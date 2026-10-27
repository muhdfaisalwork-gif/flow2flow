import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Zap,
  Lock,
  Heart,
  Github,
  ArrowRight,
  Globe,
  Terminal,
  Cpu,
} from "lucide-react";

export default function About() {
  const principles = [
    {
      icon: Lock,
      title: "100% Privacy by Design",
      desc: "Your data, customer payloads, and API credentials belong exclusively to you. Shadow Flow has zero telemetric reporting, no phoning home, and supports strict air-gapped deployments.",
    },
    {
      icon: Zap,
      title: "Zero Vendor Lock-in",
      desc: "All workflow graphs are stored as clean, transparent JSON. Export, import, version in Git, or run in headless containers with complete licensing freedom under Apache 2.0.",
    },
    {
      icon: Cpu,
      title: "Local-First Performance",
      desc: "Why should a simple JSON transformation take 800ms of cloud network round-trip? Shadow Flow executes workflows right in your browser or local daemon with sub-millisecond latency.",
    },
    {
      icon: Heart,
      title: "Community-Led Innovation",
      desc: "We believe workflow automation is a foundational utility of software engineering that should be open, accessible, and transparent to developers everywhere.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 text-xs">
              Our Mission & Philosophy
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Building the Sovereign Workflow Layer
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Shadow Flow is on a mission to free developers and enterprises from prohibitive execution fees, proprietary lock-in, and privacy compromises in modern workflow automation.
            </p>
          </div>

          {/* Story Narrative */}
          <div className="p-8 sm:p-12 rounded-2xl bg-card/60 border border-border space-y-6 mb-16 text-muted-foreground text-sm sm:text-base leading-relaxed">
            <h2 className="text-2xl font-bold text-foreground">Why We Built Shadow Flow</h2>
            <p>
              In recent years, the workflow automation landscape transformed from developer-friendly tools into gated commercial ecosystems. Cloud providers began charging punishing fees per execution step, imposing restrictive source-available licenses, and funneling private corporate payloads through centralized third-party servers.
            </p>
            <p>
              With the explosion of autonomous AI agents and local open-weight models (like DeepSeek, Llama, and Mistral), this centralized model completely broke down. Routing hundreds of thousands of AI agent evaluations through a closed cloud runner creates massive latency bottlenecks and unacceptable privacy risks.
            </p>
            <p>
              We built <strong>Shadow Flow</strong> as the definitive answer: an open-source (Apache 2.0), visual DAG orchestration platform engineered with client-side WebAssembly, native Model Context Protocol (MCP) support, and drop-in compatibility with existing n8n workflows.
            </p>
          </div>

          {/* Core Principles */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Our Core Architectural Tenets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {principles.map((p, i) => (
                <Card key={i} className="border-border bg-card/60 hover:border-primary/40 transition-all">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <p.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">{p.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Open Source Callout */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-background border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-bold mb-1">Open Source & Independent</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Licensed under the permissive Apache License 2.0. Fork it, embed it in your commercial SaaS, or deploy it to private air-gapped clusters with no restrictions.
              </p>
            </div>
            <Button asChild className="gap-2 font-semibold shrink-0">
              <a href="https://github.com/muhdfaisalwork-gif/flow2flow" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" /> View GitHub Repository
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
