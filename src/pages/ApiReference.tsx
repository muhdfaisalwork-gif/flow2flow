import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Terminal, Copy, Check, ExternalLink, Code2, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Endpoint {
  method: "GET" | "POST" | "DELETE" | "PUT";
  path: string;
  title: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; desc: string }[];
  curlExample: string;
  responseExample: string;
}

const endpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/api/v1/workflows/:id/execute",
    title: "Execute Workflow",
    description: "Triggers execution of a workflow by ID, passing an optional payload to the trigger node.",
    parameters: [
      { name: "id", type: "string (UUID)", required: true, desc: "The unique identifier of the workflow." },
      { name: "sync", type: "boolean", required: false, desc: "If true, blocks until workflow execution finishes." },
    ],
    curlExample: `curl -X POST https://api.shadowflow.work/v1/workflows/wf_89a2b1/execute \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": {
      "user_email": "alex@company.com",
      "event": "customer_signup"
    }
  }'`,
    responseExample: `{
  "executionId": "exec_551029ab8",
  "workflowId": "wf_89a2b1",
  "status": "COMPLETED",
  "durationMs": 142,
  "nodeResults": {
    "node_trigger": { "success": true },
    "node_ai_agent": {
      "output": "Analyzed customer tier: Enterprise. Auto-provisioned Slack channel."
    }
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/workflows",
    title: "List Workflows",
    description: "Retrieves a paginated list of all active workflows belonging to the authenticated account.",
    parameters: [
      { name: "limit", type: "number", required: false, desc: "Max number of items to return (default: 20)." },
      { name: "offset", type: "number", required: false, desc: "Pagination offset." },
    ],
    curlExample: `curl -X GET https://api.shadowflow.work/v1/workflows?limit=10 \\
  -H "Authorization: Bearer <YOUR_API_KEY>"`,
    responseExample: `{
  "data": [
    {
      "id": "wf_89a2b1",
      "name": "Customer AI Onboarding Router",
      "active": true,
      "nodesCount": 6,
      "updatedAt": "2026-10-27T14:20:00Z"
    }
  ],
  "total": 14
}`,
  },
  {
    method: "POST",
    path: "/api/v1/mcp/invoke",
    title: "Invoke MCP Tool Protocol",
    description: "Invokes a Shadow Flow workflow or node as a Model Context Protocol tool for AI agents.",
    parameters: [
      { name: "toolName", type: "string", required: true, desc: "Name of registered MCP tool." },
      { name: "arguments", type: "object", required: true, desc: "Input arguments schema." },
    ],
    curlExample: `curl -X POST https://api.shadowflow.work/v1/mcp/invoke \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "toolName": "shadow_flow_research_radar",
    "arguments": {
      "topic": "DeepSeek R1 optimization",
      "maxResults": 5
    }
  }'`,
    responseExample: `{
  "isError": false,
  "content": [
    {
      "type": "text",
      "text": "Found 5 high-impact papers and benchmarks regarding DeepSeek-R1 latency..."
    }
  ]
}`,
  },
];

export default function ApiReference() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(endpoints[0]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="w-5 h-5 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">API & Webhook Reference</h1>
                <Badge variant="outline" className="text-xs">REST v1</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Trigger workflows, poll execution results, and integrate with autonomous MCP agents.
              </p>
            </div>

            <Button asChild size="sm" variant="outline" className="text-xs h-9 gap-1.5">
              <Link to="/docs">
                <BookOpen className="w-3.5 h-3.5" /> Full Documentation
              </Link>
            </Button>
          </div>

          {/* Endpoints Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Endpoints List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Available Endpoints
              </div>
              {endpoints.map((ep) => (
                <button
                  key={ep.path}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedEndpoint.path === ep.path
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card/60 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      className={`text-[10px] font-mono px-1.5 py-0.5 ${
                        ep.method === "POST"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {ep.method}
                    </Badge>
                    <span className="font-mono text-foreground font-semibold truncate">{ep.path}</span>
                  </div>
                  <div className="text-muted-foreground text-[11px] line-clamp-1">{ep.title}</div>
                </button>
              ))}
            </div>

            {/* Endpoint Inspector */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-border p-6 bg-card/50">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge
                    className={`font-mono text-xs px-2 py-0.5 ${
                      selectedEndpoint.method === "POST"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {selectedEndpoint.method}
                  </Badge>
                  <code className="text-sm sm:text-base font-mono font-bold text-foreground">
                    {selectedEndpoint.path}
                  </code>
                </div>

                <h3 className="text-lg font-bold mb-2">{selectedEndpoint.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                  {selectedEndpoint.description}
                </p>

                {/* Parameters */}
                {selectedEndpoint.parameters && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Request Parameters
                    </h4>
                    <div className="border border-border rounded-lg overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-muted/60 text-muted-foreground text-[10px] uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Field</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Required</th>
                            <th className="py-2.5 px-3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border font-mono text-[11px]">
                          {selectedEndpoint.parameters.map((p) => (
                            <tr key={p.name}>
                              <td className="py-2 px-3 font-semibold text-foreground">{p.name}</td>
                              <td className="py-2 px-3 text-muted-foreground">{p.type}</td>
                              <td className="py-2 px-3">
                                {p.required ? (
                                  <Badge className="text-[9px] bg-destructive/15 text-destructive border-destructive/20">Required</Badge>
                                ) : (
                                  <span className="text-muted-foreground">Optional</span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-sans text-muted-foreground">{p.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* cURL Example */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold uppercase text-[10px] tracking-wider">Example Request (cURL)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEndpoint.curlExample);
                        toast.success("cURL snippet copied!");
                      }}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                  <pre className="p-4 rounded-xl bg-muted/80 border border-border text-xs font-mono overflow-x-auto text-foreground">
                    <code>{selectedEndpoint.curlExample}</code>
                  </pre>
                </div>

                {/* Response Example */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold uppercase text-[10px] tracking-wider">Sample JSON Response (200 OK)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEndpoint.responseExample);
                        toast.success("JSON response copied!");
                      }}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                  <pre className="p-4 rounded-xl bg-muted/80 border border-border text-xs font-mono overflow-x-auto text-emerald-400">
                    <code>{selectedEndpoint.responseExample}</code>
                  </pre>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
