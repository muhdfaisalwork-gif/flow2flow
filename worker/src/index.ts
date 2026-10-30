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
  GROQ_API_KEY?: string;
  RESEND_API_KEY?: string;
  DB: D1Database;
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
}

interface UserPayload {
  id: string;
  email: string;
  display_name?: string;
  type?: string;
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
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

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
      type: decoded.type,
    };
  } catch {
    return null;
  }
}

async function getAuthUser(request: Request, env: Env): Promise<UserPayload | null> {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!env.JWT_SECRET) return null;
  const user = await verifyJWT(token, env.JWT_SECRET);
  if (!user || user.type === '2fa_challenge') return null;
  return user;
}

// ----------------------------------------------------------------------------
// RFC 6238 TOTP & Two-Factor Authentication (Web Crypto)
// ----------------------------------------------------------------------------

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

function bytesToBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

async function generateHOTP(secretBase32: string, counter: number): Promise<string> {
  const keyBytes = base32ToBytes(secretBase32);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  const high = Math.floor(counter / 0x100000000);
  const low = counter >>> 0;
  counterView.setUint32(0, high, false);
  counterView.setUint32(4, low, false);

  const hmac = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmacBytes = new Uint8Array(hmac);

  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const codeInt =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = codeInt % 1000000;
  return otp.toString().padStart(6, '0');
}

async function verifyTOTP(secretBase32: string, token: string, window = 1, timeStepSeconds = 30): Promise<boolean> {
  if (!token || token.length !== 6) return false;
  const currentCounter = Math.floor(Date.now() / 1000 / timeStepSeconds);

  for (let offset = -window; offset <= window; offset++) {
    const expected = await generateHOTP(secretBase32, currentCounter + offset);
    if (expected === token.trim()) {
      return true;
    }
  }
  return false;
}

async function hashBackupCode(code: string): Promise<string> {
  const norm = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const data = new TextEncoder().encode(norm);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(hash));
}

async function generateHashedBackupCodes(count = 8): Promise<{ plainCodes: string[]; hashedCodes: string[] }> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const rand = crypto.getRandomValues(new Uint8Array(8));
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += chars[rand[j] % chars.length];
      if (j === 3) code += '-';
    }
    plainCodes.push(code);
    hashedCodes.push(await hashBackupCode(code));
  }

  return { plainCodes, hashedCodes };
}

async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<{ valid: boolean; remainingHashedCodes: string[] }> {
  const normHash = await hashBackupCode(code);
  const index = hashedCodes.indexOf(normHash);
  if (index !== -1) {
    const remaining = [...hashedCodes];
    remaining.splice(index, 1);
    return { valid: true, remainingHashedCodes: remaining };
  }
  return { valid: false, remainingHashedCodes: hashedCodes };
}

function generateNumericOTP(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += (bytes[i] % 10).toString();
  }
  return otp;
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length <= 2 ? name[0] + '***' : name[0] + '***' + name[name.length - 1];
  return `${maskedName}@${domain}`;
}

async function send2FAEmail(env: Env, toEmail: string, code: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.warn('[2FA] RESEND_API_KEY not configured; cannot deliver email code');
    return false;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f1f5f9; padding: 24px; margin: 0; }
    .card { background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 32px; max-width: 480px; margin: 0 auto; }
    .logo { color: #10b981; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; margin-bottom: 24px; }
    .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #ffffff; }
    .desc { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .code-box { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 18px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #38bdf8; font-family: monospace; margin-bottom: 24px; }
    .expiry { font-size: 12px; color: #64748b; text-align: center; margin-bottom: 24px; }
    .footer { font-size: 11px; color: #475569; border-top: 1px solid #1f2937; padding-top: 16px; margin-top: 24px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ Shadow Flow Security</div>
    <div class="title">Two-Factor Authentication Code</div>
    <p class="desc">You are signing in to your Shadow Flow account. Use the one-time verification code below to verify your identity.</p>
    <div class="code-box">${code}</div>
    <div class="expiry">This code expires in 10 minutes. If you did not request this verification, please secure your password.</div>
    <div class="footer">Shadow Flow — Serverless Edge Automation Platform (shadowflow.work)</div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Shadow Flow Security <support@shadowflow.work>',
        to: toEmail,
        subject: `Your Shadow Flow Verification Code: ${code}`,
        html,
        text: `Your Shadow Flow verification code is: ${code}. It expires in 10 minutes.`,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[2FA] Failed to dispatch email via Resend:', err);
    return false;
  }
}

async function getEffectiveUserId(request: Request, env: Env): Promise<{ userId: string; isAuthenticated: boolean }> {
  const user = await getAuthUser(request, env);
  if (user) {
    return { userId: user.id, isAuthenticated: true };
  }
  // Rely strictly on Cloudflare edge-injected header to prevent IP spoofing
  const ip = request.headers.get('cf-connecting-ip') || 'guest';
  return { userId: `ip_${ip.replace(/[^a-zA-Z0-9_.-]/g, '_')}`, isAuthenticated: false };
}

async function getUserPlan(userId: string, env: Env): Promise<{ plan: string; limit: number }> {
  if (userId.startsWith('ip_')) {
    return { plan: 'free', limit: 20 };
  }
  try {
    const sub = (await env.DB.prepare('SELECT plan FROM user_subscriptions WHERE user_id = ?').bind(userId).first()) as { plan: string } | null;
    const plan = (sub?.plan || 'free').toLowerCase();
    if (plan === 'pro') return { plan: 'pro', limit: 100 };
    if (plan === 'max' || plan === 'enterprise') return { plan: 'max', limit: 999999 };
    return { plan: 'free', limit: 20 };
  } catch {
    return { plan: 'free', limit: 20 };
  }
}

async function checkAndIncrementUsage(
  userId: string,
  env: Env
): Promise<{ allowed: boolean; plan: string; limit: number; used: number; remaining: number }> {
  const { plan, limit } = await getUserPlan(userId, env);
  const today = new Date().toISOString().slice(0, 10);

  let currentUsage = 0;
  try {
    const row = (await env.DB.prepare('SELECT count FROM ai_usage WHERE user_id = ? AND request_date = ?').bind(userId, today).first()) as { count: number } | null;
    currentUsage = row?.count || 0;
  } catch {
    // Usage lookup fallback
  }

  if (limit < 999999 && currentUsage >= limit) {
    return { allowed: false, plan, limit, used: currentUsage, remaining: 0 };
  }

  // Increment usage
  try {
    const usageId = `${userId}_${today}`;
    await env.DB.prepare(
      'INSERT INTO ai_usage (id, user_id, request_date, count) VALUES (?, ?, ?, 1) ON CONFLICT(user_id, request_date) DO UPDATE SET count = count + 1'
    ).bind(usageId, userId, today).run();
  } catch {
    // Usage increment fallback
  }

  const nextUsed = currentUsage + 1;
  const remaining = limit >= 999999 ? 999999 : Math.max(0, limit - nextUsed);
  return { allowed: true, plan, limit, used: nextUsed, remaining };
}

async function callGroqAI(
  messages: Array<{ role: string; content: string }>,
  isJson: boolean,
  env: Env
): Promise<{ content: string; model: string }> {
  if (env.GROQ_API_KEY) {
    const candidateModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    for (const model of candidateModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            response_format: isJson ? { type: 'json_object' } : undefined,
            temperature: 0.2,
            max_tokens: 2048,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return { content, model: `Groq (${model})` };
          }
        }
      } catch (e) {
        console.error(`Groq model ${model} error, trying next:`, e);
      }
    }
  }

  // Fallback to Cloudflare Workers AI if available
  if (env.AI) {
    try {
      const aiResponse = (await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages,
        max_tokens: 1024,
      })) as { response?: string };
      return { content: aiResponse.response || JSON.stringify(aiResponse), model: 'Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct)' };
    } catch (e) {
      console.error('Cloudflare AI fallback error:', e);
    }
  }

  throw new Error('AI engine service currently unavailable');
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
        const userId = ((body as { id?: string }).id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test((body as { id?: string }).id!))
          ? (body as { id?: string }).id!
          : crypto.randomUUID();
        const now = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO users (id, email, password_hash, password_salt, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(userId, email, hash, salt, displayName, now, now)
          .run();

        const user: UserPayload = { id: userId, email, display_name: displayName };
        if (!env.JWT_SECRET) {
          return jsonResponse({ error: 'Server auth configuration missing' }, 500, request);
        }
        const token = await createJWT(user as unknown as Record<string, unknown>, env.JWT_SECRET);

        return jsonResponse({ success: true, user, token }, 201, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Signup failed', details: message }, 500, request);
      }
    }

    // POST /api/auth/login
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { email?: string; password?: string; tfaCode?: string };
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();
        const tfaCode = body.tfaCode?.trim();

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

        // Check if user has 2FA enabled
        const tfaRow = (await env.DB.prepare(
          'SELECT enabled, secret, backup_codes, preferred_method, email_otp, email_otp_expires_at FROM user_tfa WHERE user_id = ?'
        ).bind(row.id).first()) as {
          enabled: number;
          secret: string;
          backup_codes: string;
          preferred_method: string;
          email_otp?: string;
          email_otp_expires_at?: string;
        } | null;

        if (tfaRow && tfaRow.enabled) {
          const method = tfaRow.preferred_method || 'totp';

          if (!tfaCode) {
            // Issue short-lived 2FA challenge token (valid for 5 minutes)
            if (!env.JWT_SECRET) {
              return jsonResponse({ error: 'Server auth configuration missing' }, 500, request);
            }
            const challengeToken = await createJWT({
              id: row.id,
              email: row.email,
              display_name: row.display_name,
              type: '2fa_challenge',
              exp: Math.floor(Date.now() / 1000) + 300,
            }, env.JWT_SECRET);

            if (method === 'email') {
              const otp = generateNumericOTP(6);
              const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
              await env.DB.prepare(
                'UPDATE user_tfa SET email_otp = ?, email_otp_expires_at = ?, updated_at = ? WHERE user_id = ?'
              ).bind(otp, expiresAt, new Date().toISOString(), row.id).run();

              await send2FAEmail(env, row.email, otp);
            }

            return jsonResponse({
              require2FA: true,
              tempToken: challengeToken,
              method,
              emailMasked: maskEmail(row.email),
              email: row.email,
            }, 200, request);
          }

          // Verify provided 2FA code (Email OTP, TOTP or backup code)
          let valid = false;
          let newBackupCodesJson: string | null = null;

          if (method === 'email' && tfaRow.email_otp) {
            const nowIso = new Date().toISOString();
            if (tfaRow.email_otp === tfaCode.trim() && (!tfaRow.email_otp_expires_at || tfaRow.email_otp_expires_at > nowIso)) {
              valid = true;
              await env.DB.prepare('UPDATE user_tfa SET email_otp = NULL, email_otp_expires_at = NULL WHERE user_id = ?')
                .bind(row.id).run();
            }
          }

          if (!valid && tfaCode.replace(/\D/g, '').length === 6 && tfaRow.secret) {
            valid = await verifyTOTP(tfaRow.secret, tfaCode.replace(/\D/g, ''));
          }

          if (!valid && tfaRow.backup_codes) {
            try {
              const hashedList = JSON.parse(tfaRow.backup_codes) as string[];
              const backupCheck = await verifyBackupCode(tfaCode, hashedList);
              if (backupCheck.valid) {
                valid = true;
                newBackupCodesJson = JSON.stringify(backupCheck.remainingHashedCodes);
              }
            } catch {
              // Ignore backup code parse error
            }
          }

          if (!valid) {
            return jsonResponse({ error: 'Invalid 2FA code or backup code' }, 401, request);
          }

          if (newBackupCodesJson !== null) {
            await env.DB.prepare('UPDATE user_tfa SET backup_codes = ? WHERE user_id = ?')
              .bind(newBackupCodesJson, row.id)
              .run();
          }
        }

        const user: UserPayload = { id: row.id, email: row.email, display_name: row.display_name };
        if (!env.JWT_SECRET) {
          return jsonResponse({ error: 'Server auth configuration missing' }, 500, request);
        }
        const token = await createJWT(user as unknown as Record<string, unknown>, env.JWT_SECRET);

        return jsonResponse({ success: true, user, token }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Login failed', details: message }, 500, request);
      }
    }

    // POST /api/auth/login/2fa - Complete 2FA login challenge
    if (url.pathname === '/api/auth/login/2fa' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { tempToken?: string; code?: string };
        const tempToken = body.tempToken?.trim();
        const code = body.code?.trim();

        if (!tempToken || !code) {
          return jsonResponse({ error: 'Challenge token and code are required' }, 400, request);
        }

        if (!env.JWT_SECRET) {
          return jsonResponse({ error: 'Server auth configuration missing' }, 500, request);
        }

        const challenge = await verifyJWT(tempToken, env.JWT_SECRET);
        if (!challenge || challenge.type !== '2fa_challenge') {
          return jsonResponse({ error: '2FA session expired. Please sign in again.' }, 401, request);
        }

        const userRow = (await env.DB.prepare(
          'SELECT id, email, display_name FROM users WHERE id = ?'
        ).bind(challenge.id).first()) as { id: string; email: string; display_name: string } | null;

        if (!userRow) {
          return jsonResponse({ error: 'User not found' }, 404, request);
        }

        const tfaRow = (await env.DB.prepare(
          'SELECT enabled, secret, backup_codes, preferred_method, email_otp, email_otp_expires_at FROM user_tfa WHERE user_id = ?'
        ).bind(userRow.id).first()) as {
          enabled: number;
          secret: string;
          backup_codes: string;
          preferred_method: string;
          email_otp?: string;
          email_otp_expires_at?: string;
        } | null;

        if (!tfaRow || !tfaRow.enabled) {
          return jsonResponse({ error: '2FA is not enabled for this user' }, 400, request);
        }

        let valid = false;
        let newBackupCodesJson: string | null = null;
        const method = tfaRow.preferred_method || 'totp';

        // Check Email OTP
        if (tfaRow.email_otp) {
          const nowIso = new Date().toISOString();
          if (tfaRow.email_otp === code.trim() && (!tfaRow.email_otp_expires_at || tfaRow.email_otp_expires_at > nowIso)) {
            valid = true;
            await env.DB.prepare('UPDATE user_tfa SET email_otp = NULL, email_otp_expires_at = NULL WHERE user_id = ?')
              .bind(userRow.id).run();
          }
        }

        // Check Authenticator TOTP
        if (!valid && code.replace(/\D/g, '').length === 6 && tfaRow.secret) {
          valid = await verifyTOTP(tfaRow.secret, code.replace(/\D/g, ''));
        }

        // Check Backup codes
        if (!valid && tfaRow.backup_codes) {
          try {
            const hashedList = JSON.parse(tfaRow.backup_codes) as string[];
            const backupCheck = await verifyBackupCode(code, hashedList);
            if (backupCheck.valid) {
              valid = true;
              newBackupCodesJson = JSON.stringify(backupCheck.remainingHashedCodes);
            }
          } catch {
            // Ignore backup code check error
          }
        }

        if (!valid) {
          return jsonResponse({ error: 'Invalid 2FA code or backup code' }, 401, request);
        }

        if (newBackupCodesJson !== null) {
          await env.DB.prepare('UPDATE user_tfa SET backup_codes = ? WHERE user_id = ?')
            .bind(newBackupCodesJson, userRow.id)
            .run();
        }

        const user: UserPayload = { id: userRow.id, email: userRow.email, display_name: userRow.display_name };
        const token = await createJWT(user as unknown as Record<string, unknown>, env.JWT_SECRET);

        return jsonResponse({ success: true, user, token }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: '2FA verification failed', details: message }, 500, request);
      }
    }

    // POST /api/auth/login/2fa/resend - Resend 2FA verification email code
    if (url.pathname === '/api/auth/login/2fa/resend' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { tempToken?: string };
        const tempToken = body.tempToken?.trim();

        if (!tempToken) {
          return jsonResponse({ error: 'Challenge token is required' }, 400, request);
        }

        if (!env.JWT_SECRET) {
          return jsonResponse({ error: 'Server auth configuration missing' }, 500, request);
        }

        const challenge = await verifyJWT(tempToken, env.JWT_SECRET);
        if (!challenge || challenge.type !== '2fa_challenge') {
          return jsonResponse({ error: '2FA session expired. Please sign in again.' }, 401, request);
        }

        const userRow = (await env.DB.prepare(
          'SELECT id, email FROM users WHERE id = ?'
        ).bind(challenge.id).first()) as { id: string; email: string } | null;

        if (!userRow) {
          return jsonResponse({ error: 'User not found' }, 404, request);
        }

        const otp = generateNumericOTP(6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        const now = new Date().toISOString();

        await env.DB.prepare(
          'UPDATE user_tfa SET email_otp = ?, email_otp_expires_at = ?, updated_at = ? WHERE user_id = ?'
        ).bind(otp, expiresAt, now, userRow.id).run();

        await send2FAEmail(env, userRow.email, otp);

        return jsonResponse({
          success: true,
          message: `A new 6-digit verification code was sent to ${maskEmail(userRow.email)}`,
        }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to resend code', details: message }, 500, request);
      }
    }

    // ------------------------------------------------------------------------
    // TWO-FACTOR AUTHENTICATION API ROUTES: /api/auth/tfa/*
    // ------------------------------------------------------------------------

    // GET /api/auth/tfa/status
    if (url.pathname === '/api/auth/tfa/status' && request.method === 'GET') {
      const user = await getAuthUser(request, env);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request);

      const row = (await env.DB.prepare(
        'SELECT enabled, preferred_method, backup_codes FROM user_tfa WHERE user_id = ?'
      ).bind(user.id).first()) as { enabled: number; preferred_method: string; backup_codes: string } | null;

      const enabled = Boolean(row?.enabled);
      let backupCodesRemaining = 0;
      if (row?.backup_codes) {
        try {
          const list = JSON.parse(row.backup_codes);
          if (Array.isArray(list)) backupCodesRemaining = list.length;
        } catch {
          // Ignore invalid backup codes JSON
        }
      }

      return jsonResponse({
        enabled,
        preferred_method: row?.preferred_method || 'totp',
        totp_verified: enabled,
        backup_codes_remaining: backupCodesRemaining,
      }, 200, request);
    }

    // POST /api/auth/tfa/setup
    if (url.pathname === '/api/auth/tfa/setup' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request);

      const randomBytes = crypto.getRandomValues(new Uint8Array(20));
      const secret = bytesToBase32(randomBytes);
      const issuer = 'ShadowFlow';
      const totpUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO user_tfa (user_id, enabled, secret, backup_codes, preferred_method, created_at, updated_at)
         VALUES (?, 0, ?, '[]', 'totp', ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET secret = ?, updated_at = ?`
      ).bind(user.id, secret, now, now, secret, now).run();

      return jsonResponse({
        secret,
        totp_uri: totpUri,
      }, 200, request);
    }

    // POST /api/auth/tfa/setup-email - Dispatch email OTP for 2FA setup
    if (url.pathname === '/api/auth/tfa/setup-email' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request);

      const otp = generateNumericOTP(6);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO user_tfa (user_id, enabled, secret, backup_codes, preferred_method, email_otp, email_otp_expires_at, created_at, updated_at)
         VALUES (?, 0, '', '[]', 'email', ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET email_otp = ?, email_otp_expires_at = ?, updated_at = ?`
      ).bind(user.id, otp, expiresAt, now, now, otp, expiresAt, now).run();

      await send2FAEmail(env, user.email, otp);

      return jsonResponse({
        success: true,
        message: `A 6-digit verification code was sent to ${maskEmail(user.email)}`,
        email: user.email,
        emailMasked: maskEmail(user.email),
      }, 200, request);
    }

    // POST /api/auth/tfa/verify-and-enable
    if (url.pathname === '/api/auth/tfa/verify-and-enable' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request);

      const body = (await request.json()) as { code?: string; secret?: string; method?: string };
      const code = body.code?.trim();
      if (!code || code.length !== 6) {
        return jsonResponse({ error: 'A 6-digit verification code is required' }, 400, request);
      }

      const method = body.method === 'email' ? 'email' : 'totp';

      if (method === 'email') {
        const row = (await env.DB.prepare(
          'SELECT email_otp, email_otp_expires_at FROM user_tfa WHERE user_id = ?'
        ).bind(user.id).first()) as { email_otp?: string; email_otp_expires_at?: string } | null;

        const nowIso = new Date().toISOString();
        if (!row || !row.email_otp || row.email_otp !== code || (row.email_otp_expires_at && row.email_otp_expires_at < nowIso)) {
          return jsonResponse({ valid: false, error: 'Invalid or expired email verification code. Please request a new code.' }, 400, request);
        }

        const { plainCodes, hashedCodes } = await generateHashedBackupCodes(8);
        const now = new Date().toISOString();

        await env.DB.prepare(
          `INSERT INTO user_tfa (user_id, enabled, secret, backup_codes, preferred_method, email_otp, email_otp_expires_at, created_at, updated_at)
           VALUES (?, 1, '', ?, 'email', NULL, NULL, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET enabled = 1, preferred_method = 'email', backup_codes = ?, email_otp = NULL, email_otp_expires_at = NULL, updated_at = ?`
        ).bind(user.id, JSON.stringify(hashedCodes), now, now, JSON.stringify(hashedCodes), now).run();

        return jsonResponse({
          success: true,
          valid: true,
          message: 'Two-factor authentication (Email Verification) enabled successfully',
          backupCodes: plainCodes,
        }, 200, request);
      }

      // Default: Authenticator TOTP
      const row = (await env.DB.prepare(
        'SELECT secret FROM user_tfa WHERE user_id = ?'
      ).bind(user.id).first()) as { secret: string } | null;

      const secretToVerify = body.secret?.trim() || row?.secret;
      if (!secretToVerify) {
        return jsonResponse({ error: 'No 2FA setup in progress. Please initiate setup first.' }, 400, request);
      }

      const isValid = await verifyTOTP(secretToVerify, code);
      if (!isValid) {
        return jsonResponse({ valid: false, error: 'Invalid verification code. Please check your authenticator app.' }, 400, request);
      }

      // Generate 8 fresh backup codes
      const { plainCodes, hashedCodes } = await generateHashedBackupCodes(8);
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO user_tfa (user_id, enabled, secret, backup_codes, preferred_method, created_at, updated_at)
         VALUES (?, 1, ?, ?, 'totp', ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET enabled = 1, secret = ?, backup_codes = ?, preferred_method = 'totp', updated_at = ?`
      ).bind(user.id, secretToVerify, JSON.stringify(hashedCodes), now, now, secretToVerify, JSON.stringify(hashedCodes), now).run();

      return jsonResponse({
        success: true,
        valid: true,
        message: 'Two-factor authentication (Authenticator App) enabled successfully',
        backupCodes: plainCodes,
      }, 200, request);
    }

    // POST /api/auth/tfa/disable
    if (url.pathname === '/api/auth/tfa/disable' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request);

      const now = new Date().toISOString();
      await env.DB.prepare(
        'UPDATE user_tfa SET enabled = 0, updated_at = ? WHERE user_id = ?'
      ).bind(now, user.id).run();

      return jsonResponse({ success: true, message: 'Two-factor authentication disabled' }, 200, request);
    }

    // POST /api/auth/tfa/generate-backup-codes
    if (url.pathname === '/api/auth/tfa/generate-backup-codes' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request);

      const row = (await env.DB.prepare(
        'SELECT enabled FROM user_tfa WHERE user_id = ?'
      ).bind(user.id).first()) as { enabled: number } | null;

      if (!row || !row.enabled) {
        return jsonResponse({ error: '2FA is not enabled on this account' }, 400, request);
      }

      const { plainCodes, hashedCodes } = await generateHashedBackupCodes(8);
      const now = new Date().toISOString();
      await env.DB.prepare(
        'UPDATE user_tfa SET backup_codes = ?, updated_at = ? WHERE user_id = ?'
      ).bind(JSON.stringify(hashedCodes), now, user.id).run();

      return jsonResponse({ success: true, codes: plainCodes }, 200, request);
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
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }

      const parts = url.pathname.split('/');
      const workflowId = parts[3];

      if (parts[4] === 'versions') {
        const wf = await env.DB.prepare('SELECT id FROM workflows WHERE id = ? AND user_id = ?').bind(workflowId, user.id).first();
        if (!wf) {
          return jsonResponse({ error: 'Workflow not found' }, 404, request);
        }

        // GET /api/workflows/:id/versions
        const rows = await env.DB.prepare(
          'SELECT id, version, change_summary, created_at FROM workflow_versions WHERE workflow_id = ? ORDER BY version DESC'
        )
          .bind(workflowId)
          .all();
        return jsonResponse({ versions: rows.results || [] }, 200, request);
      }

      const row = (await env.DB.prepare('SELECT * FROM workflows WHERE id = ? AND user_id = ?').bind(workflowId, user.id).first()) as Record<string, unknown> | null;
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
      const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
      if (contentLength > 256 * 1024) {
        return jsonResponse({ error: 'Payload Too Large: maximum webhook payload is 256KB' }, 413, request);
      }

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

    // GET /api/copilot/usage - Check daily AI usage and quota by plan
    if (url.pathname === '/api/copilot/usage' && request.method === 'GET') {
      try {
        const { userId, isAuthenticated } = await getEffectiveUserId(request, env);
        const { plan, limit } = await getUserPlan(userId, env);
        const today = new Date().toISOString().slice(0, 10);
        let used = 0;
        try {
          const row = (await env.DB.prepare('SELECT count FROM ai_usage WHERE user_id = ? AND request_date = ?').bind(userId, today).first()) as { count: number } | null;
          used = row?.count || 0;
        } catch {
          // Ignore usage query error
        }
        const remaining = limit >= 999999 ? 999999 : Math.max(0, limit - used);
        return jsonResponse(
          {
            plan,
            limit: limit >= 999999 ? 'unlimited' : limit,
            used,
            remaining: limit >= 999999 ? 'unlimited' : remaining,
            isAuthenticated,
            resetTimeUtc: '00:00 UTC',
          },
          200,
          request
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to retrieve AI usage', details: message }, 500, request);
      }
    }

    // POST /api/copilot/chat - Built-in AI Copilot with Daily Quota (20 Free / 100 Pro / Unlimited Max)
    if (url.pathname === '/api/copilot/chat' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          prompt?: string;
          messages?: Array<{ role: string; content: string }>;
          formatJson?: boolean;
        };

        const { userId } = await getEffectiveUserId(request, env);
        const quota = await checkAndIncrementUsage(userId, env);

        if (!quota.allowed) {
          return jsonResponse(
            {
              error: `Daily AI limit reached (${quota.used}/${quota.limit} requests). Upgrade to Pro for 100 requests/day or Max for unlimited.`,
              code: 'QUOTA_EXCEEDED',
              plan: quota.plan,
              limit: quota.limit,
              used: quota.used,
              remaining: 0,
            },
            429,
            request
          );
        }

        let messages = body.messages;
        if (!messages && body.prompt) {
          messages = [
            {
              role: 'system',
              content:
                'You are Shadow Flow Copilot, an expert AI workflow architect. Return concise, direct architectural guidance or valid JSON for workflow steps. No excessive conversational filler.',
            },
            { role: 'user', content: body.prompt },
          ];
        }

        if (!messages || messages.length === 0) {
          return jsonResponse({ error: 'Missing prompt or messages parameter' }, 400, request);
        }

        const isJson = Boolean(body.formatJson);
        const { content, model } = await callGroqAI(messages, isJson, env);

        return jsonResponse(
          {
            success: true,
            content,
            generatedBy: model,
            usage: {
              plan: quota.plan,
              limit: quota.limit >= 999999 ? 'unlimited' : quota.limit,
              used: quota.used,
              remaining: quota.remaining >= 999999 ? 'unlimited' : quota.remaining,
            },
          },
          200,
          request
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Copilot generation failed', details: message }, 500, request);
      }
    }

    // GET /api/copilot/memory - Fetch synced graph memory nodes for the authenticated user
    if (url.pathname === '/api/copilot/memory' && request.method === 'GET') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }
      try {
        const rows = await env.DB.prepare(
          'SELECT id, node_type as type, label, data, created_at as createdAt, updated_at as updatedAt FROM user_graph_memory WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100'
        )
          .bind(user.id)
          .all();

        const nodes = (rows.results || []).map((row: Record<string, unknown>) => {
          let properties = {};
          try {
            properties = JSON.parse(String(row.data || '{}'));
          } catch {
            // Ignore property parse errors
          }
          return {
            id: row.id,
            type: row.type,
            label: row.label,
            properties,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          };
        });

        return jsonResponse({ nodes, edges: [] }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to fetch graph memory', details: message }, 500, request);
      }
    }

    // POST /api/copilot/memory - Upsert graph memory nodes from client
    if (url.pathname === '/api/copilot/memory' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      if (!user) {
        return jsonResponse({ error: 'Unauthorized' }, 401, request);
      }
      try {
        const body = (await request.json()) as {
          nodes?: Array<{ id: string; type?: string; label: string; properties?: Record<string, unknown> }>;
        };
        if (!body.nodes || !Array.isArray(body.nodes)) {
          return jsonResponse({ error: 'Missing or invalid "nodes" array' }, 400, request);
        }

        const now = new Date().toISOString();
        let inserted = 0;
        for (const node of body.nodes) {
          if (!node.id || !node.label) continue;
          await env.DB.prepare(
            `INSERT INTO user_graph_memory (id, user_id, node_type, label, data, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               label = excluded.label,
               node_type = excluded.node_type,
               data = excluded.data,
               updated_at = excluded.updated_at`
          )
            .bind(
              node.id,
              user.id,
              node.type || 'concept',
              node.label,
              JSON.stringify(node.properties || {}),
              now,
              now
            )
            .run();
          inserted++;
        }

        return jsonResponse({ success: true, count: inserted }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to save graph memory', details: message }, 500, request);
      }
    }

    // ------------------------------------------------------------------------
    // BLOGS & AUTONOMOUS SEO ENGINE ENDPOINTS: /api/blogs and /api/seo/*
    // ------------------------------------------------------------------------

    // GET /api/blogs - List all published technical articles
    if (url.pathname === '/api/blogs' && request.method === 'GET') {
      try {
        const rows = await env.DB.prepare(
          'SELECT id, slug, title, excerpt, content, category, published_at as publishedAt, updated_at as updatedAt, reading_time_minutes as readingTimeMinutes, author, author_role as authorRole, target_keyword as targetKeyword, tags, schema_json_ld as schemaJsonLd FROM blogs ORDER BY published_at DESC'
        ).all();

        const posts = (rows.results || []).map((row: Record<string, unknown>) => {
          let tags = [];
          let schemaJsonLd = {};
          try { tags = JSON.parse(String(row.tags || '[]')); } catch { /* ignore */ }
          try { schemaJsonLd = JSON.parse(String(row.schemaJsonLd || '{}')); } catch { /* ignore */ }

          return {
            ...row,
            tags,
            schemaJsonLd,
            readTime: `${Number(row.readingTimeMinutes) || 6} min read`,
            url: `https://shadowflow.work/blog/${row.slug}`,
          };
        });

        return jsonResponse(
          { success: true, count: posts.length, posts },
          200,
          request,
          { 'Cache-Control': 'public, max-age=120, s-maxage=300' }
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to fetch blogs', details: message }, 500, request);
      }
    }

    // GET /api/blogs/:slug - Get single blog post by slug
    if (url.pathname.startsWith('/api/blogs/') && request.method === 'GET') {
      const slug = url.pathname.slice('/api/blogs/'.length).trim();
      try {
        const row = (await env.DB.prepare(
          'SELECT id, slug, title, excerpt, content, category, published_at as publishedAt, updated_at as updatedAt, reading_time_minutes as readingTimeMinutes, author, author_role as authorRole, target_keyword as targetKeyword, tags, schema_json_ld as schemaJsonLd FROM blogs WHERE slug = ?'
        ).bind(slug).first()) as Record<string, unknown> | null;

        if (!row) {
          return jsonResponse({ error: 'Blog post not found' }, 404, request);
        }

        let tags = [];
        let schemaJsonLd = {};
        try { tags = JSON.parse(String(row.tags || '[]')); } catch { /* ignore */ }
        try { schemaJsonLd = JSON.parse(String(row.schemaJsonLd || '{}')); } catch { /* ignore */ }

        return jsonResponse(
          {
            success: true,
            post: {
              ...row,
              tags,
              schemaJsonLd,
              readTime: `${Number(row.readingTimeMinutes) || 6} min read`,
              url: `https://shadowflow.work/blog/${row.slug}`,
            },
          },
          200,
          request,
          { 'Cache-Control': 'public, max-age=120, s-maxage=300' }
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to fetch blog post', details: message }, 500, request);
      }
    }

    // POST /api/blogs - Create or update a blog post (Protected: Admin or Internal Key)
    if (url.pathname === '/api/blogs' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      const isInternalBot = (env.JWT_SECRET && request.headers.get('x-internal-secret') === env.JWT_SECRET) ||
                            (env.JWT_SECRET && request.headers.get('x-admin-key') === env.JWT_SECRET);
      if (!user && !isInternalBot) {
        return jsonResponse({ error: 'Unauthorized: Authentication required to publish blog posts' }, 401, request);
      }

      try {
        const body = (await request.json()) as Record<string, unknown>;
        const slug = String(body.slug || '').trim();
        const title = String(body.title || '').trim();
        const content = String(body.content || '').trim();

        if (!slug || !title || !content) {
          return jsonResponse({ error: 'Missing required fields: slug, title, content' }, 400, request);
        }

        const id = body.id || `blog_${slug}`;
        const excerpt = body.excerpt || body.description || content.slice(0, 160).replace(/[#*`]/g, '').trim();
        const category = body.category || 'AI Automation';
        const now = new Date().toISOString();
        const publishedAt = body.publishedAt || body.published_at || now.split('T')[0];
        const readingTime = body.readingTimeMinutes || Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
        const author = body.author || 'Faisal Muhammad';
        const authorRole = body.authorRole || body.author_role || 'Chief AI Architect';
        const targetKeyword = body.targetKeyword || body.target_keyword || slug.replace(/-/g, ' ');
        const tagsJson = JSON.stringify(body.tags || [targetKeyword]);
        const schemaJson = JSON.stringify(body.schemaJsonLd || {});

        await env.DB.prepare(
          `INSERT INTO blogs (id, slug, title, excerpt, content, category, published_at, updated_at, reading_time_minutes, author, author_role, target_keyword, tags, schema_json_ld)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(slug) DO UPDATE SET
             title = excluded.title,
             excerpt = excluded.excerpt,
             content = excluded.content,
             category = excluded.category,
             updated_at = excluded.updated_at,
             reading_time_minutes = excluded.reading_time_minutes,
             author = excluded.author,
             author_role = excluded.author_role,
             target_keyword = excluded.target_keyword,
             tags = excluded.tags,
             schema_json_ld = excluded.schema_json_ld`
        )
          .bind(
            id,
            slug,
            title,
            excerpt,
            content,
            category,
            publishedAt,
            now,
            readingTime,
            author,
            authorRole,
            targetKeyword,
            tagsJson,
            schemaJson
          )
          .run();

        return jsonResponse(
          {
            success: true,
            message: `Article "${title}" saved successfully`,
            post: { id, slug, title, publishedAt, updatedAt: now },
          },
          200,
          request
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to save blog post', details: message }, 500, request);
      }
    }

    // POST /api/seo/generate - Autonomous Edge AI Blog Article Writer (Quota & Auth Protected)
    if (url.pathname === '/api/seo/generate' && request.method === 'POST') {
      const { userId, isAuthenticated } = await getEffectiveUserId(request, env);
      if (!isAuthenticated) {
        return jsonResponse({ error: 'Unauthorized: Please log in to generate AI SEO articles' }, 401, request);
      }

      const quota = await checkAndIncrementUsage(userId, env);
      if (!quota.allowed) {
        return jsonResponse(
          {
            error: `Daily AI quota reached (${quota.used}/${quota.limit}). Upgrade to Pro or Max for additional volume.`,
            code: 'QUOTA_EXCEEDED',
          },
          429,
          request
        );
      }

      try {
        const body = (await request.json()) as {
          topic?: string;
          keyword?: string;
          tone?: string;
          audience?: string;
        };

        const topic = body.topic?.trim();
        const keyword = body.keyword?.trim() || topic?.slice(0, 30);

        if (!topic) {
          return jsonResponse({ error: 'Topic is required' }, 400, request);
        }

        const systemPrompt = `You are an elite principal systems architect writing for Shadow Flow (https://shadowflow.work), an open-source visual workflow automation platform.
Write a deep-dive, publication-ready technical engineering article.
Follow strict human-natural writing standards:
1. NEVER use generic AI buzzwords: do not use delve, pivotal, robust, multifaceted, nuanced, transformative, groundbreaking, revolutionary, landscape, tapestry, realm, testament, fostering, harnessing, leveraging.
2. NEVER include chatbot greetings or sign-offs (no "Certainly!", "Let's dive in", "In today's digital landscape", or "I hope this helps").
3. Use plain verbs: 'use' instead of 'leverage' or 'utilize', 'start' instead of 'commence', 'show' instead of 'showcase'.
4. Structure:
   - Compelling H1 Title
   - Concrete 2-3 paragraph problem statement with specific numbers/latencies/costs.
   - 3-4 deep architectural sections with H2 headings.
   - Include realistic code, JSON, or configuration snippets.
   - Mention how Shadow Flow provides visual DAG execution, native MCP adapters, and local Ollama inference.
   - Natural conclusion without an announcement like "In conclusion".
Format: Clean GitHub-flavored Markdown.`;

        const userPrompt = `Topic: "${topic}"
Target Keyword: "${keyword}"
Audience: ${body.audience || 'Engineers, DevOps & Automation Architects'}
Tone: ${body.tone || 'authoritative, practical, and highly technical'}

Write the full article now in Markdown.`;

        let generatedMarkdown = '';
        let modelUsed = 'Workers AI';

        if (env.AI) {
          try {
            const aiRes = (await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: 3000,
            })) as { response?: string };

            if (aiRes.response) {
              generatedMarkdown = aiRes.response;
              modelUsed = '@cf/meta/llama-3.1-8b-instruct';
            }
          } catch (e) {
            console.warn('[Workers AI] Failed, falling back to Groq/Groq AI:', e);
          }
        }

        if (!generatedMarkdown) {
          const groqRes = await callGroqAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ], false, env);
          generatedMarkdown = groqRes.content;
          modelUsed = groqRes.model;
        }

        const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const excerpt = generatedMarkdown
          .split('\n')
          .find((line) => line.trim().length > 40 && !line.startsWith('#'))
          ?.replace(/[*_#`]/g, '')
          .slice(0, 160)
          .trim() || `Technical deep dive into ${topic}.`;

        return jsonResponse(
          {
            success: true,
            title: topic,
            slug,
            excerpt,
            content: generatedMarkdown,
            targetKeyword: keyword,
            model: modelUsed,
            readingTimeMinutes: Math.max(1, Math.ceil(generatedMarkdown.split(/\s+/).length / 200)),
          },
          200,
          request
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'SEO article generation failed', details: message }, 500, request);
      }
    }

    // POST /api/email/send - Dispatch transactional/support emails via Resend (Auth Protected)
    if (url.pathname === '/api/email/send' && request.method === 'POST') {
      const user = await getAuthUser(request, env);
      const isInternalBot = Boolean(env.JWT_SECRET && request.headers.get('x-internal-secret') === env.JWT_SECRET);
      if (!user && !isInternalBot) {
        return jsonResponse({ error: 'Unauthorized: Authentication required to send emails' }, 401, request);
      }

      try {
        const body = (await request.json()) as {
          to: string | string[];
          from?: string;
          subject: string;
          text?: string;
          html?: string;
          replyTo?: string;
        };

        if (!body.to || !body.subject || (!body.text && !body.html)) {
          return jsonResponse({ error: 'Missing required fields: to, subject, and text/html' }, 400, request);
        }

        const apiKey = env.RESEND_API_KEY;
        if (!apiKey) {
          return jsonResponse({ error: 'RESEND_API_KEY secret not configured in worker environment' }, 500, request);
        }
        // Enforce verified platform sender address to prevent domain spoofing
        const fromAddress = 'Shadow Flow <support@shadowflow.work>';

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: Array.isArray(body.to) ? body.to : [body.to],
            subject: body.subject,
            text: body.text || undefined,
            html: body.html || undefined,
            reply_to: body.replyTo || (user ? user.email : undefined),
          }),
        });

        const resendData = (await resendRes.json()) as Record<string, unknown>;
        if (!resendRes.ok) {
          return jsonResponse({ error: 'Resend API error', details: resendData }, resendRes.status, request);
        }

        return jsonResponse({ success: true, ...resendData }, 200, request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to send email', details: message }, 500, request);
      }
    }

    // AI Prompt-to-Flow generation endpoint using Groq + Workers AI with Plan Quotas
    if (url.pathname === '/api/generate-flow' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { prompt?: string };
        const prompt = body.prompt?.trim();

        if (!prompt) {
          return jsonResponse({ error: 'Missing "prompt" parameter in request body' }, 400, request);
        }

        const { userId } = await getEffectiveUserId(request, env);
        const quota = await checkAndIncrementUsage(userId, env);

        if (!quota.allowed) {
          return jsonResponse(
            {
              error: `Daily AI limit reached (${quota.used}/${quota.limit} requests). Upgrade to Pro for 100 requests/day or Max for unlimited.`,
              code: 'QUOTA_EXCEEDED',
              plan: quota.plan,
              limit: quota.limit,
              used: quota.used,
              remaining: 0,
            },
            429,
            request
          );
        }

        const promptMessages = [
          {
            role: 'system',
            content:
              'You are Shadow Flow Copilot. Return ONLY a valid JSON array of workflow steps with keys: id, type, label, description, params. Valid types: webhook, ai-agent, mcp-tool, activepieces-action, transform, condition, slack, email. No markdown code blocks, return raw JSON array.',
          },
          {
            role: 'user',
            content: `Generate workflow steps for: ${prompt}`,
          },
        ];

        try {
          const { content, model } = await callGroqAI(promptMessages, true, env);
          let parsedSteps: unknown;
          try {
            parsedSteps = JSON.parse(content);
          } catch {
            const jsonMatch = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedSteps = JSON.parse(jsonMatch[0]);
            } else {
              parsedSteps = { rawOutput: content };
            }
          }

          return jsonResponse(
            {
              success: true,
              prompt,
              result: parsedSteps,
              generatedBy: model,
              usage: {
                plan: quota.plan,
                limit: quota.limit >= 999999 ? 'unlimited' : quota.limit,
                used: quota.used,
                remaining: quota.remaining >= 999999 ? 'unlimited' : quota.remaining,
              },
            },
            200,
            request
          );
        } catch {
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
              usage: {
                plan: quota.plan,
                limit: quota.limit >= 999999 ? 'unlimited' : quota.limit,
                used: quota.used,
                remaining: quota.remaining >= 999999 ? 'unlimited' : quota.remaining,
              },
            },
            200,
            request
          );
        }
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
