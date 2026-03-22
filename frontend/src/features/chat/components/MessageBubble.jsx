import { useNavigate } from "react-router-dom";
import { C } from "../../../shared/styles/colors";

export default function MessageBubble({ message }) {
  const navigate = useNavigate();
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: 14,
          borderRadius: 12,
          background: isUser ? C.primaryDim : C.card,
          border: `1px solid ${isUser ? C.primaryBorder : C.border}`,
          borderTopRightRadius: isUser ? 3 : 12,
          borderTopLeftRadius: isUser ? 12 : 3,
        }}
      >
        <p style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
          {message.content}
        </p>
        {message.sources && message.sources.length > 0 && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}
          >
            {message.sources.map((s, i) => (
              <span
                key={i}
                onClick={() => navigate(`/sessions/${s.sessionId}`)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#8b5cf6",
                  background: "rgba(139,92,246,0.12)",
                  cursor: "pointer",
                }}
              >
                {s.topic}
              </span>
            ))}
          </div>
        )}
        <p style={{ fontSize: 10, color: C.textDim, marginTop: 6 }}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
