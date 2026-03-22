import { useInsights } from "../hooks/useInsights";
import ScoreTrend from "../components/ScoreTrend";
import SubjectBreakdown from "../components/SubjectBreakdown";
import TopicRanking from "../components/TopicRanking";
import InsightsSkeleton from "../components/InsightsSkeleton";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";
import { Zap, Flame } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function Insights() {
  const { data, loading } = useInsights();
  const isMobile = useIsMobile();

  if (loading) return <InsightsSkeleton />;
  if (!data)
    return (
      <div style={{ padding: isMobile ? 16 : 28 }}>
        <p style={{ color: C.textDim }}>Failed to load insights</p>
      </div>
    );

  const hColors = [
    "transparent",
    "rgba(99,102,241,0.15)",
    "rgba(99,102,241,0.35)",
    "#6366f1",
  ];

  return (
    <div style={{ padding: isMobile ? 16 : 28, maxWidth: 960, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isMobile ? 16 : 20,
        }}
      >
        <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700 }}>Insights</h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 20,
            background: C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          <Flame size={16} color={C.amber} fill={C.amber} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>
            {data.streak.current}
          </span>
          {!isMobile && (
            <span style={{ fontSize: 12, color: C.textDim }}>
              day streak (best: {data.streak.longest})
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { l: "Recordings", v: data.stats.totalRecordings },
          { l: "Topics", v: data.stats.totalTopics },
          { l: "Avg Score", v: data.stats.avgScore },
          {
            l: "Total Time",
            v: `${Math.round(data.stats.totalTimeSeconds / 60)}m`,
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: isMobile ? 12 : 14,
              borderRadius: 10,
              background: C.card,
              border: `1px solid ${C.border}`,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700 }}>{s.v}</p>
            <p style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
              {s.l}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 12,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: isMobile ? 14 : 18,
            borderRadius: 12,
            background: C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
            Score Trend
          </h4>
          <ScoreTrend data={data.scoreTrend} />
        </div>
        <div
          style={{
            flex: 1,
            padding: isMobile ? 14 : 18,
            borderRadius: 12,
            background: C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
            Subject Breakdown
          </h4>
          <SubjectBreakdown data={data.subjectBreakdown} />
        </div>
      </div>

      <TopicRanking
        strongest={data.strongestTopic}
        weakest={data.weakestTopic}
      />

      <div
        style={{
          padding: isMobile ? 12 : 16,
          borderRadius: 12,
          background: C.card,
          border: `1px solid ${C.border}`,
          marginTop: 12,
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
          Activity
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: isMobile ? 2 : 3,
          }}
        >
          {data.activityHeatmap.map((d, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                borderRadius: 2,
                background:
                  d.count === 0 ? C.border : hColors[Math.min(d.count, 3)],
              }}
              title={`${d.date}: ${d.count} recording${d.count !== 1 ? "s" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
