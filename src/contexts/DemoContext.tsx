import { createContext, useContext, useState, type ReactNode } from "react";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

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
  status: "success" | "failed" | "running";
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

const DEMO_USER = { id: "demo-user-001", email: "demo@flow2flow.app", display_name: "Demo User" };

const DEMO_WORKFLOWS: DemoWorkflow[] = [
  {
    id: "demo-wf-1",
    name: "Lead Generation Pipeline",
    description: "Capture leads via webhook, extract with AI, filter & email qualified ones",
    nodes: [],
    edges: [],
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "demo-wf-2",
    name: "Content Pipeline",
    description: "Scheduled content generation with AI and Slack notifications",
    nodes: [],
    edges: [],
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "demo-wf-3",
    name: "AI Customer Support",
    description: "Auto-respond to support tickets using AI chat",
    nodes: [],
    edges: [],
    is_active: false,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const DEMO_RUNS: DemoRun[] = [
  { id: "run-1", workflow_id: "demo-wf-1", status: "success", started_at: new Date(Date.now() - 3600000).toISOString(), finished_at: new Date(Date.now() - 3595000).toISOString(), error_log: null },
  { id: "run-2", workflow_id: "demo-wf-1", status: "success", started_at: new Date(Date.now() - 7200000).toISOString(), finished_at: new Date(Date.now() - 7196000).toISOString(), error_log: null },
  { id: "run-3", workflow_id: "demo-wf-2", status: "failed", started_at: new Date(Date.now() - 86400000).toISOString(), finished_at: new Date(Date.now() - 86395000).toISOString(), error_log: "Timeout: Slack API did not respond" },
  { id: "run-4", workflow_id: "demo-wf-2", status: "success", started_at: new Date(Date.now() - 172800000).toISOString(), finished_at: new Date(Date.now() - 172796000).toISOString(), error_log: null },
  { id: "run-5", workflow_id: "demo-wf-3", status: "success", started_at: new Date(Date.now() - 259200000).toISOString(), finished_at: new Date(Date.now() - 259197000).toISOString(), error_log: null },
];

export function DemoProvider({ children }: { children: ReactNode }) {
  return (
    <DemoContext.Provider value={{ isDemo: true, workflows: DEMO_WORKFLOWS, runs: DEMO_RUNS, demoUser: DEMO_USER }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
