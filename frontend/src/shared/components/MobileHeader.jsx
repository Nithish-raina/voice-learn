import { useNavigate } from "react-router-dom";
import { Brain, Settings } from "lucide-react";
import { C } from "../styles/colors";

export default function MobileHeader() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
        position: "sticky",
        top: 0,
        zIndex: 90,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
        onClick={() => navigate("/dashboard")}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={13} color="#fff" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
          VoiceLearn
        </span>
      </div>
      <button
        onClick={() => navigate("/settings")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Settings size={20} color={C.textDim} />
      </button>
    </div>
  );
}
