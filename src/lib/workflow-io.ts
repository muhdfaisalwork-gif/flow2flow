import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  NodeCategory,
  CredentialDependency,
} from '@/types/workflow';
import { nodeDefinitions } from '@/lib/nodes/definitions';
import {
  parseN8nWorkflow,
  serializeToN8nJson,
  autoLayoutWorkflow,
  type RawN8nWorkflow,
} from '@/lib/importer/n8nAdapter';

export type ExportFormat = 'json' | 'n8n' | 'activepieces' | 'zapier';

interface ExportedWorkflow {
  version: string;
  format: ExportFormat;
  exportedAt: string;
  workflow: {
    name: string;
    description: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    settings: Workflow['settings'];
  };
}

function getNodeDefinition(type: NodeType) {
  return nodeDefinitions.find((def) => def.type === type);
}

export function exportWorkflow(
  workflow: Workflow,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  format: ExportFormat = 'json'
): string {
  if (format === 'n8n') {
    return serializeToN8nJson(workflow.name, nodes, edges);
  }

  if (format === 'activepieces') {
    return exportToActivepieces(workflow, nodes);
  }

  if (format === 'zapier') {
    return exportToZapier(workflow, nodes);
  }

  const exportData: ExportedWorkflow = {
    version: '1.0.0',
    format: 'json',
    exportedAt: new Date().toISOString(),
    workflow: {
      name: workflow.name,
      description: workflow.description,
      nodes,
      edges,
      settings: workflow.settings,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

function exportToActivepieces(workflow: Workflow, nodes: WorkflowNode[]): string {
  const apWorkflow = {
    name: workflow.name,
    description: workflow.description,
    trigger: nodes.find((n) => n.data.category === 'triggers' || n.data.category === 'trigger'),
    actions: nodes
      .filter((n) => n.data.category !== 'triggers' && n.data.category !== 'trigger')
      .map((node) => ({
        name: node.data.label,
        type: node.data.type,
        settings: node.data.config || {},
      })),
  };

  return JSON.stringify(apWorkflow, null, 2);
}

function exportToZapier(workflow: Workflow, nodes: WorkflowNode[]): string {
  const zapierFormat = {
    name: workflow.name,
    trigger: nodes.find((n) => n.data.category === 'triggers' || n.data.category === 'trigger')?.data,
    actions: nodes
      .filter((n) => n.data.category !== 'triggers' && n.data.category !== 'trigger')
      .map((node) => ({
        name: node.data.label,
        type: node.data.type,
        config: node.data.config || {},
      })),
  };

  return JSON.stringify(zapierFormat, null, 2);
}

export function importWorkflow(jsonString: string): {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings: Workflow['settings'];
  missingCredentials?: CredentialDependency[];
  sourceFormat: string;
} {
  let data: Record<string, unknown>;

  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format. Please check your file.');
  }

  // 1. Shadow Flow native exported format
  if (data.version && data.format === 'json' && data.workflow) {
    const wf = data.workflow as {
      name: string;
      description: string;
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      settings: Workflow['settings'];
    };
    return {
      ...wf,
      sourceFormat: 'Shadow Flow',
    };
  }

  // 2. n8n format (has connections object or nodes with n8n-nodes-* type strings)
  const isN8nNodes =
    Array.isArray(data.nodes) &&
    data.nodes.some(
      (n: unknown) =>
        typeof n === 'object' &&
        n !== null &&
        'type' in n &&
        typeof (n as { type: unknown }).type === 'string' &&
        ((n as { type: string }).type.includes('n8n-nodes-') ||
          Array.isArray((n as { position?: unknown }).position))
    );

  if ((data.connections && Array.isArray(data.nodes)) || isN8nNodes) {
    const parsed = parseN8nWorkflow(data as unknown as RawN8nWorkflow);
    return {
      name: parsed.name,
      description: parsed.description,
      nodes: parsed.nodes,
      edges: parsed.edges,
      settings: parsed.settings,
      missingCredentials: parsed.missingCredentials,
      sourceFormat: 'n8n',
    };
  }

  // 3. Activepieces or Zapier-like format
  if (data.trigger || data.actions) {
    return importFromGenericFormat(
      data as {
        name?: string;
        trigger?: unknown;
        actions?: Array<{ name: string; type: string; config?: Record<string, unknown> }>;
      }
    );
  }

  // 4. Raw Shadow Flow nodes/edges JSON
  if (Array.isArray(data.nodes)) {
    const rawNodes = data.nodes as WorkflowNode[];
    const rawEdges = (data.edges as WorkflowEdge[]) || [];
    return {
      name: (data.name as string) || 'Imported Workflow',
      description: (data.description as string) || '',
      nodes: autoLayoutWorkflow(rawNodes, rawEdges),
      edges: rawEdges,
      settings: (data.settings as Workflow['settings']) || {
        timezone: 'UTC',
        retryOnFailure: true,
        maxRetries: 3,
        errorNotification: true,
      },
      sourceFormat: 'Generic JSON',
    };
  }

  throw new Error(
    'Unrecognized workflow format. Supported formats: Shadow Flow, n8n, Activepieces, Zapier, or any JSON with a nodes array.'
  );
}

function mapGenericTypeToFlow(genericType: string): NodeType {
  const lowerType = genericType.toLowerCase();
  if (lowerType.includes('http') || lowerType.includes('request')) return 'http-request';
  if (lowerType.includes('code') || lowerType.includes('script')) return 'code-node';
  if (lowerType.includes('transform') || lowerType.includes('set')) return 'data-transform';
  if (lowerType.includes('if') || lowerType.includes('condition')) return 'if-else';
  if (lowerType.includes('ai') || lowerType.includes('chat')) return 'ai-chat';
  return 'http-request';
}

function importFromGenericFormat(data: {
  name?: string;
  trigger?: unknown;
  actions?: Array<{ name: string; type: string; config?: Record<string, unknown> }>;
}): ReturnType<typeof importWorkflow> {
  const nodes: WorkflowNode[] = [];

  if (data.trigger) {
    const triggerDef = getNodeDefinition('webhook-trigger');
    nodes.push({
      id: `trigger-${Date.now()}`,
      type: 'custom',
      position: { x: 100, y: 180 },
      data: {
        type: 'webhook-trigger',
        label: 'Trigger',
        category: 'triggers' as NodeCategory,
        icon: triggerDef?.icon || 'Webhook',
        color: triggerDef?.color || '#3B82F6',
        config: {},
        isConfigured: true,
        executionStatus: 'idle',
      },
    });
  }

  data.actions?.forEach((action, index) => {
    const actionType = mapGenericTypeToFlow(action.type);
    const actionDef = getNodeDefinition(actionType);
    nodes.push({
      id: `action-${index}-${Date.now()}`,
      type: 'custom',
      position: { x: 100 + (index + 1) * 320, y: 180 },
      data: {
        type: actionType,
        label: action.name,
        category: (actionDef?.category || 'actions') as NodeCategory,
        icon: actionDef?.icon || 'Zap',
        color: actionDef?.color || '#8B5CF6',
        config: action.config || {},
        isConfigured: Object.keys(action.config || {}).length > 0,
        executionStatus: 'idle',
      },
    });
  });

  const edges: WorkflowEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      sourceHandle: 'output_0',
      type: 'custom',
      animated: true,
    });
  }

  return {
    name: data.name || 'Imported Workflow',
    description: 'Imported workflow',
    nodes: autoLayoutWorkflow(nodes, edges),
    edges,
    settings: {
      timezone: 'UTC',
      retryOnFailure: true,
      maxRetries: 3,
      errorNotification: true,
    },
    sourceFormat: 'Generic',
  };
}

export function downloadWorkflow(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
