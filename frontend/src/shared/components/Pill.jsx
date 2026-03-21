import { C } from "../styles/colors";

export default function Pill({
  children,
  color = C.primary,
  bg = C.primaryDim,
}) {
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
