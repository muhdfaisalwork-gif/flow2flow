-- Add share_token to workflows for public sharing
ALTER TABLE public.workflows 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- Create index for share token lookups
CREATE INDEX IF NOT EXISTS idx_workflows_share_token ON public.workflows(share_token) WHERE share_token IS NOT NULL;

-- Create workflow versions table for version history
CREATE TABLE public.workflow_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  change_summary TEXT
);

-- Enable RLS on workflow_versions
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions of their own workflows
CREATE POLICY "Users can view versions of their workflows"
ON public.workflow_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_versions.workflow_id 
    AND workflows.user_id = auth.uid()
  )
);

-- Users can create versions for their own workflows
CREATE POLICY "Users can create versions of their workflows"
ON public.workflow_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_versions.workflow_id 
    AND workflows.user_id = auth.uid()
  )
);

-- Users can delete versions of their own workflows
CREATE POLICY "Users can delete versions of their workflows"
ON public.workflow_versions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_versions.workflow_id 
    AND workflows.user_id = auth.uid()
  )
);

-- Create unique constraint on workflow_id + version_number
CREATE UNIQUE INDEX idx_workflow_version_number ON public.workflow_versions(workflow_id, version_number);

-- Add policy for viewing public/shared workflows
CREATE POLICY "Anyone can view public workflows"
ON public.workflows
FOR SELECT
USING (is_public = true OR share_token IS NOT NULL);

-- Insert sample workflow templates
INSERT INTO public.workflow_templates (name, description, category, nodes, edges, is_public)
VALUES 
(
  'Email to Slack Notification',
  'Automatically send a Slack message when receiving important emails',
  'communication',
  '[{"id":"trigger-1","type":"custom","position":{"x":250,"y":100},"data":{"type":"webhook-trigger","label":"Email Webhook","category":"triggers","icon":"Webhook","color":"bg-green-500","config":{},"isConfigured":false}},{"id":"action-1","type":"custom","position":{"x":250,"y":250},"data":{"type":"http-request","label":"Send to Slack","category":"actions","icon":"Globe","color":"bg-blue-500","config":{"url":"https://hooks.slack.com/...","method":"POST"},"isConfigured":true}}]',
  '[{"id":"edge-1","source":"trigger-1","target":"action-1","animated":true}]',
  true
),
(
  'GitHub Issue Tracker',
  'Track new GitHub issues and log them to a database',
  'development',
  '[{"id":"trigger-1","type":"custom","position":{"x":250,"y":100},"data":{"type":"webhook-trigger","label":"GitHub Webhook","category":"triggers","icon":"Webhook","color":"bg-green-500","config":{},"isConfigured":false}},{"id":"action-1","type":"custom","position":{"x":250,"y":250},"data":{"type":"data-transform","label":"Parse Issue Data","category":"actions","icon":"Shuffle","color":"bg-purple-500","config":{},"isConfigured":false}},{"id":"action-2","type":"custom","position":{"x":250,"y":400},"data":{"type":"http-request","label":"Save to Database","category":"actions","icon":"Globe","color":"bg-blue-500","config":{},"isConfigured":false}}]',
  '[{"id":"edge-1","source":"trigger-1","target":"action-1","animated":true},{"id":"edge-2","source":"action-1","target":"action-2","animated":true}]',
  true
),
(
  'AI Content Summarizer',
  'Automatically summarize long documents using AI',
  'ai',
  '[{"id":"trigger-1","type":"custom","position":{"x":250,"y":100},"data":{"type":"manual-trigger","label":"Manual Start","category":"triggers","icon":"Hand","color":"bg-green-500","config":{},"isConfigured":true}},{"id":"action-1","type":"custom","position":{"x":250,"y":250},"data":{"type":"ai-summarize","label":"AI Summarize","category":"ai","icon":"Brain","color":"bg-pink-500","config":{},"isConfigured":false}},{"id":"action-2","type":"custom","position":{"x":250,"y":400},"data":{"type":"http-request","label":"Send Summary","category":"actions","icon":"Globe","color":"bg-blue-500","config":{},"isConfigured":false}}]',
  '[{"id":"edge-1","source":"trigger-1","target":"action-1","animated":true},{"id":"edge-2","source":"action-1","target":"action-2","animated":true}]',
  true
),
(
  'Scheduled Data Sync',
  'Sync data between two APIs on a schedule',
  'data',
  '[{"id":"trigger-1","type":"custom","position":{"x":250,"y":100},"data":{"type":"schedule-trigger","label":"Daily at 9 AM","category":"triggers","icon":"Clock","color":"bg-green-500","config":{"cron":"0 9 * * *"},"isConfigured":true}},{"id":"action-1","type":"custom","position":{"x":250,"y":250},"data":{"type":"http-request","label":"Fetch Source Data","category":"actions","icon":"Globe","color":"bg-blue-500","config":{},"isConfigured":false}},{"id":"action-2","type":"custom","position":{"x":250,"y":400},"data":{"type":"data-transform","label":"Transform Data","category":"actions","icon":"Shuffle","color":"bg-purple-500","config":{},"isConfigured":false}},{"id":"action-3","type":"custom","position":{"x":250,"y":550},"data":{"type":"http-request","label":"Push to Destination","category":"actions","icon":"Globe","color":"bg-blue-500","config":{},"isConfigured":false}}]',
  '[{"id":"edge-1","source":"trigger-1","target":"action-1","animated":true},{"id":"edge-2","source":"action-1","target":"action-2","animated":true},{"id":"edge-3","source":"action-2","target":"action-3","animated":true}]',
  true
),
(
  'Conditional Email Router',
  'Route emails to different channels based on content',
  'communication',
  '[{"id":"trigger-1","type":"custom","position":{"x":350,"y":100},"data":{"type":"webhook-trigger","label":"Email Received","category":"triggers","icon":"Webhook","color":"bg-green-500","config":{},"isConfigured":false}},{"id":"logic-1","type":"custom","position":{"x":350,"y":250},"data":{"type":"if-else","label":"Check Priority","category":"logic","icon":"GitBranch","color":"bg-orange-500","config":{},"isConfigured":false}},{"id":"action-1","type":"custom","position":{"x":150,"y":400},"data":{"type":"http-request","label":"Urgent: SMS Alert","category":"actions","icon":"Globe","color":"bg-blue-500","config":{},"isConfigured":false}},{"id":"action-2","type":"custom","position":{"x":550,"y":400},"data":{"type":"http-request","label":"Normal: Slack","category":"actions","icon":"Globe","color":"bg-blue-500","config":{},"isConfigured":false}}]',
  '[{"id":"edge-1","source":"trigger-1","target":"logic-1","animated":true},{"id":"edge-2","source":"logic-1","target":"action-1","animated":true},{"id":"edge-3","source":"logic-1","target":"action-2","animated":true}]',
  true
),
(
  'Lead Enrichment Pipeline',
  'Enrich new leads with AI analysis and external data',
  'sales',
  '[{"id":"trigger-1","type":"custom","position":{"x":250,"y":100},"data":{"type":"webhook-trigger","label":"New Lead","category":"triggers","icon":"Webhook","color":"bg-green-500","config":{},"isConfigured":false}},{"id":"action-1","type":"custom","position":{"x":250,"y":250},"data":{"type":"http-request","label":"Fetch Company Data","category":"actions","icon":"Globe","color":"bg-blue-500","config":{},"isConfigured":false}},{"id":"action-2","type":"custom","position":{"x":250,"y":400},"data":{"type":"ai-extract","label":"AI Extract Insights","category":"ai","icon":"Brain","color":"bg-pink-500","config":{},"isConfigured":false}},{"id":"action-3","type":"custom","position":{"x":250,"y":550},"data":{"type":"http-request","label":"Update CRM","category":"actions","icon":"Globe","color":"bg-blue-500","config":{},"isConfigured":false}}]',
  '[{"id":"edge-1","source":"trigger-1","target":"action-1","animated":true},{"id":"edge-2","source":"action-1","target":"action-2","animated":true},{"id":"edge-3","source":"action-2","target":"action-3","animated":true}]',
  true
)
ON CONFLICT DO NOTHING;