import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: monoFamily } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

const integrations = [
  { name: "Slack", icon: "💬", color: "#E01E5A" },
  { name: "GitHub", icon: "🐙", color: "#6e5494" },
  { name: "Notion", icon: "📓", color: "#FFFFFF" },
  { name: "Google Sheets", icon: "📊", color: "#34A853" },
  { name: "PostgreSQL", icon: "🐘", color: "#336791" },
  { name: "Stripe", icon: "💳", color: "#635BFF" },
  { name: "Twilio", icon: "📱", color: "#F22F46" },
  { name: "SendGrid", icon: "✉️", color: "#1A82E2" },
  { name: "AWS S3", icon: "☁️", color: "#FF9900" },
  { name: "OpenAI", icon: "🧠", color: "#10A37F" },
  { name: "Discord", icon: "🎮", color: "#5865F2" },
  { name: "Jira", icon: "📋", color: "#0052CC" },
  { name: "MongoDB", icon: "🍃", color: "#47A248" },
  { name: "Redis", icon: "🔴", color: "#DC382D" },
  { name: "Zapier", icon: "⚡", color: "#FF4A00" },
  { name: "HubSpot", icon: "🧲", color: "#FF7A59" },
  { name: "Salesforce", icon: "☁️", color: "#00A1E0" },
  { name: "Shopify", icon: "🛍️", color: "#96BF48" },
];

export const Scene6Integrations: React.FC = () => {
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
          marginBottom: 20,
        }}
      >
        <span style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          500+
        </span>{" "}
        Integrations
      </div>
      <div style={{ fontFamily, fontSize: 22, color: "rgba(255,255,255,0.5)", marginBottom: 50, opacity: titleSpring }}>
        Connect to everything your team uses
      </div>

      {/* Integration grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, maxWidth: 1400, justifyContent: "center" }}>
        {integrations.map((int, i) => {
          const row = Math.floor(i / 6);
          const col = i % 6;
          const delay = 15 + row * 8 + col * 4;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 200 } });
          const float = Math.sin((frame + i * 12) * 0.04) * 3;
          return (
            <div
              key={int.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: `${int.color}15`,
                border: `1px solid ${int.color}40`,
                borderRadius: 12,
                padding: "12px 20px",
                minWidth: 190,
                opacity: s,
                transform: `scale(${interpolate(s, [0, 1], [0.7, 1])}) translateY(${float}px)`,
              }}
            >
              <span style={{ fontSize: 24 }}>{int.icon}</span>
              <span style={{ fontFamily: monoFamily, fontSize: 15, color: "white", fontWeight: 500 }}>{int.name}</span>
            </div>
          );
        })}
      </div>

      {/* "+482 more" badge */}
      <div
        style={{
          marginTop: 30,
          opacity: spring({ frame: frame - 70, fps, config: { damping: 20 } }),
          fontFamily: monoFamily,
          fontSize: 18,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        + 482 more connectors available
      </div>
    </AbsoluteFill>
  );
};
