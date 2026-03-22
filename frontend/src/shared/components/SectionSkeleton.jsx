import { C } from "../styles/colors";

export default function SectionSkeleton({ message, height = 80 }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        background: C.card,
        border: `1px solid ${C.border}`,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <p style={{ fontSize: 13, color: C.textDim }}>{message}</p>
    </div>
  );
}
