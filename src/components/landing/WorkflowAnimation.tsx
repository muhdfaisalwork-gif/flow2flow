import { motion } from "framer-motion";

const nodes = [
  { id: 1, x: 60, y: 80, label: "Webhook", icon: "🔗", color: "from-electric to-primary" },
  { id: 2, x: 200, y: 40, label: "AI Process", icon: "🤖", color: "from-neon to-accent" },
  { id: 3, x: 200, y: 120, label: "Database", icon: "💾", color: "from-cyber to-success" },
  { id: 4, x: 340, y: 80, label: "Send Email", icon: "📧", color: "from-warning to-destructive" },
];

const connections = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
];

export function WorkflowAnimation() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3]">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
        {/* Grid Background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border opacity-50"
            />
          </pattern>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--electric))" />
            <stop offset="100%" stopColor="hsl(var(--neon))" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connection Lines */}
        {connections.map((conn, i) => {
          const from = nodes.find((n) => n.id === conn.from)!;
          const to = nodes.find((n) => n.id === conn.to)!;
          const midX = (from.x + to.x) / 2;
          
          return (
            <motion.path
              key={i}
              d={`M ${from.x + 40} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray="8 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Animated Data Dots */}
        {connections.map((conn, i) => {
          const from = nodes.find((n) => n.id === conn.from)!;
          const to = nodes.find((n) => n.id === conn.to)!;
          const midX = (from.x + to.x) / 2;
          
          return (
            <motion.circle
              key={`dot-${i}`}
              r="4"
              fill="hsl(var(--electric))"
              filter="url(#glow)"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                offsetDistance: ["0%", "100%"],
              }}
              transition={{
                duration: 2,
                delay: 1 + i * 0.3,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              style={{
                offsetPath: `path('M ${from.x + 40} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}')`,
              }}
            />
          );
        })}

        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          className="absolute w-20 h-16 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(node.x / 400) * 100}%`,
            top: `${(node.y / 200) * 100}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1 * i,
          }}
        >
          <motion.div
            className="w-full h-full rounded-xl bg-card border border-border shadow-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover-lift"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">{node.icon}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{node.label}</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
