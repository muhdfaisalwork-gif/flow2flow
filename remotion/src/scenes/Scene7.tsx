import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

const executionSteps = [
  { label: "Webhook Received", status: "✅", time: "0ms", color: "#10B981" },
  { label: "Data Extracted", status: "✅", time: "120ms", color: "#10B981" },
  { label: "AI Processing", status: "⏳", time: "1.2s", color: "#F59E0B" },
  { label: "Filter Applied", status: "⏳", time: "—", color: "#6B7280" },
  { label: "Email Sent", status: "⏳", time: "—", color: "#6B7280" },
];

export const Scene7RealTimeExecution: React.FC = () => {
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
          marginBottom: 50,
        }}
      >
        <span style={{ background: "linear-gradient(135deg, #3B82F6, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Real-time
        </span>{" "}
        Execution Monitor
      </div>

      <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
        {/* Execution log */}
        <div
          style={{
            width: 650,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 16,
            overflow: "hidden",
            opacity: titleSpring,
          }}
        >
          <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: monoFamily, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Execution Log</span>
            <span style={{ fontFamily: monoFamily, fontSize: 13, color: "#10B981" }}>● LIVE</span>
          </div>

          {executionSteps.map((step, i) => {
            const stepDelay = 20 + i * 18;
            const s = spring({ frame: frame - stepDelay, fps, config: { damping: 15 } });
            const isActive = i === 2 && frame > 56;
            const isComplete = frame > stepDelay + 30;
            const displayStatus = isComplete ? "✅" : step.status;
            const displayTime = isComplete && step.time === "—" ? `${(i * 0.4 + 1.5).toFixed(1)}s` : step.time;
            const displayColor = isComplete ? "#10B981" : step.color;
            
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
                  background: isActive && !isComplete ? "rgba(245,158,11,0.08)" : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{displayStatus}</span>
                  <span style={{ fontFamily: monoFamily, fontSize: 16, color: "white" }}>{step.label}</span>
                </div>
                <span style={{ fontFamily: monoFamily, fontSize: 14, color: displayColor }}>{displayTime}</span>
              </div>
            );
          })}
        </div>

        {/* Data inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              width: 450,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 16,
              padding: 24,
              opacity: spring({ frame: frame - 30, fps, config: { damping: 20 } }),
            }}
          >
            <div style={{ fontFamily: monoFamily, fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Data Inspector</div>
            {[
              '{ "leads": 47,',
              '  "qualified": 12,',
              '  "score_avg": 84.3,',
              '  "source": "webhook" }',
            ].map((line, i) => {
              const lineS = spring({ frame: frame - 40 - i * 6, fps, config: { damping: 15 } });
              return (
                <div key={i} style={{ fontFamily: monoFamily, fontSize: 15, color: "#10B981", opacity: lineS, padding: "2px 0" }}>
                  {line}
                </div>
              );
            })}
          </div>

          {/* Error alerts */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 12,
              padding: "12px 20px",
              opacity: spring({ frame: frame - 80, fps, config: { damping: 20 } }),
            }}
          >
            <span style={{ fontSize: 20 }}>🔔</span>
            <span style={{ fontFamily: monoFamily, fontSize: 14, color: "#10B981" }}>Instant error alerts & retry</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
