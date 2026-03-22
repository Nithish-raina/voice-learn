import Skeleton from "../../../shared/components/Skeleton";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";

export default function InsightsSkeleton() {
  const isMobile = useIsMobile();

  return (
    <Skeleton>
      <div style={{ padding: isMobile ? 16 : 28, maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isMobile ? 16 : 20,
          }}
        >
          <Skeleton.Bar width={100} height={20} />
          <Skeleton.Bar width={isMobile ? 80 : 140} height={34} radius={20} />
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton.Card key={i} style={{ textAlign: "center", padding: 14 }}>
              <Skeleton.Bar width={40} height={20} style={{ margin: "0 auto" }} />
              <Skeleton.Bar width={70} height={10} style={{ margin: "8px auto 0" }} />
            </Skeleton.Card>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexDirection: isMobile ? "column" : "row" }}>
          <Skeleton.Card style={{ flex: 1 }}>
            <Skeleton.Bar width={100} height={14} style={{ marginBottom: 14 }} />
            <Skeleton.Bar width="100%" height={120} />
          </Skeleton.Card>
          <Skeleton.Card style={{ flex: 1 }}>
            <Skeleton.Bar width={130} height={14} style={{ marginBottom: 14 }} />
            <Skeleton.Bar width="100%" height={120} />
          </Skeleton.Card>
        </div>

        {/* Topic ranking */}
        <Skeleton.Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ flex: 1 }}>
              <Skeleton.Bar width={100} height={12} style={{ marginBottom: 10 }} />
              <Skeleton.Bar width="80%" height={14} />
            </div>
            <div style={{ flex: 1 }}>
              <Skeleton.Bar width={100} height={12} style={{ marginBottom: 10 }} />
              <Skeleton.Bar width="80%" height={14} />
            </div>
          </div>
        </Skeleton.Card>

        {/* Activity heatmap */}
        <Skeleton.Card>
          <Skeleton.Bar width={60} height={12} style={{ marginBottom: 10 }} />
          <Skeleton.Bar width="100%" height={80} />
        </Skeleton.Card>
      </div>
    </Skeleton>
  );
}
