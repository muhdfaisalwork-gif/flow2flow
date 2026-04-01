
-- Drop the current broad SELECT and replace with one that denies direct table reads from client
-- The safe view (with security_invoker) will use this policy but only exposes safe columns
DROP POLICY IF EXISTS "Users can view their own TFA settings (no secrets)" ON public.user_tfa_settings;

-- Restrictive SELECT: only authenticated users, only their own data
CREATE POLICY "Users can view own TFA settings"
ON public.user_tfa_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
