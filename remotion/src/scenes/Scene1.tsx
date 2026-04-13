import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin"] });

export const Scene1HeroIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const subtitleSpring = spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 200 } });
  const line2Spring = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 200 } });

  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const subtitleY = interpolate(subtitleSpring, [0, 1], [40, 0]);
  const line2Y = interpolate(line2Spring, [0, 1], [40, 0]);

  // Floating nodes
  const nodes = [
    { label: "⚡", x: 1400, y: 250, delay: 20, color: "#3B82F6" },
    { label: "🔗", x: 1550, y: 400, delay: 35, color: "#8B5CF6" },
    { label: "🤖", x: 1350, y: 550, delay: 50, color: "#00DDFF" },
    { label: "📧", x: 1600, y: 650, delay: 65, color: "#3B82F6" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: 140,
      }}
    >
      <div>
        <div
          style={{
            fontFamily,
            fontSize: 90,
            fontWeight: 800,
            color: "white",
            opacity: titleSpring,
            transform: `translateY(${titleY}px)`,
            lineHeight: 1.1,
          }}
        >
          Automate{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Everything
          </span>
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 90,
            fontWeight: 800,
            color: "white",
            opacity: line2Spring,
            transform: `translateY(${line2Y}px)`,
            lineHeight: 1.1,
            marginTop: 10,
          }}
        >
          Build{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #00DDFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Anything
          </span>
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
            opacity: subtitleSpring,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 30,
            maxWidth: 600,
            lineHeight: 1.5,
          }}
        >
          The open-source workflow automation platform
        </div>
      </div>

      {/* Floating node icons */}
      {nodes.map((node, i) => {
        const s = spring({ frame: frame - node.delay, fps, config: { damping: 12 } });
        const float = Math.sin((frame - node.delay) * 0.06) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y + float,
              width: 70,
              height: 70,
              borderRadius: 16,
              background: `${node.color}22`,
              border: `2px solid ${node.color}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              opacity: s,
              transform: `scale(${s})`,
            }}
          >
            {node.label}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
