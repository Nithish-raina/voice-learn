import { C } from "../../../shared/styles/colors";

export default function Transcript({ text }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 10,
        background: C.card,
        border: `1px solid ${C.border}`,
      }}
    >
      <h4
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.textSec,
          marginBottom: 10,
        }}
      >
        Transcript
      </h4>
      <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.75 }}>
        "{text}"
      </p>
    </div>
  );
}
