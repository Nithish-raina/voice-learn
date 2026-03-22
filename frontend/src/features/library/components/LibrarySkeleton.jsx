import Skeleton from "../../../shared/components/Skeleton";
import { C } from "../../../shared/styles/colors";

export default function LibrarySkeleton() {
  return (
    <Skeleton>
      <div style={{ padding: 28, maxWidth: 960, margin: "0 auto" }}>
        <Skeleton.Bar width={120} height={20} style={{ marginBottom: 16 }} />

        {/* Search bar */}
        <Skeleton.Bar width="100%" height={38} radius={8} style={{ marginBottom: 8 }} />

        {/* Subject pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[60, 90, 55, 60, 70, 70].map((w, i) => (
            <Skeleton.Bar key={i} width={w} height={32} radius={20} />
          ))}
        </div>

        {/* Card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton.Card key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <Skeleton.Circle size={40} />
                <Skeleton.Bar width={16} height={16} />
              </div>
              <Skeleton.Bar width="80%" height={14} style={{ marginBottom: 8 }} />
              <Skeleton.Bar width={70} height={22} radius={12} style={{ marginBottom: 10 }} />
              <Skeleton.Bar width="55%" height={10} />
            </Skeleton.Card>
          ))}
        </div>
      </div>
    </Skeleton>
  );
}
