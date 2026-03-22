import { C } from "../../../shared/styles/colors";

const prompts = [
  "Quiz me on recent topics",
  "What should I review next?",
  "Summarize what I learned this week",
  "What are my biggest knowledge gaps?",
  "Which topics am I strongest in?",
];

export default function SuggestedPrompts({ onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: 16,
      }}
    >
      <p style={{ fontSize: 14, color: C.textDim }}>
        Try asking something like:
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          maxWidth: 500,
        }}
      >
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: C.card,
              border: `1px solid ${C.border}`,
              color: C.textSec,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
