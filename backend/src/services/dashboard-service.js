import { sessionRepository } from "../repositories/session-repository.js";
import { flashcardRepository } from "../repositories/flashcard-repository.js";
import logger from "../lib/logger.js";

function calculateStreak(dates) {
  if (dates.length === 0) return { current: 0, longest: 0 };

  // Normalize to date strings and deduplicate
  const uniqueDates = [
    ...new Set(
      dates.map((d) => {
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }),
    ),
  ]
    .sort()
    .reverse();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // Current streak
  let current = 0;
  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    let checkDate = new Date(uniqueDates[0]);
    for (const dateStr of uniqueDates) {
      const expected = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
      if (dateStr === expected) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longest = 1;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = (prev - curr) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longest = Math.max(longest, current);
  if (uniqueDates.length === 0) longest = 0;

  return { current, longest };
}

function buildHeatmap(sessions, days) {
  const map = {};
  const today = new Date();

  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    map[key] = 0;
  }

  // Count sessions per day
  sessions.forEach((s) => {
    const date = new Date(s.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (map[key] !== undefined) {
      map[key]++;
    }
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

export const dashboardService = {
  async getDashboard(userId) {
    logger.debug({ userId }, "Building dashboard data");
    const [
      recentSessionsResult,
      sessionDatesResult,
      dueFlashcardsCountResult,
      aggregateStatsResult,
      topicCountResult,
    ] = await Promise.allSettled([
      sessionRepository.getRecentByUserId(userId, 5),
      sessionRepository.getCompletedSessionDates(userId),
      flashcardRepository.countDue(userId),
      sessionRepository.aggregate({ userId, status: "completed" }),
      sessionRepository.getDistinctTopicCount(userId),
    ]);

    // Build streak and heatmap from session dates if available
    let streak = null;
    let heatmap = null;
    if (sessionDatesResult.status === "fulfilled") {
      const dates = sessionDatesResult.value.map((s) => s.createdAt);
      streak = calculateStreak(dates);
      heatmap = buildHeatmap(sessionDatesResult.value, 30);
    }

    // Build stats from aggregate and topic count if available
    let stats = null;
    if (
      aggregateStatsResult.status === "fulfilled" &&
      topicCountResult.status === "fulfilled"
    ) {
      const aggregateStats = aggregateStatsResult.value;
      stats = {
        totalTopics: topicCountResult.value,
        avgScore: Math.round((aggregateStats._avg.score || 0) * 10) / 10,
        totalTimeSeconds: aggregateStats._sum.durationSeconds || 0,
      };
    }

    return {
      streak:
        streak ??
        { error: sessionDatesResult.reason?.message || "Failed to load streak" },
      dueFlashcardsCount:
        dueFlashcardsCountResult.status === "fulfilled"
          ? dueFlashcardsCountResult.value
          : { error: dueFlashcardsCountResult.reason?.message || "Failed to load due flashcards" },
      recentSessions:
        recentSessionsResult.status === "fulfilled"
          ? recentSessionsResult.value
          : { error: recentSessionsResult.reason?.message || "Failed to load recent sessions" },
      activityHeatmap:
        heatmap ??
        { error: sessionDatesResult.reason?.message || "Failed to load activity heatmap" },
      stats:
        stats ??
        { error: "Failed to load stats" },
    };
  },
};
