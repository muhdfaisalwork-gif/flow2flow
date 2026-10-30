import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  ArrowRight,
  Search,
  Cpu,
  Database,
  Mail,
  GitBranch,
  Terminal,
  FileCode2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface IntegrationItem {
  name: string;
  category: "AI & LLMs" | "Databases" | "Messaging" | "Development" | "Productivity";
  icon: string;
  description: string;
  popular?: boolean;
}

const allIntegrations: IntegrationItem[] = [
  { name: "DeepSeek Reasoner", category: "AI & LLMs", icon: "🤖", description: "R1 reasoning model integration for forensic analysis and multi-step deduction.", popular: true },
  { name: "Local Ollama", category: "AI & LLMs", icon: "💻", description: "Private local inference for Gemma 4 and Llama 3 with zero external cloud API spend.", popular: true },
  { name: "Model Context Protocol", category: "AI & LLMs", icon: "🔌", description: "Standardized tool discovery protocol connecting compliant MCP servers.", popular: true },
  { name: "Cloudflare D1", category: "Databases", icon: "⚡", description: "Edge SQLite database with distributed read replication and sub-15ms mutations.", popular: true },
  { name: "PostgreSQL", category: "Databases", icon: "🐘", description: "Direct SQL connection pools with parameter binding and transaction rollbacks.", popular: true },
  { name: "Supabase", category: "Databases", icon: "⚡", description: "Realtime tables, storage buckets, and Postgres Row-Level Security policies.", popular: true },
  { name: "Resend", category: "Messaging", icon: "📧", description: "Transactional email delivery with high inbox deliverability and click tracking.", popular: true },
  { name: "Slack", category: "Messaging", icon: "💬", description: "Post rich block-kit incident alerts, user approvals, and operational summaries.", popular: true },
  { name: "Discord", category: "Messaging", icon: "🎮", description: "Webhook and bot event listeners with embed payload formatting.", popular: false },
  { name: "GitHub", category: "Development", icon: "🐙", description: "Pull request triggers, issue triage, and commit deployment webhooks.", popular: true },
  { name: "Linear", category: "Development", icon: "📐", description: "Automated ticket creation, status synchronization, and engineering triage.", popular: true },
  { name: "Notion", category: "Productivity", icon: "📝", description: "Read and write database pages, sync executive briefings, and catalog research.", popular: false },
  { name: "Google Sheets", category: "Productivity", icon: "📊", description: "Append rows, batch lookup inventory, and export reporting tables.", popular: true },
  { name: "Airtable", category: "Productivity", icon: "📋", description: "Relational bases with schema validation and webhook triggers.", popular: false },
  { name: "Stripe", category: "Messaging", icon: "💳", description: "Webhook event intake for payment intents, customer invoices, and disputes.", popular: true },
  { name: "Clay", category: "Productivity", icon: "🧊", description: "Firmographic data enrichment, technographic signals, and domain lookups.", popular: true },
];

const categories = ["All", "AI & LLMs", "Databases", "Messaging", "Development", "Productivity"] as const;

export function IntegrationsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = allIntegrations.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section className="py-24 relative overflow-hidden bg-background" id="integrations">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Universal Interoperability
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Connect to 500+ Protocols, APIs, & Tools
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Wire local LLMs, cloud databases, Model Context Protocol servers, and webhooks into your DAG without writing custom wrapper boilerplate.
          </p>

          {/* Search & Category Filter */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Universal n8n Importer Feature Banner */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-card shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 text-primary">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-foreground">
                  Universal n8n JSON Importer
                </h3>
                <Badge variant="outline" className="text-[10px] bg-background font-mono text-emerald-400 border-emerald-500/30">
                  100% Compatible
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Already have workflows built in n8n? Export your JSON files and import them directly into Shadow Flow. Our engine preserves node parameters, credentials, and automatically calculates Kahn's topological layout.
              </p>
            </div>
          </div>

          <Button asChild className="gap-2 font-semibold shrink-0">
            <Link to="/demo">
              Test n8n Importer <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredIntegrations.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="p-4 rounded-xl border border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground bg-muted/30">
                      {item.category}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Protocol: REST / MCP</span>
                  <span className="text-emerald-400 font-semibold">Active</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" className="gap-2 font-semibold">
            <Link to="/integrations">
              Browse All 500+ Ecosystem Connectors <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
