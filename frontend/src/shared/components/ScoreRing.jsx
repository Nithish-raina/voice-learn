import { useState, useEffect } from "react";

export default function ScoreRing({ score, size = 56, strokeWidth = 4 }) {
  const [progress, setProgress] = useState(0);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const color = score >= 7 ? "#22c55e" : score >= 4 ? "#eab308" : "#ef4444";

  useEffect(() => {
    const t = setTimeout(() => setProgress(score / 10), 80);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#23232f"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.28,
          fontWeight: 700,
          color,
        }}
      >
        {Math.round(progress * 10)}
      </div>
    </div>
  );
}
