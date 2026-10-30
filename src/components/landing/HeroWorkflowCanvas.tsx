import { useEffect, useRef, useState } from "react";

interface NodePoint {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  label: string;
  category: "trigger" | "process" | "ai" | "action" | "output";
  color: string;
  icon: string;
  pulsePhase: number;
  active: boolean;
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  speed: number;
  color: string;
}

export function HeroWorkflowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);

    const rect = canvas.getBoundingClientRect();
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mouseX = e.clientX - b.left;
      mouseY = e.clientY - b.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      setHoveredNode(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const rawNodes = [
      { id: 0, xRatio: 0.12, yRatio: 0.22, label: "Webhook", category: "trigger", color: "#38bdf8", icon: "🔗" },
      { id: 1, xRatio: 0.14, yRatio: 0.72, label: "Schedule (Cron)", category: "trigger", color: "#38bdf8", icon: "⏱" },
      { id: 2, xRatio: 0.32, yRatio: 0.35, label: "Zod Validator", category: "process", color: "#a855f7", icon: "🛡" },
      { id: 3, xRatio: 0.34, yRatio: 0.65, label: "Heuristic Engine", category: "process", color: "#818cf8", icon: "⚡" },
      { id: 4, xRatio: 0.55, yRatio: 0.25, label: "DeepSeek R1", category: "ai", color: "#ec4899", icon: "🤖" },
      { id: 5, xRatio: 0.58, yRatio: 0.52, label: "Local Ollama", category: "ai", color: "#06b6d4", icon: "💻" },
      { id: 6, xRatio: 0.56, yRatio: 0.82, label: "Model Context Protocol", category: "action", color: "#3b82f6", icon: "🔌" },
      { id: 7, xRatio: 0.80, yRatio: 0.32, label: "PostgreSQL / D1", category: "output", color: "#10b981", icon: "💾" },
      { id: 8, xRatio: 0.84, yRatio: 0.68, label: "Slack & Resend", category: "output", color: "#f59e0b", icon: "📤" },
      { id: 9, xRatio: 0.92, yRatio: 0.48, label: "Telemetry Log", category: "output", color: "#10b981", icon: "📊" },
    ];

    const displayW = canvas.offsetWidth;
    const displayH = canvas.offsetHeight;

    const nodes: NodePoint[] = rawNodes.map((n) => ({
      id: n.id,
      x: n.xRatio * displayW,
      y: n.yRatio * displayH,
      baseX: n.xRatio * displayW,
      baseY: n.yRatio * displayH,
      vx: 0,
      vy: 0,
      label: n.label,
      category: n.category as NodePoint["category"],
      color: n.color,
      icon: n.icon,
      pulsePhase: Math.random() * Math.PI * 2,
      active: true,
    }));

    const rawConnections = [
      { from: 0, to: 2, speed: 0.007, color: "#38bdf8" },
      { from: 1, to: 3, speed: 0.006, color: "#38bdf8" },
      { from: 2, to: 4, speed: 0.008, color: "#a855f7" },
      { from: 2, to: 5, speed: 0.006, color: "#a855f7" },
      { from: 3, to: 5, speed: 0.007, color: "#818cf8" },
      { from: 3, to: 6, speed: 0.005, color: "#818cf8" },
      { from: 4, to: 7, speed: 0.009, color: "#ec4899" },
      { from: 5, to: 7, speed: 0.007, color: "#06b6d4" },
      { from: 5, to: 8, speed: 0.008, color: "#06b6d4" },
      { from: 6, to: 8, speed: 0.006, color: "#3b82f6" },
      { from: 7, to: 9, speed: 0.008, color: "#10b981" },
      { from: 8, to: 9, speed: 0.007, color: "#f59e0b" },
    ];

    const connections: Connection[] = rawConnections.map((c) => ({
      from: c.from,
      to: c.to,
      progress: Math.random(),
      speed: c.speed,
      color: c.color,
    }));

    let frame = 0;

    const render = () => {
      frame++;
      const currentW = canvas.offsetWidth;
      const currentH = canvas.offsetHeight;
      ctx.clearRect(0, 0, currentW, currentH);

      // 1. Subtle background grid dots
      ctx.fillStyle = "rgba(148, 163, 184, 0.08)";
      const dotSpacing = 36;
      for (let gx = 0; gx < currentW; gx += dotSpacing) {
        for (let gy = 0; gy < currentH; gy += dotSpacing) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Physics & Cursor Proximity for Nodes
      let currentHover: string | null = null;
      for (const node of nodes) {
        // Floating harmonic motion
        const floatX = Math.sin(frame * 0.015 + node.pulsePhase) * 6;
        const floatY = Math.cos(frame * 0.018 + node.pulsePhase) * 6;
        const targetX = node.baseX + floatX;
        const targetY = node.baseY + floatY;

        // Cursor repulsion / attraction
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const dist = Math.sqrt(dx * dy + dy * dy);
        const radius = 100;

        if (dist < radius && dist > 0) {
          currentHover = `${node.label} (${node.category.toUpperCase()})`;
          const force = (1 - dist / radius) * 16;
          node.x -= (dx / dist) * force;
          node.y -= (dy / dist) * force;
        } else {
          // Spring back to base
          node.x += (targetX - node.x) * 0.05;
          node.y += (targetY - node.y) * 0.05;
        }
      }
      if (currentHover !== hoveredNode) {
        setHoveredNode(currentHover);
      }

      // 3. Draw curved spline connection lines
      for (const conn of connections) {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        if (!from || !to) continue;

        const cp1x = from.x + (to.x - from.x) * 0.5;
        const cp1y = from.y;
        const cp2x = from.x + (to.x - from.x) * 0.5;
        const cp2y = to.y;

        // Base spline wire
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y);
        ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Active highlighted connection when cursor is near
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const distToMouse = Math.hypot(mouseX - midX, mouseY - midY);

        if (distToMouse < 140) {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y);
          ctx.strokeStyle = conn.color;
          ctx.lineWidth = 2.2;
          ctx.shadowColor = conn.color;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Animated Energy Pulse Photon along bezier curve
        conn.progress += conn.speed;
        if (conn.progress > 1) conn.progress = 0;

        const t = conn.progress;
        // Cubic Bezier interpolation
        const u = 1 - t;
        const px =
          u * u * u * from.x +
          3 * u * u * t * cp1x +
          3 * u * t * t * cp2x +
          t * t * t * to.x;
        const py =
          u * u * u * from.y +
          3 * u * u * t * cp1y +
          3 * u * t * t * cp2y +
          t * t * t * to.y;

        // Photon glow head
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = conn.color;
        ctx.shadowColor = conn.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Tail trail
        const trailT = Math.max(0, t - 0.04);
        const tu = 1 - trailT;
        const tx =
          tu * tu * tu * from.x +
          3 * tu * tu * trailT * cp1x +
          3 * tu * trailT * trailT * cp2x +
          trailT * trailT * trailT * to.x;
        const ty =
          tu * tu * tu * from.y +
          3 * tu * tu * trailT * cp1y +
          3 * tu * trailT * trailT * cp2y +
          trailT * trailT * trailT * to.y;

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.strokeStyle = conn.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 4. Draw interactive node pills & badges
      for (const node of nodes) {
        const dCursor = Math.hypot(mouseX - node.x, mouseY - node.y);
        const isHover = dCursor < 35;
        const pulse = Math.sin(frame * 0.04 + node.pulsePhase) * 0.5 + 0.5;

        // Outer glow halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, 22 + (isHover ? 6 : pulse * 3), 0, Math.PI * 2);
        ctx.fillStyle = isHover ? `${node.color}25` : `${node.color}10`;
        ctx.fill();

        // Node card background
        const cardW = 68;
        const cardH = 36;
        const rx = node.x - cardW / 2;
        const ry = node.y - cardH / 2;

        ctx.beginPath();
        ctx.roundRect(rx, ry, cardW, cardH, 8);
        ctx.fillStyle = isHover ? "#0f172a" : "#090d16";
        ctx.fill();
        ctx.lineWidth = isHover ? 1.8 : 1;
        ctx.strokeStyle = isHover ? node.color : "rgba(51, 65, 85, 0.7)";
        if (isHover) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 14;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Node Pin / Port handles
        ctx.beginPath();
        ctx.arc(rx, node.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(rx + cardW, node.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Label & Emoji icon
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillStyle = isHover ? "#f8fafc" : "#cbd5e1";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${node.icon} ${node.label.slice(0, 7)}`, node.x, node.y);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[360px] sm:h-[440px] lg:h-[480px] rounded-2xl overflow-hidden glass border border-border/80">
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Floating Status Indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/60 text-xs font-mono text-muted-foreground pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live DAG Canvas</span>
        {hoveredNode && (
          <span className="text-foreground font-semibold ml-1 text-primary">
            • {hoveredNode}
          </span>
        )}
      </div>

      <div className="absolute bottom-3 right-3 text-[11px] font-mono text-muted-foreground/80 px-2.5 py-1 rounded bg-background/60 backdrop-blur border border-border/40 pointer-events-none">
        Move cursor to inspect nodes & pathways
      </div>
    </div>
  );
}
