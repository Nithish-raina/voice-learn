import { prisma } from "../lib/prisma-client.js";
import { sessionRepository } from "../repositories/session-repository.js";

function calculateStreak(dates) {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const toDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const uniqueDays = [...new Set(dates.map(toDateString))].sort().reverse();
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  const isConsecutive = (d1, d2) => Math.round((new Date(d1) - new Date(d2)) / 86400000) === 1;

  let longest = 1;
  let currentRun = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    if (isConsecutive(uniqueDays[i], uniqueDays[i + 1])) {
      currentRun++;
    } else {
      currentRun = 1;
    }
    longest = Math.max(longest, currentRun);
  }

  let current = 0;
  if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
    current = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      if (isConsecutive(uniqueDays[i], uniqueDays[i + 1])) current++;
      else break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

function buildHeatmap(sessions, days) {
  const map = {};
  const today = new Date();
  
  const toDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Initialize all requested days with 0
  for (let i = days - 1; i >= 0; i--) {
    map[toDateString(new Date(today.getTime() - i * 86400000))] = 0;
  }

  // Count sessions matching the days
  sessions.forEach((s) => {
    const key = toDateString(s.createdAt);
    if (map[key] !== undefined) map[key]++;
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

export const insightService = {
  async getInsights(userId) {
    // Fetch all completed sessions
    const allSessions = await prisma.session.findMany({
      where: { userId, status: "completed" },
      orderBy: { createdAt: "desc" },
      select: { id: true, topic: true, subject: true, score: true, durationSeconds: true, createdAt: true },
    });

    // 1. Streaks & Heatmap
    const streak = calculateStreak(allSessions.map((s) => s.createdAt));
    const activityHeatmap = buildHeatmap(allSessions, 30);

    // Helpers for reuse mapping
    const getAvg = (scores) => scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    const toDateString = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // 2. Score Trend (Last 6 weeks)
    const scoreTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

      const weekSessions = allSessions.filter((s) => new Date(s.createdAt) >= weekStart && new Date(s.createdAt) < weekEnd);
      const scores = weekSessions.map((s) => s.score).filter((s) => s !== null);

      scoreTrend.push({
        week: toDateString(weekStart),
        avgScore: scores.length > 0 ? getAvg(scores) : null,
        count: weekSessions.length,
      });
    }

    // 3. Topics & Subjects Grouping (Done efficiently in a single pass)
    const topicMap = {};
    const subjectMap = {};
    let validScoresSum = 0;
    let validScoresCount = 0;
    let totalTimeSeconds = 0;

    allSessions.forEach((s) => {
      totalTimeSeconds += s.durationSeconds || 0;

      if (s.score !== null) {
        validScoresSum += s.score;
        validScoresCount++;

        if (!topicMap[s.topic]) topicMap[s.topic] = { scores: [], count: 0 };
        topicMap[s.topic].scores.push(s.score);
        topicMap[s.topic].count++;

        if (!subjectMap[s.subject]) subjectMap[s.subject] = { scores: [], count: 0 };
        subjectMap[s.subject].scores.push(s.score);
        subjectMap[s.subject].count++;
      }
    });

    // 4. Calculate Strongest/Weakest Topics
    const topicAverages = Object.entries(topicMap)
      .map(([topic, data]) => ({ topic, avgScore: getAvg(data.scores), attempts: data.count }))
      .sort((a, b) => b.avgScore - a.avgScore);

    const strongestTopic = topicAverages.length > 0 ? { topic: topicAverages[0].topic, avgScore: topicAverages[0].avgScore } : null;
    const weakestTopic = topicAverages.length > 0 ? { topic: topicAverages[topicAverages.length - 1].topic, avgScore: topicAverages[topicAverages.length - 1].avgScore } : null;

    // 5. Calculate Subject Breakdown
    const subjectBreakdown = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      avgScore: getAvg(data.scores),
      count: data.count,
    }));

    // 6. Overall Stats
    const avgScore = validScoresCount > 0 ? Math.round((validScoresSum / validScoresCount) * 10) / 10 : 0;
    const distinctTopics = new Set(allSessions.map((s) => s.topic)).size;

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
        totalTimeSeconds,
      },
    };
  },
};
