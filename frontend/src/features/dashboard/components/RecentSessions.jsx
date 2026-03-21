import { useNavigate } from "react-router-dom";
import ScoreRing from "../../../shared/components/ScoreRing";
import Pill from "../../../shared/components/Pill";
import { ArrowRight } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function RecentSessions({ sessions }) {
  const navigate = useNavigate();

  if (sessions.length === 0)
    return (
      <p style={{ color: C.textDim, fontSize: 13 }}>
        No recordings yet. Start your first one!
      </p>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {sessions.map((s) => (
        <div
          key={s.id}
          onClick={() => navigate(`/sessions/${s.id}`)}
          style={{
            padding: 14,
            borderRadius: 10,
            background: C.card,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
          }}
        >
          <ScoreRing score={s.score || 0} size={42} strokeWidth={3.5} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{s.topic}</p>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Pill>{s.subject}</Pill>
              <span style={{ fontSize: 11, color: C.textDim }}>
                {Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s
                · {new Date(s.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <ArrowRight size={14} color={C.textDim} />
        </div>
      ))}
    </div>
  );
}
