// session service for handling business logic related to sessions
import { sessionRepository } from "../repositories/session-repository.js";
import { generatePresignedUploadUrl } from "../lib/s3-client.js";
import { AppError } from "../utils/errors.js";
import { SESSION_STATUS } from "../utils/constants.js";

export const sessionService = {
  async create(userId, { topic, subject, difficulty }) {
    const session = await sessionRepository.create({
      userId,
      topic,
      subject,
      difficulty,
      status: SESSION_STATUS.RECORDING,
    });

    let presignedUrl;
    let audioKey;

    try {
      ({ url: presignedUrl, key: audioKey } = await generatePresignedUploadUrl(
        userId,
        session.id,
      ));
    } catch (error) {
      await sessionRepository.update(session.id, {
        status: SESSION_STATUS.FAILED,
      });
      throw new AppError(
        "Failed to prepare upload. Please try again.",
        502,
        "UPLOAD_SETUP_FAILED",
      );
    }

    // Save the S3 key so we know where the audio will be
    await sessionRepository.update(session.id, {
      audioUrl: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${audioKey}`,
    });

    return {
      sessionId: session.id,
      presignedUrl,
      websocketUrl: `wss://${process.env.WS_HOST || "localhost:3000"}/ws/session/${session.id}`,
    };
  },

  async getById(userId, sessionId) {
    const session = await sessionRepository.findById(sessionId);

    if (!session) {
      throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
    }

    if (session.userId !== userId) {
      throw new AppError(
        "You do not have access to this session",
        403,
        "FORBIDDEN",
      );
    }

    return {
      id: session.id,
      topic: session.topic,
      subject: session.subject,
      difficulty: session.difficulty,
      transcriptText: session.transcriptText,
      audioUrl: session.audioUrl,
      durationSeconds: session.durationSeconds,
      score: session.score,
      strengths: session.strengths,
      gaps: session.gaps,
      testYourselfQas: session.testYourselfQas,
      flashcards: session.flashcards.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        status: f.status,
        nextReviewAt: f.nextReviewAt,
        reviewCount: f.reviewCount,
      })),
      status: session.status,
      createdAt: session.createdAt,
    };
  },

  async list(userId, { subject, search, sort, page = 1, limit = 12 }) {
    // Ensure pagination values are valid positive integers
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, Math.min(50, parseInt(limit) || 12));

    const { sessions, totalItems } = await sessionRepository.findByUserId(
      userId,
      {
        subject,
        search,
        sort: sort || "created_at_desc",
        page,
        limit,
      },
    );

    // Get attempt counts and mastery info per topic
    const topicStats = await sessionRepository.getTopicAttemptCounts(userId);
    const topicMap = {};
    topicStats.forEach((t) => {
      topicMap[t.topic] = {
        attemptCount: t._count,
        bestScore: t._max.score,
      };
    });

    const enrichedSessions = sessions.map((s) => ({
      ...s,
      attemptCount: topicMap[s.topic]?.attemptCount || 1,
      isMastered:
        (topicMap[s.topic]?.bestScore || 0) >= 8 &&
        (topicMap[s.topic]?.attemptCount || 0) >= 2,
    }));

    return {
      sessions: enrichedSessions,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  },
};
