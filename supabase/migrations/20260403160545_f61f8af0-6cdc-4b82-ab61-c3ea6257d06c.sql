
-- Create user_credentials table for credential vault
CREATE TABLE public.user_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  encrypted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credentials"
ON public.user_credentials FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credentials"
ON public.user_credentials FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
ON public.user_credentials FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
ON public.user_credentials FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_credentials_updated_at
BEFORE UPDATE ON public.user_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add retry_count to workflow_runs
ALTER TABLE public.workflow_runs ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;
