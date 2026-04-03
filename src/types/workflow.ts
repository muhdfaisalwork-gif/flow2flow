import type { Node, Edge } from '@xyflow/react';

export type NodeType = 
  // Triggers
  | 'webhook-trigger'
  | 'schedule-trigger'
  | 'manual-trigger'
  // Actions
  | 'http-request'
  | 'code-node'
  | 'data-transform'
  | 'email-send'
  | 'slack-message'
  | 'db-query'
  | 'webhook-response'
  // Logic
  | 'if-else'
  | 'switch'
  | 'loop'
  | 'merge'
  | 'filter'
  | 'delay'
  | 'set-variable'
  // AI
  | 'ai-chat'
  | 'ai-extract'
  | 'ai-summarize';

export type NodeCategory = 'triggers' | 'actions' | 'logic' | 'ai';

export interface NodeDefinition {
  type: NodeType;
  label: string;
  description: string;
  category: NodeCategory;
  icon: string;
  color: string;
  inputs: number;
  outputs: number;
  defaultData: Record<string, unknown>;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  type: NodeType;
  category: NodeCategory;
  icon: string;
  color: string;
  config: Record<string, unknown>;
  isConfigured: boolean;
}

export type WorkflowNode = Node<WorkflowNodeData, string>;
export type WorkflowEdge = Edge;

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings: WorkflowSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowSettings {
  timezone: string;
  retryOnFailure: boolean;
  maxRetries: number;
  errorNotification: boolean;
}

export type WorkflowRunStatus = 'pending' | 'running' | 'success' | 'failed';

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowRunStatus;
  startedAt: string;
  finishedAt?: string;
  inputData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  errorLog?: string;
  retryCount?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isPublic: boolean;
}
