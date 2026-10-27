import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Terminal,
  Cpu,
  Layers,
  ShieldCheck,
  Workflow,
  Copy,
  CheckCircle2,
  ExternalLink,
  Search,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface DocSection {
  id: string;
  title: string;
  category: string;
  content: JSX.Element;
}

export default function Docs() {
  const [activeSectionId, setActiveSectionId] = useState<string>("quickstart");
  const [searchFilter, setSearchFilter] = useState("");

  const sections: DocSection[] = [
    {
      id: "quickstart",
      category: "Getting Started",
      title: "Quickstart & Installation",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Getting Started with Shadow Flow</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Shadow Flow can be launched in under 30 seconds using Docker or tested entirely in your browser with zero server installation.
          </p>

          <h3 className="text-lg font-semibold pt-2">Option A: Quick Run with Docker</h3>
          <div className="p-4 rounded-xl bg-muted/80 border border-border font-mono text-xs space-y-2">
            <div className="text-muted-foreground"># Run latest official Shadow Flow container</div>
            <div className="text-emerald-400 font-semibold select-all">
              docker run -d -p 8080:8080 --name shadowflow -v shadowflow_data:/app/data ghcr.io/muhdfaisalwork-gif/shadowflow:latest
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Once started, open <code className="text-primary font-mono">http://localhost:8080</code> in your browser to access the visual canvas.
          </p>

          <h3 className="text-lg font-semibold pt-4">Option B: Development Setup from Source</h3>
          <div className="p-4 rounded-xl bg-muted/80 border border-border font-mono text-xs space-y-2">
            <div className="text-muted-foreground"># Clone repository and install dependencies</div>
            <div className="text-primary select-all">git clone https://github.com/muhdfaisalwork-gif/shadowflow.git</div>
            <div className="text-primary select-all">cd shadowflow</div>
            <div className="text-primary select-all">npm install</div>
            <div className="text-emerald-400 font-semibold select-all">npm run dev</div>
          </div>
        </div>
      ),
    },
    {
      id: "architecture",
      category: "Getting Started",
      title: "Architecture & Dual Engine",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Dual Execution Engine</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Unlike legacy workflow systems that require round-tripping every simple evaluation to a heavy remote server, Shadow Flow uses a hybrid dual-runtime model.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <h4 className="font-bold text-sm text-primary mb-1">1. WebAssembly Client Runtime</h4>
              <p className="text-xs text-muted-foreground">
                Runs directly inside your browser tab. Instant testing, rapid prototyping, and privacy-preserving data transformations without firing a single HTTP request to a server.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <h4 className="font-bold text-sm text-emerald-400 mb-1">2. Private Worker Daemon</h4>
              <p className="text-xs text-muted-foreground">
                Headless background micro-services for long-running batch jobs, cron triggers, vector embeddings, and enterprise webhooks running inside your private VPC.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ai-nodes",
      category: "AI & Agents",
      title: "AI Nodes & Copilot Setup",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Autonomous AI Agents & MCP</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Shadow Flow natively connects to both closed commercial APIs (OpenAI GPT-4o, Anthropic Claude 3.5) and open-weight models (DeepSeek-R1, Ollama Llama 3) via the Model Context Protocol (MCP).
          </p>

          <div className="p-4 rounded-xl bg-muted/80 border border-border font-mono text-xs space-y-2">
            <div className="text-muted-foreground">// Example AI Agent Node Configuration</div>
            <div className="text-blue-400">const agentConfig = &#123;</div>
            <div className="pl-4 text-foreground">model: "deepseek-reasoner",</div>
            <div className="pl-4 text-foreground">temperature: 0.1,</div>
            <div className="pl-4 text-foreground">tools: ["mcp:web-search", "mcp:sql-query", "mcp:slack-alert"],</div>
            <div className="pl-4 text-foreground">maxIterations: 5,</div>
            <div className="text-blue-400">&#125;;</div>
          </div>
        </div>
      ),
    },
    {
      id: "n8n-migration",
      category: "Migration",
      title: "Migrating from n8n",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Drop-In n8n Compatibility</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Shadow Flow features 100% workflow topology parity with n8n exports. You can drag and drop any exported <code className="text-primary font-mono">.json</code> file straight onto the Shadow Flow canvas.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Automatic Trigger Conversion:</strong> Webhooks, Cron Schedules, and manual triggers are mapped instantly.</span>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Zero Telemetry Guarantee:</strong> Eliminate unexpected tracking and licensing restrictions.</span>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Expression Compatibility:</strong> JavaScript expressions like <code>$json.body.id</code> resolve naturally.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      category: "Enterprise",
      title: "Security, Vault & RBAC",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Enterprise Security & Compliance</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Shadow Flow was engineered from day one for zero-trust, air-gapped corporate deployments where sensitive tokens and customer data cannot leave internal perimeter boundaries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <div className="font-bold text-sm mb-1">AES-256 GCM</div>
              <p className="text-xs text-muted-foreground">All stored credentials and webhook tokens are encrypted at rest with envelope encryption.</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <div className="font-bold text-sm mb-1">Zero Cloud Telemetry</div>
              <p className="text-xs text-muted-foreground">No tracking pings, no license servers, and no third-party analytic beacons.</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <div className="font-bold text-sm mb-1">Audit Trails</div>
              <p className="text-xs text-muted-foreground">Detailed immutable JSON execution logs for every node execution and credential access.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Documentation</h1>
                <Badge variant="secondary" className="text-xs">v1.0.2</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Guides, architectural overviews, and tutorials for Shadow Flow.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter topics..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs h-9 shrink-0 gap-1.5">
                <Link to="/api-reference">
                  <Terminal className="w-3.5 h-3.5 text-primary" /> API Reference
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Layout: Sidebar & Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-1">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      activeSectionId === sec.id
                        ? "bg-primary text-primary-foreground font-semibold shadow"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{sec.title}</span>
                    <span className="text-[10px] opacity-75">{sec.category}</span>
                  </button>
                ))}
              </div>

              <Card className="border-border bg-card/60 p-4 space-y-3">
                <div className="text-xs font-semibold text-foreground">Need Hands-On Testing?</div>
                <p className="text-[11px] text-muted-foreground">
                  Test pre-built workflows directly in our browser demo sandbox without logging in.
                </p>
                <Button asChild size="sm" className="w-full text-xs h-8 gap-1.5 font-semibold">
                  <Link to="/demo">
                    Open Demo Canvas <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </Card>
            </div>

            {/* Content Pane */}
            <div className="lg:col-span-9">
              <Card className="border-border p-6 sm:p-8 bg-card/40">
                <div className="mb-4">
                  <Badge variant="outline" className="text-[10px] mb-2">
                    {currentSection.category}
                  </Badge>
                </div>
                {currentSection.content}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
