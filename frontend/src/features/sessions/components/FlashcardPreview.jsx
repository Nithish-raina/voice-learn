import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function FlashcardPreview({ flashcards }) {
  const navigate = useNavigate();
  if (!flashcards || flashcards.length === 0) return null;

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        background: C.card,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <Layers size={16} color={C.primary} />
        <h4 style={{ fontSize: 13, fontWeight: 600 }}>
          Auto-Generated Flashcards
        </h4>
      </div>
      <p
        style={{
          fontSize: 12,
          color: C.textDim,
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      >
        {flashcards.length} cards targeting your gaps. These will appear in your
        daily review.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {flashcards.slice(0, 3).map((f) => (
          <div
            key={f.id}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: C.surface,
              fontSize: 12,
              color: C.textSec,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: C.primary, fontWeight: 700, fontSize: 11 }}>
              Q
            </span>
            {f.question}
          </div>
        ))}
        {flashcards.length > 3 && (
          <p style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
            +{flashcards.length - 3} more cards
          </p>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <span
          onClick={() => navigate("/flashcards")}
          style={{
            fontSize: 13,
            color: C.primary,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Review now →
        </span>
      </div>
    </div>
  );
}
