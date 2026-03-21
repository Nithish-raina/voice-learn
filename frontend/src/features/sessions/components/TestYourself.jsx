import { useState } from "react";
import { C } from "../../../shared/styles/colors";

export default function TestYourself({ qas }) {
  const [open, setOpen] = useState(null);
  if (!qas || qas.length === 0) return null;

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
          color: "#8b5cf6",
          marginBottom: 6,
        }}
      >
        🤔 Test Yourself
      </h4>
      <p style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>
        Think about each question, then click to reveal
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {qas.map((qa, i) => (
          <div
            key={i}
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              borderRadius: 8,
              background: C.surface,
              cursor: "pointer",
              border: `1px solid ${open === i ? C.primaryBorder : "transparent"}`,
              transition: "border-color 0.15s",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: C.text,
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {qa.question}
              </p>
              <span
                style={{
                  fontSize: 16,
                  color: C.textDim,
                  transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                }}
              >
                ▾
              </span>
            </div>
            {open === i && (
              <div
                style={{
                  padding: "0 12px 12px",
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: C.green,
                    lineHeight: 1.65,
                  }}
                >
                  {qa.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
