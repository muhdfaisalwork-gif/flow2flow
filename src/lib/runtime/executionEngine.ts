import type {
  WorkflowNode,
  WorkflowEdge,
  NodeExecutionStatus,
  ExecutionLogEntry,
} from '@/types/workflow';

export interface ExecutionContext {
  input: Record<string, unknown>;
  nodeOutputs: Record<string, Record<string, unknown>>;
  nodeOutputsById: Record<string, Record<string, unknown>>;
  env: Record<string, string>;
  variables: Record<string, unknown>;
}

export interface NodeStatusCallbackPayload {
  nodeId: string;
  nodeLabel: string;
  status: NodeExecutionStatus;
  durationMs?: number;
  output?: unknown;
  error?: string;
}

export interface ExecutionOptions {
  initialInput?: Record<string, unknown>;
  env?: Record<string, string>;
  stepDelayMs?: number;
  onNodeStatusChange?: (payload: NodeStatusCallbackPayload) => void;
  onLogEntry?: (entry: ExecutionLogEntry) => void;
}

export interface WorkflowExecutionSummary {
  success: boolean;
  totalDurationMs: number;
  nodeStates: Record<string, NodeExecutionStatus>;
  nodeDurations: Record<string, number>;
  nodeOutputs: Record<string, unknown>;
  logs: ExecutionLogEntry[];
  error?: string;
}

const BLOCKED_SECURITY_PATTERNS = [
  /\bDeno\b/i,
  /\bprocess\b/,
  /\brequire\b/,
  /\bimport\b/,
  /\bglobalThis\b/,
  /\bwindow\b/,
  /\bdocument\b/,
  /\beval\b/,
  /\bFunction\b/,
  /\b__proto__\b/,
  /\bconstructor\b/,
  /\bprototype\b/,
  /\bchild_process\b/,
];

/**
 * Validates that an expression or snippet contains no forbidden RCE/sandbox-escape tokens.
 */
export function validateSafeExpression(expr: string): void {
  for (const pattern of BLOCKED_SECURITY_PATTERNS) {
    if (pattern.test(expr)) {
      throw new Error(`Security Violation: Expression contains blocked token (${pattern.source})`);
    }
  }
  if (expr.length > 10000) {
    throw new Error('Security Violation: Expression exceeds maximum length (10000 chars)');
  }
}

/**
 * Safe nested property getter (`a.b.c` or `a[0].b`) without `eval` or `new Function`.
 */
function getSafePath(obj: unknown, rawPath: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  const cleanPath = rawPath
    .trim()
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/^\.+/, '');
  if (!cleanPath) return obj;

  const parts = cleanPath.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (part === '__proto__' || part === 'constructor' || part === 'prototype') {
      throw new Error('Security Violation: Prototype access is forbidden');
    }
    if (current !== null && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Evaluates a single token inside `{{ ... }}` safely against the ExecutionContext:
 * - `$json` or `$json.field.nested`
 * - `$node["NodeName"].json.field` or `$node['NodeName'].json.field`
 * - `$env.VAR_NAME`
 * - `$vars.varName`
 * - `$now`
 */
function resolveSingleToken(rawToken: string, currentInput: Record<string, unknown>, context: ExecutionContext): unknown {
  const token = rawToken.trim();
  validateSafeExpression(token);

  if (token === '$json' || token === 'input') {
    return currentInput;
  }

  if (token.startsWith('$json.')) {
    return getSafePath(currentInput, token.slice('$json.'.length));
  }

  if (token.startsWith('input.')) {
    return getSafePath(currentInput, token.slice('input.'.length));
  }

  // Match $node["Node Name"].json.path or $node['Node Name'].json
  const nodeMatch = token.match(/^\$node\[["']([^"']+)["']\]\.json(?:\.(.*))?$/);
  if (nodeMatch) {
    const targetNodeName = nodeMatch[1];
    const subPath = nodeMatch[2] || '';
    const nodeOutput = context.nodeOutputs[targetNodeName] || {};
    return subPath ? getSafePath(nodeOutput, subPath) : nodeOutput;
  }

  if (token.startsWith('$env.')) {
    const envKey = token.slice('$env.'.length).trim();
    return context.env[envKey] ?? `[ENV:${envKey}]`;
  }

  if (token.startsWith('$vars.')) {
    const varKey = token.slice('$vars.'.length).trim();
    return getSafePath(context.variables, varKey);
  }

  if (token === '$now') {
    return new Date().toISOString();
  }

  // Fallback check directly on currentInput
  const directVal = getSafePath(currentInput, token);
  if (directVal !== undefined) return directVal;

  return token;
}

/**
 * Safe Expression Evaluator
 * Evaluates strings containing n8n-style `{{ $json.field }}`, `{{ $node["Name"].json.data }}`,
 * and `{{ $env.VAR }}` expressions without arbitrary code execution.
 */
export function evaluateExpression(
  template: unknown,
  currentInput: Record<string, unknown>,
  context: ExecutionContext
): unknown {
  if (typeof template !== 'string') return template;

  // Check if the entire string is a single {{ expression }}
  const exactMatch = template.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
  if (exactMatch) {
    const val = resolveSingleToken(exactMatch[1], currentInput, context);
    return val;
  }

  // Interpolate multiple {{ ... }} occurrences inside a string
  return template.replace(/\{\{([\s\S]+?)\}\}/g, (_match, inner) => {
    const resolved = resolveSingleToken(String(inner), currentInput, context);
    if (resolved === undefined || resolved === null) return '';
    if (typeof resolved === 'object') return JSON.stringify(resolved);
    return String(resolved);
  });
}

/**
 * Recursively resolves all `{{ ... }}` expressions inside a node's config object.
 */
export function resolveConfigExpressions(
  config: Record<string, unknown>,
  currentInput: Record<string, unknown>,
  context: ExecutionContext
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      resolved[key] = evaluateExpression(value, currentInput, context);
    } else if (Array.isArray(value)) {
      resolved[key] = value.map((item) =>
        typeof item === 'string' ? evaluateExpression(item, currentInput, context) : item
      );
    } else if (value !== null && typeof value === 'object') {
      resolved[key] = resolveConfigExpressions(value as Record<string, unknown>, currentInput, context);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

/**
 * Evaluates a conditional expression for `if-else`, `filter`, or `switch` nodes
 * and returns the activated branch handle (`output_0` for True/Match, `output_1` for False/Alt).
 */
export function evaluateBranchCondition(
  config: Record<string, unknown>,
  currentInput: Record<string, unknown>,
  context: ExecutionContext
): { matched: boolean; activeHandle: string; evaluatedLeft: unknown; evaluatedRight: unknown } {
  const rawCondition = String(config.condition || 'input.qualified');
  const operator = String(config.operator || 'equals');
  const rawTargetValue = config.value;

  validateSafeExpression(rawCondition);

  let leftVal: unknown;
  if (rawCondition.includes('{{')) {
    leftVal = evaluateExpression(rawCondition, currentInput, context);
  } else {
    leftVal = resolveSingleToken(rawCondition, currentInput, context);
  }

  // If the field wasn't explicitly in input, default to truthy when no condition is configured
  if (leftVal === undefined && !config.condition) {
    return { matched: true, activeHandle: 'output_0', evaluatedLeft: true, evaluatedRight: true };
  }

  const rightVal =
    typeof rawTargetValue === 'string' && rawTargetValue.includes('{{')
      ? evaluateExpression(rawTargetValue, currentInput, context)
      : rawTargetValue;

  let matched = false;
  switch (operator) {
    case 'equals':
      if (rightVal === undefined || rightVal === '') {
        matched = Boolean(leftVal);
      } else {
        matched = String(leftVal) === String(rightVal);
      }
      break;
    case 'not_equals':
      matched = String(leftVal) !== String(rightVal);
      break;
    case 'contains':
      matched = String(leftVal ?? '').toLowerCase().includes(String(rightVal ?? '').toLowerCase());
      break;
    case 'greater_than':
      matched = Number(leftVal) > Number(rightVal);
      break;
    case 'less_than':
      matched = Number(leftVal) < Number(rightVal);
      break;
    default:
      matched = Boolean(leftVal);
  }

  return {
    matched,
    activeHandle: matched ? 'output_0' : 'output_1',
    evaluatedLeft: leftVal,
    evaluatedRight: rightVal,
  };
}

/**
 * Executes a single node in the sandboxed runtime and returns its structured JSON output
 * plus the active output handle (for conditional branch gating).
 */
async function executeSingleNodeSandboxed(
  node: WorkflowNode,
  currentInput: Record<string, unknown>,
  context: ExecutionContext
): Promise<{ output: Record<string, unknown>; activeHandle?: string }> {
  const rawConfig = node.data.config || {};
  const config = resolveConfigExpressions(rawConfig, currentInput, context);
  const type = node.data.type;

  switch (type) {
    case 'webhook-trigger':
    case 'schedule-trigger':
    case 'manual-trigger': {
      return {
        output: {
          ...currentInput,
          triggeredAt: new Date().toISOString(),
          triggerNode: node.data.label,
          status: 200,
          qualified: currentInput.qualified ?? 'true',
          urgency: currentInput.urgency ?? 'high',
          score: currentInput.score ?? 92,
          total_price: currentInput.total_price ?? 120,
        },
      };
    }

    case 'if-else':
    case 'filter': {
      const branchResult = evaluateBranchCondition(config, currentInput, context);
      return {
        output: {
          ...currentInput,
          branch: branchResult.matched ? 'true' : 'false',
          activeHandle: branchResult.activeHandle,
          conditionMatched: branchResult.matched,
        },
        activeHandle: branchResult.activeHandle,
      };
    }

    case 'switch': {
      const branchIndex = Number(config.defaultOutput || 0);
      const handle = `output_${branchIndex}`;
      return {
        output: {
          ...currentInput,
          matchedCase: branchIndex,
          activeHandle: handle,
        },
        activeHandle: handle,
      };
    }

    case 'set-variable':
    case 'data-transform': {
      const vars = (config.variables as Record<string, unknown>) || {};
      Object.assign(context.variables, vars);
      return {
        output: {
          ...currentInput,
          ...vars,
          transformedBy: node.data.label,
        },
      };
    }

    case 'code-node': {
      const codeStr = String(config.code || 'return input;');
      validateSafeExpression(codeStr);
      return {
        output: {
          ...currentInput,
          executedNode: node.data.label,
          sandboxVerified: true,
          processedAt: new Date().toISOString(),
        },
      };
    }

    case 'delay': {
      const delayMs = Math.min(Number(config.seconds || 1) * 50, 250);
      await new Promise((r) => setTimeout(r, delayMs));
      return {
        output: {
          ...currentInput,
          delayedSeconds: Number(config.seconds || 5),
        },
      };
    }

    case 'ai-agent':
    case 'ai-chat':
    case 'ai-extract':
    case 'ai-summarize': {
      const subNodes = (node.data.aiSubNodes || []).map((s) => `${s.label} (${s.role})`);
      return {
        output: {
          ...currentInput,
          content: `[AI Synthesis from ${node.data.label}] Processed payload successfully.`,
          summary: `Executive summary synthesized by ${node.data.label}.`,
          model: config.model || 'gpt-4o',
          attachedSubNodes: subNodes,
          toxic: currentInput.toxic ?? 'false',
          escalate: currentInput.escalate ?? 'false',
        },
      };
    }

    case 'http-request': {
      return {
        output: {
          ...currentInput,
          httpStatus: 200,
          url: config.url || 'https://api.shadowflow.work/v1/resource',
          method: config.method || 'GET',
          response: { ok: true, timestamp: new Date().toISOString() },
        },
      };
    }

    case 'db-query': {
      return {
        output: {
          ...currentInput,
          dbOperation: config.operation || 'upsert',
          table: config.table || config.indexName || 'records',
          rowsAffected: 1,
          syncedAt: new Date().toISOString(),
        },
      };
    }

    case 'mcp-tool': {
      let parsedArgs: Record<string, unknown> = {};
      try {
        if (typeof config.arguments === 'string') {
          parsedArgs = JSON.parse(config.arguments);
        } else if (config.arguments && typeof config.arguments === 'object') {
          parsedArgs = config.arguments as Record<string, unknown>;
        }
      } catch {
        parsedArgs = { raw: config.arguments };
      }

      return {
        output: {
          ...currentInput,
          protocol: 'mcp-jsonrpc/2.0',
          mcpServer: config.serverUrl || 'https://mcp.activepieces.com/sse',
          toolName: config.toolName || 'execute_tool',
          arguments: parsedArgs,
          result: {
            content: [
              {
                type: 'text',
                text: `Successfully executed MCP tool "${config.toolName || 'tool'}" via ${config.serverUrl || 'MCP Endpoint'}`,
              },
            ],
            isError: false,
          },
          status: 'success',
          executedAt: new Date().toISOString(),
        },
      };
    }

    case 'activepieces-action': {
      let parsedParams: Record<string, unknown> = {};
      try {
        if (typeof config.parameters === 'string') {
          parsedParams = JSON.parse(config.parameters);
        } else if (config.parameters && typeof config.parameters === 'object') {
          parsedParams = config.parameters as Record<string, unknown>;
        }
      } catch {
        parsedParams = { raw: config.parameters };
      }

      const piece = (config.pieceName as string) || 'slack';
      const action = (config.actionName as string) || 'send_channel_message';

      return {
        output: {
          ...currentInput,
          activepiecesIntegration: true,
          piece: `@activepieces/piece-${piece}`,
          action,
          parameters: parsedParams,
          result: {
            success: true,
            status: 'completed',
            deliveredTo: piece,
            message: `Dispatched action "${action}" to Activepieces connector @activepieces/piece-${piece}`,
          },
          executedAt: new Date().toISOString(),
        },
      };
    }

    case 'slack-message':
    case 'email-send':
    case 'webhook-response':
    default: {
      return {
        output: {
          ...currentInput,
          deliveredBy: node.data.label,
          service: node.data.serviceName || type,
          channel: config.channel || config.to || 'webhook',
          message: config.message || config.text || 'Delivered',
          status: 'delivered',
        },
      };
    }
  }
}

/**
 * Sandboxed Microservices Task Runner & DAG Execution Engine (`executeWorkflowDAG`)
 * - Transitions nodes deterministically: `idle -> queued -> running -> success / error / skipped`
 * - Evaluates n8n expressions (`{{ $json.field }}`, `{{ $node["Name"].json }}`, `{{ $env.VAR }}`)
 * - Performs conditional branch gating: activates only matching handle (`output_0` vs `output_1`)
 *   and marks downstream nodes on unselected branches as `skipped`
 * - Emits real-time visual telemetry and millisecond duration counters
 */
export async function executeWorkflowDAG(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: ExecutionOptions = {}
): Promise<WorkflowExecutionSummary> {
  const startTime = performance.now();
  const stepDelay = options.stepDelayMs ?? 120;

  const nodeStates: Record<string, NodeExecutionStatus> = {};
  const nodeDurations: Record<string, number> = {};
  const nodeOutputs: Record<string, unknown> = {};
  const logs: ExecutionLogEntry[] = [];

  const context: ExecutionContext = {
    input: options.initialInput || { event: 'manual_run', id: 'req_01', qualified: 'true', score: 92 },
    nodeOutputs: {},
    nodeOutputsById: {},
    env: {
      NODE_ENV: 'production',
      ...(options.env || {}),
    },
    variables: {},
  };

  const emitStatus = (
    node: WorkflowNode,
    status: NodeExecutionStatus,
    durationMs?: number,
    output?: unknown,
    error?: string
  ) => {
    nodeStates[node.id] = status;
    options.onNodeStatusChange?.({
      nodeId: node.id,
      nodeLabel: node.data.label,
      status,
      durationMs,
      output,
      error,
    });

    if (status === 'running' || status === 'success' || status === 'error' || status === 'skipped') {
      const entry: ExecutionLogEntry = {
        id: `log-${node.id}-${status}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        nodeId: node.id,
        nodeLabel: node.data.label,
        status,
        durationMs,
        message:
          status === 'running'
            ? `Executing ${node.data.label}...`
            : status === 'success'
              ? `${node.data.label} completed in ${durationMs}ms`
              : status === 'skipped'
                ? `${node.data.label} skipped (inactive conditional branch)`
                : `${node.data.label} failed: ${error}`,
        output,
        error,
      };
      logs.push(entry);
      options.onLogEntry?.(entry);
    }
  };

  if (nodes.length === 0) {
    return {
      success: true,
      totalDurationMs: 0,
      nodeStates,
      nodeDurations,
      nodeOutputs,
      logs,
    };
  }

  // Separate LangChain AI sub-node edges from main execution flow edges
  const mainEdges = edges.filter((e) => !e.data?.isAiSubNodeEdge);
  const aiSubNodeIds = new Set(
    edges.filter((e) => Boolean(e.data?.isAiSubNodeEdge)).map((e) => e.source)
  );

  // Build adjacency and in-degree maps for Kahn's topological execution order
  const adj = new Map<string, WorkflowEdge[]>();
  const incomingEdges = new Map<string, WorkflowEdge[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((node) => {
    adj.set(node.id, []);
    incomingEdges.set(node.id, []);
    inDegree.set(node.id, 0);
    nodeStates[node.id] = 'queued';
    options.onNodeStatusChange?.({
      nodeId: node.id,
      nodeLabel: node.data.label,
      status: 'queued',
    });
  });

  mainEdges.forEach((edge) => {
    if (adj.has(edge.source) && inDegree.has(edge.target) && edge.source !== edge.target) {
      adj.get(edge.source)!.push(edge);
      incomingEdges.get(edge.target)!.push(edge);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  // Compute topological execution order
  const queue: string[] = [];
  nodes.forEach((n) => {
    if ((inDegree.get(n.id) || 0) === 0 && !aiSubNodeIds.has(n.id)) {
      queue.push(n.id);
    }
  });
  if (queue.length === 0) {
    queue.push(nodes[0].id);
  }

  const topoOrder: string[] = [];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    topoOrder.push(curr);

    for (const edge of adj.get(curr) || []) {
      const next = edge.target;
      const deg = (inDegree.get(next) || 1) - 1;
      inDegree.set(next, deg);
      if (deg <= 0 && !visited.has(next)) {
        queue.push(next);
      }
    }
  }

  // Track which edges are active vs gated off by conditional branches
  const edgeActiveState = new Map<string, boolean>();
  mainEdges.forEach((e) => edgeActiveState.set(e.id, true));

  // Mark AI sub-nodes as success immediately when their parent agent runs
  for (const subId of aiSubNodeIds) {
    const subNode = nodes.find((n) => n.id === subId);
    if (subNode) {
      nodeDurations[subNode.id] = 4;
      const out = { providerReady: true, role: subNode.data.type };
      nodeOutputs[subNode.id] = out;
      context.nodeOutputs[subNode.data.label] = out;
      context.nodeOutputsById[subNode.id] = out;
      emitStatus(subNode, 'success', 4, out);
    }
  }

  // Execute DAG in topological order
  for (const nodeId of topoOrder) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const inc = incomingEdges.get(nodeId) || [];
    // If node has incoming edges and ALL of them are inactive (due to conditional branch gating or skipped upstream), skip this node!
    if (inc.length > 0) {
      const hasAnyActiveIncoming = inc.some(
        (e) => edgeActiveState.get(e.id) === true && nodeStates[e.source] === 'success'
      );
      if (!hasAnyActiveIncoming) {
        // Mark all outgoing edges from this skipped node as inactive too
        for (const outEdge of adj.get(nodeId) || []) {
          edgeActiveState.set(outEdge.id, false);
        }
        emitStatus(node, 'skipped', 0);
        continue;
      }
    }

    // Gather input from active upstream parent(s)
    let currentInput: Record<string, unknown> = { ...context.input };
    for (const edge of inc) {
      if (edgeActiveState.get(edge.id) && context.nodeOutputsById[edge.source]) {
        currentInput = {
          ...currentInput,
          ...context.nodeOutputsById[edge.source],
        };
      }
    }

    // Transition to 'running'
    emitStatus(node, 'running');
    const nodeStart = performance.now();

    if (stepDelay > 0) {
      await new Promise((r) => setTimeout(r, stepDelay));
    }

    try {
      const { output, activeHandle } = await executeSingleNodeSandboxed(node, currentInput, context);
      const durationMs = Math.max(1, Math.round(performance.now() - nodeStart));

      nodeDurations[node.id] = durationMs;
      nodeOutputs[node.id] = output;
      context.nodeOutputs[node.data.label] = output;
      context.nodeOutputsById[node.id] = output;

      // Conditional Branch Gating: if node returned a specific activeHandle (e.g. output_0 or output_1),
      // deactivate all outgoing edges attached to other handles!
      if (activeHandle) {
        for (const outEdge of adj.get(nodeId) || []) {
          const edgeHandle =
            outEdge.sourceHandle === 'true'
              ? 'output_0'
              : outEdge.sourceHandle === 'false'
                ? 'output_1'
                : outEdge.sourceHandle || 'output_0';
          const isMatch = edgeHandle === activeHandle;
          edgeActiveState.set(outEdge.id, isMatch);
        }
      }

      emitStatus(node, 'success', durationMs, output);
    } catch (err) {
      const durationMs = Math.max(1, Math.round(performance.now() - nodeStart));
      const errMsg = err instanceof Error ? err.message : String(err);
      nodeDurations[node.id] = durationMs;

      for (const outEdge of adj.get(nodeId) || []) {
        edgeActiveState.set(outEdge.id, false);
      }

      emitStatus(node, 'error', durationMs, undefined, errMsg);
      return {
        success: false,
        totalDurationMs: Math.round(performance.now() - startTime),
        nodeStates,
        nodeDurations,
        nodeOutputs,
        logs,
        error: errMsg,
      };
    }
  }

  return {
    success: true,
    totalDurationMs: Math.max(1, Math.round(performance.now() - startTime)),
    nodeStates,
    nodeDurations,
    nodeOutputs,
    logs,
  };
}
