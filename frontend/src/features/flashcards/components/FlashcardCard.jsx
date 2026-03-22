import { C } from "../../../shared/styles/colors";

const ratingButtons = [
  {
    l: "Forgot",
    sub: "Review tomorrow",
    c: C.red,
    bg: C.redDim,
    b: C.redBorder,
  },
  {
    l: "Hard",
    sub: "Review in 2 days",
    c: C.amber,
    bg: C.amberDim,
    b: C.amberBorder,
  },
  {
    l: "Good",
    sub: "Review in 5 days",
    c: C.primary,
    bg: C.primaryDim,
    b: C.primaryBorder,
  },
  {
    l: "Easy",
    sub: "Review in 12 days",
    c: C.green,
    bg: C.greenDim,
    b: C.greenBorder,
  },
];

export default function FlashcardCard({ flashcard, flipped, onFlip, onRate }) {
  return (
    <div>
      <div
        onClick={onFlip}
        style={{
          width: "100%",
          padding: 32,
          borderRadius: 14,
          background: C.card,
          border: `1px solid ${flipped ? C.primaryBorder : C.border}`,
          cursor: "pointer",
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transition: "border-color 0.2s",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: flipped ? C.primary : C.textDim,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          {flipped ? "Answer" : "Question"}
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7 }}>
          {flipped ? flashcard.answer : flashcard.question}
        </p>
        {!flipped && (
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 20 }}>
            Think about your answer, then click to reveal
          </p>
        )}
      </div>

      {flipped && (
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              fontSize: 12,
              color: C.textDim,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            How well did you know this?
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {ratingButtons.map((b, i) => (
              <button
                key={i}
                onClick={() => onRate(["forgot", "hard", "good", "easy"][i])}
                style={{
                  padding: "12px 8px",
                  borderRadius: 8,
                  border: `1px solid ${b.b}`,
                  background: b.bg,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <p style={{ fontWeight: 600, fontSize: 13, color: b.c }}>
                  {b.l}
                </p>
                <p style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>
                  {b.sub}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
