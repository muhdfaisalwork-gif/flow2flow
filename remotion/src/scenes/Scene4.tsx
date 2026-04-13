import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

const fullMessage = "Build me a lead generation workflow";

export const Scene4AIAssistant: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  // Typewriter effect
  const charsVisible = Math.min(Math.floor(frame * 0.8), fullMessage.length);
  const typedText = fullMessage.slice(0, charsVisible);
  const cursorOpacity = Math.round(frame * 0.1) % 2 === 0 ? 1 : 0;

  // AI response nodes appearing after typing is done
  const typingDone = charsVisible >= fullMessage.length;
  const responseDelay = typingDone ? frame - Math.ceil(fullMessage.length / 0.8) : -100;

  const responseNodes = [
    { label: "Webhook Trigger", icon: "⚡", delay: 10 },
    { label: "AI Extract", icon: "🤖", delay: 22 },
    { label: "Filter Leads", icon: "🔍", delay: 34 },
    { label: "Send Email", icon: "📧", delay: 46 },
  ];

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
        <span style={{ background: "linear-gradient(135deg, #8B5CF6, #00DDFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AI-Powered
        </span>{" "}
        Workflow Generation
      </div>

      <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
        {/* Chat panel */}
        <div
          style={{
            width: 600,
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 16,
            padding: 30,
            opacity: titleSpring,
          }}
        >
          <div style={{ fontFamily: monoFamily, fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>AI Assistant</div>
          <div
            style={{
              fontFamily,
              fontSize: 22,
              color: "white",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 12,
              padding: "16px 20px",
              minHeight: 60,
            }}
          >
            {typedText}
            <span style={{ opacity: cursorOpacity, color: "#3B82F6" }}>|</span>
          </div>
          {typingDone && (
            <div
              style={{
                marginTop: 20,
                fontFamily: monoFamily,
                fontSize: 15,
                color: "rgba(139,92,246,0.8)",
                opacity: spring({ frame: responseDelay, fps, config: { damping: 20 } }),
              }}
            >
              ✨ Generating workflow...
            </div>
          )}
        </div>

        {/* Generated nodes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {responseNodes.map((node, i) => {
            const s = spring({ frame: responseDelay - node.delay, fps, config: { damping: 12 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  borderRadius: 12,
                  padding: "14px 24px",
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
                }}
              >
                <span style={{ fontSize: 24 }}>{node.icon}</span>
                <span style={{ fontFamily: monoFamily, fontSize: 18, color: "white", fontWeight: 500 }}>{node.label}</span>
              </div>
            );
          })}

          {/* Connection arrow hint */}
          {responseDelay > 50 && (
            <div style={{ fontFamily: monoFamily, fontSize: 14, color: "rgba(0,221,255,0.6)", textAlign: "center", marginTop: 8, opacity: spring({ frame: responseDelay - 55, fps, config: { damping: 20 } }) }}>
              → Auto-connected
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
