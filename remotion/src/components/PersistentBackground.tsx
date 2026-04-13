import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const orbX1 = interpolate(frame, [0, 600], [0, 200], { extrapolateRight: "clamp" });
  const orbY1 = Math.sin(frame * 0.02) * 50;
  const orbX2 = interpolate(frame, [0, 600], [100, -100], { extrapolateRight: "clamp" });
  const orbY2 = Math.cos(frame * 0.015) * 40;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)" }}>
      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.8,
        }}
      />
      {/* Blue orb */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
          left: 300 + orbX1,
          top: 200 + orbY1,
          filter: "blur(40px)",
        }}
      />
      {/* Purple orb */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          right: 200 + orbX2,
          bottom: 150 + orbY2,
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};
