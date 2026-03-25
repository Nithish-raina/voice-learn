import { useState, useEffect, useRef } from "react";
import { C } from "../../../shared/styles/colors";

export default function RecordingActive({ topic, maxSeconds, onStop }) {
  const [seconds, setSeconds] = useState(0);
  const [bars, setBars] = useState(Array(40).fill(4));
  const [autoStopped, setAutoStopped] = useState(false);
  const stoppedRef = useRef(false);
  const timerIdRef = useRef(null);
  const barsIdRef = useRef(null);
  const stopTimeoutRef = useRef(null);

  function clearAllTimers() {
    clearInterval(timerIdRef.current);
    clearInterval(barsIdRef.current);
    clearTimeout(stopTimeoutRef.current);
  }

  // 1-second timer for elapsed time and auto-stop
  useEffect(() => {
    timerIdRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (maxSeconds && next >= maxSeconds && !stoppedRef.current) {
          stoppedRef.current = true;
          setAutoStopped(true);
          clearAllTimers();
          stopTimeoutRef.current = setTimeout(() => onStop(), 2500);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerIdRef.current);
  }, [maxSeconds, onStop]);

  // Fast animation for audio bars
  useEffect(() => {
    barsIdRef.current = setInterval(() => {
      setBars(Array.from({ length: 40 }, () => 4 + Math.random() * 30));
    }, 200);
    return () => clearInterval(barsIdRef.current);
  }, []);

  // Clean up everything on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const remaining = maxSeconds ? Math.max(0, maxSeconds - seconds) : null;
  const nearLimit = remaining !== null && remaining <= 10;

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

      {autoStopped && (
        <div
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
            Time limit reached — submitting your recording for evaluation.
          </p>
        </div>
      )}

      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: nearLimit ? "#ef4444" : undefined,
        }}
      >
        {fmt(seconds)}
      </div>

      {remaining !== null && !autoStopped && (
        <p
          style={{
            fontSize: 12,
            color: nearLimit ? "#ef4444" : C.textDim,
            fontWeight: nearLimit ? 600 : 400,
            margin: 0,
          }}
        >
          {remaining > 0
            ? `${fmt(remaining)} remaining`
            : "Time's up!"}
        </p>
      )}

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
              background: nearLimit ? "#ef4444" : C.primary,
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
        disabled={autoStopped}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: autoStopped ? "#9ca3af" : "#ef4444",
          border: "none",
          cursor: autoStopped ? "default" : "pointer",
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
