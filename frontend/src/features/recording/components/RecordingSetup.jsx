import { C } from "../../../shared/styles/colors";

const subjects = [
  "Programming",
  "Science",
  "Math",
  "Design",
  "Business",
  "Other",
];
const difficulties = ["beginner", "intermediate", "advanced"];

export default function RecordingSetup({
  topic,
  setTopic,
  subject,
  setSubject,
  difficulty,
  setDifficulty,
  onStart,
  loading,
  error,
}) {
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    background: C.input,
    border: `1px solid ${C.border}`,
    color: C.text,
    fontSize: 14,
    outline: "none",
  };

  return (
    <div style={{ padding: 28, maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
        New Recording
      </h2>
      {error && (
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: C.redDim,
            border: `1px solid ${C.redBorder}`,
            color: C.red,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label
            style={{
              fontSize: 12,
              color: C.textDim,
              display: "block",
              marginBottom: 6,
            }}
          >
            What are you explaining today?
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. How HTTP Works"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: C.textDim,
              display: "block",
              marginBottom: 6,
            }}
          >
            Subject
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: `1px solid ${subject === s ? C.primary : C.border}`,
                  background: subject === s ? C.primaryDim : "transparent",
                  color: subject === s ? C.primary : C.textSec,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: C.textDim,
              display: "block",
              marginBottom: 6,
            }}
          >
            Difficulty
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: `1px solid ${difficulty === d ? C.primary : C.border}`,
                  background: difficulty === d ? C.primaryDim : "transparent",
                  color: difficulty === d ? C.primary : C.textSec,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onStart}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 28,
          padding: "13px 0",
          borderRadius: 10,
          border: "none",
          background: C.primary,
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Starting..." : "🎤 Start Recording"}
      </button>
    </div>
  );
}
