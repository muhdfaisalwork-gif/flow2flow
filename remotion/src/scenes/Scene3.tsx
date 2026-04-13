import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

const flowNodes = [
  { label: "Webhook", icon: "⚡", x: 200, y: 420, color: "#3B82F6" },
  { label: "AI Extract", icon: "🤖", x: 550, y: 300, color: "#8B5CF6" },
  { label: "Filter", icon: "🔍", x: 900, y: 420, color: "#F59E0B" },
  { label: "Email", icon: "📧", x: 1250, y: 300, color: "#10B981" },
  { label: "Slack", icon: "💬", x: 1250, y: 540, color: "#10B981" },
];

const connections = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
];

export const Scene3WorkflowCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80 }}>
      <div
        style={{
          fontFamily,
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          marginBottom: 40,
        }}
      >
        Visual{" "}
        <span style={{ background: "linear-gradient(135deg, #3B82F6, #00DDFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Workflow Builder
        </span>
      </div>

      {/* Canvas area */}
      <div style={{ position: "relative", width: 1600, height: 600 }}>
        {/* Connection lines */}
        <svg style={{ position: "absolute", inset: 0 }} width={1600} height={600}>
          {connections.map((conn, i) => {
            const lineDelay = 30 + i * 15;
            const lineProgress = interpolate(frame - lineDelay, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const from = flowNodes[conn.from];
            const to = flowNodes[conn.to];
            const fx = from.x + 90;
            const fy = from.y + 35;
            const tx = to.x;
            const ty = to.y + 35;
            const midX = (fx + tx) / 2;
            const d = `M ${fx} ${fy} C ${midX} ${fy}, ${midX} ${ty}, ${tx} ${ty}`;
            const totalLength = 400;
            return (
              <path
                key={i}
                d={d}
                stroke="#3B82F6"
                strokeWidth={3}
                fill="none"
                strokeDasharray={totalLength}
                strokeDashoffset={totalLength * (1 - lineProgress)}
                opacity={0.6}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {flowNodes.map((node, i) => {
          const nodeDelay = 10 + i * 12;
          const nodeSpring = spring({ frame: frame - nodeDelay, fps, config: { damping: 15, stiffness: 200 } });
          const float = Math.sin((frame + i * 20) * 0.04) * 4;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: node.x,
                top: node.y + float,
                width: 180,
                height: 70,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${node.color}20, ${node.color}10)`,
                border: `2px solid ${node.color}55`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
                opacity: nodeSpring,
                transform: `scale(${nodeSpring})`,
              }}
            >
              <span style={{ fontSize: 28 }}>{node.icon}</span>
              <span style={{ fontFamily: monoFamily, fontSize: 16, color: "white", fontWeight: 500 }}>{node.label}</span>
            </div>
          );
        })}

        {/* Data pulse */}
        {frame > 60 && (
          <div
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#00DDFF",
              boxShadow: "0 0 20px #00DDFF",
              left: interpolate(frame - 60, [0, 60], [290, 1250], { extrapolateRight: "clamp" }),
              top: interpolate(frame - 60, [0, 20, 40, 60], [455, 335, 455, 335], { extrapolateRight: "clamp" }),
              opacity: frame > 120 ? 0 : 1,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
