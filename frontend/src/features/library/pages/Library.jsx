import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSessions } from "../hooks/useSessions";
import ScoreRing from "../../../shared/components/ScoreRing";
import Pill from "../../../shared/components/Pill";
import LibrarySkeleton from "../components/LibrarySkeleton";
import { Search, X, Star, Loader } from "lucide-react";
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
  const debounceRef = useRef(null);
  const initialLoad = useRef(true);

  function doFetch(searchVal, subjectVal) {
    fetch({
      subject: subjectVal === "All" ? undefined : subjectVal,
      search: searchVal || undefined,
    });
  }

  // Initial load + subject changes fire immediately
  useEffect(() => {
    initialLoad.current = false;
    doFetch(search, subject);
  }, [subject]);

  // Debounced search — 400ms after user stops typing
  useEffect(() => {
    if (initialLoad.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doFetch(search, subject);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  if (loading && !data) return <LibrarySkeleton />;

  const isSearching = loading && !!data;

  return (
    <div style={{ padding: 28, maxWidth: 960, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        My Library
      </h2>

      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderRadius: 8,
          background: C.input,
          border: `1px solid ${search ? C.primary : C.border}`,
          marginBottom: 8,
          transition: "border-color 0.2s",
        }}
      >
        {isSearching ? (
          <Loader
            size={16}
            color={C.primary}
            style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
          />
        ) : (
          <Search size={16} color={C.textDim} style={{ flexShrink: 0 }} />
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} color={C.textDim} />
          </button>
        )}
      </div>

      {/* Searching indicator */}
      <div style={{ height: 20, marginBottom: 2 }}>
        {isSearching && (
          <p style={{ fontSize: 12, color: C.textDim }}>
            Searching...
          </p>
        )}
        {!isSearching && search && data?.sessions && (
          <p style={{ fontSize: 12, color: C.textDim }}>
            {data.sessions.length} result{data.sessions.length !== 1 ? "s" : ""} for "{search}"
          </p>
        )}
      </div>

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

      {!isSearching && data?.sessions?.length === 0 && (
        <p style={{ color: C.textDim, fontSize: 13 }}>
          {search ? `No results for "${search}"` : "No sessions found"}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          opacity: isSearching ? 0.5 : 1,
          transition: "opacity 0.2s",
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
