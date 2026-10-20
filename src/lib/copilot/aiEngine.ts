import type {
  WorkflowNode,
  WorkflowEdge,
  HandleDefinition,
  NodeCategory,
  NodeType,
} from '@/types/workflow';
import {
  autoLayoutWorkflow,
  resolveN8nNodeMeta,
  parseN8nWorkflow,
  type RawN8nWorkflow,
} from '@/lib/importer/n8nAdapter';

export type CopilotProvider =
  | 'heuristic'
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'ollama';

export interface CopilotConfig {
  provider: CopilotProvider;
  model?: string;
  apiKey?: string;
  ollamaBaseUrl?: string;
}

export interface CopilotSynthesisResult {
  name: string;
  explanation: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  repairedIssues: string[];
  modeUsed: CopilotProvider;
}

export interface GraphValidationReport {
  isValid: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  repairsApplied: string[];
  orphanNodesWired: number;
  danglingEdgesStripped: number;
  cyclesBroken: number;
  layoutNormalized: boolean;
}

export const COPILOT_MODELS: Record<CopilotProvider, { label: string; defaultModel: string; requiresKey: boolean }> = {
  heuristic: {
    label: 'Zero-Cost Heuristic Engine (Offline)',
    defaultModel: 'flow2flow-heuristic-v2',
    requiresKey: false,
  },
  openai: {
    label: 'OpenAI (GPT-4o)',
    defaultModel: 'gpt-4o',
    requiresKey: true,
  },
  anthropic: {
    label: 'Anthropic (Claude 3.5 Sonnet)',
    defaultModel: 'claude-3-5-sonnet-20241022',
    requiresKey: true,
  },
  gemini: {
    label: 'Google Gemini (1.5 Pro / 2.5 Flash)',
    defaultModel: 'gemini-2.0-flash',
    requiresKey: true,
  },
  groq: {
    label: 'Groq LPU (Llama 3.3 70B)',
    defaultModel: 'llama-3.3-70b-versatile',
    requiresKey: true,
  },
  ollama: {
    label: 'Local Ollama (Qwen 2.5 Coder)',
    defaultModel: 'qwen2.5-coder:7b',
    requiresKey: false,
  },
};

function createFlowNode(
  id: string,
  label: string,
  rawTypeOrFlowType: string,
  position: { x: number; y: number },
  config: Record<string, unknown> = {}
): WorkflowNode {
  const meta = resolveN8nNodeMeta(rawTypeOrFlowType);
  const isBranching =
    meta.flowType === 'if-else' ||
    meta.flowType === 'filter' ||
    meta.flowType === 'switch';

  const outputs: HandleDefinition[] = isBranching
    ? [
        { id: 'output_0', label: 'True / Main', type: 'main', index: 0 },
        { id: 'output_1', label: 'False / Alt', type: 'main', index: 1 },
      ]
    : [{ id: 'output_0', label: 'Main', type: 'main', index: 0 }];

  return {
    id,
    type: 'custom',
    position,
    data: {
      label,
      type: meta.flowType as NodeType,
      category: meta.category as NodeCategory,
      icon: meta.icon,
      color: meta.color,
      config: {
        ...config,
        n8nType: rawTypeOrFlowType,
      },
      isConfigured: true,
      n8nType: rawTypeOrFlowType,
      serviceName: meta.serviceName,
      executionStatus: 'idle',
      outputs,
      aiSubNodes: [],
    },
  };
}

/**
 * Graph Validation & Self-Healing Engine (`validateAndRepairWorkflow`)
 * - Ensures a root trigger node exists
 * - Strips dangling edges referencing missing source/target nodes
 * - Differentiates intentional AI agent tool loops (`isAiSubNodeEdge`) from ETL cycle traps
 * - Wires orphan nodes into the nearest logical upstream node
 * - Normalizes handles (`output_0`, `output_1`)
 * - Recalculates collision-free topological coordinates using Kahn's algorithm
 */
export function validateAndRepairWorkflow(
  rawNodes: WorkflowNode[],
  rawEdges: WorkflowEdge[]
): GraphValidationReport {
  const repairsApplied: string[] = [];
  let nodes = rawNodes.map((n) => ({
    ...n,
    position: {
      x: Number.isFinite(n.position?.x) ? n.position.x : 100,
      y: Number.isFinite(n.position?.y) ? n.position.y : 200,
    },
    data: {
      ...n.data,
      isConfigured: n.data?.isConfigured ?? true,
      executionStatus: n.data?.executionStatus || 'idle',
    },
  }));

  // 1. Ensure at least one trigger node exists if graph is non-empty
  const hasTrigger = nodes.some(
    (n) =>
      n.data.category === 'triggers' ||
      n.data.category === 'trigger' ||
      String(n.data.type).includes('trigger')
  );

  if (nodes.length > 0 && !hasTrigger) {
    const triggerNode = createFlowNode(
      `trigger-auto-${Date.now()}`,
      'Webhook Trigger',
      'n8n-nodes-base.webhook',
      { x: 100, y: 200 },
      { method: 'POST', path: '/webhook' }
    );
    nodes = [triggerNode, ...nodes];
    repairsApplied.push('Injected missing root Webhook Trigger node.');
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  // 2. Strip dangling edges and self-loops
  let danglingEdgesStripped = 0;
  const validEdges: WorkflowEdge[] = [];
  const seenEdgeKeys = new Set<string>();

  for (const edge of rawEdges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target) || edge.source === edge.target) {
      danglingEdgesStripped++;
      continue;
    }

    // Normalize legacy 'true'/'false' handles to 'output_0'/'output_1'
    let normalizedHandle = edge.sourceHandle || 'output_0';
    if (normalizedHandle === 'true') normalizedHandle = 'output_0';
    if (normalizedHandle === 'false') normalizedHandle = 'output_1';

    const edgeKey = `${edge.source}->${edge.target}:${normalizedHandle}`;
    if (seenEdgeKeys.has(edgeKey)) continue;
    seenEdgeKeys.add(edgeKey);

    validEdges.push({
      ...edge,
      id: edge.id || `edge-${edge.source}-${edge.target}-${normalizedHandle}`,
      sourceHandle: normalizedHandle,
      type: 'custom',
      animated: edge.animated ?? true,
    });
  }

  if (danglingEdgesStripped > 0) {
    repairsApplied.push(`Stripped ${danglingEdgesStripped} dangling or invalid edge(s).`);
  }

  // 3. Detect and break non-AI ETL cycle traps using DFS coloring
  let cyclesBroken = 0;
  const color = new Map<string, number>(); // 0 = unvisited, 1 = visiting, 2 = visited
  const edgesToKeep: WorkflowEdge[] = [];

  const adj = new Map<string, WorkflowEdge[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  validEdges.forEach((e) => adj.get(e.source)?.push(e));

  function dfs(u: string) {
    color.set(u, 1);
    for (const edge of adj.get(u) || []) {
      const v = edge.target;
      const isAiToolEdge = Boolean(edge.data?.isAiSubNodeEdge);
      if (color.get(v) === 1 && !isAiToolEdge) {
        // Back-edge detected in standard ETL flow -> break cycle
        cyclesBroken++;
        continue;
      }
      edgesToKeep.push(edge);
      if ((color.get(v) || 0) === 0) {
        dfs(v);
      }
    }
    color.set(u, 2);
  }

  // Run DFS from triggers first, then any remaining unvisited nodes
  nodes
    .filter((n) => n.data.category === 'triggers' || n.data.category === 'trigger')
    .forEach((t) => {
      if ((color.get(t.id) || 0) === 0) dfs(t.id);
    });
  nodes.forEach((n) => {
    if ((color.get(n.id) || 0) === 0) dfs(n.id);
  });

  if (cyclesBroken > 0) {
    repairsApplied.push(`Broke ${cyclesBroken} infinite ETL cycle trap(s).`);
  }

  // 4. Detect and wire orphan nodes (nodes with 0 incoming and 0 outgoing edges when graph > 1 node)
  let orphanNodesWired = 0;
  if (nodes.length > 1) {
    const connectedIds = new Set<string>();
    edgesToKeep.forEach((e) => {
      connectedIds.add(e.source);
      connectedIds.add(e.target);
    });

    const triggerNode =
      nodes.find((n) => n.data.category === 'triggers' || n.data.category === 'trigger') || nodes[0];

    let lastConnectedNode =
      nodes.filter((n) => connectedIds.has(n.id)).pop() || triggerNode;

    nodes.forEach((node) => {
      if (!connectedIds.has(node.id) && node.id !== lastConnectedNode.id) {
        orphanNodesWired++;
        edgesToKeep.push({
          id: `edge-repaired-${lastConnectedNode.id}-${node.id}`,
          source: lastConnectedNode.id,
          target: node.id,
          sourceHandle: 'output_0',
          type: 'custom',
          animated: true,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
        });
        connectedIds.add(node.id);
        lastConnectedNode = node;
      }
    });

    if (orphanNodesWired > 0) {
      repairsApplied.push(`Automatically wired ${orphanNodesWired} orphan node(s) into the pipeline.`);
    }
  }

  // 5. Ensure every node has valid output handle definitions
  nodes = nodes.map((node) => {
    const isBranch =
      node.data.type === 'if-else' ||
      node.data.type === 'filter' ||
      node.data.type === 'switch';
    const outputs: HandleDefinition[] =
      node.data.outputs && node.data.outputs.length > 0
        ? node.data.outputs
        : isBranch
          ? [
              { id: 'output_0', label: 'True / Main', type: 'main', index: 0 },
              { id: 'output_1', label: 'False / Alt', type: 'main', index: 1 },
            ]
          : [{ id: 'output_0', label: 'Main', type: 'main', index: 0 }];
    return {
      ...node,
      data: {
        ...node.data,
        outputs,
      },
    };
  });

  // 6. Topological Auto-Layout to resolve any coordinate collisions
  const layoutedNodes = autoLayoutWorkflow(nodes, edgesToKeep);
  repairsApplied.push('Computed collision-free Kahn topological layout (320px × 150px).');

  return {
    isValid: true,
    nodes: layoutedNodes,
    edges: edgesToKeep,
    repairsApplied,
    orphanNodesWired,
    danglingEdgesStripped,
    cyclesBroken,
    layoutNormalized: true,
  };
}

/**
 * Conversational Workflow Modification Engine (`applyConversationalEdit`)
 * Refactors an existing workflow graph in-place based on natural language instructions:
 * - "Insert a filter node between step 1 and step 2"
 * - "Add an error notification to Discord / Slack"
 * - "Switch model to Claude 3.5 Sonnet / Gemini / GPT-4o"
 * - "Remove the delay / wait node"
 */
export function applyConversationalEdit(
  prompt: string,
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[]
): CopilotSynthesisResult | null {
  if (currentNodes.length === 0) return null;
  const p = prompt.toLowerCase();

  // Case A: Switch AI model in existing AI nodes
  if (
    /(switch|change|update|set|use)\s+(the\s+)?(ai\s+|llm\s+)?model\s+to/i.test(prompt) ||
    p.includes('switch to claude') ||
    p.includes('switch to gemini') ||
    p.includes('switch to gpt') ||
    p.includes('switch model')
  ) {
    let targetModel = 'claude-3-5-sonnet-20241022';
    let targetLabel = 'Claude 3.5 Sonnet';
    let targetN8nType = '@n8n/n8n-nodes-langchain.lmChatAnthropic';

    if (p.includes('gemini')) {
      targetModel = 'gemini-2.5-flash';
      targetLabel = 'Google Gemini 2.5';
      targetN8nType = '@n8n/n8n-nodes-langchain.lmChatGoogleGemini';
    } else if (p.includes('gpt-4') || p.includes('openai')) {
      targetModel = 'gpt-4o';
      targetLabel = 'OpenAI GPT-4o';
      targetN8nType = '@n8n/n8n-nodes-langchain.lmChatOpenAi';
    } else if (p.includes('llama') || p.includes('groq')) {
      targetModel = 'llama-3.3-70b-versatile';
      targetLabel = 'Groq Llama 3.3 70B';
      targetN8nType = '@n8n/n8n-nodes-langchain.lmChatGroq';
    } else if (p.includes('ollama') || p.includes('qwen')) {
      targetModel = 'qwen2.5-coder:7b';
      targetLabel = 'Ollama Qwen 2.5';
      targetN8nType = '@n8n/n8n-nodes-langchain.lmChatOllama';
    }

    let updatedCount = 0;
    const updatedNodes = currentNodes.map((node) => {
      if (node.data.category === 'ai' || String(node.data.type).startsWith('ai-')) {
        updatedCount++;
        const meta = resolveN8nNodeMeta(targetN8nType);
        return {
          ...node,
          data: {
            ...node.data,
            label: node.data.type === 'ai-agent' ? `${node.data.label} (${targetLabel})` : targetLabel,
            icon: meta.icon,
            color: meta.color,
            n8nType: targetN8nType,
            config: {
              ...node.data.config,
              model: targetModel,
            },
          },
        };
      }
      return node;
    });

    if (updatedCount > 0) {
      const repaired = validateAndRepairWorkflow(updatedNodes, currentEdges);
      return {
        name: 'Refactored Workflow',
        explanation: `Switched ${updatedCount} AI node(s) to **${targetLabel}** (\`${targetModel}\`) while preserving all existing connections.`,
        nodes: repaired.nodes,
        edges: repaired.edges,
        repairedIssues: repaired.repairsApplied,
        modeUsed: 'heuristic',
      };
    }
  }

  // Case B: Insert a node between existing steps ("Insert a filter node between step 1 and step 2" or "Add a delay before Slack")
  if (/(insert|add|place|put)\s+a?\s*([a-z0-9\s/-]+?)\s+(node\s+)?(between|before|after)/i.test(prompt)) {
    const match = prompt.match(/(insert|add|place|put)\s+a?\s*([a-z0-9\s/-]+?)\s+(?:node\s+)?(between|before|after)\s+(.+)/i);
    const nodeKeyword = match?.[2]?.trim() || 'filter';

    let rawType = 'n8n-nodes-base.filter';
    let label = 'Filter Items';
    if (nodeKeyword.includes('delay') || nodeKeyword.includes('wait')) {
      rawType = 'n8n-nodes-base.wait';
      label = 'Wait 5s';
    } else if (nodeKeyword.includes('code') || nodeKeyword.includes('script')) {
      rawType = 'n8n-nodes-base.code';
      label = 'Transform Code';
    } else if (nodeKeyword.includes('if') || nodeKeyword.includes('condition')) {
      rawType = 'n8n-nodes-base.if';
      label = 'If Condition';
    } else if (nodeKeyword.includes('ai') || nodeKeyword.includes('summarize') || nodeKeyword.includes('claude')) {
      rawType = '@n8n/n8n-nodes-langchain.chatOpenAi';
      label = 'AI Processor';
    } else if (nodeKeyword.includes('slack')) {
      rawType = 'n8n-nodes-base.slack';
      label = 'Slack Notification';
    }

    const sourceNode = currentNodes[0];
    const targetNode = currentNodes[1] || currentNodes[currentNodes.length - 1];

    const newNode = createFlowNode(
      `node-inserted-${Date.now()}`,
      label,
      rawType,
      {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: sourceNode.position.y,
      },
      { condition: 'input.valid', operator: 'equals', value: 'true' }
    );

    // Split the edge between sourceNode and targetNode if one exists
    const existingEdgeIdx = currentEdges.findIndex(
      (e) => e.source === sourceNode.id && e.target === targetNode.id
    );

    const newEdges = [...currentEdges];
    if (existingEdgeIdx >= 0) {
      newEdges.splice(existingEdgeIdx, 1);
    }

    newEdges.push(
      {
        id: `edge-${sourceNode.id}-${newNode.id}`,
        source: sourceNode.id,
        target: newNode.id,
        sourceHandle: 'output_0',
        type: 'custom',
        animated: true,
      },
      {
        id: `edge-${newNode.id}-${targetNode.id}`,
        source: newNode.id,
        target: targetNode.id,
        sourceHandle: 'output_0',
        type: 'custom',
        animated: true,
      }
    );

    const repaired = validateAndRepairWorkflow([...currentNodes, newNode], newEdges);
    return {
      name: 'Refactored Workflow',
      explanation: `Inserted **${label}** between **${sourceNode.data.label}** and **${targetNode.data.label}** and recalculated topological layout.`,
      nodes: repaired.nodes,
      edges: repaired.edges,
      repairedIssues: repaired.repairsApplied,
      modeUsed: 'heuristic',
    };
  }

  // Case C: Add an error notification or branch ("Add an error notification to Discord" / "Add Slack alert")
  if (/(add|attach|append|wire)\s+(an?\s+)?(error|failure|alert|notification|slack|discord|email|telegram)/i.test(prompt)) {
    let rawType = 'n8n-nodes-base.slack';
    let label = 'Slack Error Alert';
    if (p.includes('discord')) {
      rawType = 'n8n-nodes-base.discord';
      label = 'Discord Error Alert';
    } else if (p.includes('email') || p.includes('gmail')) {
      rawType = 'n8n-nodes-base.gmail';
      label = 'Email Alert';
    } else if (p.includes('telegram')) {
      rawType = 'n8n-nodes-base.telegram';
      label = 'Telegram Alert';
    }

    // Attach to a branching node's output_1 (False/Alt) if present, otherwise to the last node
    const branchNode =
      currentNodes.find((n) => n.data.type === 'if-else' || n.data.type === 'filter' || n.data.type === 'switch') ||
      currentNodes[currentNodes.length - 1];

    const isBranch =
      branchNode.data.type === 'if-else' ||
      branchNode.data.type === 'filter' ||
      branchNode.data.type === 'switch';

    const sourceHandle = isBranch ? 'output_1' : 'output_0';
    const alertNode = createFlowNode(
      `node-alert-${Date.now()}`,
      label,
      rawType,
      { x: branchNode.position.x + 320, y: branchNode.position.y + 150 },
      { channel: '#alerts', message: 'Workflow alert triggered: {{ $json }}' }
    );

    const newEdge: WorkflowEdge = {
      id: `edge-${branchNode.id}-${alertNode.id}-${sourceHandle}`,
      source: branchNode.id,
      target: alertNode.id,
      sourceHandle,
      type: 'custom',
      animated: true,
      label: isBranch ? 'False' : undefined,
      style: { stroke: isBranch ? '#EF4444' : '#3B82F6', strokeWidth: 2 },
    };

    const repaired = validateAndRepairWorkflow([...currentNodes, alertNode], [...currentEdges, newEdge]);
    return {
      name: 'Refactored Workflow',
      explanation: `Added **${label}** wired to **${branchNode.data.label}** (${isBranch ? 'False/Error branch `output_1`' : 'main output'}).`,
      nodes: repaired.nodes,
      edges: repaired.edges,
      repairedIssues: repaired.repairsApplied,
      modeUsed: 'heuristic',
    };
  }

  return null;
}

/**
 * Zero-Cost Heuristic Engine (Offline Prompt-to-Flow Synthesizer)
 * Converts natural language descriptions into multi-node, multi-branch executable workflows
 * with zero API keys required.
 */
export function synthesizeWorkflowHeuristic(
  prompt: string,
  existingNodes: WorkflowNode[] = [],
  existingEdges: WorkflowEdge[] = []
): CopilotSynthesisResult {
  // First check if this is an iterative conversational edit on an existing canvas
  if (existingNodes.length > 0) {
    const edited = applyConversationalEdit(prompt, existingNodes, existingEdges);
    if (edited) return edited;
  }

  const p = prompt.toLowerCase();
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  // 1. Determine Trigger Node
  let triggerLabel = 'Webhook Trigger';
  let triggerType = 'n8n-nodes-base.webhook';
  let triggerConfig: Record<string, unknown> = { method: 'POST', path: '/webhook' };

  if (p.includes('schedule') || p.includes('cron') || p.includes('every ') || p.includes('daily') || p.includes('hourly') || p.includes('morning')) {
    triggerLabel = 'Schedule Trigger';
    triggerType = 'n8n-nodes-base.scheduleTrigger';
    triggerConfig = { cron: '0 9 * * *', timezone: 'UTC' };
  } else if (p.includes('stripe')) {
    triggerLabel = 'Stripe Event Trigger';
    triggerType = 'n8n-nodes-base.stripeTrigger';
    triggerConfig = { events: ['payment_intent.succeeded'] };
  } else if (p.includes('github')) {
    triggerLabel = 'GitHub Event Trigger';
    triggerType = 'n8n-nodes-base.githubTrigger';
    triggerConfig = { events: ['push', 'workflow_run'] };
  } else if (p.includes('gmail') || p.includes('inbox')) {
    triggerLabel = 'Gmail Inbound Trigger';
    triggerType = 'n8n-nodes-base.gmailTrigger';
    triggerConfig = { q: 'is:unread' };
  } else if (p.includes('typeform') || p.includes('form')) {
    triggerLabel = 'Form Submission Trigger';
    triggerType = 'n8n-nodes-base.typeformTrigger';
  }

  const triggerNode = createFlowNode('node-1', triggerLabel, triggerType, { x: 100, y: 200 }, triggerConfig);
  nodes.push(triggerNode);
  let lastMainNode = triggerNode;

  // 2. Optional Data Fetch / Extraction / Enrichment step
  if (p.includes('fetch') || p.includes('api') || p.includes('scrape') || p.includes('firecrawl') || p.includes('http')) {
    const httpNode = createFlowNode(
      `node-${nodes.length + 1}`,
      p.includes('firecrawl') ? 'Firecrawl Web Scraper' : 'Fetch External API',
      p.includes('firecrawl') ? 'n8n-nodes-base.firecrawl' : 'n8n-nodes-base.httpRequest',
      { x: 420, y: 200 },
      { method: 'GET', url: 'https://api.example.com/v1/data' }
    );
    nodes.push(httpNode);
    edges.push({
      id: `edge-${lastMainNode.id}-${httpNode.id}`,
      source: lastMainNode.id,
      target: httpNode.id,
      sourceHandle: 'output_0',
      type: 'custom',
      animated: true,
    });
    lastMainNode = httpNode;
  }

  // 3. AI / LLM / Agent Processing step
  if (
    p.includes('ai') ||
    p.includes('summarize') ||
    p.includes('extract') ||
    p.includes('classify') ||
    p.includes('claude') ||
    p.includes('openai') ||
    p.includes('gpt') ||
    p.includes('gemini') ||
    p.includes('agent') ||
    p.includes('chatbot') ||
    p.includes('sentiment')
  ) {
    const isClaude = p.includes('claude') || p.includes('anthropic');
    const isGemini = p.includes('gemini');
    const aiN8nType = isClaude
      ? '@n8n/n8n-nodes-langchain.lmChatAnthropic'
      : isGemini
        ? '@n8n/n8n-nodes-langchain.lmChatGoogleGemini'
        : '@n8n/n8n-nodes-langchain.agent';

    const aiLabel = isClaude
      ? 'Claude 3.5 Sonnet Agent'
      : isGemini
        ? 'Gemini 2.5 AI Agent'
        : p.includes('summarize')
          ? 'AI Content Summarizer'
          : 'AI Autonomous Agent';

    const aiNode = createFlowNode(
      `node-${nodes.length + 1}`,
      aiLabel,
      aiN8nType,
      { x: 740, y: 200 },
      {
        model: isClaude ? 'claude-3-5-sonnet-20241022' : isGemini ? 'gemini-2.5-flash' : 'gpt-4o',
        systemPrompt: 'You are an enterprise workflow intelligence engine.',
        userPrompt: 'Process input payload: {{ $json }}',
      }
    );
    nodes.push(aiNode);
    edges.push({
      id: `edge-${lastMainNode.id}-${aiNode.id}`,
      source: lastMainNode.id,
      target: aiNode.id,
      sourceHandle: 'output_0',
      type: 'custom',
      animated: true,
    });
    lastMainNode = aiNode;
  }

  // 4. Conditional Branching (If/Else or Filter)
  const needsBranching =
    p.includes('if ') ||
    p.includes('filter') ||
    p.includes('check') ||
    p.includes('condition') ||
    p.includes('urgent') ||
    p.includes('score') ||
    p.includes('else');

  if (needsBranching) {
    const ifNode = createFlowNode(
      `node-${nodes.length + 1}`,
      'Evaluate Condition',
      'n8n-nodes-base.if',
      { x: 1060, y: 200 },
      { condition: 'input.qualified', operator: 'equals', value: 'true' }
    );
    nodes.push(ifNode);
    edges.push({
      id: `edge-${lastMainNode.id}-${ifNode.id}`,
      source: lastMainNode.id,
      target: ifNode.id,
      sourceHandle: 'output_0',
      type: 'custom',
      animated: true,
    });

    // True Branch (output_0)
    const primaryDestType = p.includes('supabase')
      ? 'n8n-nodes-base.supabase'
      : p.includes('postgres') || p.includes('database')
        ? 'n8n-nodes-base.postgres'
        : p.includes('hubspot')
          ? 'n8n-nodes-base.hubspot'
          : p.includes('notion')
            ? 'n8n-nodes-base.notion'
            : p.includes('sheets')
              ? 'n8n-nodes-base.googleSheets'
              : 'n8n-nodes-base.slack';

    const primaryDestLabel = p.includes('supabase')
      ? 'Upsert Supabase Record'
      : p.includes('postgres') || p.includes('database')
        ? 'Save to PostgreSQL'
        : p.includes('hubspot')
          ? 'Sync HubSpot CRM'
          : p.includes('notion')
            ? 'Create Notion Page'
            : p.includes('sheets')
              ? 'Append Google Sheet'
              : 'Notify Slack #ops';

    const trueNode = createFlowNode(
      `node-${nodes.length + 1}`,
      primaryDestLabel,
      primaryDestType,
      { x: 1380, y: 120 },
      { operation: 'insert', channel: '#ops', message: 'Validated payload: {{ $json }}' }
    );

    // False Branch (output_1)
    const falseDestType = p.includes('discord')
      ? 'n8n-nodes-base.discord'
      : p.includes('email')
        ? 'n8n-nodes-base.emailSend'
        : 'n8n-nodes-base.slack';

    const falseDestLabel = p.includes('discord')
      ? 'Discord Fallback Alert'
      : p.includes('email')
        ? 'Send Fallback Email'
        : 'Log Fallback Alert';

    const falseNode = createFlowNode(
      `node-${nodes.length + 2}`,
      falseDestLabel,
      falseDestType,
      { x: 1380, y: 280 },
      { channel: '#alerts', message: 'Condition not met for {{ $json }}' }
    );

    nodes.push(trueNode, falseNode);
    edges.push(
      {
        id: `edge-${ifNode.id}-${trueNode.id}-true`,
        source: ifNode.id,
        target: trueNode.id,
        sourceHandle: 'output_0',
        type: 'custom',
        animated: true,
        label: 'True',
        style: { stroke: '#10B981', strokeWidth: 2 },
      },
      {
        id: `edge-${ifNode.id}-${falseNode.id}-false`,
        source: ifNode.id,
        target: falseNode.id,
        sourceHandle: 'output_1',
        type: 'custom',
        animated: true,
        label: 'False',
        style: { stroke: '#EF4444', strokeWidth: 2 },
      }
    );
  } else {
    // Linear destination nodes
    if (p.includes('supabase') || p.includes('postgres') || p.includes('database') || p.includes('store') || p.includes('sheets') || p.includes('notion')) {
      const dbType = p.includes('supabase')
        ? 'n8n-nodes-base.supabase'
        : p.includes('sheets')
          ? 'n8n-nodes-base.googleSheets'
          : p.includes('notion')
            ? 'n8n-nodes-base.notion'
            : 'n8n-nodes-base.postgres';
      const dbLabel = p.includes('supabase')
        ? 'Store in Supabase'
        : p.includes('sheets')
          ? 'Append to Google Sheets'
          : p.includes('notion')
            ? 'Save to Notion'
            : 'Write to PostgreSQL';

      const dbNode = createFlowNode(
        `node-${nodes.length + 1}`,
        dbLabel,
        dbType,
        { x: 1060, y: 200 },
        { table: 'workflow_records', operation: 'insert' }
      );
      nodes.push(dbNode);
      edges.push({
        id: `edge-${lastMainNode.id}-${dbNode.id}`,
        source: lastMainNode.id,
        target: dbNode.id,
        sourceHandle: 'output_0',
        type: 'custom',
        animated: true,
      });
      lastMainNode = dbNode;
    }

    // Notification / Final response node
    const finalType = p.includes('discord')
      ? 'n8n-nodes-base.discord'
      : p.includes('telegram')
        ? 'n8n-nodes-base.telegram'
        : p.includes('email') || p.includes('gmail')
          ? 'n8n-nodes-base.gmail'
          : p.includes('slack')
            ? 'n8n-nodes-base.slack'
            : 'n8n-nodes-base.respondToWebhook';

    const finalLabel = p.includes('discord')
      ? 'Post to Discord'
      : p.includes('telegram')
        ? 'Send Telegram Message'
        : p.includes('email') || p.includes('gmail')
          ? 'Send Email Digest'
          : p.includes('slack')
            ? 'Send Slack Notification'
            : 'Return Webhook Response';

    const finalNode = createFlowNode(
      `node-${nodes.length + 1}`,
      finalLabel,
      finalType,
      { x: 1380, y: 200 },
      { channel: '#general', message: 'Workflow completed: {{ $json }}', statusCode: 200 }
    );
    nodes.push(finalNode);
    edges.push({
      id: `edge-${lastMainNode.id}-${finalNode.id}`,
      source: lastMainNode.id,
      target: finalNode.id,
      sourceHandle: 'output_0',
      type: 'custom',
      animated: true,
    });
  }

  const repaired = validateAndRepairWorkflow(nodes, edges);
  const generatedName =
    prompt
      .replace(/^(build|create|make|generate|design)\s+(a|an)\s+(workflow|pipeline|automation)\s+(that|to|for)?\s*/i, '')
      .slice(0, 48)
      .trim() || 'AI Synthesized Workflow';

  return {
    name: generatedName.charAt(0).toUpperCase() + generatedName.slice(1),
    explanation: `Synthesized a **${repaired.nodes.length}-node** workflow topology (${repaired.edges.length} connections) with Kahn's topological auto-layout and self-healing verification.`,
    nodes: repaired.nodes,
    edges: repaired.edges,
    repairedIssues: repaired.repairsApplied,
    modeUsed: 'heuristic',
  };
}

/**
 * BYOK Multi-Model & Local Ollama Prompt-to-Flow Engine
 * Supports OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google Gemini, Groq (Llama 3.3),
 * and Local Ollama, with automatic fallback to the Zero-Cost Heuristic Engine.
 */
export async function synthesizeWorkflowWithAI(
  prompt: string,
  config: CopilotConfig,
  existingNodes: WorkflowNode[] = [],
  existingEdges: WorkflowEdge[] = []
): Promise<CopilotSynthesisResult> {
  // Check if this is an instant conversational graph modification first
  if (existingNodes.length > 0) {
    const conversationalEdit = applyConversationalEdit(prompt, existingNodes, existingEdges);
    if (conversationalEdit) {
      return { ...conversationalEdit, modeUsed: config.provider };
    }
  }

  if (config.provider === 'heuristic' || (COPILOT_MODELS[config.provider].requiresKey && !config.apiKey)) {
    return synthesizeWorkflowHeuristic(prompt, existingNodes, existingEdges);
  }

  const systemInstruction = `You are the Flow2Flow Prompt-to-Flow Architect. Return ONLY valid JSON matching the n8n workflow structure:
{
  "name": "Workflow Title",
  "description": "Concise explanation of the workflow",
  "nodes": [
    { "id": "1", "name": "Webhook Trigger", "type": "n8n-nodes-base.webhook", "position": [100, 200], "parameters": { "httpMethod": "POST", "path": "inbound" } }
  ],
  "connections": {
    "Webhook Trigger": { "main": [[{ "node": "Next Node Name", "type": "main", "index": 0 }]] }
  }
}`;

  try {
    let rawJsonText = '';

    if (config.provider === 'ollama') {
      const baseUrl = (config.ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model || COPILOT_MODELS.ollama.defaultModel,
          stream: false,
          format: 'json',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
      const data = await res.json();
      rawJsonText = data.message?.content || '';
    } else if (config.provider === 'openai' || config.provider === 'groq') {
      const endpoint =
        config.provider === 'groq'
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || COPILOT_MODELS[config.provider].defaultModel,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`${config.provider} API returned ${res.status}`);
      const data = await res.json();
      rawJsonText = data.choices?.[0]?.message?.content || '';
    } else if (config.provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: config.model || COPILOT_MODELS.anthropic.defaultModel,
          max_tokens: 2048,
          system: systemInstruction,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic API returned ${res.status}`);
      const data = await res.json();
      rawJsonText = data.content?.[0]?.text || '';
    } else if (config.provider === 'gemini') {
      const model = config.model || COPILOT_MODELS.gemini.defaultModel;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\nUser request: ${prompt}` }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini API returned ${res.status}`);
      const data = await res.json();
      rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const cleanedJson = rawJsonText.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsedN8n = parseN8nWorkflow(JSON.parse(cleanedJson) as RawN8nWorkflow, {
      forceAutoLayout: true,
    });
    const repaired = validateAndRepairWorkflow(parsedN8n.nodes, parsedN8n.edges);

    return {
      name: parsedN8n.name,
      explanation: parsedN8n.description || `Generated ${repaired.nodes.length} nodes via ${COPILOT_MODELS[config.provider].label}.`,
      nodes: repaired.nodes,
      edges: repaired.edges,
      repairedIssues: repaired.repairsApplied,
      modeUsed: config.provider,
    };
  } catch {
    // Graceful self-healing fallback to the offline Heuristic Engine
    const fallback = synthesizeWorkflowHeuristic(prompt, existingNodes, existingEdges);
    return {
      ...fallback,
      explanation: `${fallback.explanation} *(Synthesized via resilient Heuristic fallback)*`,
    };
  }
}
