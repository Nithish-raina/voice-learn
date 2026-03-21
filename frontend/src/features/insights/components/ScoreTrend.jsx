import { C } from "../../../shared/styles/colors";

export default function ScoreTrend({ data }) {
  const filtered = data.filter((d) => d.avgScore !== null);
  if (filtered.length === 0)
    return (
      <p style={{ color: C.textDim, fontSize: 13 }}>Not enough data yet</p>
    );

  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 10, color: C.textDim }}>
            {d.avgScore ?? "-"}
          </span>
          <div
            style={{
              width: "100%",
              height: d.avgScore ? `${(d.avgScore / 10) * 100}px` : 4,
              borderRadius: 5,
              background: d.avgScore
                ? `linear-gradient(to top, ${C.primary}, #8b5cf6)`
                : C.border,
            }}
          />
          <span style={{ fontSize: 10, color: C.textDim }}>
            {new Date(d.week).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
