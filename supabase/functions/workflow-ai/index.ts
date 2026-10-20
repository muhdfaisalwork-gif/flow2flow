import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const InputSchema = z.object({
  message: z.string().min(1).max(5000, "Message too long (max 5000 chars)"),
  context: z.record(z.unknown()).optional(),
  type: z.enum(["chat", "generate"]).default("chat"),
  history: z.array(z.object({ role: z.string(), content: z.string() })).optional().default([]),
});

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
- type: "email-send", label: "Send Email" — Send emails. Config: { to: "", subject: "", body: "", credentialId: "" }
- type: "slack-message", label: "Slack Message" — Post to Slack. Config: { channel: "", message: "", credentialId: "" }
- type: "db-query", label: "Database Query" — Query DB. Config: { table: "", operation: "select", filters: {} }
- type: "webhook-response", label: "Respond" — Return data. Config: { statusCode: 200, body: "" }

LOGIC (category: "logic", color: "hsl(var(--cyber))"):
- type: "if-else", label: "If/Else" — Branch. Config: { condition: "", operator: "equals", value: "" }
- type: "switch", label: "Switch" — Multiple branches. Config: { cases: [], defaultOutput: 0 }
- type: "loop", label: "Loop" — Iterate arrays. Config: { arrayPath: "", batchSize: 1 }
- type: "merge", label: "Merge" — Combine streams. Config: { mode: "append" }
- type: "filter", label: "Filter" — Pass/reject. Config: { condition: "", operator: "equals", value: "" }
- type: "delay", label: "Delay" — Wait. Config: { seconds: 5 }
- type: "set-variable", label: "Set Variable" — Assign values. Config: { variables: {} }

AI (category: "ai", color: "hsl(var(--glow))"):
- type: "ai-chat", label: "AI Chat" — Prompts to LLMs. Config: { model: "google/gemini-2.5-flash", systemPrompt: "", userPrompt: "", temperature: 0.7 }
- type: "ai-extract", label: "AI Extract" — Parse data. Config: { schema: {}, instructions: "" }
- type: "ai-summarize", label: "AI Summarize" — Condense content. Config: { maxLength: 200, style: "concise" }

ICON MAPPING:
- webhook-trigger: "Webhook", schedule-trigger: "Clock", manual-trigger: "Play"
- http-request: "Globe", code-node: "Code", data-transform: "Shuffle"
- email-send: "Mail", slack-message: "Hash", db-query: "Database", webhook-response: "Send"
- if-else: "GitBranch", switch: "ArrowRightLeft", loop: "Repeat", merge: "Merge"
- filter: "Filter", delay: "Timer", set-variable: "Variable"
- ai-chat: "MessageSquare", ai-extract: "FileSearch", ai-summarize: "FileText"

When generating workflows:
1. Every workflow must start with exactly one trigger node
2. Position nodes left-to-right: trigger at x=100, then x=350, x=600, etc. y=200 center
3. Set isConfigured=true if you provide meaningful config values
4. Use descriptive labels
5. Connect all nodes logically with edges
6. For if-else/filter branches, create two output paths

Be creative and practical. Suggest real use cases and fill in realistic config values.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Validate input
    const rawBody = await req.json();
    const parsed = InputSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, context, type, history } = parsed.data;

    const apiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("AI_API_KEY");
    const apiUrl = Deno.env.get("AI_GATEWAY_URL") || "https://api.openai.com/v1/chat/completions";
    if (!apiKey) throw new Error("OPENAI_API_KEY or AI_API_KEY is not configured");

    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (context?.workflow && ((context.workflow as Record<string, unknown[]>).nodes?.length > 0 || (context.workflow as Record<string, unknown[]>).edges?.length > 0)) {
      messages.push({
        role: "user",
        content: `Current workflow has ${(context.workflow as Record<string, unknown[]>).nodes?.length || 0} nodes and ${(context.workflow as Record<string, unknown[]>).edges?.length || 0} edges. Here's the current state:\n${JSON.stringify(context.workflow, null, 2)}`,
      });
      messages.push({
        role: "assistant",
        content: "I can see your current workflow. I can help modify, extend, or optimize it. What would you like to do?",
      });
    }

    if (history.length > 0) {
      for (const msg of history.slice(-10)) {
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
            description: "Generate a complete workflow with properly configured nodes and edges.",
            parameters: {
              type: "object",
              properties: {
                nodes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      type: { type: "string", enum: ["custom"] },
                      position: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } }, required: ["x", "y"] },
                      data: {
                        type: "object",
                        properties: {
                          label: { type: "string" }, type: { type: "string" }, category: { type: "string", enum: ["triggers", "actions", "logic", "ai"] },
                          icon: { type: "string" }, color: { type: "string" }, config: { type: "object" }, isConfigured: { type: "boolean" },
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
                    properties: { id: { type: "string" }, source: { type: "string" }, target: { type: "string" }, type: { type: "string", enum: ["custom"] }, animated: { type: "boolean" } },
                    required: ["id", "source", "target", "type"],
                  },
                },
                explanation: { type: "string" },
                name: { type: "string" },
              },
              required: ["nodes", "edges", "explanation", "name"],
            },
          },
        },
      ];
      body.tool_choice = { type: "function", function: { name: "generate_workflow" } };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    let result: Record<string, unknown>;

    if (type === "generate" && choice?.message?.tool_calls?.[0]) {
      const args = JSON.parse(choice.message.tool_calls[0].function.arguments);
      result = { type: "workflow", workflow: { nodes: args.nodes, edges: args.edges }, explanation: args.explanation, name: args.name };
    } else {
      result = { type: "message", content: choice?.message?.content || "I'm sorry, I couldn't process that request." };
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("workflow-ai error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
