import { MessageSquare, Plus } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function EmptyChat({ onCreate, disabled }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: C.primaryDim,
          border: `1px solid ${C.primaryBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MessageSquare size={24} color={C.primary} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600 }}>
        Chat With Your Knowledge
      </h3>
      <p
        style={{
          fontSize: 13,
          color: C.textDim,
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        Ask questions about everything you've learned. Your recordings, scores,
        and flashcards are searchable through AI-powered chat.
      </p>
      <button
        onClick={onCreate}
        disabled={disabled}
        style={{
          padding: "10px 24px",
          borderRadius: 10,
          background: disabled ? C.card : C.primary,
          border: disabled ? `1px solid ${C.border}` : "none",
          color: disabled ? C.textDim : "#fff",
          fontWeight: 600,
          fontSize: 14,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Plus size={16} /> {disabled ? "Conversation limit reached" : "Start a conversation"}
      </button>
    </div>
  );
}
