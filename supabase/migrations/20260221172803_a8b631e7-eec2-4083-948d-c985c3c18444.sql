
-- Fix the SECURITY DEFINER view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.user_tfa_settings_safe;

CREATE VIEW public.user_tfa_settings_safe
WITH (security_invoker = true) AS
SELECT id, user_id, enabled, preferred_method, totp_verified, phone_verified, email_verified, created_at, updated_at
FROM public.user_tfa_settings;
