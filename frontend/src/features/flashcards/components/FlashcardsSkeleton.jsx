import Skeleton from "../../../shared/components/Skeleton";

export default function FlashcardsSkeleton() {
  return (
    <Skeleton>
      <div style={{ padding: 28, maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Skeleton.Bar width={130} height={20} />
          <Skeleton.Bar width={280} height={12} style={{ marginTop: 8 }} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton.Card key={i} style={{ flex: 1, textAlign: "center", padding: 14 }}>
              <Skeleton.Bar width={30} height={20} style={{ margin: "0 auto" }} />
              <Skeleton.Bar width={60} height={10} style={{ margin: "8px auto 0" }} />
            </Skeleton.Card>
          ))}
        </div>

        {/* Due Today section */}
        <Skeleton.Bar width={90} height={15} style={{ marginBottom: 6 }} />
        <Skeleton.Bar width={240} height={11} style={{ marginBottom: 14 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton.Card key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <Skeleton.Bar width="65%" height={14} />
                  <Skeleton.Bar width={60} height={20} radius={12} style={{ marginTop: 8 }} />
                </div>
                <Skeleton.Bar width={70} height={32} radius={6} />
              </div>
            </Skeleton.Card>
          ))}
        </div>
      </div>
    </Skeleton>
  );
}
