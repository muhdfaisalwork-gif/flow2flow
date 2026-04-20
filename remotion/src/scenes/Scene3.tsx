import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

// Sidebar nodes (library)
const libraryNodes = [
  { label: "Webhook", icon: "⚡", color: "#3B82F6" },
  { label: "Schedule", icon: "⏰", color: "#3B82F6" },
  { label: "AI Extract", icon: "🤖", color: "#8B5CF6" },
  { label: "Filter", icon: "🔍", color: "#F59E0B" },
  { label: "HTTP Request", icon: "🌐", color: "#10B981" },
  { label: "Send Email", icon: "📧", color: "#10B981" },
  { label: "Slack", icon: "💬", color: "#10B981" },
];

// Final placed nodes on canvas
const placedNodes = [
  { label: "Webhook", icon: "⚡", x: 80, y: 180, color: "#3B82F6", placedAt: 15 },
  { label: "AI Extract", icon: "🤖", x: 360, y: 80, color: "#8B5CF6", placedAt: 35 },
  { label: "Filter", icon: "🔍", x: 640, y: 180, color: "#F59E0B", placedAt: 55 },
  { label: "Send Email", icon: "📧", x: 920, y: 80, color: "#10B981", placedAt: 75 },
  { label: "Slack", icon: "💬", x: 920, y: 280, color: "#10B981", placedAt: 90 },
];

const connections = [
  { from: 0, to: 1, drawAt: 38 },
  { from: 1, to: 2, drawAt: 58 },
  { from: 2, to: 3, drawAt: 78 },
  { from: 2, to: 4, drawAt: 93 },
];

// Cursor path - moves from sidebar to canvas to drop nodes
const cursorPath = [
  { frame: 0, x: 200, y: 250 },
  { frame: 10, x: 200, y: 320 }, // hover AI Extract in library
  { frame: 18, x: 480, y: 130 }, // drag to canvas
  { frame: 25, x: 200, y: 380 }, // back to library - Filter
  { frame: 38, x: 760, y: 230 }, // drop Filter
  { frame: 50, x: 200, y: 440 }, // back - Email
  { frame: 62, x: 1040, y: 130 }, // drop Email
  { frame: 75, x: 200, y: 470 }, // Slack
  { frame: 88, x: 1040, y: 330 }, // drop Slack
  { frame: 100, x: 700, y: 230 }, // hover Filter to configure
  { frame: 115, x: 700, y: 230 }, // stay
];

const interpCursor = (f: number) => {
  for (let i = 0; i < cursorPath.length - 1; i++) {
    const a = cursorPath[i];
    const b = cursorPath[i + 1];
    if (f >= a.frame && f <= b.frame) {
      const t = (f - a.frame) / (b.frame - a.frame);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return {
        x: a.x + (b.x - a.x) * ease,
        y: a.y + (b.y - a.y) * ease,
        clicking: Math.abs(f - a.frame) < 3 || Math.abs(f - b.frame) < 3,
      };
    }
  }
  const last = cursorPath[cursorPath.length - 1];
  return { x: last.x, y: last.y, clicking: false };
};

export const Scene3WorkflowCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const cursor = interpCursor(frame);

  // Config panel appears at frame 100 (when cursor reaches Filter node)
  const configPanelSpring = spring({ frame: frame - 100, fps, config: { damping: 18, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40 }}>
      <div
        style={{
          fontFamily,
          fontSize: 42,
          fontWeight: 700,
          color: "white",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          marginBottom: 20,
        }}
      >
        Build Real Workflows{" "}
        <span style={{ background: "linear-gradient(135deg, #3B82F6, #00DDFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Visually
        </span>
      </div>

      {/* Editor mock */}
      <div
        style={{
          position: "relative",
          width: 1700,
          height: 720,
          background: "rgba(15,23,42,0.85)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 16,
          display: "flex",
          overflow: "hidden",
          opacity: titleSpring,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 260,
            height: "100%",
            background: "rgba(30,27,75,0.6)",
            borderRight: "1px solid rgba(59,130,246,0.2)",
            padding: 16,
          }}
        >
          <div style={{ fontFamily: monoFamily, fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Node Library
          </div>
          {libraryNodes.map((node, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                marginBottom: 6,
                background: `${node.color}15`,
                border: `1px solid ${node.color}30`,
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>{node.icon}</span>
              <span style={{ fontFamily, fontSize: 13, color: "white", fontWeight: 500 }}>{node.label}</span>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div
          style={{
            flex: 1,
            position: "relative",
            backgroundImage:
              "radial-gradient(circle, rgba(59,130,246,0.15) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Connections */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {connections.map((conn, i) => {
              const progress = interpolate(frame - conn.drawAt, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const from = placedNodes[conn.from];
              const to = placedNodes[conn.to];
              const fx = from.x + 170;
              const fy = from.y + 30;
              const tx = to.x;
              const ty = to.y + 30;
              const midX = (fx + tx) / 2;
              const d = `M ${fx} ${fy} C ${midX} ${fy}, ${midX} ${ty}, ${tx} ${ty}`;
              return (
                <g key={i}>
                  <path
                    d={d}
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fill="none"
                    strokeDasharray={500}
                    strokeDashoffset={500 * (1 - progress)}
                    opacity={0.7}
                  />
                  {/* Data pulse on connection */}
                  {progress >= 1 && frame > conn.drawAt + 20 && (
                    <circle
                      r={4}
                      fill="#00DDFF"
                      style={{ filter: "drop-shadow(0 0 6px #00DDFF)" }}
                    >
                      <animateMotion
                        dur="1.5s"
                        repeatCount="indefinite"
                        path={d}
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Placed nodes */}
          {placedNodes.map((node, i) => {
            const placeSpring = spring({ frame: frame - node.placedAt, fps, config: { damping: 12, stiffness: 200 } });
            if (placeSpring < 0.01) return null;
            const float = Math.sin((frame + i * 20) * 0.04) * 2;
            const isFilter = i === 2;
            const isHighlighted = isFilter && frame > 100;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: node.x,
                  top: node.y + float,
                  width: 170,
                  height: 60,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${node.color}30, ${node.color}15)`,
                  border: `2px solid ${isHighlighted ? "#00DDFF" : node.color + "70"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 14px",
                  opacity: placeSpring,
                  transform: `scale(${placeSpring})`,
                  boxShadow: isHighlighted ? "0 0 24px rgba(0,221,255,0.5)" : "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <span style={{ fontSize: 22 }}>{node.icon}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily, fontSize: 13, color: "white", fontWeight: 600 }}>{node.label}</span>
                  <span style={{ fontFamily: monoFamily, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>node_{i + 1}</span>
                </div>
              </div>
            );
          })}

          {/* Configuration panel - slides in from right */}
          {frame > 95 && (
            <div
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 280,
                background: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(245,158,11,0.4)",
                borderRadius: 12,
                padding: 16,
                opacity: configPanelSpring,
                transform: `translateX(${interpolate(configPanelSpring, [0, 1], [40, 0])}px)`,
                boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ fontFamily: monoFamily, fontSize: 11, color: "rgba(245,158,11,0.8)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Configure Filter
              </div>
              <div style={{ fontFamily, fontSize: 14, color: "white", fontWeight: 600, marginBottom: 14 }}>Filter Leads 🔍</div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: monoFamily, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>CONDITION</div>
                <div style={{ fontFamily: monoFamily, fontSize: 12, color: "white", background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }}>
                  data.score &gt; 75
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: monoFamily, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>OUTPUT BRANCH</div>
                <div style={{ fontFamily: monoFamily, fontSize: 12, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.3)" }}>
                  ✓ qualified_leads
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <div style={{ flex: 1, fontFamily, fontSize: 12, color: "white", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", padding: "8px", borderRadius: 6, textAlign: "center", fontWeight: 600 }}>
                  Save
                </div>
                <div style={{ flex: 1, fontFamily, fontSize: 12, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: 6, textAlign: "center" }}>
                  Test
                </div>
              </div>
            </div>
          )}

          {/* Animated cursor */}
          <div
            style={{
              position: "absolute",
              left: cursor.x,
              top: cursor.y,
              width: 24,
              height: 24,
              pointerEvents: "none",
              zIndex: 100,
              transform: cursor.clicking ? "scale(0.85)" : "scale(1)",
              transition: "none",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="#0F172A" strokeWidth="1.5">
              <path d="M3 2 L3 18 L7 14 L9 20 L12 19 L10 13 L16 13 Z" />
            </svg>
            {cursor.clicking && (
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  top: -10,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "2px solid #00DDFF",
                  opacity: 0.6,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
