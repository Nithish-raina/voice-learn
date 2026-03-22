import { C } from "../../../shared/styles/colors";

export default function TopicRanking({ strongest, weakest }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div
        style={{
          flex: 1,
          padding: 16,
          borderRadius: 12,
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <p style={{ fontSize: 12, color: C.textDim }}>Strongest</p>
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: C.green,
            marginTop: 4,
          }}
        >
          {strongest?.topic || "N/A"}
        </p>
        <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
          Score: {strongest?.avgScore || 0}/10
        </p>
      </div>
      <div
        style={{
          flex: 1,
          padding: 16,
          borderRadius: 12,
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <p style={{ fontSize: 12, color: C.textDim }}>Needs Work</p>
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: C.amber,
            marginTop: 4,
          }}
        >
          {weakest?.topic || "N/A"}
        </p>
        <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
          Score: {weakest?.avgScore || 0}/10
        </p>
      </div>
    </div>
  );
}
