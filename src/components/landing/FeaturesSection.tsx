import { motion } from "framer-motion";
import {
  Workflow,
  Bot,
  Code2,
  Puzzle,
  Shield,
  Zap,
  GitBranch,
  Cloud,
} from "lucide-react";

const features = [
  {
    icon: Workflow,
    title: "Visual Workflow Builder",
    description:
      "Drag-and-drop interface to create complex automations without code. Connect nodes, set conditions, and watch data flow.",
    gradient: "from-electric to-primary",
  },
  {
    icon: Bot,
    title: "AI-Powered Automation",
    description:
      "Describe what you want in plain English. Our AI assistant builds workflows, suggests optimizations, and fixes errors.",
    gradient: "from-neon to-accent",
  },
  {
    icon: Code2,
    title: "Code When You Need It",
    description:
      "Full JavaScript/TypeScript support for custom logic. Use built-in code nodes or import your own functions.",
    gradient: "from-cyber to-success",
  },
  {
    icon: Puzzle,
    title: "500+ Integrations",
    description:
      "Connect to Slack, GitHub, Notion, Google Sheets, databases, and hundreds more. Build custom connectors easily.",
    gradient: "from-warning to-destructive",
  },
  {
    icon: Shield,
    title: "Self-Host or Cloud",
    description:
      "Deploy on your own infrastructure for full control, or use our managed cloud. Your data, your choice.",
    gradient: "from-electric to-neon",
  },
  {
    icon: Zap,
    title: "Real-time Execution",
    description:
      "Watch your workflows execute in real-time. Debug with step-by-step data inspection and instant error alerts.",
    gradient: "from-neon to-cyber",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description:
      "Git-native workflows. Branch, merge, and rollback changes. Collaborate with your team seamlessly.",
    gradient: "from-cyber to-electric",
  },
  {
    icon: Cloud,
    title: "Scalable Infrastructure",
    description:
      "From hobby projects to enterprise scale. Auto-scaling, load balancing, and high availability built-in.",
    gradient: "from-accent to-neon",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-electric uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Everything You Need to{" "}
            <span className="gradient-text">Automate</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for developers and business users alike.
            Build, test, and deploy workflows in minutes.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-electric/50 transition-all duration-300 hover-lift"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-electric/5 to-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
