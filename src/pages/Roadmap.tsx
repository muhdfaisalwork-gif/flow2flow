import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThumbsUp, Compass, Plus, Sparkles, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface RoadmapItem {
  id: string;
  title: string;
  category: "Engine" | "AI & Agents" | "Integrations" | "Enterprise";
  description: string;
  status: "In Progress" | "Planned" | "Researching";
  votes: number;
}

const initialItems: Record<string, RoadmapItem[]> = {
  now: [
    {
      id: "now-1",
      title: "Distributed Worker Swarms",
      category: "Engine",
      description: "Scale workflow executions across multiple physical nodes with automatic leader election and Redis queuing.",
      status: "In Progress",
      votes: 142,
    },
    {
      id: "now-2",
      title: "Model Context Protocol (MCP) Server Mode",
      category: "AI & Agents",
      description: "Allow any Shadow Flow workflow to be invoked directly as a dynamic tool from Claude Desktop or Cursor.",
      status: "In Progress",
      votes: 189,
    },
    {
      id: "now-3",
      title: "Autonomous AI SEO & News Agent Studio",
      category: "AI & Agents",
      description: "Automated content research, SERP heuristics, on-page SEO scoring, and backlink directory outreach.",
      status: "In Progress",
      votes: 215,
    },
  ],
  next: [
    {
      id: "next-1",
      title: "Multi-Tenant Team Workspaces & SSO",
      category: "Enterprise",
      description: "SAML 2.0 / OIDC enterprise authentication, organization hierarchies, and role-based access control.",
      status: "Planned",
      votes: 98,
    },
    {
      id: "next-2",
      title: "Local Vector Database Node (Chroma / LanceDB)",
      category: "AI & Agents",
      description: "Embedded zero-setup vector storage running directly inside the Shadow Flow runtime for private RAG.",
      status: "Planned",
      votes: 164,
    },
    {
      id: "next-3",
      title: "Visual Branch Diffing & Git PR Previews",
      category: "Engine",
      description: "Visual canvas visualizer for Git pull requests showing added, modified, and removed node connections.",
      status: "Planned",
      votes: 112,
    },
  ],
  future: [
    {
      id: "future-1",
      title: "Self-Healing Workflows with Auto-Rollback",
      category: "AI & Agents",
      description: "Autonomous supervisor agents that detect API schema changes and dynamically adjust node mappings.",
      status: "Researching",
      votes: 256,
    },
    {
      id: "future-2",
      title: "WASM-Compiled Edge Micro-Gateways",
      category: "Engine",
      description: "Compile selected workflows into ultra-lightweight standalone WebAssembly binaries for Cloudflare Workers.",
      status: "Researching",
      votes: 178,
    },
    {
      id: "future-3",
      title: "Community Plugin Marketplace & Monetization",
      category: "Integrations",
      description: "Decentralized marketplace where developers can publish verified custom node packages.",
      status: "Researching",
      votes: 135,
    },
  ],
};

export default function Roadmap() {
  const [columns, setColumns] = useState(initialItems);
  const [userVoted, setUserVoted] = useState<Set<string>>(new Set());

  const handleVote = (colKey: string, itemId: string) => {
    if (userVoted.has(itemId)) {
      toast.info("You already upvoted this initiative!");
      return;
    }

    setColumns((prev) => {
      const colItems = prev[colKey].map((item) => {
        if (item.id === itemId) {
          return { ...item, votes: item.votes + 1 };
        }
        return item;
      });
      return { ...prev, [colKey]: colItems };
    });

    setUserVoted((prev) => new Set([...prev, itemId]));
    toast.success("Vote recorded! Thank you for shaping the roadmap.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Compass className="w-3.5 h-3.5" />
              Transparent Public Roadmap
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              What We're Building Next
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Shadow Flow is 100% community-driven. Upvote the features you need most, track ongoing engineering efforts, and suggest new capabilities.
            </p>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Column 1: In Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-base">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Now (In Progress)
                </div>
                <Badge variant="secondary" className="text-xs">
                  {columns.now.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {columns.now.map((item) => (
                  <Card key={item.id} className="border-border bg-card/60 hover:border-primary/40 transition-all shadow-sm">
                    <CardHeader className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                          {item.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold">{item.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote("now", item.id)}
                          className={`text-xs h-7 gap-1.5 ${
                            userVoted.has(item.id) ? "border-primary text-primary bg-primary/10" : ""
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{item.votes}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Column 2: Next */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-base">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Next (Q1 2027)
                </div>
                <Badge variant="secondary" className="text-xs">
                  {columns.next.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {columns.next.map((item) => (
                  <Card key={item.id} className="border-border bg-card/60 hover:border-primary/40 transition-all shadow-sm">
                    <CardHeader className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]">
                          {item.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold">{item.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote("next", item.id)}
                          className={`text-xs h-7 gap-1.5 ${
                            userVoted.has(item.id) ? "border-primary text-primary bg-primary/10" : ""
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{item.votes}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Column 3: Future */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-base">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Future Vision
                </div>
                <Badge variant="secondary" className="text-xs">
                  {columns.future.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {columns.future.map((item) => (
                  <Card key={item.id} className="border-border bg-card/60 hover:border-primary/40 transition-all shadow-sm">
                    <CardHeader className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                        <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[10px]">
                          {item.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold">{item.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote("future", item.id)}
                          className={`text-xs h-7 gap-1.5 ${
                            userVoted.has(item.id) ? "border-primary text-primary bg-primary/10" : ""
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{item.votes}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Suggest a feature banner */}
          <div className="p-8 rounded-2xl bg-secondary/40 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-1">Have an idea or feature request?</h3>
              <p className="text-xs text-muted-foreground max-w-xl">
                Open a GitHub Discussion or RFC (Request For Comments) to discuss architectural proposals directly with core maintainers.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 gap-2">
              <a href="https://github.com/muhdfaisalwork-gif/flow2flow/discussions" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-4 h-4 text-primary" /> Open GitHub Discussion
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
