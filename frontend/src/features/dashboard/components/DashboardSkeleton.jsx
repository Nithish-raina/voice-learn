import Skeleton from "../../../shared/components/Skeleton";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";

export default function DashboardSkeleton() {
  const isMobile = useIsMobile();
  const p = isMobile ? 16 : 28;

  return (
    <Skeleton>
      <div style={{ padding: p, maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isMobile ? 16 : 24,
          }}
        >
          <div>
            <Skeleton.Bar width={100} height={12} />
            <Skeleton.Bar width={180} height={22} style={{ marginTop: 8 }} />
          </div>
          <Skeleton.Bar width={110} height={34} radius={20} />
        </div>

        {/* Content */}
        <div style={{ display: "flex", gap: isMobile ? 16 : 20, flexDirection: isMobile ? "column" : "row" }}>
          {/* Recent sessions */}
          <div style={{ flex: 1.5 }}>
            <Skeleton.Bar width={160} height={14} style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton.Card key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Skeleton.Circle size={40} />
                    <div style={{ flex: 1 }}>
                      <Skeleton.Bar width="70%" height={14} />
                      <Skeleton.Bar width="40%" height={11} style={{ marginTop: 8 }} />
                    </div>
                  </div>
                </Skeleton.Card>
              ))}
            </div>
          </div>

          {/* Activity sidebar */}
          <div style={{ flex: 1 }}>
            <Skeleton.Bar width={80} height={14} style={{ marginBottom: 12 }} />
            <Skeleton.Card style={{ height: 140, marginBottom: 10 }}>
              <Skeleton.Bar width="100%" height="100%" />
            </Skeleton.Card>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2].map((i) => (
                <Skeleton.Card key={i} style={{ flex: 1, textAlign: "center" }}>
                  <Skeleton.Bar width={40} height={20} style={{ margin: "0 auto" }} />
                  <Skeleton.Bar width={60} height={10} style={{ margin: "8px auto 0" }} />
                </Skeleton.Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Skeleton>
  );
}
