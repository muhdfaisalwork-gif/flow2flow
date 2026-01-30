import type { Workflow, WorkflowNode, WorkflowEdge, NodeType, NodeCategory } from '@/types/workflow';
import { nodeDefinitions } from '@/lib/nodes/definitions';

// Export formats
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

interface N8nWorkflow {
  name: string;
  nodes: Array<{
    name: string;
    type: string;
    position: [number, number];
    parameters: Record<string, unknown>;
  }>;
  connections: Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }>;
}

// Helper to get node definition by type
function getNodeDefinition(type: NodeType) {
  return nodeDefinitions.find(def => def.type === type);
}

// Export workflow as JSON
export function exportWorkflow(
  workflow: Workflow,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  format: ExportFormat = 'json'
): string {
  if (format === 'n8n') {
    return exportToN8n(workflow, nodes, edges);
  }
  
  if (format === 'activepieces') {
    return exportToActivepieces(workflow, nodes, edges);
  }
  
  if (format === 'zapier') {
    return exportToZapier(workflow, nodes, edges);
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

// Export to n8n format
function exportToN8n(workflow: Workflow, nodes: WorkflowNode[], edges: WorkflowEdge[]): string {
  const n8nWorkflow: N8nWorkflow = {
    name: workflow.name,
    nodes: nodes.map((node) => ({
      name: node.data.label,
      type: mapNodeTypeToN8n(node.data.type),
      position: [node.position.x, node.position.y],
      parameters: node.data.config || {},
    })),
    connections: buildN8nConnections(nodes, edges),
  };

  return JSON.stringify(n8nWorkflow, null, 2);
}

// Export to Activepieces format
function exportToActivepieces(workflow: Workflow, nodes: WorkflowNode[], edges: WorkflowEdge[]): string {
  const apWorkflow = {
    name: workflow.name,
    description: workflow.description,
    trigger: nodes.find(n => n.data.category === 'triggers'),
    actions: nodes.filter(n => n.data.category !== 'triggers').map(node => ({
      name: node.data.label,
      type: node.data.type,
      settings: node.data.config || {},
    })),
  };

  return JSON.stringify(apWorkflow, null, 2);
}

// Export to Zapier format (simplified)
function exportToZapier(workflow: Workflow, nodes: WorkflowNode[], edges: WorkflowEdge[]): string {
  const zapierFormat = {
    name: workflow.name,
    trigger: nodes.find(n => n.data.category === 'triggers')?.data,
    actions: nodes.filter(n => n.data.category !== 'triggers').map(node => ({
      name: node.data.label,
      type: node.data.type,
      config: node.data.config || {},
    })),
  };

  return JSON.stringify(zapierFormat, null, 2);
}

function mapNodeTypeToN8n(type: NodeType): string {
  const typeMap: Record<NodeType, string> = {
    'webhook-trigger': 'n8n-nodes-base.webhook',
    'schedule-trigger': 'n8n-nodes-base.cron',
    'manual-trigger': 'n8n-nodes-base.manualTrigger',
    'http-request': 'n8n-nodes-base.httpRequest',
    'code-node': 'n8n-nodes-base.code',
    'data-transform': 'n8n-nodes-base.set',
    'if-else': 'n8n-nodes-base.if',
    'switch': 'n8n-nodes-base.switch',
    'loop': 'n8n-nodes-base.splitInBatches',
    'merge': 'n8n-nodes-base.merge',
    'ai-chat': 'n8n-nodes-langchain.chatOpenAi',
    'ai-extract': 'n8n-nodes-langchain.extractData',
    'ai-summarize': 'n8n-nodes-langchain.summarize',
  };
  return typeMap[type] || `n8n-nodes-base.${type}`;
}

function buildN8nConnections(nodes: WorkflowNode[], edges: WorkflowEdge[]): N8nWorkflow['connections'] {
  const connections: N8nWorkflow['connections'] = {};
  
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      const sourceName = sourceNode.data.label;
      if (!connections[sourceName]) {
        connections[sourceName] = { main: [[]] };
      }
      connections[sourceName].main[0].push({
        node: targetNode.data.label,
        type: 'main',
        index: 0,
      });
    }
  });

  return connections;
}

// Import workflow from JSON
export function importWorkflow(jsonString: string): {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings: Workflow['settings'];
  sourceFormat: string;
} {
  let data: Record<string, unknown>;
  
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid JSON format. Please check your file.');
  }
  
  // Detect format
  if (data.version && data.format === 'json') {
    // Flow2Flow native format
    return {
      ...(data.workflow as ReturnType<typeof importWorkflow>),
      sourceFormat: 'Flow2Flow',
    };
  }
  
  if (data.connections && Array.isArray(data.nodes)) {
    // n8n format
    return importFromN8n(data as unknown as N8nWorkflow);
  }
  
  if (data.trigger || data.actions) {
    // Activepieces or Zapier-like format (trigger OR actions)
    return importFromGenericFormat(data as { name?: string; trigger?: unknown; actions?: Array<{ name: string; type: string; config?: Record<string, unknown> }> });
  }

  // Try to import as raw nodes/edges format
  if (Array.isArray(data.nodes)) {
    return {
      name: (data.name as string) || 'Imported Workflow',
      description: (data.description as string) || '',
      nodes: data.nodes as WorkflowNode[],
      edges: (data.edges as WorkflowEdge[]) || [],
      settings: (data.settings as Workflow['settings']) || {
        timezone: 'UTC',
        retryOnFailure: true,
        maxRetries: 3,
        errorNotification: true,
      },
      sourceFormat: 'Generic JSON',
    };
  }

  throw new Error('Unrecognized workflow format. Supported formats: Flow2Flow, n8n, Activepieces, Zapier, or any JSON with nodes array.');
}

function importFromN8n(n8nData: N8nWorkflow): ReturnType<typeof importWorkflow> {
  const nodes: WorkflowNode[] = n8nData.nodes.map((node, index) => {
    const flowType = mapN8nTypeToFlow(node.type);
    const definition = getNodeDefinition(flowType);
    
    return {
      id: `node-${index}-${Date.now()}`,
      type: 'custom',
      position: { x: node.position[0], y: node.position[1] },
      data: {
        type: flowType,
        label: node.name,
        category: (definition?.category || 'actions') as NodeCategory,
        icon: definition?.icon || 'Zap',
        color: definition?.color || 'bg-blue-500',
        config: node.parameters,
        isConfigured: Object.keys(node.parameters).length > 0,
      },
    };
  });

  // Build edges from connections
  const edges: WorkflowEdge[] = [];
  Object.entries(n8nData.connections).forEach(([sourceName, connection]) => {
    const sourceNode = nodes.find(n => n.data.label === sourceName);
    if (sourceNode && connection.main) {
      connection.main.forEach(outputs => {
        outputs.forEach(output => {
          const targetNode = nodes.find(n => n.data.label === output.node);
          if (targetNode) {
            edges.push({
              id: `edge-${sourceNode.id}-${targetNode.id}`,
              source: sourceNode.id,
              target: targetNode.id,
              animated: true,
            });
          }
        });
      });
    }
  });

  return {
    name: n8nData.name,
    description: 'Imported from n8n',
    nodes,
    edges,
    settings: {
      timezone: 'UTC',
      retryOnFailure: true,
      maxRetries: 3,
      errorNotification: true,
    },
    sourceFormat: 'n8n',
  };
}

function mapN8nTypeToFlow(n8nType: string): NodeType {
  if (n8nType.includes('webhook')) return 'webhook-trigger';
  if (n8nType.includes('cron') || n8nType.includes('schedule')) return 'schedule-trigger';
  if (n8nType.includes('manualTrigger')) return 'manual-trigger';
  if (n8nType.includes('httpRequest')) return 'http-request';
  if (n8nType.includes('code')) return 'code-node';
  if (n8nType.includes('if')) return 'if-else';
  if (n8nType.includes('switch')) return 'switch';
  if (n8nType.includes('set')) return 'data-transform';
  return 'http-request';
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

function importFromGenericFormat(data: { name?: string; trigger?: unknown; actions?: Array<{ name: string; type: string; config?: Record<string, unknown> }> }): ReturnType<typeof importWorkflow> {
  const nodes: WorkflowNode[] = [];
  let yPos = 100;

  if (data.trigger) {
    const triggerDef = getNodeDefinition('webhook-trigger');
    nodes.push({
      id: `trigger-${Date.now()}`,
      type: 'custom',
      position: { x: 250, y: yPos },
      data: {
        type: 'webhook-trigger' as NodeType,
        label: 'Trigger',
        category: 'triggers' as NodeCategory,
        icon: triggerDef?.icon || 'Webhook',
        color: triggerDef?.color || 'bg-green-500',
        config: {},
        isConfigured: false,
      },
    });
    yPos += 150;
  }

  data.actions?.forEach((action, index) => {
    const actionType = mapGenericTypeToFlow(action.type);
    const actionDef = getNodeDefinition(actionType);
    nodes.push({
      id: `action-${index}-${Date.now()}`,
      type: 'custom',
      position: { x: 250, y: yPos },
      data: {
        type: actionType,
        label: action.name,
        category: (actionDef?.category || 'actions') as NodeCategory,
        icon: actionDef?.icon || 'Zap',
        color: actionDef?.color || 'bg-blue-500',
        config: action.config || {},
        isConfigured: Object.keys(action.config || {}).length > 0,
      },
    });
    yPos += 150;
  });

  // Create sequential edges
  const edges: WorkflowEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      animated: true,
    });
  }

  return {
    name: data.name || 'Imported Workflow',
    description: 'Imported workflow',
    nodes,
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

// Download helper
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
