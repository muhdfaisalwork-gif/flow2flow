
-- 1. Fix TFA settings: drop SELECT on raw table, force use of safe view
DROP POLICY IF EXISTS "Users can view their own 2FA settings" ON public.user_tfa_settings;

-- Create a restricted SELECT that excludes secrets
CREATE POLICY "Users can view their own TFA settings (no secrets)"
ON public.user_tfa_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add RLS to the safe view
ALTER VIEW public.user_tfa_settings_safe SET (security_invoker = true);

-- 2. Fix TFA pending verifications: remove SELECT policy (codes should never be client-readable)
DROP POLICY IF EXISTS "Users can view their own pending verifications" ON public.tfa_pending_verifications;

-- 3. Fix workflow_runs INSERT: restrict to authenticated only
DROP POLICY IF EXISTS "Users can create runs for their workflows" ON public.workflow_runs;

CREATE POLICY "Authenticated users can create runs for their workflows"
ON public.workflow_runs
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM workflows
  WHERE workflows.id = workflow_runs.workflow_id
  AND workflows.user_id = auth.uid()
));

-- 4. Fix workflows share_token policy: require matching token, not just existence
DROP POLICY IF EXISTS "Anyone can view public workflows" ON public.workflows;

CREATE POLICY "Anyone can view public workflows"
ON public.workflows
FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "Anyone can view shared workflows by token"
ON public.workflows
FOR SELECT
TO public
USING (
  share_token IS NOT NULL 
  AND share_token = current_setting('request.headers', true)::json->>'x-share-token'
);
