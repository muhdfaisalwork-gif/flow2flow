import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Workflow,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  GitBranch,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Globe,
  Sliders,
  Server,
  Lock,
} from "lucide-react";

export default function Features() {
  const featureList = [
    {
      icon: Workflow,
      title: "Visual DAG Canvas",
      badge: "Core Engine",
      description:
        "High-performance node graph powered by React Flow with sub-millisecond drag-and-drop response, infinite zooming, auto-layouting, and real-time execution highlighting.",
      points: [
        "Interactive minimap and viewport controls",
        "Undo / Redo with full history stacks",
        "Visual step-by-step debug playback",
        "Custom node annotations and grouping",
      ],
    },
    {
      icon: Cpu,
      title: "Dual Execution Engine",
      badge: "Unique Architecture",
      description:
        "Run deterministic workflows directly in your local browser through client-side WebAssembly, or dispatch heavy AI workloads to private self-hosted backend runners.",
      points: [
        "100% client-side zero-latency local execution",
        "Headless CLI and Docker runner support",
        "Dynamic worker pooling and queue concurrency",
        "Sub-10ms trigger cold starts",
      ],
    },
    {
      icon: Sparkles,
      title: "Shadow AI Copilot",
      badge: "Next-Gen AI",
      description:
        "Translate natural language prompts into complete, runnable multi-node workflows. The built-in AI assistant debugs errors, configures parameters, and optimizes node topologies.",
      points: [
        "Prompt-to-Workflow generation in seconds",
        "Automated node parameter validation",
        "Self-healing error diagnostics",
        "Support for DeepSeek, OpenAI, Anthropic & local Ollama",
      ],
    },
    {
      icon: Layers,
      title: "100% n8n Workflow Parity",
      badge: "Drop-in Compatible",
      description:
        "Effortlessly migrate legacy n8n workflows into Shadow Flow. Import existing n8n JSON exports directly into the canvas without reconfiguring triggers, parameters, or data shapes.",
      points: [
        "Native n8n JSON import parser",
        "Automatic schema mapping for 80+ standard nodes",
        "One-click migration validation report",
        "Dual export format support (Shadow Flow & n8n)",
      ],
    },
    {
      icon: Lock,
      title: "Zero-Telemetry Privacy",
      badge: "Security-First",
      description:
        "Your business data, API credentials, and workflow payloads never touch third-party servers. 100% air-gappable architecture engineered for strict compliance environments.",
      points: [
        "No phoning home or analytics beacons",
        "AES-GCM-256 encrypted credential store",
        "Full support for air-gapped corporate LANs",
        "Compliant with GDPR, HIPAA, and SOC-2 guidelines",
      ],
    },
    {
      icon: GitBranch,
      title: "Git-Based Versioning & CI/CD",
      badge: "DevOps Ready",
      description:
        "Treat workflows as code. Store workflow definitions as clean declarative JSON or TypeScript in Git repositories with branch reviews, pull requests, and automated testing.",
      points: [
        "Declarative JSON & TypeScript representations",
        "Audit trail with author diffing",
        "Environment variables per stage (Dev, Staging, Prod)",
        "CLI-driven pipeline deployment",
      ],
    },
    {
      icon: Terminal,
      title: "Native Model Context Protocol (MCP)",
      badge: "AI Agent Standard",
      description:
        "Full support for Anthropic's Model Context Protocol. Connect your workflows seamlessly to Claude Desktop, local coding assistants, and distributed AI agent swarms.",
      points: [
        "Dynamic tool registration for MCP clients",
        "Bidirectional context and resource streaming",
        "Local filesystem & memory integration",
        "Universal agent tool calling protocol",
      ],
    },
    {
      icon: KeyRound,
      title: "Enterprise Credential Vault",
      badge: "Access Control",
      description:
        "Store API keys, OAuth tokens, and database secrets safely. Credentials are encrypted at rest using zero-knowledge client encryption or private enterprise key management.",
      points: [
        "OAuth2 token auto-refresh handlers",
        "Granular per-node credential access control",
        "Integrations with HashiCorp Vault & AWS Secrets",
        "Automatic secret masking in debug logs",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 text-xs">
              Platform Overview
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Engineered for Speed, Privacy, and Scalability
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Discover the full suite of capabilities that make Shadow Flow the most robust open-source automation platform for modern engineering teams.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Button asChild className="gap-2 font-semibold">
                <Link to="/demo">
                  Try Live Canvas Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/integrations">Explore 120+ Integrations</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {featureList.map((f, i) => (
              <Card key={i} className="border-border bg-card/60 hover:border-primary/40 transition-all shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <f.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {f.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold pt-2">{f.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {f.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 pt-2 border-t border-border text-xs">
                    {f.points.map((pt, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA Banner */}
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-background border border-primary/30 text-center max-w-4xl mx-auto shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Ready to automate without limitations?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xl mx-auto">
              Get started with Shadow Flow in 30 seconds. Run locally via Docker, explore the interactive demo, or deploy to your own private cloud.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="font-semibold gap-2">
                <Link to="/demo">Launch Interactive Canvas</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
