import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow,
  Bot,
  Code2,
  Puzzle,
  Shield,
  Zap,
  GitBranch,
  Cloud,
  ChevronDown,
  Terminal,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface FeatureItem {
  id: string;
  icon: typeof Workflow;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  tag: string;
  gradient: string;
  technicalDetails: {
    specs: string[];
    snippet: string;
    runtime: string;
  };
}

const features: FeatureItem[] = [
  {
    id: "visual-builder",
    icon: Workflow,
    title: "Visual DAG Canvas",
    description:
      "Design non-linear workflows with branching, loops, and parallel paths on an infinite canvas with Kahn's topological auto-layout.",
    metric: "< 16ms",
    metricLabel: "Canvas Render Latency",
    tag: "Visual Engine",
    gradient: "from-blue-500 to-cyan-500",
    technicalDetails: {
      specs: [
        "React Flow & WebAssembly graph traversal",
        "Kahn's topological sorting removes circular deadlocks",
        "Sub-pixel bezier handles with reactive drag-snapping",
      ],
      snippet: `// Kahn's algorithm layout execution
const sortedNodes = toposort(workflow.nodes, workflow.edges);
layoutEngine.arrangeGrid(sortedNodes, { spacingX: 320, spacingY: 150 });`,
      runtime: "Client-side WebAssembly",
    },
  },
  {
    id: "ai-copilot",
    icon: Bot,
    title: "Prompt-to-Flow AI Copilot",
    description:
      "Transform plain English prompts into fully wired node graphs with pre-configured schemas, credential placeholders, and edge routing.",
    metric: "0 API Keys",
    metricLabel: "Built-in Cloud AI Included",
    tag: "AI Copilot",
    gradient: "from-purple-500 to-pink-500",
    technicalDetails: {
      specs: [
        "Groq LPU ultra-low latency generation built-in",
        "Local Ollama Gemma 4 & Llama 3 offline inference",
        "Deterministic heuristic synthesis with zero cloud spend",
      ],
      snippet: `// AI Copilot graph synthesis
const graph = await copilot.synthesize("B2B lead intake with validation and CRM sync");
canvas.mount(graph.nodes, graph.edges);`,
      runtime: "Groq Cloud / Local Ollama",
    },
  },
  {
    id: "code-flexibility",
    icon: Code2,
    title: "Code When You Need It",
    description:
      "Embed TypeScript and JavaScript directly in any node. Full support for npm libraries, custom transform functions, and regex parsers.",
    metric: "100%",
    metricLabel: "TypeScript Strict Mode",
    tag: "Code Engine",
    gradient: "from-emerald-500 to-teal-500",
    technicalDetails: {
      specs: [
        "Sandboxed execution with isolated global contexts",
        "Full access to async/await and Web Fetch APIs",
        "Zero build step required for inline data transforms",
      ],
      snippet: `export default async function transform(inputs: Record<string, any>) {
  return inputs.records.filter(r => r.verified && r.score > 85);
}`,
      runtime: "V8 Sandboxed Worker",
    },
  },
  {
    id: "mcp-integrations",
    icon: Puzzle,
    title: "Model Context Protocol (MCP)",
    description:
      "Connect native Anthropic MCP servers, 500+ REST integrations, and custom OpenAPI endpoints without writing custom SDK wrappers.",
    metric: "500+",
    metricLabel: "Connected Endpoints",
    tag: "Interoperability",
    gradient: "from-amber-500 to-orange-500",
    technicalDetails: {
      specs: [
        "Anthropic Model Context Protocol dynamic tool discovery",
        "Universal n8n JSON importer with 1-click migration",
        "Bidirectional export to Activepieces and Make",
      ],
      snippet: `// MCP tool discovery & dynamic parameter binding
const tools = await mcpServer.listTools();
registerNodeTypes(tools.map(toWorkflowNode));`,
      runtime: "JSON-RPC 2.0 / MCP Spec",
    },
  },
  {
    id: "self-hostable",
    icon: Shield,
    title: "Self-Host or Cloud",
    description:
      "Run completely air-gapped on your private infrastructure, Docker, or bare metal. Zero forced telemetry or phone-home pings.",
    metric: "Apache 2.0",
    metricLabel: "100% Permissive License",
    tag: "Data Privacy",
    gradient: "from-blue-600 to-indigo-600",
    technicalDetails: {
      specs: [
        "Docker Compose single-command deployment",
        "Credentials encrypted client-side with AES-GCM-256",
        "Zero license restrictions on commercial redistribution",
      ],
      snippet: `version: '3.8'
services:
  shadowflow:
    image: shadowflow/engine:latest
    ports: ["3000:3000"]
    environment: [ENCRYPTION_KEY=secret]`,
      runtime: "Docker / Bare Metal / Cloudflare",
    },
  },
  {
    id: "zero-cost-heuristics",
    icon: Zap,
    title: "Zero-Cost Heuristic Engine",
    description:
      "Automated graph repair and logic synthesis that operates offline. Fixes broken connections and parameters without recursive LLM billing.",
    metric: "$0.00",
    metricLabel: "Per Heuristic Execution",
    tag: "Cost Optimization",
    gradient: "from-rose-500 to-red-500",
    technicalDetails: {
      specs: [
        "Deterministic graph healing without API token consumption",
        "Sub-millisecond parameter reconciliation",
        "Protects cloud budgets against recursive retry loops",
      ],
      snippet: `const healedGraph = heuristicEngine.repairMissingEdges(dag);
console.log('Fixed', healedGraph.repairedEdges, 'edges without API calls');`,
      runtime: "Client-side Heuristic Core",
    },
  },
  {
    id: "git-versioning",
    icon: GitBranch,
    title: "Git-Native Versioning",
    description:
      "Every workflow change generates a deterministic snapshot with unified diffs, rollback checkpoints, and multi-tenant audit logs.",
    metric: "Immutable",
    metricLabel: "Audit History Ledgers",
    tag: "DevOps",
    gradient: "from-violet-500 to-purple-600",
    technicalDetails: {
      specs: [
        "JSON-based workflow definitions suitable for Git commits",
        "Instant one-click rollback to prior stable checkpoints",
        "Branching and staging environment support",
      ],
      snippet: `await workflowStorage.saveVersion(workflowId, {
  changeSummary: 'Updated Resend email template bindings',
  snapshot: workflowState,
});`,
      runtime: "Cloudflare D1 SQLite",
    },
  },
  {
    id: "edge-infrastructure",
    icon: Cloud,
    title: "Edge Cloud Infrastructure",
    description:
      "Serverless execution deployed across global Cloudflare edge locations with sub-50ms roundtrip responses and D1 persistence.",
    metric: "Sub-50ms",
    metricLabel: "Global Edge Latency",
    tag: "High Availability",
    gradient: "from-cyan-500 to-blue-600",
    technicalDetails: {
      specs: [
        "Cloudflare Workers global edge compute network",
        "Distributed D1 SQLite database with read replication",
        "Zero container cold-start delay for webhook triggers",
      ],
      snippet: `// Edge Worker entrypoint
export default {
  async fetch(request, env) {
    return handleWorkflowDispatch(request, env.DB);
  }
};`,
      runtime: "Cloudflare Workers Edge",
    },
  },
];

function InteractiveFeatureCard({ feature }: { feature: FeatureItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const Icon = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
        isHovered
          ? "border-primary/60 bg-card/90 shadow-2xl shadow-primary/10 -translate-y-1.5"
          : "border-border/80 bg-card/50"
      }`}
      style={{
        perspective: 1000,
      }}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`,
          }}
        />
      )}

      {/* Main Card Content */}
      <div className="p-6 relative z-10">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-20 flex items-center justify-center text-white shadow-md`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <Badge variant="outline" className="text-[11px] font-mono bg-background/80">
            {feature.tag}
          </Badge>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-foreground mb-2">
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {feature.description}
        </p>

        {/* Metric Highlight Box */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{feature.metricLabel}</div>
            <div className="text-base font-bold text-foreground font-mono">{feature.metric}</div>
          </div>
          <span className="text-xs text-primary font-semibold flex items-center gap-1">
            Verified <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Expandable Technical Drawer */}
      <div className="border-t border-border/60 bg-muted/20 relative z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-3 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{isExpanded ? "Hide Technical Specifications" : "View Technical Implementation"}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180 text-primary" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden px-6 pb-6 pt-2 space-y-4"
            >
              {/* Architecture Specs */}
              <div>
                <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider">
                  Architecture Specifications:
                </span>
                <ul className="mt-2 space-y-1.5">
                  {feature.technicalDetails.specs.map((spec, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code Snippet */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                  <span>code.snippet</span>
                  <span className="text-primary">{feature.technicalDetails.runtime}</span>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                  <code>{feature.technicalDetails.snippet}</code>
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            Core Architecture & Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Engineered for Precision and Scale
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every layer of Shadow Flow is built with permissive open-source standards, deterministic execution guarantees, and zero vendor lock-in.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <InteractiveFeatureCard key={feature.id} feature={feature} />
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for complete API references and Model Context Protocol schemas?
          </p>
          <Button asChild variant="outline" className="gap-2 font-semibold">
            <Link to="/docs">
              Read Developer Documentation <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
