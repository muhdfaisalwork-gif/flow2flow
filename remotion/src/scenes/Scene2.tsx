import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

const categories = [
  {
    name: "Triggers",
    color: "#3B82F6",
    nodes: ["Webhook", "Schedule", "Manual"],
  },
  {
    name: "Actions",
    color: "#10B981",
    nodes: ["HTTP", "Code", "Email", "Slack", "DB Query", "Transform"],
  },
  {
    name: "Logic",
    color: "#F59E0B",
    nodes: ["If/Else", "Switch", "Loop", "Merge", "Filter", "Delay", "Variable"],
  },
  {
    name: "AI",
    color: "#8B5CF6",
    nodes: ["Chat", "Extract", "Summarize"],
  },
];

export const Scene2NodeLibrary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div
        style={{
          fontFamily,
          fontSize: 52,
          fontWeight: 700,
          color: "white",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          marginBottom: 50,
        }}
      >
        21 Node Types.{" "}
        <span style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Infinite Possibilities.
        </span>
      </div>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {categories.map((cat, ci) => {
          const catDelay = 15 + ci * 12;
          const catSpring = spring({ frame: frame - catDelay, fps, config: { damping: 20, stiffness: 200 } });
          return (
            <div key={cat.name} style={{ opacity: catSpring, transform: `translateY(${interpolate(catSpring, [0, 1], [30, 0])}px)` }}>
              <div
                style={{
                  fontFamily: monoFamily,
                  fontSize: 16,
                  color: cat.color,
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontWeight: 500,
                }}
              >
                {cat.name}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cat.nodes.map((node, ni) => {
                  const nodeDelay = catDelay + 8 + ni * 5;
                  const nodeSpring = spring({ frame: frame - nodeDelay, fps, config: { damping: 15, stiffness: 200 } });
                  return (
                    <div
                      key={node}
                      style={{
                        fontFamily: monoFamily,
                        fontSize: 18,
                        fontWeight: 500,
                        color: "white",
                        background: `${cat.color}18`,
                        border: `1px solid ${cat.color}44`,
                        borderRadius: 10,
                        padding: "10px 20px",
                        opacity: nodeSpring,
                        transform: `translateX(${interpolate(nodeSpring, [0, 1], [20, 0])}px)`,
                        minWidth: 160,
                      }}
                    >
                      {node}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
