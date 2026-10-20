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
  | 'ai-summarize'
  | 'ai-agent'
  // Storage / Generic
  | 'vector-store'
  | 'memory-node'
  | 'tool-node'
  | string;

export type NodeCategory =
  | 'triggers'
  | 'actions'
  | 'logic'
  | 'ai'
  | 'storage'
  | 'trigger'
  | 'action';

export type NodeExecutionStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'success'
  | 'error'
  | 'skipped';

export type HandleConnectionType =
  | 'main'
  | 'ai_languageModel'
  | 'ai_tool'
  | 'ai_memory'
  | 'ai_embedding'
  | 'ai_textSplitter'
  | 'ai_vectorStore'
  | 'ai_document'
  | 'ai_outputParser';

export interface HandleDefinition {
  id: string;
  label: string;
  type: HandleConnectionType;
  index?: number;
}

export interface CredentialDependency {
  id: string;
  name: string;
  service: string;
  envVarName: string;
  nodeIds: string[];
  nodeNames: string[];
  isConfigured: boolean;
}

export interface AISubNodeAttachment {
  id: string;
  label: string;
  role: HandleConnectionType;
  n8nType: string;
  icon: string;
  config?: Record<string, unknown>;
}

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
  // Extended Blueprint fields
  n8nType?: string;
  serviceName?: string;
  executionStatus?: NodeExecutionStatus;
  executionDurationMs?: number;
  executionOutput?: unknown;
  executionError?: string;
  outputs?: HandleDefinition[];
  aiSubNodes?: AISubNodeAttachment[];
  requiredCredentials?: string[];
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
  missingCredentials?: CredentialDependency[];
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

export interface ExecutionLogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeLabel: string;
  status: NodeExecutionStatus;
  durationMs?: number;
  message: string;
  output?: unknown;
  error?: string;
}

export type TemplateCategory =
  | 'AI & Autonomous Agents'
  | 'Messaging & Bots'
  | 'Email & CRM'
  | 'Databases & Storage'
  | 'DevOps & Webhooks'
  | 'Industry Verticals'
  | string;

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  vertical?: string;
  targetOutcome?: string;
  tags?: string[];
  requiredCredentials?: string[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  rawN8nJson?: Record<string, unknown>;
  isPublic: boolean;
}
