import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WorkflowNode {
  id: string;
  type: string;
  data: {
    type: string;
    label: string;
    config: Record<string, unknown>;
  };
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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflowId, inputData } = await req.json();

    if (!workflowId) {
      return new Response(
        JSON.stringify({ error: "workflowId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub;

    // Fetch workflow
    const { data: workflow, error: fetchError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !workflow) {
      return new Response(
        JSON.stringify({ error: "Workflow not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nodes = workflow.nodes as WorkflowNode[];
    const edges = workflow.edges as WorkflowEdge[];

    // Create workflow run record
    const { data: run, error: runError } = await supabase
      .from("workflow_runs")
      .insert([{
        workflow_id: workflowId,
        status: "running",
        input_data: inputData || {},
      }])
      .select()
      .single();

    if (runError) {
      console.error("Failed to create run:", runError);
    }

    // Execute workflow
    const context: ExecutionContext = {
      input: inputData || {},
      outputs: {},
      currentNode: null,
    };

    try {
      // Find start node (trigger nodes have no incoming edges)
      const targetNodes = new Set(edges.map((e) => e.target));
      const startNodes = nodes.filter((n) => !targetNodes.has(n.id));

      if (startNodes.length === 0) {
        throw new Error("No start node found");
      }

      // Execute nodes in order
      const executionOrder = topologicalSort(nodes, edges);

      for (const nodeId of executionOrder) {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        context.currentNode = nodeId;
        const result = await executeNode(node, context);
        context.outputs[nodeId] = result;
      }

      // Update run status to success
      if (run) {
        await supabase
          .from("workflow_runs")
          .update({
            status: "success",
            finished_at: new Date().toISOString(),
            output_data: context.outputs,
          })
          .eq("id", run.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          runId: run?.id,
          message: "Workflow executed successfully",
          outputs: context.outputs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (execError) {
      console.error("Execution error:", execError);

      // Update run status to failed
      if (run) {
        await supabase
          .from("workflow_runs")
          .update({
            status: "failed",
            finished_at: new Date().toISOString(),
            error_log: execError instanceof Error ? execError.message : String(execError),
          })
          .eq("id", run.id);
      }

      return new Response(
        JSON.stringify({
          success: false,
          runId: run?.id,
          error: execError instanceof Error ? execError.message : "Execution failed",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("run-workflow error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Topological sort for execution order
function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  for (const node of nodes) {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  // Build graph
  for (const edge of edges) {
    graph.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  // Find nodes with no incoming edges
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

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

// Execute a single node
async function executeNode(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { type, config } = node.data;

  switch (type) {
    case "webhook-trigger":
    case "schedule-trigger":
    case "manual-trigger":
      // Triggers just pass through input
      return context.input;

    case "http-request":
      return await executeHttpRequest(config);

    case "code-node":
      return await executeCode(config, context);

    case "transform":
      return await executeTransform(config, context);

    case "if-else":
      return await executeIfElse(config, context);

    case "ai-chat":
      return await executeAIChat(config, context);

    default:
      console.log(`Unknown node type: ${type}`);
      return { nodeType: type, message: "Node executed (no handler)" };
  }
}

async function executeHttpRequest(config: Record<string, unknown>): Promise<unknown> {
  const method = (config.method as string) || "GET";
  const url = config.url as string;
  const body = config.body as string;
  const headers = (config.headers as Record<string, string>) || {};

  if (!url) {
    throw new Error("HTTP Request: URL is required");
  }

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: method !== "GET" && body ? body : undefined,
  });

  const data = await response.text();
  try {
    return JSON.parse(data);
  } catch {
    return { text: data, status: response.status };
  }
}

async function executeCode(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const code = config.code as string;
  if (!code) return context.input;

  // Simple code execution (sandboxed)
  try {
    const fn = new Function("input", "outputs", code);
    return fn(context.input, context.outputs);
  } catch (error) {
    throw new Error(`Code execution failed: ${error}`);
  }
}

async function executeTransform(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const expression = config.expression as string;
  if (!expression) return context.input;

  try {
    const fn = new Function("input", "outputs", `return ${expression}`);
    return fn(context.input, context.outputs);
  } catch (error) {
    throw new Error(`Transform failed: ${error}`);
  }
}

async function executeIfElse(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const condition = config.condition as string;
  const operator = config.operator as string;
  const value = config.value as string;

  if (!condition) return { branch: "else", input: context.input };

  try {
    const fn = new Function("input", "outputs", `return ${condition}`);
    const result = fn(context.input, context.outputs);

    let matches = false;
    switch (operator) {
      case "equals":
        matches = result === value;
        break;
      case "not_equals":
        matches = result !== value;
        break;
      case "contains":
        matches = String(result).includes(value);
        break;
      case "greater_than":
        matches = Number(result) > Number(value);
        break;
      case "less_than":
        matches = Number(result) < Number(value);
        break;
      default:
        matches = Boolean(result);
    }

    return { branch: matches ? "if" : "else", value: result };
  } catch (error) {
    return { branch: "else", error: String(error) };
  }
}

async function executeAIChat(config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
  const model = (config.model as string) || "google/gemini-3-flash-preview";
  const systemPrompt = config.systemPrompt as string;
  const userPrompt = config.userPrompt as string;

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  // Replace {{input}} with actual input data
  const processedPrompt = userPrompt?.replace(
    /\{\{input\}\}/g,
    JSON.stringify(context.input)
  );

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: processedPrompt || JSON.stringify(context.input) });

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    model,
  };
}
