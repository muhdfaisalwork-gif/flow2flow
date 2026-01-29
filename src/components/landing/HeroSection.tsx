import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Github, Play, Sparkles, Zap, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowAnimation } from "./WorkflowAnimation";

const stats = [
  { value: "10K+", label: "Workflows Created" },
  { value: "500+", label: "Integrations" },
  { value: "99.9%", label: "Uptime" },
  { value: "Open", label: "Source" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Open Source Badge */}
            <motion.a
              href="https://github.com/muhdfaisalwork-gif/flow2flow"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4 text-electric" />
              <span className="text-sm font-medium">Open Source</span>
              <span className="px-2 py-0.5 rounded-full bg-electric/20 text-electric text-xs font-bold">
                ⭐ Star
              </span>
            </motion.a>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Automate{" "}
              <span className="gradient-text">Everything</span>
              <br />
              Build{" "}
              <span className="gradient-text">Anything</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              The open-source workflow automation platform that combines visual building, 
              AI assistance, and code flexibility. Self-host or use our cloud — your choice.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="gradient-primary text-white border-0 glow-primary gap-2 text-base px-8"
                >
                  <Zap className="w-5 h-5" />
                  Start Building Free
                </Button>
              </Link>
              <Link to="/workflow/new">
                <Button variant="outline" size="lg" className="gap-2 text-base">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* GitHub Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-4 justify-center lg:justify-start"
            >
              <a
                href="https://github.com/muhdfaisalwork-gif/flow2flow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>Star us on GitHub</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Content - Workflow Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative p-8 rounded-2xl glass gradient-border">
              <WorkflowAnimation />
              
              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full gradient-primary text-white text-xs font-medium shadow-lg"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI-Powered
                </span>
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium shadow-lg"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <span className="flex items-center gap-1">
                  <Code2 className="w-3 h-3" /> Open Source
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
