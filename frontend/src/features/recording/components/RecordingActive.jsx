import { useState, useEffect, useRef } from "react";
import { C } from "../../../shared/styles/colors";

export default function RecordingActive({ topic, onStop }) {
  const [seconds, setSeconds] = useState(0);
  const [bars, setBars] = useState(Array(40).fill(4));
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
      setBars(Array.from({ length: 40 }, () => 4 + Math.random() * 30));
    }, 200);
    return () => clearInterval(timerRef.current);
  }, []);

  const fmt = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: 40,
        gap: 24,
      }}
    >
      <div
        style={{
          padding: "8px 20px",
          borderRadius: 10,
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <p style={{ fontSize: 13, color: C.textSec }}>
          Explain <strong style={{ color: C.text }}>{topic}</strong> as if
          teaching someone new
        </p>
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fmt(seconds)}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          height: 50,
          width: "100%",
          maxWidth: 500,
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: h,
              borderRadius: 2,
              background: C.primary,
              opacity: 0.4 + Math.random() * 0.6,
              transition: "height 0.12s",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 13, color: C.textDim }}>
        Recording... speak naturally
      </p>
      <button
        onClick={onStop}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#ef4444",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        <div
          style={{ width: 18, height: 18, borderRadius: 3, background: "#fff" }}
        />
      </button>
    </div>
  );
}
