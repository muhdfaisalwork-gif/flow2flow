export interface Env {
  ENVIRONMENT: string;
  APP_NAME: string;
  PAGES_ORIGIN?: string;
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
}

const ALLOWED_ORIGINS = [
  'https://shadowflow.work',
  'https://www.shadowflow.work',
  'https://shadowflow-kdy.pages.dev',
  'http://localhost:8080',
  'http://localhost:5173',
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

    // Health check endpoint (always accessible at /health or /api/health, or / on api.* host)
    if (
      url.pathname === '/health' ||
      url.pathname === '/api/health' ||
      (isApiHost && url.pathname === '/')
    ) {
      return jsonResponse({
        status: 'ok',
        service: 'Shadow Flow Worker & Automation Engine',
        domain: 'shadowflow.work',
        environment: env.ENVIRONMENT || 'production',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        routes: [
          'GET  /health',
          'POST /webhook/:workflowId',
          'POST /api/generate-flow',
          'POST /api/execute-step',
        ],
      }, 200, request);
    }

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
      return jsonResponse({
        success: true,
        workflowId,
        executionId,
        receivedAt: new Date().toISOString(),
        payloadSummary: typeof payload === 'object' && payload !== null ? Object.keys(payload) : typeof payload,
        status: 'queued',
      }, 202, request);
    }

    // AI Prompt-to-Flow generation endpoint using Cloudflare Workers AI
    if (url.pathname === '/api/generate-flow' && request.method === 'POST') {
      try {
        const body = await request.json() as { prompt?: string };
        const prompt = body.prompt?.trim();

        if (!prompt) {
          return jsonResponse({ error: 'Missing "prompt" parameter in request body' }, 400, request);
        }

        if (env.AI) {
          const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              {
                role: 'system',
                content: 'You are Shadow Flow Copilot. Return only a valid JSON array of workflow steps with {id, type, label, description, params}. No markdown fencing.',
              },
              {
                role: 'user',
                content: `Generate workflow steps for: ${prompt}`,
              },
            ],
            max_tokens: 1024,
          });

          return jsonResponse({
            success: true,
            prompt,
            result: aiResponse,
            generatedBy: 'Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct)',
          }, 200, request);
        }

        return jsonResponse({
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
        }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Flow generation failed', details: message }, 500, request);
      }
    }

    // Safe execution step evaluator
    if (url.pathname === '/api/execute-step' && request.method === 'POST') {
      try {
        const body = await request.json() as { operation?: string; input?: unknown };
        return jsonResponse({
          success: true,
          operation: body.operation || 'pass-through',
          output: body.input,
          processedAt: new Date().toISOString(),
        }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Execution failed', details: message }, 400, request);
      }
    }

    // If on api.* subdomain and route not matched, return 404 JSON
    if (isApiHost) {
      return jsonResponse({ error: 'API Endpoint Not Found', path: url.pathname }, 404, request);
    }

    // Otherwise, serve the Shadow Flow frontend from Cloudflare Pages origin
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
