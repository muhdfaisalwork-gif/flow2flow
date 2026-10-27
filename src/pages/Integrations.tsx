import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Search,
  Zap,
  ArrowRight,
  Bot,
  Database,
  MessageSquare,
  Cloud,
  Code2,
  Workflow,
  Sparkles,
} from "lucide-react";

interface IntegrationItem {
  name: string;
  category: "AI & LLMs" | "Databases" | "Messaging" | "Cloud & DevOps" | "Productivity";
  description: string;
  type: "Trigger & Action" | "Action Only" | "Trigger Only";
  popular?: boolean;
}

const integrationsData: IntegrationItem[] = [
  // AI & LLMs
  { name: "OpenAI (GPT-4o)", category: "AI & LLMs", description: "Chat completions, embeddings, structured outputs, and vision.", type: "Action Only", popular: true },
  { name: "Anthropic (Claude 3.5)", category: "AI & LLMs", description: "Long-context reasoning, tool calling, and MCP server interop.", type: "Action Only", popular: true },
  { name: "DeepSeek (R1 & V3)", category: "AI & LLMs", description: "Open-weight reasoning models with high-throughput chain-of-thought.", type: "Action Only", popular: true },
  { name: "Ollama (Local LLMs)", category: "AI & LLMs", description: "Run Llama 3, Mistral, and Qwen entirely on-premises without cloud fees.", type: "Action Only", popular: true },
  { name: "Hugging Face", category: "AI & LLMs", description: "Inference API endpoints for thousands of open-source models.", type: "Action Only" },
  { name: "Pinecone Vector DB", category: "AI & LLMs", description: "High-speed semantic search, RAG retrieval, and vector storage.", type: "Action Only" },

  // Databases
  { name: "PostgreSQL", category: "Databases", description: "Native SQL queries, pooled connections, and transaction blocks.", type: "Trigger & Action", popular: true },
  { name: "Supabase", category: "Databases", description: "Database queries, real-time table listeners, Auth, and Storage.", type: "Trigger & Action", popular: true },
  { name: "Redis", category: "Databases", description: "In-memory caching, pub/sub queues, and rate-limiting counters.", type: "Action Only", popular: true },
  { name: "MongoDB", category: "Databases", description: "NoSQL document collections, aggregation pipelines, and filters.", type: "Trigger & Action" },
  { name: "MySQL", category: "Databases", description: "Relational queries and automatic schema inspection.", type: "Trigger & Action" },
  { name: "SQLite", category: "Databases", description: "Local embedded database queries for standalone workflows.", type: "Action Only" },

  // Messaging & Alerts
  { name: "Slack", category: "Messaging", description: "Send interactive messages, listen for slash commands, and manage channels.", type: "Trigger & Action", popular: true },
  { name: "Discord", category: "Messaging", description: "Webhooks, bot interactions, embed builders, and channel alerts.", type: "Trigger & Action", popular: true },
  { name: "Telegram Bot", category: "Messaging", description: "Bidirectional chat triggers, inline keyboard callbacks, and media dispatch.", type: "Trigger & Action" },
  { name: "Twilio SMS", category: "Messaging", description: "Programmable SMS dispatch, verification codes, and phone calls.", type: "Trigger & Action" },
  { name: "Resend", category: "Messaging", description: "Transactional email delivery with React email templates and analytics.", type: "Action Only", popular: true },
  { name: "SendGrid", category: "Messaging", description: "Enterprise high-volume marketing and transactional email API.", type: "Action Only" },

  // Cloud & DevOps
  { name: "GitHub", category: "Cloud & DevOps", description: "Webhook triggers on PRs, commit pushes, issue triage, and releases.", type: "Trigger & Action", popular: true },
  { name: "GitLab", category: "Cloud & DevOps", description: "CI/CD pipeline hooks, repository events, and issue management.", type: "Trigger & Action" },
  { name: "Docker", category: "Cloud & DevOps", description: "Container lifecycle management, image builds, and container logs.", type: "Action Only" },
  { name: "AWS S3", category: "Cloud & DevOps", description: "Cloud object storage upload, download, presigned URLs, and bucket triggers.", type: "Trigger & Action", popular: true },
  { name: "Kubernetes", category: "Cloud & DevOps", description: "Orchestrate cluster jobs, inspect pods, and trigger rollouts.", type: "Action Only" },
  { name: "Custom Webhook", category: "Cloud & DevOps", description: "Universal HTTP endpoint trigger supporting HMAC headers & JSON payloads.", type: "Trigger Only", popular: true },

  // Productivity & Business
  { name: "Google Sheets", category: "Productivity", description: "Append rows, update spreadsheets, read cell ranges, and formula sync.", type: "Trigger & Action", popular: true },
  { name: "Notion", category: "Productivity", description: "Create database entries, update pages, and query workspaces.", type: "Trigger & Action", popular: true },
  { name: "Stripe", category: "Productivity", description: "Handle checkout webhooks, subscription billing, and invoice generation.", type: "Trigger & Action", popular: true },
  { name: "Jira Software", category: "Productivity", description: "Sprint tracking, ticket transitions, and automated issue creation.", type: "Trigger & Action" },
  { name: "Airtable", category: "Productivity", description: "Relational records, view automations, and attachment storage.", type: "Trigger & Action" },
  { name: "Linear", category: "Productivity", description: "Issue tracking, project sync, and automated PR issue links.", type: "Trigger & Action" },
];

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "AI & LLMs", "Databases", "Messaging", "Cloud & DevOps", "Productivity"];

  const filteredIntegrations = useMemo(() => {
    return integrationsData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 text-xs">
              Ecosystem & Connectors
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Connect to Any Tool in Your Tech Stack
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Over 120+ pre-built nodes and integrations. Connect AI models, cloud infrastructure, enterprise databases, and messaging channels in minutes.
            </p>
          </div>

          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredIntegrations.map((item) => (
              <Card
                key={item.name}
                className="border-border bg-card/60 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {item.category}
                    </Badge>
                    {item.popular && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold pt-1">{item.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono text-[11px]">{item.type}</span>
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                      <Link to="/demo">
                        Use in Demo <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Connector Callout */}
          <div className="p-8 rounded-2xl bg-secondary/40 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-1">Need a custom private integration?</h3>
              <p className="text-xs text-muted-foreground max-w-xl">
                Shadow Flow features a zero-dependency TypeScript node SDK. You can write custom private nodes in under 50 lines of code or use our universal HTTP Webhook & MCP connector.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 gap-2">
              <Link to="/docs">
                <Code2 className="w-4 h-4 text-primary" /> Read Node SDK Docs
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
