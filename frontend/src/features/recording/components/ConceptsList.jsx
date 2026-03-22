import { C } from "../../../shared/styles/colors";

export default function ConceptsList({ concepts, keyTerms }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        background: C.card,
        border: `1px solid ${C.border}`,
      }}
    >
      <h4
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.primary,
          marginBottom: 8,
        }}
      >
        Extracted Concepts
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {concepts.map((c, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: C.surface,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
              {c.concept}
            </p>
            <p
              style={{
                fontSize: 12,
                color: C.textSec,
                marginTop: 4,
                lineHeight: 1.5,
              }}
            >
              {c.explanation}
            </p>
            {c.analogy && (
              <p
                style={{
                  fontSize: 12,
                  color: C.amber,
                  marginTop: 4,
                  fontStyle: "italic",
                }}
              >
                Analogy: {c.analogy}
              </p>
            )}
          </div>
        ))}
      </div>
      {keyTerms && keyTerms.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 10,
          }}
        >
          {keyTerms.map((term, i) => (
            <span
              key={i}
              style={{
                padding: "3px 10px",
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
                color: C.primary,
                background: C.primaryDim,
              }}
            >
              {term}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
