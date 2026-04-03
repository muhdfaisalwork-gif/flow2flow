import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const InputSchema = z.object({
  workflowId: z.string().uuid("workflowId must be a valid UUID"),
  inputData: z.record(z.unknown()).optional().default({}),
});

interface WorkflowNode {
  id: string;
  type: string;
  data: { type: string; label: string; config: Record<string, unknown> };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

interface ExecutionContext {
  input: unknown;
  outputs: Record<string, unknown>;
  currentNode: string | null;
  variables: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Input validation
    const rawBody = await req.json();
    const parsed = InputSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { workflowId, inputData } = parsed.data;

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub;

    // Fetch workflow
    const { data: workflow, error: fetchError } = await supabase
      .from("workflows").select("*").eq("id", workflowId).eq("user_id", userId).single();

    if (fetchError || !workflow) {
      return new Response(JSON.stringify({ error: "Workflow not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const nodes = workflow.nodes as WorkflowNode[];
    const edges = workflow.edges as WorkflowEdge[];
    const settings = workflow.settings as { retryOnFailure?: boolean; maxRetries?: number } || {};

    // Create run record
    const { data: run } = await supabase
      .from("workflow_runs")
      .insert([{ workflow_id: workflowId, status: "running", input_data: inputData }])
      .select().single();

    // Execute with retry logic
    const maxRetries = settings.retryOnFailure ? (settings.maxRetries || 3) : 0;
    let lastError: Error | null = null;
    let retryCount = 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (nodes.length === 0) throw new Error("Workflow has no nodes");

        const context: ExecutionContext = { input: inputData, outputs: {}, currentNode: null, variables: {} };
        const executionOrder = topologicalSort(nodes, edges);

        for (const nodeId of executionOrder) {
          const node = nodes.find((n) => n.id === nodeId);
          if (!node) continue;
          context.currentNode = nodeId;
          context.outputs[nodeId] = await executeNode(node, context);
        }

        // Success
        if (run) {
          await supabase.from("workflow_runs").update({
            status: "success", finished_at: new Date().toISOString(),
            output_data: context.outputs, retry_count: retryCount,
          }).eq("id", run.id);
        }

        return new Response(JSON.stringify({
          success: true, runId: run?.id, message: "Workflow executed successfully", outputs: context.outputs,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      } catch (execError) {
        lastError = execError instanceof Error ? execError : new Error(String(execError));
        retryCount = attempt;
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s...
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          console.log(`Retry ${attempt + 1}/${maxRetries} for workflow ${workflowId}`);
        }
      }
    }

    // All retries failed
    if (run) {
      await supabase.from("workflow_runs").update({
        status: "failed", finished_at: new Date().toISOString(),
        error_log: lastError?.message || "Execution failed", retry_count: retryCount,
      }).eq("id", run.id);
    }

    return new Response(JSON.stringify({
      success: false, runId: run?.id, error: lastError?.message || "Execution failed",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("run-workflow error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  for (const node of nodes) { graph.set(node.id, []); inDegree.set(node.id, 0); }
  for (const edge of edges) {
    graph.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) { if (degree === 0) queue.push(nodeId); }
  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    for (const neighbor of graph.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }
  return result;
}

async function executeNode(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { type, config } = node.data;
  switch (type) {
    case "webhook-trigger":
    case "schedule-trigger":
    case "manual-trigger":
      return context.input;
    case "http-request":
      return await executeHttpRequest(config);
    case "code-node":
      return await executeCode(config, context);
    case "data-transform":
      return await executeTransform(config, context);
    case "if-else":
    case "filter":
      return await executeIfElse(config, context);
    case "switch":
      return await executeSwitch(config, context);
    case "loop":
      return await executeLoop(config, context);
    case "merge":
      return await executeMerge(config, context);
    case "delay":
      return await executeDelay(config, context);
    case "set-variable":
      return executeSetVariable(config, context);
    case "ai-chat":
      return await executeAIChat(config, context);
    case "ai-extract":
      return await executeAIExtract(config, context);
    case "ai-summarize":
      return await executeAISummarize(config, context);
    case "email-send":
      return { status: "simulated", message: "Email sending requires credentials configuration", config };
    case "slack-message":
      return { status: "simulated", message: "Slack messaging requires credentials configuration", config };
    case "db-query":
      return { status: "simulated", message: "Database queries execute against your project DB", config };
    case "webhook-response":
      return { statusCode: config.statusCode || 200, body: config.body || context.input };
    default:
      console.log(`Unknown node type: ${type}`);
      return { nodeType: type, message: "Node executed (no handler)" };
  }
}

async function executeHttpRequest(config: Record<string, unknown>): Promise<unknown> {
  const method = (config.method as string) || "GET";
  const url = config.url as string;
  if (!url) throw new Error("HTTP Request: URL is required");
  const body = config.body as string;
  const headers = (config.headers as Record<string, string>) || {};
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: method !== "GET" && body ? body : undefined,
  });
  const data = await response.text();
  try { return JSON.parse(data); } catch { return { text: data, status: response.status }; }
}

const BLOCKED_PATTERNS = [
  /\bDeno\b/i, /\bprocess\b/, /\bimport\b/, /\brequire\b/, /\bfetch\b/,
  /\bglobalThis\b/, /\beval\b/, /\bFunction\b/, /\b__proto__\b/, /\bconstructor\b\s*\[/,
];

function validateUserCode(code: string): void {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) throw new Error(`Code contains blocked pattern: ${pattern.source}`);
  }
  if (code.length > 10000) throw new Error("Code exceeds maximum allowed length (10000 chars)");
}

async function executeCode(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const code = config.code as string;
  if (!code) return context.input;
  validateUserCode(code);
  try {
    const fn = new Function("input", "outputs", "variables", code);
    return fn(context.input, context.outputs, context.variables);
  } catch (error) { throw new Error(`Code execution failed: ${error}`); }
}

async function executeTransform(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const expression = config.expression as string;
  if (!expression) return context.input;
  validateUserCode(expression);
  try {
    const fn = new Function("input", "outputs", `return ${expression}`);
    return fn(context.input, context.outputs);
  } catch (error) { throw new Error(`Transform failed: ${error}`); }
}

async function executeIfElse(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const condition = config.condition as string;
  const operator = config.operator as string;
  const value = config.value as string;
  if (!condition) return { branch: "else", input: context.input };
  validateUserCode(condition);
  try {
    const fn = new Function("input", "outputs", `return ${condition}`);
    const result = fn(context.input, context.outputs);
    let matches = false;
    switch (operator) {
      case "equals": matches = result === value; break;
      case "not_equals": matches = result !== value; break;
      case "contains": matches = String(result).includes(value); break;
      case "greater_than": matches = Number(result) > Number(value); break;
      case "less_than": matches = Number(result) < Number(value); break;
      default: matches = Boolean(result);
    }
    return { branch: matches ? "if" : "else", value: result };
  } catch (error) { return { branch: "else", error: String(error) }; }
}

async function executeSwitch(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const cases = (config.cases as Array<{ condition: string; label: string }>) || [];
  const input = context.input;
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    if (c.condition) {
      validateUserCode(c.condition);
      try {
        const fn = new Function("input", "outputs", `return ${c.condition}`);
        if (fn(input, context.outputs)) return { matchedCase: i, label: c.label, input };
      } catch { /* continue */ }
    }
  }
  return { matchedCase: config.defaultOutput || 0, label: "default", input };
}

async function executeLoop(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const arrayPath = config.arrayPath as string;
  const batchSize = (config.batchSize as number) || 1;
  let items: unknown[];
  if (arrayPath) {
    validateUserCode(arrayPath);
    try {
      const fn = new Function("input", `return ${arrayPath}`);
      items = fn(context.input);
    } catch { items = Array.isArray(context.input) ? context.input as unknown[] : [context.input]; }
  } else {
    items = Array.isArray(context.input) ? context.input as unknown[] : [context.input];
  }
  if (!Array.isArray(items)) items = [items];
  const results: unknown[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    results.push(...items.slice(i, i + batchSize));
  }
  return { items: results, count: results.length };
}

async function executeMerge(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const mode = (config.mode as string) || "append";
  const allOutputs = Object.values(context.outputs);
  switch (mode) {
    case "append": return { merged: allOutputs };
    case "zip": return { merged: allOutputs };
    default: return { merged: allOutputs };
  }
}

async function executeDelay(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const seconds = Math.min((config.seconds as number) || 5, 30); // Cap at 30s
  await new Promise(r => setTimeout(r, seconds * 1000));
  return context.input;
}

function executeSetVariable(config: Record<string, unknown>, context: ExecutionContext): unknown {
  const variables = (config.variables as Record<string, unknown>) || {};
  Object.assign(context.variables, variables);
  return { ...context.input as object, variables: context.variables };
}

async function executeAIChat(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const model = (config.model as string) || "google/gemini-3-flash-preview";
  const systemPrompt = config.systemPrompt as string;
  const userPrompt = config.userPrompt as string;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const processedPrompt = userPrompt?.replace(/\{\{input\}\}/g, JSON.stringify(context.input));
  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: processedPrompt || JSON.stringify(context.input) });
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });
  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  const data = await response.json();
  return { content: data.choices?.[0]?.message?.content || "", model };
}

async function executeAIExtract(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const instructions = (config.instructions as string) || "Extract structured data from the input";
  const schema = config.schema || {};
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `Extract data according to this schema: ${JSON.stringify(schema)}. ${instructions}. Return valid JSON only.` },
        { role: "user", content: JSON.stringify(context.input) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI Extract failed: ${response.status}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  try { return JSON.parse(content); } catch { return { raw: content }; }
}

async function executeAISummarize(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const maxLength = (config.maxLength as number) || 200;
  const style = (config.style as string) || "concise";
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `Summarize the following content in a ${style} style. Maximum ${maxLength} words.` },
        { role: "user", content: JSON.stringify(context.input) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI Summarize failed: ${response.status}`);
  const data = await response.json();
  return { summary: data.choices?.[0]?.message?.content || "", style, maxLength };
}
