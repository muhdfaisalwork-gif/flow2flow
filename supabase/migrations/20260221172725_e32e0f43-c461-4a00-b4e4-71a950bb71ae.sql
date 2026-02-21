
-- Fix 1: Create a safe view for TFA settings (excludes totp_secret, backup_codes, phone_number)
CREATE VIEW public.user_tfa_settings_safe AS
SELECT id, user_id, enabled, preferred_method, totp_verified, phone_verified, email_verified, created_at, updated_at
FROM public.user_tfa_settings;

-- Fix 2: Add UPDATE and DELETE policies on workflow_runs
CREATE POLICY "Users can update runs of their workflows"
ON public.workflow_runs FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_runs.workflow_id
    AND workflows.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete runs of their workflows"
ON public.workflow_runs FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_runs.workflow_id
    AND workflows.user_id = auth.uid()
  )
);
