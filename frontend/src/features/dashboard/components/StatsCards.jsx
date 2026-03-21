import { C } from "../../../shared/styles/colors";

export default function StatsCards({ stats }) {
  const items = [
    { l: "Topics", v: stats.totalTopics },
    { l: "Avg Score", v: stats.avgScore },
    { l: "Total Time", v: `${Math.round(stats.totalTimeSeconds / 60)}m` },
  ];

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {items.map((s, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 10,
            background: C.card,
            border: `1px solid ${C.border}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 700 }}>{s.v}</p>
          <p style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{s.l}</p>
        </div>
      ))}
    </div>
  );
}
