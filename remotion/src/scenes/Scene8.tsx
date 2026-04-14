import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const Scene8VersionControlDeploy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  const gitCommits = [
    { hash: "a3f2b1c", msg: "Add lead scoring filter", author: "Sarah", time: "2m ago", color: "#3B82F6" },
    { hash: "7d1e4a9", msg: "Update email template", author: "Alex", time: "15m ago", color: "#8B5CF6" },
    { hash: "b5c8f32", msg: "Fix webhook retry logic", author: "Jordan", time: "1h ago", color: "#10B981" },
    { hash: "e9a1d7f", msg: "Initial workflow setup", author: "Sarah", time: "3h ago", color: "#F59E0B" },
  ];

  const deployFeatures = [
    { icon: "🏠", label: "Self-Host", desc: "Your servers, your data", delay: 40 },
    { icon: "☁️", label: "Managed Cloud", desc: "Zero maintenance", delay: 50 },
    { icon: "📈", label: "Auto-Scaling", desc: "Handles any load", delay: 60 },
    { icon: "🔒", label: "SOC2 Compliant", desc: "Enterprise-ready", delay: 70 },
  ];

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 70 }}>
      <div
        style={{
          fontFamily,
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          marginBottom: 45,
        }}
      >
        <span style={{ background: "linear-gradient(135deg, #8B5CF6, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Version Control
        </span>{" "}
        & Deploy
      </div>

      <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
        {/* Git history panel */}
        <div
          style={{
            width: 620,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: 16,
            overflow: "hidden",
            opacity: titleSpring,
          }}
        >
          <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔀</span>
            <span style={{ fontFamily: monoFamily, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Version History</span>
          </div>

          {gitCommits.map((commit, i) => {
            const s = spring({ frame: frame - 15 - i * 10, fps, config: { damping: 15 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [20, 0])}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: commit.color }} />
                  <span style={{ fontFamily: monoFamily, fontSize: 13, color: commit.color }}>{commit.hash}</span>
                  <span style={{ fontFamily, fontSize: 15, color: "white" }}>{commit.msg}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: monoFamily, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{commit.author}</span>
                  <span style={{ fontFamily: monoFamily, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{commit.time}</span>
                </div>
              </div>
            );
          })}

          {/* Rollback button */}
          <div style={{ padding: "14px 24px", display: "flex", gap: 12 }}>
            {["↩️ Rollback", "🔀 Branch", "🔃 Merge"].map((action, i) => {
              const s = spring({ frame: frame - 60 - i * 8, fps, config: { damping: 15 } });
              return (
                <div
                  key={action}
                  style={{
                    fontFamily: monoFamily,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: 8,
                    padding: "8px 16px",
                    opacity: s,
                  }}
                >
                  {action}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deploy options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {deployFeatures.map((feat, i) => {
            const s = spring({ frame: frame - feat.delay, fps, config: { damping: 12 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 14,
                  padding: "16px 24px",
                  width: 380,
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [30, 0])}px)`,
                }}
              >
                <span style={{ fontSize: 30 }}>{feat.icon}</span>
                <div>
                  <div style={{ fontFamily, fontSize: 18, color: "white", fontWeight: 600 }}>{feat.label}</div>
                  <div style={{ fontFamily: monoFamily, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{feat.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
