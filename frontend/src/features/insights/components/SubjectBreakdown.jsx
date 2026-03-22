import { C } from "../../../shared/styles/colors";

const subjectColors = {
  Programming: C.primary,
  Science: C.green,
  Math: "#8b5cf6",
  Business: C.amber,
  Design: "#ec4899",
  Other: C.textSec,
};

export default function SubjectBreakdown({ data }) {
  if (!data || data.length === 0)
    return <p style={{ color: C.textDim, fontSize: 13 }}>No data yet</p>;

  return (
    <div>
      {data.map((s, i) => {
        const color = subjectColors[s.subject] || C.textSec;
        return (
          <div key={i} style={{ marginBottom: i < data.length - 1 ? 14 : 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 12, color: C.textSec }}>
                {s.subject}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color }}>
                {s.avgScore}/10
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: C.border }}>
              <div
                style={{
                  width: `${(s.avgScore / 10) * 100}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
