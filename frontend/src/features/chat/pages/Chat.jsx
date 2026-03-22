import { MessageSquare } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function Chat() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: 40,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: C.primaryDim,
          border: `1px solid ${C.primaryBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <MessageSquare size={28} color={C.primary} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        Chat With Your Knowledge
      </h2>
      <p
        style={{
          fontSize: 14,
          color: C.textDim,
          maxWidth: 400,
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        Ask questions about everything you've learned. Your recordings, scores,
        and flashcards will be searchable through an AI-powered chat.
      </p>
      <div
        style={{
          padding: "10px 24px",
          borderRadius: 10,
          background: C.amberDim,
          border: `1px solid ${C.amberBorder}`,
          color: C.amber,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Coming Soon
      </div>
    </div>
  );
}
