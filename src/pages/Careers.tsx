import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Heart,
  Globe,
  Zap,
  Laptop,
  Smile,
} from "lucide-react";
import { toast } from "sonner";

interface JobRole {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  description: string;
}

const roles: JobRole[] = [
  {
    id: "eng-1",
    title: "Senior Distributed Systems Engineer",
    team: "Execution Core",
    location: "Remote (Global)",
    type: "Full-Time",
    description: "Design and scale the next-generation distributed workflow queue, leader election, and high-throughput execution engines in Rust and TypeScript.",
  },
  {
    id: "eng-2",
    title: "Staff Frontend Architect (Canvas & WASM)",
    team: "UI/UX & Engine",
    location: "Remote (Global)",
    type: "Full-Time",
    description: "Lead the architecture of our visual React Flow DAG canvas, client-side WebAssembly execution runtime, and state reconciliation pipeline.",
  },
  {
    id: "eng-3",
    title: "AI Research & Agent Systems Engineer",
    team: "AI Platform",
    location: "Remote (Global)",
    type: "Full-Time",
    description: "Build native Model Context Protocol (MCP) bridges, multi-agent supervision loops, and local LLM tool calling integrations.",
  },
  {
    id: "devrel-1",
    title: "Developer Relations & Community Advocate",
    team: "Developer Ecosystem",
    location: "Remote (Global)",
    type: "Full-Time",
    description: "Champion Shadow Flow across developer conferences, author architectural deep dives, create video tutorials, and foster our Discord community.",
  },
];

export default function Careers() {
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);

  const handleApply = (role: JobRole) => {
    setSelectedRole(role);
    toast.success(`Application modal opened for: ${role.title}`);
  };

  const perks = [
    { icon: Globe, title: "100% Remote-First", desc: "Work from anywhere in the world with async-first workflows and flexible hours." },
    { icon: Laptop, title: "Latest Hardware Stipend", desc: "$4,000 allowance for top-of-the-line laptop, 4K monitors, and ergonomic setup." },
    { icon: Heart, title: "Comprehensive Health", desc: "Premium medical, dental, vision, and mental wellness coverage for you and family." },
    { icon: Zap, title: "Open-Source Dedication", desc: "Spend 20% of your paid work time contributing to upstream open-source projects." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 text-xs">
              Careers & Culture
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Shape the Future of Autonomous Systems
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              We are a distributed team of engineers, systems architects, and open-source advocates building the backbone of privacy-first workflow automation.
            </p>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {perks.map((p, i) => (
              <Card key={i} className="border-border bg-card/60">
                <CardContent className="p-5 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Open Roles Section */}
          <div className="space-y-6 mb-16">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-2xl font-bold">Open Positions</h2>
              <Badge variant="secondary" className="text-xs">
                {roles.length} Active Openings
              </Badge>
            </div>

            <div className="space-y-4">
              {roles.map((r) => (
                <Card key={r.id} className="border-border bg-card/60 hover:border-primary/40 transition-all p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {r.team}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {r.location}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {r.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{r.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                        {r.description}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleApply(r)}
                      className="shrink-0 gap-2 font-semibold text-xs h-9"
                    >
                      Apply Now <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* General Application Callout */}
          <div className="p-8 rounded-2xl bg-secondary/40 border border-border text-center max-w-2xl mx-auto">
            <h3 className="text-lg font-bold mb-2">Don't see your specific role?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              We are always excited to connect with talented open-source contributors, systems programmers, and compilers researchers. Send your portfolio and GitHub profile to our talent inbox.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href="mailto:careers@shadowflow.work">
                Send Open Application <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
