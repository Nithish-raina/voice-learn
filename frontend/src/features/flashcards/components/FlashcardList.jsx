import Pill from "../../../shared/components/Pill";
import { C } from "../../../shared/styles/colors";

export default function FlashcardList({ flashcards, onReview }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {flashcards.map((f) => (
        <div
          key={f.id}
          style={{
            padding: 14,
            borderRadius: 10,
            background: C.card,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: C.primaryDim,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>
              Q
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 500 }}>{f.question}</p>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Pill>{f.sourceTopic}</Pill>
              <span style={{ fontSize: 11, color: C.textDim }}>
                {f.intervalDays === 1 && f.reviewCount === 0
                  ? "First review"
                  : `${f.intervalDays} day interval`}
              </span>
            </div>
          </div>
          <button
            onClick={() => onReview(f)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              background: C.primaryDim,
              border: `1px solid ${C.primaryBorder}`,
              color: C.primary,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Review
          </button>
        </div>
      ))}
    </div>
  );
}
