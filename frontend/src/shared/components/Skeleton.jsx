import { C } from "../styles/colors";

const shimmerKeyframes = `@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`;

function Bar({ width = "100%", height = 14, radius = 6, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, ${C.card} 25%, ${C.border} 50%, ${C.card} 75%)`,
        backgroundSize: "800px 100%",
        animation: "shimmer 1.5s infinite linear",
        ...style,
      }}
    />
  );
}

function Circle({ size = 40, style }) {
  return <Bar width={size} height={size} radius="50%" style={style} />;
}

function Card({ children, style }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 12,
        background: C.card,
        border: `1px solid ${C.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function Skeleton({ children }) {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      {children}
    </>
  );
}

Skeleton.Bar = Bar;
Skeleton.Circle = Circle;
Skeleton.Card = Card;
