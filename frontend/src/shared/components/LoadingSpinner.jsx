import { C } from "../styles/colors";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `3px solid ${C.primary}`,
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: C.textDim, fontSize: 13 }}>{message}</p>
    </div>
  );
}
