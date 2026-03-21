import { useNavigate } from "react-router-dom";
import { Brain, Mic, Layers } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function Landing() {
  const navigate = useNavigate();
  const steps = [
    {
      icon: <Mic size={20} color={C.primary} />,
      t: "Record",
      d: "Explain topics in your own words",
    },
    {
      icon: <Brain size={20} color={C.primary} />,
      t: "Analyze",
      d: "AI scores your understanding",
    },
    {
      icon: <Layers size={20} color={C.primary} />,
      t: "Remember",
      d: "Smart flashcards for retention",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 48,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Brain size={28} color="#fff" />
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
        VoiceLearn
      </h1>
      <p
        style={{
          fontSize: 18,
          color: C.textSec,
          margin: "8px 0 4px",
          fontWeight: 500,
        }}
      >
        Learn anything by teaching it
      </p>
      <p
        style={{
          fontSize: 14,
          color: C.textDim,
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        Record yourself explaining topics. Get AI-scored feedback. Generate
        flashcards. Remember forever.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <button
          onClick={() => navigate("/signup")}
          style={{
            padding: "12px 32px",
            borderRadius: 10,
            border: "none",
            background: C.primary,
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Get Started
        </button>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "12px 32px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: C.textSec,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Log In
        </button>
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 56 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ textAlign: "center", maxWidth: 180 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: C.card,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              {s.icon}
            </div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{s.t}</p>
            <p style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
              {s.d}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
