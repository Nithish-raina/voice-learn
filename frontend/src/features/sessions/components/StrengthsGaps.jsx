import { C } from "../../../shared/styles/colors";

export default function StrengthsGaps({ strengths, gaps }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div
        style={{
          flex: 1,
          padding: 14,
          borderRadius: 10,
          background: C.greenDim,
          border: `1px solid ${C.greenBorder}`,
        }}
      >
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.green,
            marginBottom: 6,
          }}
        >
          ✦ Strengths
        </h4>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
          {strengths}
        </p>
      </div>
      <div
        style={{
          flex: 1,
          padding: 14,
          borderRadius: 10,
          background: C.amberDim,
          border: `1px solid ${C.amberBorder}`,
        }}
      >
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.amber,
            marginBottom: 6,
          }}
        >
          ⚡ Gaps Detected
        </h4>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{gaps}</p>
      </div>
    </div>
  );
}
