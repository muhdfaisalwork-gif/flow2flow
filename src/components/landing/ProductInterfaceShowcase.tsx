import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Terminal,
  Clock,
  Sparkles,
  Bot,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  FileCode2,
  Share2,
  Settings2,
  Maximize2,
  ArrowRight,
  Database,
  Globe,
  Sliders,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ProductInterfaceShowcase() {
  const [activeTab, setActiveTab] = useState<"canvas" | "copilot" | "trace" | "n8n">("canvas");
  const [selectedNode, setSelectedNode] = useState<string>("webhook-1");

  return (
    <section className="py-24 relative overflow-hidden bg-secondary/15" id="interface-showcase">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5" />
            Verified Application Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            The Living Shadow Flow Workspace
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Inspect the actual desktop workspace. Switch views to explore the visual DAG canvas, the AI Copilot synthesis drawer, execution traces, and the n8n importer.
          </p>

          {/* Interface Mode Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab("canvas")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === "canvas"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/80"
              }`}
            >
              <Layers className="w-4 h-4" /> Visual DAG Canvas
            </button>

            <button
              onClick={() => setActiveTab("copilot")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === "copilot"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/80"
              }`}
            >
              <Bot className="w-4 h-4" /> AI Copilot Drawer
            </button>

            <button
              onClick={() => setActiveTab("trace")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === "trace"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/80"
              }`}
            >
              <Clock className="w-4 h-4" /> Execution Trace & Benchmarks
            </button>

            <button
              onClick={() => setActiveTab("n8n")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === "n8n"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/80"
              }`}
            >
              <FileCode2 className="w-4 h-4" /> Universal n8n Adapter
            </button>
          </div>
        </div>

        {/* Application Window Frame */}
        <div className="rounded-2xl border border-border/80 bg-slate-950 shadow-2xl overflow-hidden">
          
          {/* macOS Title Bar */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">
                Shadow Flow IDE • production.workflow.sf
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                WASM Core: Active
              </span>
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-slate-400 hover:text-white">
                <Link to="/demo">
                  Open Full Canvas <Maximize2 className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Window Canvas Body */}
          <div className="p-6 sm:p-8 min-h-[460px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: VISUAL DAG CANVAS */}
              {activeTab === "canvas" && (
                <motion.div
                  key="canvas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-4">
                      <span>Grid: 320px × 150px</span>
                      <span>Zoom: 100%</span>
                      <span>Nodes: 4 Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Click any node to inspect payload:</span>
                    </div>
                  </div>

                  {/* Interactive Nodes Topology */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                    
                    {/* Node 1 */}
                    <div
                      onClick={() => setSelectedNode("webhook-1")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedNode === "webhook-1"
                          ? "bg-blue-950/40 border-blue-400 shadow-lg shadow-blue-500/10 scale-102"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 mb-1">
                        <span>TRIGGER</span>
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                      </div>
                      <div className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>🔗</span> Webhook Ingest
                      </div>
                      <p className="text-xs text-slate-400">POST /api/v1/event</p>
                    </div>

                    {/* Node 2 */}
                    <div
                      onClick={() => setSelectedNode("heuristic-2")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedNode === "heuristic-2"
                          ? "bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/10 scale-102"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 mb-1">
                        <span>PROCESS</span>
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                      </div>
                      <div className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>⚡</span> Heuristic Rule
                      </div>
                      <p className="text-xs text-slate-400">Zero-cost filter</p>
                    </div>

                    {/* Node 3 */}
                    <div
                      onClick={() => setSelectedNode("deepseek-3")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedNode === "deepseek-3"
                          ? "bg-pink-950/40 border-pink-400 shadow-lg shadow-pink-500/10 scale-102"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-pink-400 mb-1">
                        <span>REASONING</span>
                        <span className="w-2 h-2 rounded-full bg-pink-400" />
                      </div>
                      <div className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>🤖</span> DeepSeek R1
                      </div>
                      <p className="text-xs text-slate-400">CoT Verification</p>
                    </div>

                    {/* Node 4 */}
                    <div
                      onClick={() => setSelectedNode("d1-4")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedNode === "d1-4"
                          ? "bg-emerald-950/40 border-emerald-400 shadow-lg shadow-emerald-500/10 scale-102"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1">
                        <span>MUTATION</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>💾</span> Edge D1 SQLite
                      </div>
                      <p className="text-xs text-slate-400">Atomic upsert</p>
                    </div>

                  </div>

                  {/* Selected Node Spec Inspector Box */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs">
                    <div className="flex items-center justify-between mb-2 text-slate-400">
                      <span>Node Inspector: <strong className="text-white">{selectedNode}</strong></span>
                      <span className="text-emerald-400">Status: Idle / Ready</span>
                    </div>
                    <pre className="text-slate-300 text-[11px] leading-relaxed overflow-x-auto">
{selectedNode === "webhook-1" && `// Webhook Trigger Endpoint
{
  "path": "/api/v1/event",
  "method": "POST",
  "auth": "HMAC-SHA256",
  "response": { "status": 202, "message": "Dispatched to DAG" }
}`}
{selectedNode === "heuristic-2" && `// Zero-Cost Heuristic Rule
{
  "condition": "payload.tier === 'enterprise' && payload.verified === true",
  "action": "route_to_reasoner",
  "fallback": "route_to_standard",
  "token_cost": "$0.00"
}`}
{selectedNode === "deepseek-3" && `// DeepSeek Reasoner Node Configuration
{
  "model": "deepseek-reasoner",
  "temperature": 0.2,
  "max_tokens": 4096,
  "system": "Analyze payload anomalies and verify transaction legitimacy."
}`}
{selectedNode === "d1-4" && `// Cloudflare D1 Mutation
{
  "query": "INSERT INTO audit_ledger (id, user_id, status) VALUES (?, ?, ?)",
  "bindings": ["tx_891b2c", "usr_10", "verified"],
  "latency_ms": 14
}`}
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: AI COPILOT DRAWER */}
              {activeTab === "copilot" && (
                <motion.div
                  key="copilot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Prompt-to-Flow AI Assistant</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Synthesizes complete visual DAG architectures from natural English descriptions without requiring custom manual wiring.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
                      <span className="text-purple-400 font-bold">User:</span> "Build an autonomous market research workflow using Firecrawl and Claude 3.5 that publishes summaries to Slack."
                    </div>

                    <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs font-mono text-slate-300 space-y-2">
                      <div className="text-blue-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Copilot Synthesized 4 Connected Nodes:
                      </div>
                      <div className="text-[11px] text-slate-400 pl-4 space-y-1">
                        <div>1. Schedule Trigger: Every Monday 08:00 UTC</div>
                        <div>2. Firecrawl Scrape Node: Ingest target market sites</div>
                        <div>3. Claude 3.5 Sonnet: Fact extraction and synthesis</div>
                        <div>4. Slack Notifier: Post executive briefing to #leadership</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: EXECUTION TRACE & BENCHMARKS */}
              {activeTab === "trace" && (
                <motion.div
                  key="trace"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-xs font-mono text-slate-400 flex items-center justify-between border-b border-slate-800 pb-2">
                    <span>EXECUTION WATERFALL TIMELINE</span>
                    <span className="text-emerald-400">Total Run Time: 57.6ms</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                        <span>1. Webhook Handshake</span>
                        <span className="text-blue-400">3.8ms</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-500 w-[12%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                        <span>2. Zod Schema Verification</span>
                        <span className="text-purple-400">1.2ms</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-purple-500 w-[6%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                        <span>3. Zero-Cost Heuristic Routing</span>
                        <span className="text-indigo-400">0.4ms</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[3%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                        <span>4. DeepSeek R1 Inference</span>
                        <span className="text-pink-400">38.0ms</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-pink-500 w-[68%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                        <span>5. Cloudflare D1 Ledger Upsert</span>
                        <span className="text-emerald-400">14.2ms</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[24%]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: UNIVERSAL N8N ADAPTER */}
              {activeTab === "n8n" && (
                <motion.div
                  key="n8n"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-mono text-orange-400 font-bold mb-2">
                        n8n Source JSON Export:
                      </div>
                      <pre className="text-[11px] font-mono text-slate-400 leading-relaxed overflow-x-auto">
{`{
  "nodes": [
    { "name": "Webhook", "type": "n8n-nodes-base.webhook" },
    { "name": "Slack", "type": "n8n-nodes-base.slack" }
  ],
  "connections": { ... }
}`}
                      </pre>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/40">
                      <div className="text-xs font-mono text-blue-400 font-bold mb-2">
                        Shadow Flow Translated Topology:
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                        <li className="flex items-center gap-1.5 text-emerald-400">
                          ✓ Kahn topological sort applied
                        </li>
                        <li className="flex items-center gap-1.5 text-emerald-400">
                          ✓ Credentials mapped to local vault
                        </li>
                        <li className="flex items-center gap-1.5 text-emerald-400">
                          ✓ 100% Apache 2.0 commercial freedom
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Action Footer */}
          <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Ready to build and test your own directed acyclic graph?
            </span>
            <Button asChild size="sm" className="gap-2 font-semibold">
              <Link to="/demo">
                Launch Live Playground <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

        </div>

      </div>
    </section>
  );
}
