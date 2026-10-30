import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Terminal,
  Clock,
  ArrowRight,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface WorkflowStage {
  id: string;
  stepNumber: string;
  category: "TRIGGER" | "PROCESS" | "DECISION" | "ACTION" | "RESULT";
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  latency: string;
  runtime: string;
  explanation: string;
  verifiedCapability: string;
  samplePayload: Record<string, unknown>;
  outputSummary: string;
}

const PRESET_SCENARIOS = [
  {
    id: "lead-enrichment",
    title: "B2B Lead Enrichment & Resend Pipeline",
    description: "Inbound webhook intake, domain verification, DeepSeek reasoning, and transactional routing.",
    stages: [
      {
        id: "s1",
        stepNumber: "01",
        category: "TRIGGER" as const,
        name: "Webhook Intake",
        subtitle: "POST /api/v1/lead",
        icon: "🔗",
        color: "#38bdf8",
        latency: "4ms",
        runtime: "Cloudflare Edge",
        explanation: "Accepts JSON payloads with client HMAC verification. Responds with immediate 202 Accepted to keep client latency low.",
        verifiedCapability: "Webhook Trigger with HMAC & Bearer Authentication",
        samplePayload: {
          event: "form.submission",
          email: "alex@orbitcloud.io",
          domain: "orbitcloud.io",
          source: "enterprise_pricing",
          timestamp: "2026-10-30T10:15:00Z",
        },
        outputSummary: "Validated payload dispatched into execution context.",
      },
      {
        id: "s2",
        stepNumber: "02",
        category: "PROCESS" as const,
        name: "Zod Schema Parser",
        subtitle: "Type Verification",
        icon: "🛡️",
        color: "#a855f7",
        latency: "1.2ms",
        runtime: "WebAssembly Core",
        explanation: "Runs compile-time TypeScript validation. Sanitizes email formats and verifies corporate domain syntax before invoking external APIs.",
        verifiedCapability: "Zod & JSON-Schema Node Guardrails",
        samplePayload: {
          domainValid: true,
          sanitizedEmail: "alex@orbitcloud.io",
          domainTier: "custom_domain",
          fieldsExtracted: 5,
        },
        outputSummary: "Input conforms strictly to typed lead contract.",
      },
      {
        id: "s3",
        stepNumber: "03",
        category: "DECISION" as const,
        name: "Zero-Cost Heuristic",
        subtitle: "Rule Evaluation",
        icon: "⚡",
        color: "#818cf8",
        latency: "0.4ms",
        runtime: "Offline Engine",
        explanation: "Evaluates multi-branch conditions locally without incurring LLM token costs or external API rate limits.",
        verifiedCapability: "Client-Side Zero-Cost Heuristic Engine",
        samplePayload: {
          condition: "is_corporate_lead == true",
          route: "priority_pipeline_alpha",
          tokenCost: "$0.000",
          cachedHit: true,
        },
        outputSummary: "Branch routed to Priority Enterprise Processing.",
      },
      {
        id: "s4",
        stepNumber: "04",
        category: "ACTION" as const,
        name: "DeepSeek R1 Reasoner",
        subtitle: "Model Context Protocol",
        icon: "🤖",
        color: "#ec4899",
        latency: "42ms",
        runtime: "Local Ollama / Edge AI",
        explanation: "Analyzes company signals, queries external firmographics via MCP tools, and synthesizes personalized outreach copy with strict guardrails.",
        verifiedCapability: "Anthropic MCP Tool Calling & Local Gemma/Llama",
        samplePayload: {
          model: "deepseek-reasoner",
          mcpToolsInvoked: ["clay_firmographics", "crm_lookup"],
          confidenceScore: 0.985,
          summary: "Mid-market SaaS with 180 engineers looking to migrate from n8n.",
        },
        outputSummary: "Extracted company context and synthesized custom executive memo.",
      },
      {
        id: "s5",
        stepNumber: "05",
        category: "RESULT" as const,
        name: "D1 Settlement & Resend",
        subtitle: "Atomic Persistence",
        icon: "🚀",
        color: "#10b981",
        latency: "16ms",
        runtime: "Cloudflare D1 SQLite",
        explanation: "Atomically records the lead to SQLite D1 ledger and dispatches structured transactional email through Resend API.",
        verifiedCapability: "Cloudflare D1 SQLite & Native Resend Dispatch",
        samplePayload: {
          d1RecordId: "lead_91b72a4f",
          emailDispatched: true,
          resendId: "re_8fZSADE5eNgx",
          totalPipelineTime: "63.6ms",
        },
        outputSummary: "Data stored in ledger and team notified in under 70 milliseconds.",
      },
    ],
  },
  {
    id: "deepseek-audit",
    title: "DeepSeek Reasoner Forensic Audit",
    description: "Automated anomaly detection across transaction streams with multi-step chain-of-thought verification.",
    stages: [
      {
        id: "d1",
        stepNumber: "01",
        category: "TRIGGER" as const,
        name: "Batch Ledger Feed",
        subtitle: "Cron Ingestion",
        icon: "⏱",
        color: "#38bdf8",
        latency: "6ms",
        runtime: "Workers Cron Trigger",
        explanation: "Polls reconciliation streams on an automated schedule (e.g. every 15 minutes) or ingests batch webhooks.",
        verifiedCapability: "Cron Scheduler & Multi-Tenant Trigger Node",
        samplePayload: { batchSize: 500, stream: "stripe_payouts", currency: "USD" },
        outputSummary: "500 records batched into memory.",
      },
      {
        id: "d2",
        stepNumber: "02",
        category: "PROCESS" as const,
        name: "Diff & Normalization",
        subtitle: "Array Operations",
        icon: "🔄",
        color: "#a855f7",
        latency: "3ms",
        runtime: "WASM Runner",
        explanation: "Calculates delta variations against historical moving averages to isolate threshold anomalies.",
        verifiedCapability: "Array Transformer & JavaScript Code Node",
        samplePayload: { flaggedAnomalies: 2, deltaVariancePercent: 4.8 },
        outputSummary: "2 transactions flagged for semantic review.",
      },
      {
        id: "d3",
        stepNumber: "03",
        category: "DECISION" as const,
        name: "Risk Scoring Filter",
        subtitle: "Conditional Gate",
        icon: "⚖️",
        color: "#818cf8",
        latency: "0.2ms",
        runtime: "Local Rules",
        explanation: "Routes low-risk entries directly to ledger settlement while escalating anomalies to reasoning models.",
        verifiedCapability: "If / Else Filter & Switch Nodes",
        samplePayload: { requiresCoT: true, threshold: "> $5,000 variance" },
        outputSummary: "High-value variance sent to DeepSeek Reasoner.",
      },
      {
        id: "d4",
        stepNumber: "04",
        category: "ACTION" as const,
        name: "DeepSeek R1 Chain-of-Thought",
        subtitle: "Forensic Analysis",
        icon: "🤖",
        color: "#ec4899",
        latency: "84ms",
        runtime: "Local Ollama GGUF",
        explanation: "Evaluates invoice terms against transaction logs to verify whether discrepancies represent legitimate billing adjustments.",
        verifiedCapability: "Zero-telemetry local Ollama inference",
        samplePayload: { model: "deepseek-r1-7b", verifiedValid: true, memo: "Variance matched annual discount tier." },
        outputSummary: "CoT verification completed with zero cloud API billing.",
      },
      {
        id: "d5",
        stepNumber: "05",
        category: "RESULT" as const,
        name: "Ledger Reconciliation",
        subtitle: "Audit Settlement",
        icon: "💾",
        color: "#10b981",
        latency: "12ms",
        runtime: "D1 Database",
        explanation: "Upserts audit trail with cryptographic proof and unblocks queued disbursement in Stripe.",
        verifiedCapability: "Encrypted D1 persistence and audit logging",
        samplePayload: { status: "settled", reconciliationPassed: true, elapsedMs: 105.2 },
        outputSummary: "Reconciliation verified and ledger sealed.",
      },
    ],
  },
  {
    id: "n8n-importer",
    title: "Universal n8n Importer & Auto-Layout",
    description: "Import n8n JSON exports directly into Shadow Flow with Kahn's topological auto-layout.",
    stages: [
      {
        id: "n1",
        stepNumber: "01",
        category: "TRIGGER" as const,
        name: "n8n JSON Upload",
        subtitle: "Drag & Drop",
        icon: "📂",
        color: "#38bdf8",
        latency: "2ms",
        runtime: "Client Browser",
        explanation: "Accepts any raw n8n workflow export JSON directly in the browser with zero server roundtrips.",
        verifiedCapability: "Universal n8n Adapter (n8nAdapter.ts)",
        samplePayload: { source: "n8n_v1.72", nodeCount: 14, edgeCount: 16 },
        outputSummary: "Workflow definition ingested for parsing.",
      },
      {
        id: "n2",
        stepNumber: "02",
        category: "PROCESS" as const,
        name: "Node Type Translator",
        subtitle: "Schema Mapping",
        icon: "🔄",
        color: "#a855f7",
        latency: "1.5ms",
        runtime: "WASM Parser",
        explanation: "Maps n8n core and community nodes to native Shadow Flow canvas primitives with compatible parameter bindings.",
        verifiedCapability: "Bidirectional Node Compatibility Engine",
        samplePayload: { mappedNodes: 14, unmapped: 0, credentialsMapped: ["slack", "postgres"] },
        outputSummary: "All 14 node bindings translated flawlessly.",
      },
      {
        id: "n3",
        stepNumber: "03",
        category: "DECISION" as const,
        name: "Topological Sort",
        subtitle: "Kahn's Algorithm",
        icon: "📐",
        color: "#818cf8",
        latency: "0.8ms",
        runtime: "Pure Graph Engine",
        explanation: "Computes directed acyclic dependencies, removes circular traps, and identifies parallel execution tiers.",
        verifiedCapability: "Kahn's Topological DAG Layout Engine",
        samplePayload: { tiers: 4, rootTriggers: 1, leafActions: 3 },
        outputSummary: "Dependencies resolved into optimal execution tiers.",
      },
      {
        id: "n4",
        stepNumber: "04",
        category: "ACTION" as const,
        name: "Auto-Grid Layout",
        subtitle: "320px x 150px Grid",
        icon: "✨",
        color: "#ec4899",
        latency: "2.1ms",
        runtime: "React Flow Layout",
        explanation: "Recalculates clean node spacing, resolves edge crossings, and generates ergonomic curved bezier handles.",
        verifiedCapability: "Automatic Ergonomic Node Positioning",
        samplePayload: { canvasWidth: 1400, canvasHeight: 680, edgeCrossingsEliminated: 6 },
        outputSummary: "Clean, visual layout generated on canvas.",
      },
      {
        id: "n5",
        stepNumber: "05",
        category: "RESULT" as const,
        name: "Interactive Execution",
        subtitle: "100% Apache 2.0",
        icon: "🚀",
        color: "#10b981",
        latency: "0ms",
        runtime: "Self-Hosted / Cloud",
        explanation: "Workflow is ready to run with zero licensing restrictions, telemetry requirements, or forced commercial upgrades.",
        verifiedCapability: "100% Permissive Apache License 2.0",
        samplePayload: { status: "ready_to_run", license: "Apache-2.0", commercialFreedom: true },
        outputSummary: "Ready for live execution with total licensing freedom.",
      },
    ],
  },
];

export function InteractiveWorkflowStudio() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const scenario = PRESET_SCENARIOS[selectedScenarioIndex];

  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeStage = scenario.stages[activeStageIndex];

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Play / Auto-run simulation
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setActiveStageIndex((prev) => (prev + 1) % scenario.stages.length);
      }, 2000);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, scenario.stages.length]);

  const handleStep = () => {
    setIsPlaying(false);
    setActiveStageIndex((prev) => (prev + 1) % scenario.stages.length);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStageIndex(0);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-background" id="interactive-demo">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-electric/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            Signature Interactive Studio
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Experience Workflow Execution in Real-Time
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Click any node below to inspect live inputs and outputs, or press <strong className="text-foreground">Run Simulation</strong> to follow signals across the pipeline.
          </p>

          {/* Scenario Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {PRESET_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioIndex(idx);
                  setActiveStageIndex(0);
                  setIsPlaying(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  selectedScenarioIndex === idx
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/80"
                }`}
              >
                {sc.title}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Window Card */}
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          
          {/* Top Window Bar */}
          <div className="px-6 py-4 border-b border-border/80 bg-muted/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                shadowflow://runtime/simulator • {scenario.title}
              </span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <Button
                size="sm"
                variant={isPlaying ? "destructive" : "default"}
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-1.5 text-xs font-semibold h-8"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? "Pause" : "Run Simulation"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleStep}
                className="gap-1.5 text-xs h-8"
                title="Advance to next step"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Step
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleReset}
                className="h-8 w-8 p-0"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Interactive DAG Track (Horizontal Nodes + Curved Signals) */}
          <div className="p-6 lg:p-8 border-b border-border/60 bg-background/50 relative overflow-x-auto">
            
            {/* SVG Connecting Splines */}
            <div className="min-w-[720px] relative">
              <div className="grid grid-cols-5 gap-4 relative z-10">
                {scenario.stages.map((stage, idx) => {
                  const isCurrent = idx === activeStageIndex;
                  const isPast = idx < activeStageIndex;

                  return (
                    <motion.div
                      key={stage.id}
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveStageIndex(idx);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer rounded-2xl p-4 transition-all relative select-none border ${
                        isCurrent
                          ? "bg-primary/15 border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/30"
                          : isPast
                          ? "bg-emerald-500/5 border-emerald-500/40 hover:border-emerald-500/70"
                          : "bg-card/40 border-border/80 hover:border-border hover:bg-card/80"
                      }`}
                    >
                      {/* Step Indicator Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold tracking-wider text-muted-foreground">
                          {stage.stepNumber}. {stage.category}
                        </span>
                        {isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                        ) : isPast ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-border" />
                        )}
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl shrink-0">{stage.icon}</span>
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {stage.name}
                        </h4>
                      </div>

                      <p className="text-xs text-muted-foreground truncate mb-3">
                        {stage.subtitle}
                      </p>

                      {/* Performance Metric Pill */}
                      <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-border/40 text-muted-foreground">
                        <span>Latency</span>
                        <span className={isCurrent ? "text-primary font-bold" : "text-foreground"}>
                          {stage.latency}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Status Banner */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted-foreground px-2">
                <div className="flex items-center gap-2">
                  <span>Execution Status:</span>
                  <Badge variant="outline" className="font-semibold bg-background">
                    {isPlaying ? "SIMULATING ACTIVE TRANSIT" : `ACTIVE NODE: ${activeStage.category}`}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span>
                    Current Latency: <strong className="text-emerald-400">{activeStage.latency}</strong>
                  </span>
                  <span>
                    Target Environment: <strong className="text-foreground">{activeStage.runtime}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Node Inspection & Live Context Payload Breakdown */}
          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-card/40">
            
            {/* Left Column: Stage Explanation & Genuine Product Capability */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold mb-1">
                  <span>STAGE {activeStage.stepNumber} DETAILED SPECIFICATION</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-3">
                  <span>{activeStage.icon}</span>
                  {activeStage.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeStage.explanation}
                </p>
              </div>

              {/* Verified Product Feature Badge */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    Genuine Shadow Flow Capability
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeStage.verifiedCapability}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="sm" className="gap-2 text-xs font-semibold">
                  <Link to="/demo">
                    Open Live Canvas Demo <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link to="/features">
                    Inspect Architecture Docs
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Live Context Payload (JSON Terminal) */}
            <div className="flex flex-col rounded-xl border border-border/80 bg-slate-950 overflow-hidden shadow-inner">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span>runtime.context.payload.json</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-slate-950 font-mono text-emerald-400 border-emerald-500/30">
                  200 OK
                </Badge>
              </div>

              <div className="p-4 flex-1 overflow-x-auto">
                <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                  {JSON.stringify(activeStage.samplePayload, null, 2)}
                </pre>
              </div>

              <div className="px-4 py-2.5 bg-slate-900/60 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>Result: {activeStage.outputSummary}</span>
                <span className="text-emerald-400 font-bold">Verified</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
