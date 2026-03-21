import { prisma } from "../lib/prisma-client.js";
import { sessionRepository } from "../repositories/session-repository.js";

function calculateStreak(dates) {
  if (dates.length === 0) return { current: 0, longest: 0 };

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

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    map[key] = 0;
  }

  sessions.forEach((s) => {
    const date = new Date(s.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (map[key] !== undefined) {
      map[key]++;
    }
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

export const insightService = {
  async getInsights(userId) {
    // Fetch all completed sessions
    const allSessions = await prisma.session.findMany({
      where: { userId, status: "completed" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        topic: true,
        subject: true,
        score: true,
        durationSeconds: true,
        createdAt: true,
      },
    });

    // Streak
    const sessionDates = allSessions.map((s) => s.createdAt);
    const streak = calculateStreak(sessionDates);

    // Heatmap (last 30 days)
    const activityHeatmap = buildHeatmap(allSessions, 30);

    // Score trend — average score per week for last 6 weeks
    const scoreTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekSessions = allSessions.filter((s) => {
        const d = new Date(s.createdAt);
        return d >= weekStart && d < weekEnd;
      });

      const scores = weekSessions
        .filter((s) => s.score !== null)
        .map((s) => s.score);
      const avgScore =
        scores.length > 0
          ? Math.round(
              (scores.reduce((a, b) => a + b, 0) / scores.length) * 10,
            ) / 10
          : null;

      scoreTrend.push({
        week: `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`,
        avgScore,
        count: weekSessions.length,
      });
    }

    // Strongest and weakest topics — group by topic, average score
    const topicScores = {};
    allSessions.forEach((s) => {
      if (s.score === null) return;
      if (!topicScores[s.topic]) {
        topicScores[s.topic] = { scores: [], total: 0 };
      }
      topicScores[s.topic].scores.push(s.score);
      topicScores[s.topic].total++;
    });

    const topicAverages = Object.entries(topicScores).map(([topic, data]) => ({
      topic,
      avgScore:
        Math.round(
          (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10,
        ) / 10,
      attempts: data.total,
    }));

    topicAverages.sort((a, b) => b.avgScore - a.avgScore);

    const strongestTopic =
      topicAverages.length > 0
        ? { topic: topicAverages[0].topic, avgScore: topicAverages[0].avgScore }
        : null;

    const weakestTopic =
      topicAverages.length > 0
        ? {
            topic: topicAverages[topicAverages.length - 1].topic,
            avgScore: topicAverages[topicAverages.length - 1].avgScore,
          }
        : null;

    // Subject breakdown
    const subjectScores = {};
    allSessions.forEach((s) => {
      if (s.score === null) return;
      if (!subjectScores[s.subject]) {
        subjectScores[s.subject] = { scores: [], count: 0 };
      }
      subjectScores[s.subject].scores.push(s.score);
      subjectScores[s.subject].count++;
    });

    const subjectBreakdown = Object.entries(subjectScores).map(
      ([subject, data]) => ({
        subject,
        avgScore:
          Math.round(
            (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10,
          ) / 10,
        count: data.count,
      }),
    );

    // Overall stats
    const totalScores = allSessions
      .filter((s) => s.score !== null)
      .map((s) => s.score);
    const avgScore =
      totalScores.length > 0
        ? Math.round(
            (totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 10,
          ) / 10
        : 0;

    const totalTime = allSessions.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0,
    );
    const distinctTopics = [...new Set(allSessions.map((s) => s.topic))].length;

    return {
      streak,
      activityHeatmap,
      scoreTrend,
      strongestTopic,
      weakestTopic,
      subjectBreakdown,
      stats: {
        totalRecordings: allSessions.length,
        totalTopics: distinctTopics,
        avgScore,
        totalTimeSeconds: totalTime,
      },
    };
  },
};
