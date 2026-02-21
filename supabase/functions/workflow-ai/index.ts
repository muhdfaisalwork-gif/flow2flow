import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Flow2Flow AI, an expert workflow automation assistant. You help users create, understand, and optimize automation workflows.

Available node types with their exact type identifiers:

TRIGGERS (category: "triggers", color: "hsl(var(--electric))"):
- type: "webhook-trigger", label: "Webhook" — Receive HTTP requests. Config: { method: "POST", path: "/webhook", headers: {} }
- type: "schedule-trigger", label: "Schedule" — Cron-based. Config: { cron: "0 * * * *", timezone: "UTC" }
- type: "manual-trigger", label: "Manual" — On demand. Config: {}

ACTIONS (category: "actions", color: "hsl(var(--neon))"):
- type: "http-request", label: "HTTP Request" — Call any API. Config: { method: "GET", url: "", headers: {}, body: "" }
- type: "code-node", label: "Code" — JavaScript. Config: { code: "return input;", language: "javascript" }
- type: "data-transform", label: "Transform" — Map/filter. Config: { operation: "map", expression: "" }

LOGIC (category: "logic", color: "hsl(var(--cyber))"):
- type: "if-else", label: "If/Else" — Branch. Config: { condition: "", operator: "equals", value: "" }
- type: "switch", label: "Switch" — Multiple branches. Config: { cases: [], defaultOutput: 0 }
- type: "loop", label: "Loop" — Iterate arrays. Config: { arrayPath: "", batchSize: 1 }
- type: "merge", label: "Merge" — Combine streams. Config: { mode: "append" }

AI (category: "ai", color: "hsl(var(--glow))"):
- type: "ai-chat", label: "AI Chat" — Prompts to LLMs. Config: { model: "google/gemini-2.5-flash", systemPrompt: "", userPrompt: "", temperature: 0.7 }
- type: "ai-extract", label: "AI Extract" — Parse data. Config: { schema: {}, instructions: "" }
- type: "ai-summarize", label: "AI Summarize" — Condense content. Config: { maxLength: 200, style: "concise" }

ICON MAPPING (use these exact icon names):
- webhook-trigger: "Webhook", schedule-trigger: "Clock", manual-trigger: "Play"
- http-request: "Globe", code-node: "Code", data-transform: "Shuffle"
- if-else: "GitBranch", switch: "ArrowRightLeft", loop: "Repeat", merge: "Merge"
- ai-chat: "MessageSquare", ai-extract: "FileSearch", ai-summarize: "FileText"

When generating workflows:
1. Every workflow must start with exactly one trigger node
2. Position nodes in a readable left-to-right flow: trigger at x=100, then x=350, x=600, etc. Use y=200 as center, branch at y=100 and y=300
3. Set isConfigured=true if you provide meaningful config values, false otherwise
4. Use descriptive labels (e.g. "Fetch User Data" instead of just "HTTP Request")
5. Connect all nodes logically with edges
6. For if-else branches, create two output paths

Be creative and practical. Suggest real use cases and fill in realistic config values where possible.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, context, type = "chat", history = [] } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add workflow context if available
    if (context?.workflow && (context.workflow.nodes?.length > 0 || context.workflow.edges?.length > 0)) {
      messages.push({
        role: "user",
        content: `Current workflow has ${context.workflow.nodes?.length || 0} nodes and ${context.workflow.edges?.length || 0} edges. Here's the current state:\n${JSON.stringify(context.workflow, null, 2)}`,
      });
      messages.push({
        role: "assistant",
        content: "I can see your current workflow. I can help modify, extend, or optimize it. What would you like to do?",
      });
    }

    // Add conversation history for chat continuity
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-10)) { // Last 10 messages for context
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const body: Record<string, unknown> = {
      model: "google/gemini-3-flash-preview",
      messages,
    };

    if (type === "generate") {
      body.tools = [
        {
          type: "function",
          function: {
            name: "generate_workflow",
            description: "Generate a complete workflow with properly configured nodes and edges based on the user's natural language description. Each node must use exact type identifiers from the available node types.",
            parameters: {
              type: "object",
              properties: {
                nodes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", description: "Unique ID like 'webhook-trigger-1' or 'http-request-1'" },
                      type: { type: "string", enum: ["custom"], description: "Always 'custom'" },
                      position: {
                        type: "object",
                        properties: {
                          x: { type: "number" },
                          y: { type: "number" },
                        },
                        required: ["x", "y"],
                      },
                      data: {
                        type: "object",
                        properties: {
                          label: { type: "string", description: "Descriptive label for the node" },
                          type: { type: "string", description: "One of the exact node type identifiers" },
                          category: { type: "string", enum: ["triggers", "actions", "logic", "ai"] },
                          icon: { type: "string", description: "Icon name from the mapping" },
                          color: { type: "string", description: "CSS color value using hsl(var(--electric/neon/cyber/glow))" },
                          config: { type: "object", description: "Node-specific configuration" },
                          isConfigured: { type: "boolean", description: "Whether meaningful config values are provided" },
                        },
                        required: ["label", "type", "category", "icon", "color", "config", "isConfigured"],
                      },
                    },
                    required: ["id", "type", "position", "data"],
                  },
                },
                edges: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      source: { type: "string" },
                      target: { type: "string" },
                      type: { type: "string", enum: ["custom"] },
                      animated: { type: "boolean" },
                    },
                    required: ["id", "source", "target", "type"],
                  },
                },
                explanation: { type: "string", description: "Clear explanation of what the workflow does, step by step" },
                name: { type: "string", description: "Suggested workflow name" },
              },
              required: ["nodes", "edges", "explanation", "name"],
            },
          },
        },
      ];
      body.tool_choice = { type: "function", function: { name: "generate_workflow" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    let result: Record<string, unknown>;

    if (type === "generate" && choice?.message?.tool_calls?.[0]) {
      const toolCall = choice.message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      result = {
        type: "workflow",
        workflow: {
          nodes: args.nodes,
          edges: args.edges,
        },
        explanation: args.explanation,
        name: args.name,
      };
    } else {
      result = {
        type: "message",
        content: choice?.message?.content || "I'm sorry, I couldn't process that request.",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("workflow-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
