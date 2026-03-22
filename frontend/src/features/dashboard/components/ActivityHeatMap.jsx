import { C } from "../../../shared/styles/colors";

const hColors = [
  "transparent",
  "rgba(99,102,241,0.15)",
  "rgba(99,102,241,0.35)",
  "#6366f1",
];

export default function ActivityHeatmap({ data }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        background: C.card,
        border: `1px solid ${C.border}`,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              aspectRatio: "1",
              borderRadius: 3,
              background:
                d.count === 0 ? C.border : hColors[Math.min(d.count, 3)],
            }}
            title={`${d.date}: ${d.count} recordings`}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: 10,
          color: C.textDim,
        }}
      >
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
