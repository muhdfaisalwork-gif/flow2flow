import { createContext, useContext, type ReactNode } from 'react';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';
import { getTemplateById } from '@/lib/templates/templateRegistry';

interface DemoWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DemoRun {
  id: string;
  workflow_id: string;
  status: 'success' | 'failed' | 'running';
  started_at: string;
  finished_at: string | null;
  error_log: string | null;
}

interface DemoContextType {
  isDemo: true;
  workflows: DemoWorkflow[];
  runs: DemoRun[];
  demoUser: { id: string; email: string; display_name: string };
}

const DemoContext = createContext<DemoContextType | null>(null);

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@shadowflow.dev',
  display_name: 'Demo User',
};

function buildDemoWorkflows(): DemoWorkflow[] {
  const tpl1 = getTemplateById('bp-crm-typeform-hubspot');
  const tpl2 = getTemplateById('bp-ai-deep-research');
  const tpl3 = getTemplateById('bp-ai-ticket-classifier');

  return [
    {
      id: 'demo-wf-1',
      name: tpl1?.name || 'Typeform to HubSpot Lead Scoring & Slack Alert',
      description:
        tpl1?.description ||
        'Capture leads via Typeform, score with AI, upsert HubSpot, and alert Slack',
      nodes: tpl1?.nodes || [],
      edges: tpl1?.edges || [],
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'demo-wf-2',
      name: tpl2?.name || 'Autonomous Deep Research (Firecrawl + Perplexity + Claude 3.5)',
      description:
        tpl2?.description ||
        'Multi-source web research synthesized by Claude 3.5 Sonnet into Notion',
      nodes: tpl2?.nodes || [],
      edges: tpl2?.edges || [],
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-wf-3',
      name: tpl3?.name || 'AI Customer Support Ticket Classifier & Auto-Triage',
      description:
        tpl3?.description ||
        'Classify inbound support tickets with AI and route urgent P0 issues to Slack',
      nodes: tpl3?.nodes || [],
      edges: tpl3?.edges || [],
      is_active: true,
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];
}

const DEMO_RUNS: DemoRun[] = [
  {
    id: 'run-1',
    workflow_id: 'demo-wf-1',
    status: 'success',
    started_at: new Date(Date.now() - 3600000).toISOString(),
    finished_at: new Date(Date.now() - 3595000).toISOString(),
    error_log: null,
  },
  {
    id: 'run-2',
    workflow_id: 'demo-wf-1',
    status: 'success',
    started_at: new Date(Date.now() - 7200000).toISOString(),
    finished_at: new Date(Date.now() - 7196000).toISOString(),
    error_log: null,
  },
  {
    id: 'run-3',
    workflow_id: 'demo-wf-2',
    status: 'success',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    finished_at: new Date(Date.now() - 86395000).toISOString(),
    error_log: null,
  },
];

export function DemoProvider({ children }: { children: ReactNode }) {
  const workflows = buildDemoWorkflows();
  return (
    <DemoContext.Provider
      value={{ isDemo: true, workflows, runs: DEMO_RUNS, demoUser: DEMO_USER }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
