import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-signature",
};

/**
 * Lemon Squeezy subscription webhook receiver (Supabase Edge Function).
 *
 * Security: every request must carry an `X-Signature` header containing the
 * hex HMAC-SHA256 of the raw request body, signed with the webhook signing
 * secret configured in Lemon Squeezy. Set it with:
 *   supabase secrets set LEMONSQUEEZY_WEBHOOK_SECRET=...
 * Unsigned or mis-signed requests are rejected with 401.
 *
 * NOTE: Persisting the subscription tier requires a `subscriptions` table
 * (not yet in the schema). Until then this function verifies + parses the
 * event and logs it; it does not grant access by itself.
 */

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const secret = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[billing-webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set; refusing request");
    return json(500, { error: "Webhook secret not configured" });
  }

  const rawBody = await req.text();
  const signature = (req.headers.get("x-signature") ?? "").toLowerCase();
  const expected = await hmacSha256Hex(secret, rawBody);
  if (!signature || !timingSafeEqual(signature, expected)) {
    return json(401, { error: "Invalid signature" });
  }

  let payload: { meta?: { event_name?: string }; data?: { attributes?: Record<string, unknown> } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const eventName: string = payload?.meta?.event_name ?? "unknown_event";
  const attrs = payload?.data?.attributes ?? {};
  const customerEmail = typeof attrs.user_email === "string" ? attrs.user_email : null;
  const variantName = String(attrs.variant_name ?? attrs.product_name ?? "").toLowerCase();
  const tier = /enterprise|team|agency/.test(variantName) ? "enterprise" : "pro";
  const status = typeof attrs.status === "string" ? attrs.status : "unknown";

  console.log(
    `[billing-webhook] verified ${eventName} email=${customerEmail ?? "unknown"} tier=${tier} status=${status}`
  );

  return json(200, { received: true, event: eventName, tier, status });
});
