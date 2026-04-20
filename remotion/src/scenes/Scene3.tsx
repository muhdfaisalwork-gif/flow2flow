import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

/**
 * Scene 3 — Build a REAL automation end-to-end (270 frames @ 30fps = 9s)
 *
 * Story: "When a new Stripe payment arrives → AI categorizes it →
 *         branch by amount → high-value: Slack alert + CRM update,
 *         low-value: receipt email."
 *
 * Beats:
 *   0-30    Title + editor chrome appears
 *   30-55   Drag Stripe trigger from sidebar to canvas
 *   55-80   Drag AI Categorize, auto-connects
 *   80-105  Drag Branch (if/else), auto-connects
 *   105-135 Drag Slack + HubSpot on TRUE branch
 *   135-160 Drag Email on FALSE branch, all wired
 *   160-200 Open AI Categorize → fill prompt + model dropdown
 *   200-230 Open Branch → set condition `amount > 500`
 *   230-270 Hit "Test Run" → green pulses traverse the graph
 */

// Library nodes (left sidebar)
const libraryNodes = [
  { label: "Stripe Payment", icon: "💳", color: "#635BFF", group: "Triggers" },
  { label: "Webhook", icon: "⚡", color: "#3B82F6", group: "Triggers" },
  { label: "Schedule", icon: "⏰", color: "#3B82F6", group: "Triggers" },
  { label: "AI Categorize", icon: "🤖", color: "#8B5CF6", group: "AI" },
  { label: "AI Extract", icon: "✨", color: "#8B5CF6", group: "AI" },
  { label: "Branch (If/Else)", icon: "⚖️", color: "#F59E0B", group: "Logic" },
  { label: "Slack", icon: "💬", color: "#4A154B", group: "Integrations" },
  { label: "HubSpot CRM", icon: "🎯", color: "#FF7A59", group: "Integrations" },
  { label: "Send Email", icon: "📧", color: "#10B981", group: "Integrations" },
];

// Final placed nodes on canvas (positions inside canvas area, canvas is ~1380 wide)
type PlacedNode = {
  id: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  placedAt: number;
  libIndex: number; // which sidebar item it came from
};

const placedNodes: PlacedNode[] = [
  { id: "stripe", label: "Stripe Payment", sub: "On new charge", icon: "💳", color: "#635BFF", x: 60,  y: 260, placedAt: 38,  libIndex: 0 },
  { id: "ai",     label: "AI Categorize",  sub: "google/gemini-2.5-flash", icon: "🤖", color: "#8B5CF6", x: 320, y: 260, placedAt: 65,  libIndex: 3 },
  { id: "branch", label: "Branch",         sub: "amount > 500", icon: "⚖️", color: "#F59E0B", x: 580, y: 260, placedAt: 92,  libIndex: 5 },
  { id: "slack",  label: "Slack Alert",    sub: "#sales-vip",  icon: "💬", color: "#4A154B", x: 860, y: 130, placedAt: 118, libIndex: 6 },
  { id: "crm",    label: "HubSpot CRM",    sub: "Update deal",  icon: "🎯", color: "#FF7A59", x: 860, y: 250, placedAt: 130, libIndex: 7 },
  { id: "email",  label: "Receipt Email",  sub: "Template: r1", icon: "📧", color: "#10B981", x: 860, y: 400, placedAt: 152, libIndex: 8 },
];

const connections = [
  { from: 0, to: 1, drawAt: 68,  branch: "main" as const },
  { from: 1, to: 2, drawAt: 95,  branch: "main" as const },
  { from: 2, to: 3, drawAt: 121, branch: "true" as const },
  { from: 2, to: 4, drawAt: 133, branch: "true" as const },
  { from: 2, to: 5, drawAt: 155, branch: "false" as const },
];

// Cursor choreography — sidebar item → canvas drop
const cursorPath = [
  { frame: 0,   x: 1100, y: 100, click: false },
  { frame: 28,  x: 180,  y: 300, click: false },     // hover Stripe
  { frame: 32,  x: 180,  y: 300, click: true  },     // grab
  { frame: 38,  x: 200,  y: 320, click: true  },     // drop Stripe
  { frame: 55,  x: 180,  y: 460, click: false },     // hover AI Categorize
  { frame: 60,  x: 180,  y: 460, click: true  },
  { frame: 65,  x: 460,  y: 320, click: true  },     // drop AI
  { frame: 82,  x: 180,  y: 580, click: false },     // hover Branch
  { frame: 87,  x: 180,  y: 580, click: true  },
  { frame: 92,  x: 720,  y: 320, click: true  },     // drop Branch
  { frame: 108, x: 180,  y: 660, click: false },     // hover Slack
  { frame: 113, x: 180,  y: 660, click: true  },
  { frame: 118, x: 1000, y: 190, click: true  },     // drop Slack
  { frame: 122, x: 180,  y: 700, click: false },     // hover HubSpot
  { frame: 126, x: 180,  y: 700, click: true  },
  { frame: 130, x: 1000, y: 310, click: true  },     // drop HubSpot
  { frame: 142, x: 180,  y: 740, click: false },     // hover Email
  { frame: 147, x: 180,  y: 740, click: true  },
  { frame: 152, x: 1000, y: 460, click: true  },     // drop Email
  { frame: 168, x: 460,  y: 320, click: false },     // back to AI node
  { frame: 174, x: 460,  y: 320, click: true  },     // open config
  { frame: 195, x: 1450, y: 280, click: false },     // typing in panel
  { frame: 205, x: 720,  y: 320, click: false },     // back to Branch
  { frame: 210, x: 720,  y: 320, click: true  },
  { frame: 225, x: 1450, y: 280, click: false },
  { frame: 238, x: 1330, y: 60,  click: false },     // hover Run button
  { frame: 244, x: 1330, y: 60,  click: true  },     // press Run
  { frame: 270, x: 1330, y: 60,  click: false },
];

const interpCursor = (f: number) => {
  for (let i = 0; i < cursorPath.length - 1; i++) {
    const a = cursorPath[i];
    const b = cursorPath[i + 1];
    if (f >= a.frame && f <= b.frame) {
      const t = (f - a.frame) / Math.max(1, b.frame - a.frame);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return {
        x: a.x + (b.x - a.x) * ease,
        y: a.y + (b.y - a.y) * ease,
        clicking: a.click || b.click,
      };
    }
  }
  const last = cursorPath[cursorPath.length - 1];
  return { x: last.x, y: last.y, clicking: false };
};

// Build cubic SVG path between two nodes (right side of from → left side of to)
const buildPath = (from: PlacedNode, to: PlacedNode) => {
  const fx = from.x + 200;
  const fy = from.y + 35;
  const tx = to.x;
  const ty = to.y + 35;
  const midX = (fx + tx) / 2;
  return { d: `M ${fx} ${fy} C ${midX} ${fy}, ${midX} ${ty}, ${tx} ${ty}`, fx, fy, tx, ty };
};

export const Scene3WorkflowCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const editorSpring = spring({ frame: frame - 8, fps, config: { damping: 22, stiffness: 180 } });
  const cursor = interpCursor(frame);

  // Config panels
  const aiPanelOpen = frame > 174 && frame < 230;
  const aiPanelSpring = spring({ frame: frame - 174, fps, config: { damping: 18, stiffness: 200 } });
  const branchPanelOpen = frame >= 210 && frame < 250;
  const branchPanelSpring = spring({ frame: frame - 210, fps, config: { damping: 18, stiffness: 200 } });

  // Test run
  const runStarted = frame > 244;
  const runProgress = interpolate(frame - 244, [0, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Typing animations for AI prompt
  const aiPrompt = "Categorize this payment by customer intent and product type.";
  const aiTyped = aiPanelOpen ? aiPrompt.slice(0, Math.max(0, Math.floor((frame - 182) * 1.6))) : "";

  // Typing for Branch condition
  const branchCond = "data.amount > 500";
  const branchTyped = branchPanelOpen ? branchCond.slice(0, Math.max(0, Math.floor((frame - 215) * 1.4))) : "";

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30 }}>
      {/* Title */}
      <div
        style={{
          fontFamily,
          fontSize: 38,
          fontWeight: 700,
          color: "white",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          marginBottom: 14,
          letterSpacing: -0.5,
        }}
      >
        Build a real automation in{" "}
        <span style={{ background: "linear-gradient(135deg, #3B82F6, #00DDFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          minutes, not weeks
        </span>
      </div>

      {/* Editor */}
      <div
        style={{
          position: "relative",
          width: 1760,
          height: 880,
          background: "rgba(10,15,30,0.92)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 18,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: editorSpring,
          transform: `translateY(${interpolate(editorSpring, [0, 1], [40, 0])}px)`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
        }}
      >
        {/* Top toolbar */}
        <div
          style={{
            height: 46,
            background: "rgba(15,23,42,0.95)",
            borderBottom: "1px solid rgba(59,130,246,0.18)",
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", gap: 7 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F56" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFBD2E" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#27C93F" }} />
          </div>
          <div style={{ fontFamily: monoFamily, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            flow2flow / High-Value Payment Router
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ fontFamily, fontSize: 12, color: "rgba(255,255,255,0.6)", padding: "5px 12px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6 }}>
              Save
            </div>
            <div
              style={{
                fontFamily,
                fontSize: 12,
                color: "white",
                fontWeight: 600,
                padding: "5px 14px",
                background: runStarted
                  ? "linear-gradient(135deg, #10B981, #00DDFF)"
                  : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                borderRadius: 6,
                boxShadow: cursor.clicking && Math.abs(cursor.x - 1330) < 20 && Math.abs(cursor.y - 60) < 20
                  ? "0 0 18px rgba(0,221,255,0.6)"
                  : "none",
                transform: cursor.clicking && Math.abs(cursor.x - 1330) < 20 && Math.abs(cursor.y - 60) < 20 ? "scale(0.95)" : "scale(1)",
              }}
            >
              {runStarted ? "● Running…" : "▶ Test Run"}
            </div>
          </div>
        </div>

        {/* Body: sidebar + canvas */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <div
            style={{
              width: 280,
              background: "rgba(20,18,45,0.7)",
              borderRight: "1px solid rgba(59,130,246,0.18)",
              padding: 14,
              overflow: "hidden",
            }}
          >
            <div style={{ fontFamily: monoFamily, fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
              Node Library
            </div>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <div style={{
                fontFamily, fontSize: 12, color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6, padding: "6px 10px",
              }}>
                🔍 Search nodes…
              </div>
            </div>
            {libraryNodes.map((node, i) => {
              // Highlight when cursor is over it (matches sidebar Y of placedNodes drop sequence)
              const yPos = 70 + i * 56;
              const isHovered = cursor.x < 260 && Math.abs(cursor.y - (yPos + 18)) < 20;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 10px",
                    marginBottom: 4,
                    background: isHovered ? `${node.color}25` : `${node.color}10`,
                    border: `1px solid ${isHovered ? node.color + "70" : node.color + "25"}`,
                    borderRadius: 7,
                    transform: isHovered ? "translateX(2px)" : "translateX(0)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{node.icon}</span>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                    <span style={{ fontFamily, fontSize: 12, color: "white", fontWeight: 500 }}>{node.label}</span>
                    <span style={{ fontFamily: monoFamily, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{node.group}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canvas */}
          <div
            style={{
              flex: 1,
              position: "relative",
              backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.12) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              overflow: "hidden",
            }}
          >
            {/* Connections (SVG layer) */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {connections.map((conn, i) => {
                const from = placedNodes[conn.from];
                const to = placedNodes[conn.to];
                const { d } = buildPath(from, to);
                const drawProgress = interpolate(frame - conn.drawAt, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const stroke =
                  conn.branch === "true" ? "#10B981" :
                  conn.branch === "false" ? "#F59E0B" :
                  "#3B82F6";

                // Run pulse during test run
                const runPulseDelay =
                  conn.from === 0 ? 2 :
                  conn.from === 1 ? 8 :
                  conn.to === 3 || conn.to === 4 ? 14 :
                  16;
                const showRunPulse = runStarted && frame - 244 > runPulseDelay;

                return (
                  <g key={i}>
                    <path
                      d={d}
                      stroke={stroke}
                      strokeWidth={2.5}
                      fill="none"
                      strokeDasharray={600}
                      strokeDashoffset={600 * (1 - drawProgress)}
                      opacity={0.85}
                      style={{ filter: `drop-shadow(0 0 4px ${stroke}55)` }}
                    />
                    {/* Idle data pulse */}
                    {drawProgress >= 1 && !runStarted && (
                      <circle r={3.5} fill="#00DDFF" style={{ filter: "drop-shadow(0 0 6px #00DDFF)" }}>
                        <animateMotion dur="2s" repeatCount="indefinite" path={d} />
                      </circle>
                    )}
                    {/* Live run pulse */}
                    {showRunPulse && (
                      <>
                        <circle r={6} fill="#10B981" style={{ filter: "drop-shadow(0 0 12px #10B981)" }}>
                          <animateMotion dur="0.8s" repeatCount="indefinite" path={d} />
                        </circle>
                        <circle r={3} fill="white">
                          <animateMotion dur="0.8s" repeatCount="indefinite" path={d} />
                        </circle>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Placed nodes */}
            {placedNodes.map((node, i) => {
              const placeSpring = spring({ frame: frame - node.placedAt, fps, config: { damping: 12, stiffness: 220 } });
              if (placeSpring < 0.01) return null;
              const float = Math.sin((frame + i * 25) * 0.04) * 2;
              const isOpen =
                (aiPanelOpen && node.id === "ai") ||
                (branchPanelOpen && node.id === "branch");

              // Run state styling
              const runDelay =
                node.id === "stripe" ? 0 :
                node.id === "ai" ? 6 :
                node.id === "branch" ? 12 :
                18;
              const isRunning = runStarted && frame - 244 > runDelay && frame - 244 < runDelay + 6;
              const isDone = runStarted && frame - 244 > runDelay + 6;
              const borderColor = isOpen ? "#00DDFF" : isDone ? "#10B981" : isRunning ? "#F59E0B" : node.color + "85";
              const glow = isOpen
                ? "0 0 22px rgba(0,221,255,0.55)"
                : isRunning
                  ? "0 0 22px rgba(245,158,11,0.6)"
                  : isDone
                    ? "0 0 18px rgba(16,185,129,0.5)"
                    : "0 6px 16px rgba(0,0,0,0.35)";

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: node.x,
                    top: node.y + float,
                    width: 200,
                    height: 70,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${node.color}30, ${node.color}10)`,
                    border: `2px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 14px",
                    opacity: placeSpring,
                    transform: `scale(${placeSpring})`,
                    boxShadow: glow,
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 9,
                    background: `${node.color}40`, display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 22,
                  }}>
                    {node.icon}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily, fontSize: 13, color: "white", fontWeight: 600 }}>{node.label}</span>
                    <span style={{ fontFamily: monoFamily, fontSize: 10, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {node.sub}
                    </span>
                  </div>
                  {isDone && <span style={{ fontSize: 16, color: "#10B981" }}>✓</span>}
                  {isRunning && (
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: "#F59E0B",
                      boxShadow: "0 0 10px #F59E0B",
                    }} />
                  )}
                </div>
              );
            })}

            {/* Branch labels (TRUE / FALSE) */}
            {frame > 135 && (
              <>
                <div style={{
                  position: "absolute", left: 800, top: 195,
                  fontFamily: monoFamily, fontSize: 10, color: "#10B981",
                  background: "rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: 10,
                  border: "1px solid rgba(16,185,129,0.4)",
                  opacity: spring({ frame: frame - 135, fps, config: { damping: 20 } }),
                }}>
                  TRUE
                </div>
                <div style={{
                  position: "absolute", left: 800, top: 380,
                  fontFamily: monoFamily, fontSize: 10, color: "#F59E0B",
                  background: "rgba(245,158,11,0.15)", padding: "2px 8px", borderRadius: 10,
                  border: "1px solid rgba(245,158,11,0.4)",
                  opacity: spring({ frame: frame - 155, fps, config: { damping: 20 } }),
                }}>
                  FALSE
                </div>
              </>
            )}

            {/* AI Categorize config panel */}
            {aiPanelOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 320,
                  background: "rgba(15,23,42,0.97)",
                  border: "1px solid rgba(139,92,246,0.45)",
                  borderRadius: 12,
                  padding: 16,
                  opacity: aiPanelSpring,
                  transform: `translateX(${interpolate(aiPanelSpring, [0, 1], [50, 0])}px)`,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontFamily, fontSize: 14, color: "white", fontWeight: 600 }}>AI Categorize</span>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: monoFamily, fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 4, textTransform: "uppercase" }}>Model</div>
                  <div style={{ fontFamily: monoFamily, fontSize: 11, color: "white", background: "rgba(139,92,246,0.15)", padding: "7px 10px", borderRadius: 6, border: "1px solid rgba(139,92,246,0.3)", display: "flex", justifyContent: "space-between" }}>
                    <span>google/gemini-2.5-flash</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>▼</span>
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: monoFamily, fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 4, textTransform: "uppercase" }}>Prompt</div>
                  <div style={{ fontFamily: monoFamily, fontSize: 11, color: "white", background: "rgba(0,0,0,0.35)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", minHeight: 50, lineHeight: 1.5 }}>
                    {aiTyped}
                    <span style={{ opacity: Math.round(frame * 0.15) % 2 === 0 ? 1 : 0, color: "#8B5CF6" }}>|</span>
                  </div>
                </div>

                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontFamily: monoFamily, fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 4, textTransform: "uppercase" }}>Output</div>
                  <div style={{ fontFamily: monoFamily, fontSize: 10, color: "#10B981", background: "rgba(16,185,129,0.08)", padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.25)" }}>
                    {`{ category, intent, score }`}
                  </div>
                </div>
              </div>
            )}

            {/* Branch config panel */}
            {branchPanelOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 320,
                  background: "rgba(15,23,42,0.97)",
                  border: "1px solid rgba(245,158,11,0.45)",
                  borderRadius: 12,
                  padding: 16,
                  opacity: branchPanelSpring,
                  transform: `translateX(${interpolate(branchPanelSpring, [0, 1], [50, 0])}px)`,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>⚖️</span>
                  <span style={{ fontFamily, fontSize: 14, color: "white", fontWeight: 600 }}>Branch — If/Else</span>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: monoFamily, fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 4, textTransform: "uppercase" }}>Condition</div>
                  <div style={{ fontFamily: monoFamily, fontSize: 12, color: "white", background: "rgba(0,0,0,0.35)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(245,158,11,0.3)" }}>
                    {branchTyped}
                    <span style={{ opacity: Math.round(frame * 0.15) % 2 === 0 ? 1 : 0, color: "#F59E0B" }}>|</span>
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: monoFamily, fontSize: 9, color: "#10B981", marginBottom: 4, textTransform: "uppercase" }}>If TRUE →</div>
                  <div style={{ fontFamily: monoFamily, fontSize: 10, color: "white", background: "rgba(16,185,129,0.1)", padding: "5px 9px", borderRadius: 5, border: "1px solid rgba(16,185,129,0.3)" }}>
                    Slack + HubSpot
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: monoFamily, fontSize: 9, color: "#F59E0B", marginBottom: 4, textTransform: "uppercase" }}>Else →</div>
                  <div style={{ fontFamily: monoFamily, fontSize: 10, color: "white", background: "rgba(245,158,11,0.1)", padding: "5px 9px", borderRadius: 5, border: "1px solid rgba(245,158,11,0.3)" }}>
                    Receipt Email
                  </div>
                </div>
              </div>
            )}

            {/* Run progress bar at bottom of canvas */}
            {runStarted && (
              <div style={{
                position: "absolute", bottom: 14, left: 14, right: 14,
                background: "rgba(15,23,42,0.92)", borderRadius: 10,
                padding: "10px 14px", border: "1px solid rgba(16,185,129,0.4)",
                display: "flex", alignItems: "center", gap: 14,
                opacity: spring({ frame: frame - 246, fps, config: { damping: 20 } }),
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                <span style={{ fontFamily: monoFamily, fontSize: 12, color: "white" }}>
                  Test run · 6/6 nodes · {(runProgress * 1.4).toFixed(2)}s
                </span>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${runProgress * 100}%`, height: "100%",
                    background: "linear-gradient(90deg, #10B981, #00DDFF)",
                  }} />
                </div>
                <span style={{ fontFamily: monoFamily, fontSize: 12, color: "#10B981" }}>
                  {runProgress >= 1 ? "✓ Success" : "Running…"}
                </span>
              </div>
            )}

            {/* Animated cursor (always on top) */}
            <div
              style={{
                position: "absolute",
                left: cursor.x,
                top: cursor.y,
                width: 22,
                height: 22,
                pointerEvents: "none",
                zIndex: 100,
                transform: cursor.clicking ? "scale(0.85)" : "scale(1)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="#0F172A" strokeWidth="1.5">
                <path d="M3 2 L3 18 L7 14 L9 20 L12 19 L10 13 L16 13 Z" />
              </svg>
              {cursor.clicking && (
                <div
                  style={{
                    position: "absolute",
                    left: -12,
                    top: -12,
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    border: "2px solid #00DDFF",
                    opacity: 0.55,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
