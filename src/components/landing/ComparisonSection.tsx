import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Minus, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const competitors = [
  { name: "Shadow Flow", highlight: true, license: "Apache 2.0 Open Source" },
  { name: "n8n", highlight: false, license: "Fair-Code / Sustainable" },
  { name: "Make", highlight: false, license: "Proprietary SaaS" },
  { name: "Zapier", highlight: false, license: "Proprietary SaaS" },
];

const comparisonData = [
  {
    feature: "Permissive Open Source License",
    detail: "Freedom to commercially embed and self-host without fees",
    shadowflow: true,
    n8n: "partial",
    make: false,
    zapier: false,
  },
  {
    feature: "Universal n8n Workflow Importer",
    detail: "Import JSON definitions with Kahn topological layout",
    shadowflow: true,
    n8n: true,
    make: false,
    zapier: false,
  },
  {
    feature: "Model Context Protocol (MCP) Support",
    detail: "Direct connection to Anthropic MCP servers and tools",
    shadowflow: true,
    n8n: "partial",
    make: false,
    zapier: false,
  },
  {
    feature: "Offline Zero-Cost Heuristic Engine",
    detail: "Auto-heals broken parameters without recursive LLM costs",
    shadowflow: true,
    n8n: false,
    make: false,
    zapier: false,
  },
  {
    feature: "Local Ollama & Open Models",
    detail: "Private inference on local GPU clusters with zero cloud API spend",
    shadowflow: true,
    n8n: "partial",
    make: false,
    zapier: false,
  },
  {
    feature: "Client-Side Zero-Telemetry Sandbox",
    detail: "Workflows execute privately without reporting payload metadata",
    shadowflow: true,
    n8n: false,
    make: false,
    zapier: false,
  },
  {
    feature: "Sub-20ms Core Execution Latency",
    detail: "WebAssembly execution runner with instant state hydration",
    shadowflow: true,
    n8n: false,
    make: false,
    zapier: false,
  },
  {
    feature: "TypeScript & JavaScript Code Nodes",
    detail: "Inline code nodes with npm and Web Fetch support",
    shadowflow: true,
    n8n: true,
    make: "partial",
    zapier: "partial",
  },
];

const renderStatusIcon = (status: boolean | string) => {
  if (status === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
        <Check className="w-4 h-4" />
      </span>
    );
  }
  if (status === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/15 text-red-400">
        <X className="w-4 h-4" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 font-mono text-xs">
      <Minus className="w-3.5 h-3.5" />
    </span>
  );
};

export function ComparisonSection() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <section id="compare" className="py-24 relative bg-card/40 border-y border-border/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Architectural Benchmark
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Comparing Shadow Flow to Legacy Systems
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            See how Shadow Flow's Apache 2.0 open-source engine, Model Context Protocol integration, and zero-cost heuristic repair stack up against closed platforms.
          </p>
        </div>

        {/* Comparison Matrix Table */}
        <div className="rounded-2xl border border-border/80 bg-background/80 backdrop-blur shadow-2xl overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40">
                <th className="py-5 px-6 font-bold text-sm text-foreground w-2/5">
                  Capability & Architectural Standard
                </th>
                {competitors.map((comp) => (
                  <th
                    key={comp.name}
                    className={`py-5 px-4 font-bold text-center ${
                      comp.highlight
                        ? "bg-primary/10 border-x border-primary/30 text-primary"
                        : "text-muted-foreground text-xs font-mono"
                    }`}
                  >
                    <div className="text-sm font-extrabold text-foreground">{comp.name}</div>
                    <div className="text-[11px] font-normal text-muted-foreground mt-0.5 font-mono">
                      {comp.license}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr
                  key={row.feature}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`border-b border-border/40 transition-colors ${
                    hoveredRow === idx ? "bg-muted/30" : ""
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="font-semibold text-sm text-foreground">{row.feature}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{row.detail}</div>
                  </td>

                  {/* Shadow Flow Highlighted Column */}
                  <td className="py-4 px-4 text-center bg-primary/5 border-x border-primary/20">
                    <div className="flex justify-center">{renderStatusIcon(row.shadowflow)}</div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">{renderStatusIcon(row.n8n)}</div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">{renderStatusIcon(row.make)}</div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">{renderStatusIcon(row.zapier)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted-foreground px-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Native Support
            </span>
            <span className="flex items-center gap-1.5">
              <Minus className="w-3.5 h-3.5 text-amber-400" /> Partial / Add-on Only
            </span>
            <span className="flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-red-400" /> Unsupported
            </span>
          </div>
          <span>100% Apache 2.0 freedom guarantees no commercial lock-out.</span>
        </div>

      </div>
    </section>
  );
}
