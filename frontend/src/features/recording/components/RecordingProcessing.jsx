import { C } from "../../../shared/styles/colors";

const stages = [
  { key: "transcribing", label: "Transcribing your explanation" },
  { key: "extracting_concepts", label: "Extracting key concepts" },
  { key: "evaluating", label: "Evaluating accuracy & completeness" },
  { key: "scoring", label: "Generating score & feedback" },
];

export default function RecordingProcessing({ status }) {
  const currentIdx = stages.findIndex((s) => s.key === status);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: 40,
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: `4px solid ${C.border}`,
          borderTopColor: C.primary,
          animation: "spin 0.9s linear infinite",
          marginBottom: 28,
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Current stage text */}
      <p
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: C.text,
          marginBottom: 32,
        }}
      >
        {stages.find((s) => s.key === status)?.label || "Processing..."}
      </p>

      {/* Stage progress */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 280 }}>
        {stages.map((stage, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          return (
            <div
              key={stage.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? C.green
                    : isActive
                      ? C.primary
                      : C.border,
                  flexShrink: 0,
                  transition: "background 0.3s",
                }}
              >
                {isDone ? (
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: isDone ? C.green : isActive ? C.text : C.textDim,
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.3s",
                }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
