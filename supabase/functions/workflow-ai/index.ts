import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Flow2Flow AI, an expert workflow automation assistant. You help users create, understand, and optimize automation workflows.

Available node types:
TRIGGERS (start workflows):
- webhook: Receive HTTP requests with custom payloads
- schedule: Run on a cron schedule (e.g., "0 9 * * *" for 9 AM daily)
- manual: Manually triggered workflows

ACTIONS (perform tasks):
- http: Make HTTP requests to any API
- code: Execute JavaScript code for custom logic
- transform: Map, filter, or format data

LOGIC (control flow):
- if-else: Conditional branching based on conditions
- switch: Multiple condition branches
- loop: Iterate over arrays
- merge: Combine multiple data streams

AI (powered by AI models):
- ai-chat: Send prompts to AI models
- ai-extract: Parse unstructured data into structured format
- ai-summarize: Condense long content

When generating workflows, respond with valid JSON in this format:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "custom",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Node Name",
        "type": "node-type",
        "category": "triggers|actions|logic|ai",
        "config": { ...node-specific config }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "custom"
    }
  ]
}

Position nodes in a readable left-to-right flow with ~250px horizontal spacing and ~150px vertical spacing for branches.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, type = "chat" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add context about current workflow if provided
    if (context?.workflow) {
      messages.push({
        role: "user",
        content: `Current workflow context:\n${JSON.stringify(context.workflow, null, 2)}`,
      });
      messages.push({
        role: "assistant",
        content: "I understand the current workflow. How can I help you modify or improve it?",
      });
    }

    messages.push({ role: "user", content: message });

    // For workflow generation, use tool calling for structured output
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
            description: "Generate a workflow with nodes and edges based on user description",
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
                          label: { type: "string" },
                          type: { type: "string" },
                          category: { type: "string", enum: ["triggers", "actions", "logic", "ai"] },
                          config: { type: "object" },
                        },
                        required: ["label", "type", "category"],
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
                    },
                    required: ["id", "source", "target", "type"],
                  },
                },
                explanation: { type: "string", description: "Brief explanation of the workflow" },
              },
              required: ["nodes", "edges", "explanation"],
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
      // Extract structured workflow from tool call
      const toolCall = choice.message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      result = {
        type: "workflow",
        workflow: {
          nodes: args.nodes,
          edges: args.edges,
        },
        explanation: args.explanation,
      };
    } else {
      // Regular chat response
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
