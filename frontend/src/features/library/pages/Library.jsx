import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessions } from "../hooks/useSessions";
import ScoreRing from "../../../shared/components/ScoreRing";
import Pill from "../../../shared/components/Pill";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { Search, Star } from "lucide-react";
import { C } from "../../../shared/styles/colors";

const subjects = [
  "All",
  "Programming",
  "Science",
  "Math",
  "Design",
  "Business",
];

export default function Library() {
  const navigate = useNavigate();
  const { data, loading, fetch } = useSessions();
  const [subject, setSubject] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch({
      subject: subject === "All" ? undefined : subject,
      search: search || undefined,
    });
  }, [subject]);

  function handleSearch(e) {
    e.preventDefault();
    fetch({
      subject: subject === "All" ? undefined : subject,
      search: search || undefined,
    });
  }

  if (loading && !data) return <LoadingSpinner />;

  return (
    <div style={{ padding: 28, maxWidth: 960, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        My Library
      </h2>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 10, marginBottom: 8 }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 14px",
            borderRadius: 8,
            background: C.input,
            border: `1px solid ${C.border}`,
          }}
        >
          <Search size={16} color={C.textDim} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: C.text,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </form>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              border: `1px solid ${subject === s ? C.primary : C.border}`,
              background: subject === s ? C.primaryDim : "transparent",
              color: subject === s ? C.primary : C.textSec,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {data?.sessions?.length === 0 && (
        <p style={{ color: C.textDim, fontSize: 13 }}>No sessions found</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {data?.sessions?.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate(`/sessions/${s.id}`)}
            style={{
              padding: 18,
              borderRadius: 12,
              background: C.card,
              border: `1px solid ${C.border}`,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <ScoreRing score={s.score || 0} size={40} strokeWidth={3} />
              {s.isMastered && (
                <Star size={16} color="#eab308" fill="#eab308" />
              )}
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              {s.topic}
            </p>
            <Pill>{s.subject}</Pill>
            <p style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
              {s.attemptCount} attempt{s.attemptCount > 1 ? "s" : ""} ·{" "}
              {new Date(s.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
