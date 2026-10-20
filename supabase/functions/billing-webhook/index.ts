import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-signature, webhook-signature",
};

/**
 * Zero-Cost Serverless Billing Webhook Receiver (Supabase Free Tier Edge Function)
 * Supports Lemon Squeezy & Polar.sh subscription events:
 * - subscription_created / subscription.created
 * - subscription_updated / subscription.updated
 * - order_created / order.created
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const eventName: string =
      payload?.meta?.event_name || payload?.type || "unknown_event";

    const customerEmail: string | undefined =
      payload?.data?.attributes?.user_email ||
      payload?.data?.customer?.email ||
      payload?.data?.user?.email;

    const variantName: string = (
      payload?.data?.attributes?.variant_name ||
      payload?.data?.product?.name ||
      "pro"
    ).toLowerCase();

    const tier =
      variantName.includes("enterprise") || variantName.includes("team")
        ? "enterprise"
        : "pro";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(
      `[billing-webhook] Processed ${eventName} for ${customerEmail ?? "unknown"} -> tier=${tier}`
    );

    if (customerEmail) {
      await supabase
        .from("profiles")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("email", customerEmail);
    }

    return new Response(
      JSON.stringify({
        received: true,
        event: eventName,
        tier,
        customerEmail: customerEmail ?? null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
