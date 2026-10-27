import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  GraduationCap,
  Clock,
  ArrowRight,
  Sparkles,
  Bot,
  Layers,
  Terminal,
  CheckCircle2,
  Workflow,
} from "lucide-react";

interface Tutorial {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  description: string;
  steps: string[];
  workflowPresetId?: string;
}

const tutorialsData: Tutorial[] = [
  {
    id: "tut-1",
    title: "Building an Autonomous AI Router with DeepSeek & Slack",
    difficulty: "Intermediate",
    duration: "15 min",
    description: "Learn how to build an intelligent routing pipeline that analyzes incoming support tickets with DeepSeek-R1 and dynamically dispatches priority alerts to designated Slack channels.",
    steps: [
      "Set up an incoming Webhook trigger to capture payload events",
      "Connect an AI Agent node with a custom intent-classification prompt",
      "Configure conditional branching (Switch node) based on priority",
      "Send formatted alert messages to team Slack channels",
    ],
    workflowPresetId: "n8n-langchain-ai-agent-tools",
  },
  {
    id: "tut-2",
    title: "1-Click n8n Workflow Migration & Validation",
    difficulty: "Beginner",
    duration: "5 min",
    description: "Import an existing n8n JSON workflow export into Shadow Flow with zero code changes, verify node parameter mappings, and run an in-browser execution test.",
    steps: [
      "Export your workflow JSON from n8n",
      "Click 'Import Workflow' in Shadow Flow and paste or drag the file",
      "Review the automated node translation report",
      "Run the workflow in the client-side WASM engine",
    ],
  },
  {
    id: "tut-3",
    title: "Deploying Private Local LLMs with Ollama on Shadow Flow",
    difficulty: "Advanced",
    duration: "20 min",
    description: "Architect a 100% air-gapped, zero-cost AI data enrichment pipeline using local open-weight models (Llama 3 or Mistral) running on Ollama.",
    steps: [
      "Start Ollama locally with `ollama run llama3`",
      "Configure the Shadow Flow Ollama Node endpoint to http://localhost:11434",
      "Process high-volume internal spreadsheets with zero third-party cloud API costs",
      "Persist processed data into PostgreSQL or local SQLite",
    ],
  },
  {
    id: "tut-4",
    title: "Automated GitHub PR Review & Discord Bot Notifications",
    difficulty: "Beginner",
    duration: "10 min",
    description: "Create an event-driven DevOps pipeline that listens to repository pull requests, performs automated lint checks, and notifies development channels.",
    steps: [
      "Configure a GitHub Webhook with a secret HMAC signature",
      "Filter for opened and synchronized PR events",
      "Generate a rich Discord Embed card with author details and branch diff link",
      "Deploy to the background runner daemon",
    ],
  },
];

export default function Tutorials() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <GraduationCap className="w-3.5 h-3.5" />
              Hands-On Automation Guides
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Step-by-Step Tutorials
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Master autonomous workflow engineering with comprehensive guides, sample architectures, and runnable workflow templates.
            </p>
          </div>

          {/* Tutorials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {tutorialsData.map((tut) => (
              <Card key={tut.id} className="border-border bg-card/60 hover:border-primary/40 transition-all flex flex-col justify-between">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`text-[10px] ${
                        tut.difficulty === "Beginner"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : tut.difficulty === "Intermediate"
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {tut.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {tut.duration}
                    </span>
                  </div>

                  <CardTitle className="text-xl font-bold leading-snug">{tut.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {tut.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border text-xs space-y-1.5">
                    <div className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                      What You'll Build:
                    </div>
                    {tut.steps.map((st, i) => (
                      <div key={i} className="flex items-start gap-2 text-foreground/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Button asChild size="sm" className="w-full gap-2 text-xs font-semibold">
                      <Link to="/demo">
                        <Workflow className="w-3.5 h-3.5" /> Launch in Demo Canvas
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
