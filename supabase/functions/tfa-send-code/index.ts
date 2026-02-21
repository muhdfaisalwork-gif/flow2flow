import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCodeRequest {
  method: 'email' | 'sms';
  phone_number?: string;
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

    const { method, phone_number }: SendCodeRequest = await req.json();

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending verification
    await supabase
      .from('tfa_pending_verifications')
      .insert({
        user_id: user.id,
        method,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (method === 'email') {
      // Use Resend if configured
      const resendKey = Deno.env.get("RESEND_API_KEY");
      
      if (resendKey) {
        const resend = new Resend(resendKey);
        
        await resend.emails.send({
          from: "Flow2Flow <noreply@flow2flow.lovable.app>",
          to: [user.email!],
          subject: "Your verification code",
          html: `
            <h1>Your 2FA Verification Code</h1>
            <p>Use this code to verify your identity:</p>
            <h2 style="font-size: 32px; letter-spacing: 8px; font-family: monospace;">${code}</h2>
            <p>This code expires in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          `,
        });
      } else {
        // Email service not configured - code is stored in DB but not delivered
        console.log(`2FA email code requested for user ${user.id} (email service not configured)`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Code sent to your email" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (method === 'sms') {
      const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

      if (!twilioSid || !twilioToken || !twilioPhone) {
        // SMS service not configured - code is stored in DB but not delivered
        console.log(`2FA SMS code requested for user ${user.id} (SMS service not configured)`);
        
        // Update phone number in settings
        if (phone_number) {
          await supabase
            .from('user_tfa_settings')
            .update({ phone_number })
            .eq('user_id', user.id);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "SMS service not configured. Please configure Twilio to send codes." 
          }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Send SMS via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = btoa(`${twilioSid}:${twilioToken}`);

      const targetPhone = phone_number || (await supabase
        .from('user_tfa_settings')
        .select('phone_number')
        .eq('user_id', user.id)
        .single()).data?.phone_number;

      if (!targetPhone) {
        throw new Error("No phone number provided");
      }

      await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: targetPhone,
          From: twilioPhone,
          Body: `Your Flow2Flow verification code is: ${code}. Expires in 10 minutes.`,
        }),
      });

      // Update phone number in settings
      await supabase
        .from('user_tfa_settings')
        .update({ phone_number: targetPhone })
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ success: true, message: "Code sent via SMS" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    throw new Error("Invalid method");
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
