import Skeleton from "../../../shared/components/Skeleton";

export default function ResultsSkeleton() {
  return (
    <Skeleton>
      <div style={{ padding: 28, maxWidth: 960, margin: "0 auto" }}>
        {/* Back button */}
        <Skeleton.Bar width={110} height={14} style={{ marginBottom: 20 }} />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <Skeleton.Bar width={260} height={22} style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <Skeleton.Bar width={80} height={22} radius={12} />
              <Skeleton.Bar width={65} height={22} radius={12} />
              <Skeleton.Bar width={100} height={14} style={{ marginTop: 4 }} />
            </div>
          </div>
          <Skeleton.Circle size={76} />
        </div>

        {/* Strengths & Gaps */}
        <Skeleton.Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <Skeleton.Bar width={80} height={13} style={{ marginBottom: 10 }} />
              {[1, 2, 3].map((i) => (
                <Skeleton.Bar key={i} width="90%" height={12} style={{ marginBottom: 8 }} />
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <Skeleton.Bar width={60} height={13} style={{ marginBottom: 10 }} />
              {[1, 2].map((i) => (
                <Skeleton.Bar key={i} width="85%" height={12} style={{ marginBottom: 8 }} />
              ))}
            </div>
          </div>
        </Skeleton.Card>

        {/* Transcript */}
        <Skeleton.Card style={{ marginBottom: 16 }}>
          <Skeleton.Bar width={80} height={13} style={{ marginBottom: 12 }} />
          <Skeleton.Bar width="100%" height={11} style={{ marginBottom: 6 }} />
          <Skeleton.Bar width="95%" height={11} style={{ marginBottom: 6 }} />
          <Skeleton.Bar width="70%" height={11} />
        </Skeleton.Card>

        {/* Bottom row */}
        <div style={{ display: "flex", gap: 12 }}>
          <Skeleton.Card style={{ flex: 1 }}>
            <Skeleton.Bar width={100} height={14} style={{ marginBottom: 12 }} />
            <Skeleton.Bar width="100%" height={60} />
          </Skeleton.Card>
          <Skeleton.Card style={{ flex: 1 }}>
            <Skeleton.Bar width={90} height={14} style={{ marginBottom: 12 }} />
            <Skeleton.Bar width="100%" height={60} />
          </Skeleton.Card>
        </div>
      </div>
    </Skeleton>
  );
}
