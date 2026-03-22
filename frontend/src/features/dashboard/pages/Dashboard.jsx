import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";
import RecentSessions from "../components/RecentSessions";
import ActivityHeatmap from "../components/ActivityHeatMap";
import StatsCards from "../components/StatsCards";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";
import { Flame, Layers, ArrowRight } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useDashboard();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (loading) return <DashboardSkeleton />;
  if (!data)
    return (
      <div style={{ padding: isMobile ? 16 : 28 }}>
        <p style={{ color: C.textDim }}>Failed to load dashboard</p>
      </div>
    );

  const greeting =
    new Date().getHours() < 12
      ? "morning"
      : new Date().getHours() < 18
        ? "afternoon"
        : "evening";

  return (
    <div style={{ padding: isMobile ? 16 : 28, maxWidth: 960, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: C.textDim }}>Good {greeting}</p>
          <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, marginTop: 2 }}>
            {user?.name} 👋
          </h2>
        </div>
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
          <span style={{ fontSize: 12, color: C.textDim }}>day streak</span>
        </div>
      </div>

      {data.dueFlashcardsCount > 0 && (
        <div
          onClick={() => navigate("/flashcards")}
          style={{
            padding: isMobile ? 12 : 16,
            borderRadius: 12,
            background: C.primaryDim,
            border: `1px solid ${C.primaryBorder}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            marginBottom: isMobile ? 16 : 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: C.card,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...(isMobile ? { display: "none" } : {}),
              }}
            >
              <Layers size={18} color={C.primary} />
            </div>
            <div>
              <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>
                {data.dueFlashcardsCount} flashcards due for review
              </p>
              <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                Cards from past recordings scheduled for today
              </p>
            </div>
          </div>
          <ArrowRight size={18} color={C.primary} />
        </div>
      )}

      <div style={{
        display: "flex",
        gap: isMobile ? 16 : 20,
        flexDirection: isMobile ? "column" : "row",
      }}>
        <div style={{ flex: 1.5 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>
              Recent Explanations
            </h3>
            <span
              onClick={() => navigate("/library")}
              style={{
                fontSize: 12,
                color: C.primary,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              View all
            </span>
          </div>
          <RecentSessions sessions={data.recentSessions} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
            Activity
          </h3>
          <ActivityHeatmap data={data.activityHeatmap} />
          <StatsCards stats={data.stats} />
        </div>
      </div>
    </div>
  );
}
