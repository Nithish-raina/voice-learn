import { useNavigate } from "react-router-dom";
import { C } from "../styles/colors";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 48, fontWeight: 700, color: C.text }}>404</h1>
      <p style={{ fontSize: 15, color: C.textDim }}>
        This page doesn't exist yet.
      </p>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 24px",
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          background: C.card,
          color: C.text,
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          marginTop: 8,
        }}
      >
        Go back
      </button>
    </div>
  );
}
