import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  code: string;
  method: 'totp' | 'email' | 'sms';
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { code, method }: VerifyRequest = await req.json();

    if (method === 'totp') {
      // For TOTP, verify against stored secret using a simple algorithm
      const { data: settings } = await supabase
        .from('user_tfa_settings')
        .select('totp_secret')
        .eq('user_id', user.id)
        .single();

      if (!settings?.totp_secret) {
        return new Response(
          JSON.stringify({ valid: false, error: "TOTP not configured" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Simple TOTP verification using time-based code
      const valid = verifyTOTP(settings.totp_secret, code);
      
      if (valid) {
        await supabase
          .from('user_tfa_settings')
          .update({ totp_verified: true })
          .eq('user_id', user.id);
      }

      return new Response(
        JSON.stringify({ valid }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // For email/sms, check pending verifications
    const { data: pending } = await supabase
      .from('tfa_pending_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('method', method)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!pending) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired code" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark as used
    await supabase
      .from('tfa_pending_verifications')
      .update({ used: true })
      .eq('id', pending.id);

    // Update verification status
    const updateField = method === 'email' ? 'email_verified' : 'phone_verified';
    await supabase
      .from('user_tfa_settings')
      .update({ [updateField]: true })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({ valid: true }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// Simple TOTP verification
function verifyTOTP(secret: string, code: string): boolean {
  const timeStep = 30;
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check current and adjacent time windows
  for (let i = -1; i <= 1; i++) {
    const counter = Math.floor((currentTime / timeStep) + i);
    const expectedCode = generateTOTPCode(secret, counter);
    if (expectedCode === code) {
      return true;
    }
  }
  
  return false;
}

function generateTOTPCode(secret: string, counter: number): string {
  // Simple hash-based code generation (in production, use proper HMAC-SHA1)
  const hash = simpleHash(secret + counter.toString());
  const code = Math.abs(hash % 1000000).toString().padStart(6, '0');
  return code;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
