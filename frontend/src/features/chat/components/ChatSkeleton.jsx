import Skeleton from "../../../shared/components/Skeleton";
import { C } from "../../../shared/styles/colors";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";

function ConversationListSkeleton() {
  return (
    <div
      style={{
        width: 260,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "16px 16px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton.Bar width={100} height={14} />
        <Skeleton.Bar width={28} height={28} radius={6} />
      </div>
      <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Skeleton.Bar width={14} height={14} radius={3} />
              <Skeleton.Bar width={`${65 - i * 8}%`} height={13} />
            </div>
            <div style={{ paddingLeft: 22, marginTop: 6 }}>
              <Skeleton.Bar width={`${80 - i * 5}%`} height={11} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesSkeleton() {
  const bubbles = [
    { align: "right", widths: ["70%"] },
    { align: "left", widths: ["80%", "60%"] },
    { align: "right", widths: ["50%"] },
    { align: "left", widths: ["75%", "65%", "40%"] },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px 0",
        overflowY: "hidden",
      }}
    >
      {bubbles.map((b, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: b.align === "right" ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: b.align === "right" ? C.primaryDim : C.card,
              border: `1px solid ${b.align === "right" ? C.primaryBorder : C.border}`,
              borderTopRightRadius: b.align === "right" ? 3 : 12,
              borderTopLeftRadius: b.align === "left" ? 3 : 12,
              maxWidth: "70%",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {b.widths.map((w, j) => (
              <Skeleton.Bar key={j} width={w} height={12} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatSkeleton() {
  const isMobile = useIsMobile();

  return (
    <Skeleton>
      <div style={{ display: "flex", height: isMobile ? "calc(100vh - 112px)" : "100%", position: "relative" }}>
        {/* Conversation list skeleton — hidden on mobile */}
        {!isMobile && <ConversationListSkeleton />}

        {/* Main chat area skeleton */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: isMobile ? "0 14px" : "0 24px",
            minWidth: 0,
          }}
        >
          {/* Header skeleton */}
          <div
            style={{
              padding: "16px 0",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <Skeleton.Bar width={180} height={18} />
              <Skeleton.Bar width={240} height={12} style={{ marginTop: 6 }} />
            </div>
          </div>

          <MessagesSkeleton />

          {/* Input skeleton */}
          <div style={{ padding: "12px 0" }}>
            <Skeleton.Bar width="100%" height={44} radius={10} />
          </div>
        </div>
      </div>
    </Skeleton>
  );
}

export { MessagesSkeleton };
