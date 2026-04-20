import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from "remotion";

// Deterministic pseudo-random
const rand = (i: number) => {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  x: rand(i + 1) * 1920,
  y: rand(i + 2) * 1080,
  size: 2 + rand(i + 3) * 4,
  speed: 0.3 + rand(i + 4) * 0.8,
  drift: rand(i + 5) * Math.PI * 2,
  hue: rand(i + 6) > 0.5 ? "59,130,246" : "139,92,246",
  twinkle: 0.4 + rand(i + 7) * 0.6,
}));

const STREAMS = Array.from({ length: 8 }, (_, i) => ({
  startX: rand(i * 11 + 1) * 1920,
  startY: rand(i * 11 + 2) * 1080,
  angle: rand(i * 11 + 3) * Math.PI * 2,
  length: 80 + rand(i * 11 + 4) * 120,
  speed: 1.2 + rand(i * 11 + 5) * 1.5,
  hue: rand(i * 11 + 6) > 0.5 ? "0,221,255" : "139,92,246",
}));

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slowly rotating gradient hue
  const gradientShift = interpolate(frame, [0, durationInFrames], [0, 30]);

  // Camera-like parallax orbs
  const orbX1 = Math.sin(frame * 0.008) * 300;
  const orbY1 = Math.cos(frame * 0.012) * 150;
  const orbX2 = Math.cos(frame * 0.01) * 250;
  const orbY2 = Math.sin(frame * 0.014) * 180;
  const orbX3 = Math.sin(frame * 0.006 + 1.5) * 200;
  const orbY3 = Math.cos(frame * 0.009 + 0.8) * 220;

  // Grid pulse
  const gridPulse = 0.4 + Math.sin(frame * 0.04) * 0.15;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientShift}deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)`,
      }}
    >
      {/* Animated grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          backgroundPosition: `${(frame * 0.5) % 60}px ${(frame * 0.3) % 60}px`,
          opacity: gridPulse,
        }}
      />

      {/* Large drifting orbs */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)",
          left: 200 + orbX1,
          top: 100 + orbY1,
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.24) 0%, transparent 70%)",
          right: 100 + orbX2,
          bottom: 50 + orbY2,
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,221,255,0.18) 0%, transparent 70%)",
          left: 800 + orbX3,
          top: 400 + orbY3,
          filter: "blur(40px)",
        }}
      />

      {/* Floating particles */}
      <svg style={{ position: "absolute", inset: 0 }} width={1920} height={1080}>
        {PARTICLES.map((p, i) => {
          const yPos = ((p.y - frame * p.speed * 2) % 1180 + 1180) % 1180 - 50;
          const xPos = p.x + Math.sin(frame * 0.02 + p.drift) * 30;
          const twinkle = 0.3 + Math.abs(Math.sin(frame * 0.05 + i)) * p.twinkle;
          return (
            <circle
              key={i}
              cx={xPos}
              cy={yPos}
              r={p.size}
              fill={`rgba(${p.hue},${twinkle})`}
              style={{ filter: `blur(${p.size > 4 ? 1 : 0}px)` }}
            />
          );
        })}

        {/* Data streams - shooting lines */}
        {STREAMS.map((s, i) => {
          const cycle = 90;
          const localFrame = (frame + i * 11) % cycle;
          const progress = localFrame / cycle;
          const fade = Math.sin(progress * Math.PI);
          const x1 = s.startX + Math.cos(s.angle) * s.length * progress;
          const y1 = s.startY + Math.sin(s.angle) * s.length * progress;
          const x2 = s.startX + Math.cos(s.angle) * s.length * Math.max(0, progress - 0.2);
          const y2 = s.startY + Math.sin(s.angle) * s.length * Math.max(0, progress - 0.2);
          return (
            <line
              key={`s-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`rgba(${s.hue},${fade * 0.8})`}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
