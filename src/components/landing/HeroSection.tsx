import { useState, useRef, MouseEvent } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Github,
  Play,
  Sparkles,
  Zap,
  Monitor,
  Terminal,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroWorkflowCanvas } from "./HeroWorkflowCanvas";
import { DemoVideoModal } from "./DemoVideoModal";

const heroMetrics = [
  { value: "< 18ms", label: "Core Execution Latency", detail: "Compiled WASM engine" },
  { value: "100%", label: "Apache 2.0 Freedom", detail: "Zero commercial locks" },
  { value: "500+", label: "Ecosystem Integrations", detail: "Native MCP & REST" },
  { value: "$0.00", label: "Zero-Cost Heuristic", detail: "Offline graph healing" },
];

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  // Words for staggered headline reveal
  const headlineWords = [
    { text: "Autonomous", highlight: false },
    { text: "AI", highlight: true },
    { text: "Workflows,", highlight: true },
    { text: "Deterministic", highlight: false },
    { text: "Execution.", highlight: false },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden bg-background"
    >
      {/* Background Lighting & Grid Effects */}
      <div className="absolute inset-0 bg-grid opacity-35 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl"
      >
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Staggered Headline & Direct CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            
            {/* Top Badge: Open Source Apache 2.0 */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-primary/30 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-foreground">
                Apache 2.0 Open Source Platform
              </span>
              <a
                href="https://github.com/muhdfaisalwork-gif/shadowflow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline ml-1"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Star</span>
              </a>
            </motion.div>

            {/* Staggered Word Reveal Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              {headlineWords.map((item, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 + index * 0.08,
                    ease: "easeOut",
                  }}
                  className={`inline-block mr-2.5 ${
                    item.highlight ? "gradient-text" : "text-foreground"
                  }`}
                >
                  {item.text}
                </motion.span>
              ))}
            </h1>

            {/* Description conforming to strict plain-English rules */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Shadow Flow is a visual DAG workflow engine with zero cloud vendor lock-in. Wire DeepSeek reasoning models, Model Context Protocol servers, and transactional webhooks with sub-20ms edge latency.
            </motion.p>

            {/* Primary Action Buttons with Magnetic Feel */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2"
            >
              <Button
                asChild
                size="lg"
                className="gradient-primary text-white font-semibold text-sm px-6 h-12 gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <Link to="/demo">
                  <Zap className="w-4 h-4" />
                  Try Interactive Canvas
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setVideoOpen(true)}
                className="h-12 px-5 text-sm font-semibold gap-2 border-border/80 hover:bg-muted/60 transition-colors"
              >
                <Play className="w-4 h-4 text-primary" />
                Watch Architecture Demo
              </Button>
            </motion.div>

            {/* Trust Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-muted-foreground pt-3 font-mono"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                No registration required to demo
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Self-hostable via Docker
              </span>
            </motion.div>

          </div>

          {/* Right Column: High-DPI Interactive Living Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative">
              {/* Decorative Glow Ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-electric/30 via-neon/20 to-cyber/30 blur-xl opacity-60 pointer-events-none" />
              
              {/* Canvas Wrapper */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-card/80 border border-border">
                <HeroWorkflowCanvas />
              </div>

              {/* Floating Verified Badge */}
              <div className="absolute -bottom-3 -left-3 px-3.5 py-1.5 rounded-xl bg-card border border-border shadow-xl flex items-center gap-2 text-xs font-mono text-foreground backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Deterministic Edge Execution</span>
              </div>

              <div className="absolute -top-3 -right-3 px-3.5 py-1.5 rounded-xl bg-card border border-border shadow-xl flex items-center gap-2 text-xs font-mono text-primary backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Model Context Protocol (MCP)</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Hero Performance Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-16 pt-8 border-t border-border/60 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {heroMetrics.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                {item.value}
              </div>
              <div className="text-xs font-semibold text-foreground">
                {item.label}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {item.detail}
              </div>
            </div>
          ))}
        </motion.div>

      </motion.div>

      <DemoVideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </section>
  );
}
