// ============================================================================
// Shadow Flow Edge API & Automation Worker
// Powered by Cloudflare Workers, Cloudflare D1 (SQLite), and Workers AI
// ============================================================================

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result>;
}

export interface Env {
  ENVIRONMENT: string;
  APP_NAME: string;
  PAGES_ORIGIN?: string;
  JWT_SECRET?: string;
  DB: D1Database;
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
}

interface UserPayload {
  id: string;
  email: string;
  display_name?: string;
}

const ALLOWED_ORIGINS = [
  'https://shadowflow.work',
  'https://www.shadowflow.work',
  'https://shadowflow-kdy.pages.dev',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4180',
];

function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data: unknown, status = 200, request?: Request): Response {
  const cors = request ? getCorsHeaders(request) : { 'Access-Control-Allow-Origin': '*' };
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...cors,
    },
  });
}

// ----------------------------------------------------------------------------
// Cryptographic Helpers (Web Crypto API)
// ----------------------------------------------------------------------------

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const key = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 50000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return {
    hash: bytesToHex(new Uint8Array(key)),
    salt: bytesToHex(salt),
  };
}

async function createJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }));
  const data = `${encodedHeader}.${encodedPayload}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string): Promise<UserPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const expectedSig = new Uint8Array(
      base64UrlDecode(signature)
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const isValid = await crypto.subtle.verify('HMAC', key, expectedSig, enc.encode(data));
    if (!isValid) return null;

    const decoded = JSON.parse(base64UrlDecode(payload)) as UserPayload & { exp?: number };
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      id: decoded.id,
      email: decoded.email,
      display_name: decoded.display_name,
    };
  } catch {
    return null;
  }
}

async function getAuthUser(request: Request, env: Env): Promise<UserPayload | null> {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  const secret = env.JWT_SECRET || 'shadowflow-secret-fallback-key';
  return verifyJWT(token, secret);
}

// ----------------------------------------------------------------------------
// Worker Main Fetch Handler
// ----------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isApiHost = url.hostname.startsWith('api.') || url.hostname.endsWith('.workers.dev');

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request),
      });
    }

    // Health check endpoint
    if (
      url.pathname === '/health' ||
      url.pathname === '/api/health' ||
      (isApiHost && url.pathname === '/')
    ) {
      return jsonResponse(
        {
          status: 'ok',
          service: 'Shadow Flow Edge Worker & Automation Engine',
          database: 'Cloudflare D1 (Serverless SQLite)',
          domain: 'shadowflow.work',
          environment: env.ENVIRONMENT || 'production',
          timestamp: new Date().toISOString(),
          version: '2.0.0',
        },
        200,
        request
      );
    }

    // ------------------------------------------------------------------------
    // AUTH API ROUTES: /api/auth/*
    // ------------------------------------------------------------------------

    // POST /api/auth/signup
    if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { email?: string; password?: string; displayName?: string };
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();
        const displayName = body.displayName?.trim() || email?.split('@')[0] || 'User';

        if (!email || !password || password.length < 6) {
          return jsonResponse({ error: 'Valid email and password (minimum 6 characters) required' }, 400, request);
        }

        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
          return jsonResponse({ error: 'User with this email already exists' }, 409, request);
        }

        const { hash, salt } = await hashPassword(password);
        const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO users (id, email, password_hash, password_salt, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(userId, email, hash, salt, displayName, now, now)
          .run();

        const user: UserPayload = { id: userId, email, display_name: displayName };
        const token = await createJWT(user as unknown as Record<string, unknown>, env.JWT_SECRET || 'shadowflow-secret-fallback-key');

        return jsonResponse({ success: true, user, token }, 201, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Signup failed', details: message }, 500, request);
      }
    }

    // POST /api/auth/login
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { email?: string; password?: string };
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();

        if (!email || !password) {
          return jsonResponse({ error: 'Email and password are required' }, 400, request);
        }

        const row = (await env.DB.prepare(
          'SELECT id, email, password_hash, password_salt, display_name FROM users WHERE email = ?'
        )
          .bind(email)
          .first()) as { id: string; email: string; password_hash: string; password_salt: string; display_name: string } | null;

        if (!row) {
          return jsonResponse({ error: 'Invalid email or password' }, 401, request);
        }

        const { hash } = await hashPassword(password, row.password_salt);
        if (hash !== row.password_hash) {
          return jsonResponse({ error: 'Invalid email or password' }, 401, request);
        }

        const user: UserPayload = { id: row.id, email: row.email, display_name: row.display_name };
        const token = await createJWT(user as unknown as Record<string, unknown>, env.JWT_SECRET || 'shadowflow-secret-fallback-key');

        return jsonResponse({ success: true, user, token }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Login failed', details: message }, 500, request);
      }
    }

    // GET /api/auth/me
    if (url.pathname === '/api/auth/me' && request.method === 'GET') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }
      return jsonResponse({ user }, 200, request);
    }

    // POST /api/auth/logout
    if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
      return jsonResponse({ success: true, message: 'Logged out successfully' }, 200, request);
    }

    // ------------------------------------------------------------------------
    // WORKFLOWS API ROUTES: /api/workflows/*
    // ------------------------------------------------------------------------

    // GET /api/workflows - list user's workflows
    if (url.pathname === '/api/workflows' && request.method === 'GET') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }

      const rows = await env.DB.prepare(
        'SELECT id, name, description, is_active, updated_at, created_at, nodes, edges, settings FROM workflows WHERE user_id = ? ORDER BY updated_at DESC'
      )
        .bind(user.id)
        .all();

      const workflows = (rows.results || []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        name: String(row.name),
        description: String(row.description || ''),
        is_active: Boolean(row.is_active),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
        nodes: typeof row.nodes === 'string' ? JSON.parse(row.nodes || '[]') : row.nodes,
        edges: typeof row.edges === 'string' ? JSON.parse(row.edges || '[]') : row.edges,
        settings: typeof row.settings === 'string' ? JSON.parse(row.settings || '{}') : row.settings,
      }));

      return jsonResponse({ workflows }, 200, request);
    }

    // POST /api/workflows - create new workflow
    if (url.pathname === '/api/workflows' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }

      try {
        const body = (await request.json()) as {
          name?: string;
          description?: string;
          nodes?: unknown;
          edges?: unknown;
          settings?: unknown;
          is_active?: boolean;
        };

        const id = `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const name = body.name?.trim() || 'Untitled Workflow';
        const description = body.description?.trim() || '';
        const nodesStr = JSON.stringify(body.nodes || []);
        const edgesStr = JSON.stringify(body.edges || []);
        const settingsStr = JSON.stringify(body.settings || {});
        const isActive = body.is_active !== false ? 1 : 0;
        const now = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO workflows (id, user_id, name, description, nodes, edges, settings, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(id, user.id, name, description, nodesStr, edgesStr, settingsStr, isActive, now, now)
          .run();

        // Also save initial version
        const versionId = `ver_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await env.DB.prepare(
          'INSERT INTO workflow_versions (id, workflow_id, version, nodes, edges, settings, created_by, change_summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(versionId, id, 1, nodesStr, edgesStr, settingsStr, user.id, 'Initial creation', now)
          .run();

        return jsonResponse(
          {
            success: true,
            workflow: {
              id,
              user_id: user.id,
              name,
              description,
              nodes: body.nodes || [],
              edges: body.edges || [],
              settings: body.settings || {},
              is_active: Boolean(isActive),
              created_at: now,
              updated_at: now,
            },
          },
          201,
          request
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to create workflow', details: message }, 500, request);
      }
    }

    // GET /api/workflows/:id
    if (url.pathname.startsWith('/api/workflows/') && request.method === 'GET') {
      const parts = url.pathname.split('/');
      const workflowId = parts[3];

      if (parts[4] === 'versions') {
        // GET /api/workflows/:id/versions
        const rows = await env.DB.prepare(
          'SELECT id, version, change_summary, created_at FROM workflow_versions WHERE workflow_id = ? ORDER BY version DESC'
        )
          .bind(workflowId)
          .all();
        return jsonResponse({ versions: rows.results || [] }, 200, request);
      }

      const row = (await env.DB.prepare('SELECT * FROM workflows WHERE id = ?').bind(workflowId).first()) as Record<string, unknown> | null;
      if (!row) {
        return jsonResponse({ error: 'Workflow not found' }, 404, request);
      }

      return jsonResponse(
        {
          workflow: {
            ...row,
            is_active: Boolean(row.is_active),
            nodes: typeof row.nodes === 'string' ? JSON.parse(row.nodes || '[]') : row.nodes,
            edges: typeof row.edges === 'string' ? JSON.parse(row.edges || '[]') : row.edges,
            settings: typeof row.settings === 'string' ? JSON.parse(row.settings || '{}') : row.settings,
          },
        },
        200,
        request
      );
    }

    // PUT /api/workflows/:id
    if (url.pathname.startsWith('/api/workflows/') && request.method === 'PUT') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }

      const workflowId = url.pathname.replace('/api/workflows/', '').trim();
      try {
        const body = (await request.json()) as {
          name?: string;
          description?: string;
          nodes?: unknown;
          edges?: unknown;
          settings?: unknown;
          is_active?: boolean;
          change_summary?: string;
        };

        const existing = (await env.DB.prepare('SELECT id, user_id FROM workflows WHERE id = ?').bind(workflowId).first()) as {
          id: string;
          user_id: string;
        } | null;

        if (!existing) {
          return jsonResponse({ error: 'Workflow not found' }, 404, request);
        }
        if (existing.user_id !== user.id) {
          return jsonResponse({ error: 'Forbidden' }, 403, request);
        }

        const now = new Date().toISOString();
        const nodesStr = JSON.stringify(body.nodes || []);
        const edgesStr = JSON.stringify(body.edges || []);
        const settingsStr = JSON.stringify(body.settings || {});
        const isActive = body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1;

        await env.DB.prepare(
          'UPDATE workflows SET name = ?, description = ?, nodes = ?, edges = ?, settings = ?, is_active = ?, updated_at = ? WHERE id = ?'
        )
          .bind(body.name || 'Untitled Workflow', body.description || '', nodesStr, edgesStr, settingsStr, isActive, now, workflowId)
          .run();

        // Save a version
        const lastVer = (await env.DB.prepare('SELECT MAX(version) as max_v FROM workflow_versions WHERE workflow_id = ?')
          .bind(workflowId)
          .first()) as { max_v: number } | null;
        const nextVer = (lastVer?.max_v || 0) + 1;
        const versionId = `ver_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        await env.DB.prepare(
          'INSERT INTO workflow_versions (id, workflow_id, version, nodes, edges, settings, created_by, change_summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(versionId, workflowId, nextVer, nodesStr, edgesStr, settingsStr, user.id, body.change_summary || `Updated at ${now}`, now)
          .run();

        return jsonResponse({ success: true, updated_at: now }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Update failed', details: message }, 500, request);
      }
    }

    // DELETE /api/workflows/:id
    if (url.pathname.startsWith('/api/workflows/') && request.method === 'DELETE') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }

      const workflowId = url.pathname.replace('/api/workflows/', '').trim();
      const existing = (await env.DB.prepare('SELECT id, user_id FROM workflows WHERE id = ?').bind(workflowId).first()) as {
        id: string;
        user_id: string;
      } | null;

      if (!existing) {
        return jsonResponse({ error: 'Workflow not found' }, 404, request);
      }
      if (existing.user_id !== user.id) {
        return jsonResponse({ error: 'Forbidden' }, 403, request);
      }

      await env.DB.prepare('DELETE FROM workflows WHERE id = ?').bind(workflowId).run();
      return jsonResponse({ success: true, message: 'Workflow deleted' }, 200, request);
    }

    // ------------------------------------------------------------------------
    // USER CREDENTIALS API ROUTES: /api/credentials/*
    // ------------------------------------------------------------------------

    // GET /api/credentials
    if (url.pathname === '/api/credentials' && request.method === 'GET') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }

      const rows = await env.DB.prepare('SELECT id, provider, name, data, created_at, updated_at FROM user_credentials WHERE user_id = ?')
        .bind(user.id)
        .all();

      const credentials = (rows.results || []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        provider: String(row.provider),
        name: String(row.name),
        data: typeof row.data === 'string' ? JSON.parse(row.data || '{}') : row.data,
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      }));

      return jsonResponse({ credentials }, 200, request);
    }

    // POST /api/credentials
    if (url.pathname === '/api/credentials' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }

      try {
        const body = (await request.json()) as { provider?: string; name?: string; data?: unknown };
        const id = `crd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const now = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO user_credentials (id, user_id, provider, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(id, user.id, body.provider || 'generic', body.name || 'API Key', JSON.stringify(body.data || {}), now, now)
          .run();

        return jsonResponse({ success: true, id }, 201, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to save credential', details: message }, 500, request);
      }
    }

    // DELETE /api/credentials/:id
    if (url.pathname.startsWith('/api/credentials/') && request.method === 'DELETE') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }

      const credId = url.pathname.replace('/api/credentials/', '').trim();
      await env.DB.prepare('DELETE FROM user_credentials WHERE id = ? AND user_id = ?').bind(credId, user.id).run();
      return jsonResponse({ success: true, message: 'Credential deleted' }, 200, request);
    }

    // ------------------------------------------------------------------------
    // WEBHOOKS, AI GENERATION & EXECUTION
    // ------------------------------------------------------------------------

    // Webhook receiver endpoint
    if (url.pathname.startsWith('/webhook/')) {
      const workflowId = url.pathname.replace('/webhook/', '').trim();
      if (!workflowId) {
        return jsonResponse({ error: 'Missing workflow ID in webhook path' }, 400, request);
      }

      let payload: unknown = null;
      try {
        if (request.headers.get('content-type')?.includes('application/json')) {
          payload = await request.json();
        } else {
          payload = await request.text();
        }
      } catch {
        payload = null;
      }

      const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();

      try {
        await env.DB.prepare(
          'INSERT INTO workflow_runs (id, workflow_id, status, started_at, finished_at, error_log, logs) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(executionId, workflowId, 'success', now, now, null, JSON.stringify([payload]))
          .run();
      } catch {
        // Silently continue if foreign key check fails
      }

      return jsonResponse(
        {
          success: true,
          workflowId,
          executionId,
          receivedAt: now,
          payloadSummary: typeof payload === 'object' && payload !== null ? Object.keys(payload) : typeof payload,
          status: 'completed',
        },
        202,
        request
      );
    }

    // AI Prompt-to-Flow generation endpoint using Cloudflare Workers AI
    if (url.pathname === '/api/generate-flow' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { prompt?: string };
        const prompt = body.prompt?.trim();

        if (!prompt) {
          return jsonResponse({ error: 'Missing "prompt" parameter in request body' }, 400, request);
        }

        if (env.AI) {
          const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              {
                role: 'system',
                content:
                  'You are Shadow Flow Copilot. Return only a valid JSON array of workflow steps with {id, type, label, description, params}. No markdown fencing.',
              },
              {
                role: 'user',
                content: `Generate workflow steps for: ${prompt}`,
              },
            ],
            max_tokens: 1024,
          });

          return jsonResponse(
            {
              success: true,
              prompt,
              result: aiResponse,
              generatedBy: 'Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct)',
            },
            200,
            request
          );
        }

        return jsonResponse(
          {
            success: true,
            prompt,
            result: {
              steps: [
                { id: 'step_1', type: 'webhook', label: 'Webhook Trigger', description: 'Listens for incoming data' },
                { id: 'step_2', type: 'transform', label: 'Data Transformer', description: `Processes data for: ${prompt}` },
                { id: 'step_3', type: 'action', label: 'Output Dispatcher', description: 'Sends result to destination' },
              ],
            },
            generatedBy: 'Shadow Flow Standard Template Engine',
          },
          200,
          request
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Flow generation failed', details: message }, 500, request);
      }
    }

    // Safe execution step evaluator
    if (url.pathname === '/api/execute-step' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { operation?: string; input?: unknown };
        return jsonResponse(
          {
            success: true,
            operation: body.operation || 'pass-through',
            output: body.input,
            processedAt: new Date().toISOString(),
          },
          200,
          request
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Execution failed', details: message }, 400, request);
      }
    }

    // If on api.* subdomain and route not matched, return 404 JSON
    if (isApiHost) {
      return jsonResponse({ error: 'API Endpoint Not Found', path: url.pathname }, 404, request);
    }

    // ------------------------------------------------------------------------
    // STATIC / SPA FALLBACK TO CLOUDFLARE PAGES
    // ------------------------------------------------------------------------
    const pagesOrigin = env.PAGES_ORIGIN || 'https://shadowflow-kdy.pages.dev';
    const targetUrl = new URL(url.pathname + url.search, pagesOrigin);

    const originRes = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      redirect: 'follow',
    });

    // SPA Fallback: if route has no file extension and returned 404, serve /index.html
    const hasExtension = /\.[a-zA-Z0-9]{1,8}$/.test(url.pathname);
    if (originRes.status === 404 && !hasExtension) {
      const indexUrl = new URL('/index.html', pagesOrigin);
      const indexRes = await fetch(indexUrl.toString());
      return new Response(indexRes.body, {
        status: 200,
        headers: indexRes.headers,
      });
    }

    return new Response(originRes.body, {
      status: originRes.status,
      headers: originRes.headers,
    });
  },
};
