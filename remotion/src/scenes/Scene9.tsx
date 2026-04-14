import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin"] });

const stats = [
  { value: "10K+", label: "Workflows Created", color: "#3B82F6" },
  { value: "500+", label: "Integrations", color: "#8B5CF6" },
  { value: "99.9%", label: "Uptime", color: "#10B981" },
  { value: "Open", label: "Source", color: "#00DDFF" },
];

export const Scene9Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 80, marginBottom: 70 }}>
        {stats.map((stat, i) => {
          const s = spring({ frame: frame - 10 - i * 8, fps, config: { damping: 15, stiffness: 200 } });
          const float = Math.sin((frame + i * 15) * 0.05) * 3;
          return (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [30, 0]) + float}px)`,
              }}
            >
              <div
                style={{
                  fontFamily,
                  fontSize: 64,
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${stat.color}, ${stat.color}88)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontFamily, fontSize: 18, color: "rgba(255,255,255,0.5)", marginTop: 8, fontWeight: 700 }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: spring({ frame: frame - 50, fps, config: { damping: 20 } }),
          transform: `translateY(${interpolate(spring({ frame: frame - 50, fps, config: { damping: 20 } }), [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
          }}
        >
          Start Building{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6, #00DDFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Today
          </span>
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            marginTop: 16,
            fontWeight: 700,
          }}
        >
          flow2flow.lovable.app
        </div>
      </div>
    </AbsoluteFill>
  );
};
