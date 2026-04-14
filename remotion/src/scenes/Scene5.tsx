import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

const codeLines = [
  { text: 'const leads = await fetch(webhook.data);', delay: 15 },
  { text: 'const scored = leads.filter(l => l.score > 80);', delay: 25 },
  { text: 'await sendSlack({ channel: "#sales",', delay: 35 },
  { text: '  message: `${scored.length} hot leads!`', delay: 42 },
  { text: '});', delay: 48 },
  { text: 'return { processed: scored.length };', delay: 55 },
];

export const Scene5CodeEditor: React.FC = () => {
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
        Code When You{" "}
        <span style={{ background: "linear-gradient(135deg, #10B981, #00DDFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Need It
        </span>
      </div>

      <div style={{ display: "flex", gap: 50, alignItems: "flex-start" }}>
        {/* Code editor panel */}
        <div
          style={{
            width: 750,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 16,
            overflow: "hidden",
            opacity: titleSpring,
          }}
        >
          {/* Editor header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }} />
            <span style={{ fontFamily: monoFamily, fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 12 }}>custom-logic.ts</span>
          </div>
          
          {/* Code lines */}
          <div style={{ padding: "20px 24px" }}>
            {codeLines.map((line, i) => {
              const lineSpring = spring({ frame: frame - line.delay, fps, config: { damping: 15, stiffness: 200 } });
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: monoFamily,
                    fontSize: 17,
                    color: "rgba(255,255,255,0.85)",
                    padding: "4px 0",
                    opacity: lineSpring,
                    transform: `translateX(${interpolate(lineSpring, [0, 1], [20, 0])}px)`,
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.2)", marginRight: 16 }}>{i + 1}</span>
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Features list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 20 }}>
          {[
            { icon: "📝", label: "Full JS/TS Support", delay: 30 },
            { icon: "📦", label: "npm Packages", delay: 40 },
            { icon: "🔧", label: "Custom Functions", delay: 50 },
            { icon: "🧪", label: "Built-in Testing", delay: 60 },
          ].map((item, i) => {
            const s = spring({ frame: frame - item.delay, fps, config: { damping: 12 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [30, 0])}px)`,
                }}
              >
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <span style={{ fontFamily, fontSize: 22, color: "white", fontWeight: 600 }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
