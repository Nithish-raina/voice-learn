import { Target, Calendar, Check, Layers } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function FlashcardStats({ stats }) {
  const items = [
    {
      l: "Due Today",
      v: stats.dueToday,
      icon: <Target size={18} color={C.primary} />,
      c: C.primary,
      bg: C.primaryDim,
    },
    {
      l: "Upcoming",
      v: stats.upcoming,
      icon: <Calendar size={18} color={C.amber} />,
      c: C.amber,
      bg: C.amberDim,
    },
    {
      l: "Mastered",
      v: stats.mastered,
      icon: <Check size={18} color={C.green} />,
      c: C.green,
      bg: C.greenDim,
    },
    {
      l: "Total",
      v: stats.total,
      icon: <Layers size={18} color={C.textSec} />,
      c: C.textSec,
      bg: C.card,
    },
  ];

  return (
    <div style={{ display: "flex", gap: 10 }}>
      {items.map((s, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 10,
            background: s.bg,
            border: `1px solid ${C.border}`,
            textAlign: "center",
          }}
        >
          {s.icon}
          <p
            style={{ fontSize: 18, fontWeight: 700, color: s.c, marginTop: 6 }}
          >
            {s.v}
          </p>
          <p style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{s.l}</p>
        </div>
      ))}
    </div>
  );
}
