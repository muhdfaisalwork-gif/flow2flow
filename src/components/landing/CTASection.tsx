import { motion } from "framer-motion";
import { ArrowRight, Zap, Github, Sparkles, Monitor, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-electric/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Converging Circuit Graphic (SVG) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <svg className="w-full max-w-4xl h-64" viewBox="0 0 800 240" fill="none">
          {/* Left Converging Channels */}
          <motion.path
            d="M 50 40 C 200 40, 250 120, 400 120"
            stroke="url(#ctaGrad1)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M 50 120 C 200 120, 250 120, 400 120"
            stroke="url(#ctaGrad1)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <motion.path
            d="M 50 200 C 200 200, 250 120, 400 120"
            stroke="url(#ctaGrad1)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />

          {/* Right Converging Channels */}
          <motion.path
            d="M 750 40 C 600 40, 550 120, 400 120"
            stroke="url(#ctaGrad2)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M 750 120 C 600 120, 550 120, 400 120"
            stroke="url(#ctaGrad2)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <motion.path
            d="M 750 200 C 600 200, 550 120, 400 120"
            stroke="url(#ctaGrad2)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />

          {/* Center Sealed Circuit Hub */}
          <circle cx="400" cy="120" r="16" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
          <circle cx="400" cy="120" r="6" fill="hsl(var(--primary))" />

          <defs>
            <linearGradient id="ctaGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="ctaGrad2" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-foreground font-mono">
              Apache License 2.0 • 100% Free & Self-Hostable
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Unify Your Disconnected Operations Into{" "}
            <span className="gradient-text">One Autonomous Pipeline</span>
          </h2>

          {/* Description adhering to strict humanizer guidelines */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Build and test multi-step AI agents and API automations with zero setup. Run client-side in your browser or deploy privately on your own servers.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="gradient-primary text-white font-semibold text-base px-8 h-12 gap-2 shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Link to="/signup">
                <Zap className="w-5 h-5" />
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base font-semibold border-border/80 hover:bg-muted/60 transition-colors"
            >
              <Link to="/demo">
                <Monitor className="w-5 h-5 text-primary mr-1" />
                Launch Live Canvas
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 px-5 text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <a
                href="https://github.com/muhdfaisalwork-gif/shadowflow"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5 mr-2" />
                Star on GitHub
              </a>
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-8 border-t border-border/60 flex flex-wrap justify-center gap-6 sm:gap-10 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Permissive Apache 2.0
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero telemetry tracking
            </span>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
