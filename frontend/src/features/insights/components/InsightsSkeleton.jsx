import Skeleton from "../../../shared/components/Skeleton";

export default function InsightsSkeleton() {
  return (
    <Skeleton>
      <div style={{ padding: 28, maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Skeleton.Bar width={100} height={20} />
          <Skeleton.Bar width={140} height={34} radius={20} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton.Card key={i} style={{ flex: 1, textAlign: "center", padding: 14 }}>
              <Skeleton.Bar width={40} height={20} style={{ margin: "0 auto" }} />
              <Skeleton.Bar width={70} height={10} style={{ margin: "8px auto 0" }} />
            </Skeleton.Card>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
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
          <div style={{ display: "flex", gap: 20 }}>
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
