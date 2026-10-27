import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, GitCommit, CheckCircle2, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Release {
  version: string;
  date: string;
  title: string;
  tagline: string;
  highlights: {
    type: "feature" | "improvement" | "fix";
    text: string;
  }[];
}

const releases: Release[] = [
  {
    version: "v1.0.2",
    date: "October 2026",
    title: "Shadow Flow Rebranding, SEO Agent Studio & MCP Support",
    tagline: "Autonomous AI SEO engine, Model Context Protocol integration, and complete public hub ecosystem.",
    highlights: [
      { type: "feature", text: "Autonomous SEO Agent Studio (/seo-agent) with AI Blog Writer, On-Page Auditor, and Backlink Engine." },
      { type: "feature", text: "Native Model Context Protocol (MCP) tool server interop for Claude and autonomous coding agents." },
      { type: "feature", text: "New public engineering blog (/blog) with rich markdown rendering, JSON-LD schemas, and AI search indexing." },
      { type: "improvement", text: "Complete seamless rebranding to Shadow Flow across all documentation, Dockerfiles, and metadata." },
      { type: "improvement", text: "Added complete footer page suites: Features, Integrations, Docs, API Reference, Community, and Legal." },
      { type: "fix", text: "Resolved canvas minimap z-index layering during complex node grouping." },
    ],
  },
  {
    version: "v1.0.1",
    date: "October 2026",
    title: "100% n8n Workflow Parity & Migration Suite",
    tagline: "Drop-in n8n workflow compatibility, one-click JSON parser, and enhanced execution reliability.",
    highlights: [
      { type: "feature", text: "Full n8n JSON format importer with automated schema mapping and topology normalization." },
      { type: "feature", text: "Built-in library of production n8n workflows (LangChain AI Router, Slack Alerts, Webhook Pipelines)." },
      { type: "improvement", text: "Added React Error Boundary shields around canvas and copilot drawer to eliminate runtime crashes." },
      { type: "improvement", text: "Optimized large JSON workflow serialization for payloads over 5MB." },
      { type: "fix", text: "Fixed theme toggle dropdown menu event collision in browser automations." },
    ],
  },
  {
    version: "v1.0.0",
    date: "September 2026",
    title: "Official Open-Source Launch",
    tagline: "The modern, privacy-first alternative to closed workflow automation.",
    highlights: [
      { type: "feature", text: "High-performance visual DAG canvas built with React Flow and TypeScript." },
      { type: "feature", text: "Dual execution runtime: client-side WebAssembly for zero-latency testing + Docker backend for production." },
      { type: "feature", text: "120+ pre-built integration nodes covering AI, databases, messaging, and cloud DevOps." },
      { type: "feature", text: "AES-GCM-256 encrypted credential vault with zero telemetry and 100% self-hosted privacy." },
      { type: "feature", text: "Shadow AI Copilot for prompt-to-workflow generation." },
    ],
  },
];

export default function Changelog() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Rocket className="w-3.5 h-3.5" />
              Product Evolution
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Changelog
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Follow the latest updates, architectural improvements, and new capabilities shipped to Shadow Flow.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-12 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-border">
            {releases.map((rel) => (
              <div key={rel.version} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-3 top-1.5 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center -translate-x-1/2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold px-2.5 py-0.5">
                      {rel.version}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{rel.date}</span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{rel.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{rel.tagline}</p>
                  </div>

                  <Card className="border-border bg-card/60 shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      {rel.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 uppercase tracking-wider ${
                              item.type === "feature"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : item.type === "improvement"
                                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-foreground/90">{item.text}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {/* GitHub releases callout */}
          <div className="mt-16 p-6 rounded-2xl bg-secondary/40 border border-border text-center">
            <h3 className="font-bold text-base mb-2">Want to see full commit diffs?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Our complete Git commit history and releases are 100% public on GitHub under the Apache 2.0 license.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href="https://github.com/muhdfaisalwork-gif/shadowflow" target="_blank" rel="noopener noreferrer">
                <GitCommit className="w-4 h-4" /> View GitHub Commits
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
