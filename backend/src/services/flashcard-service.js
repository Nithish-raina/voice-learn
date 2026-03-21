// flashcard service for handling business logic related to flashcards
import { flashcardRepository } from "../repositories/flashcard-repository.js";
import { AppError } from "../utils/errors.js";

// SM-2 Spaced Repetition Algorithm
function applySM2(flashcard, rating) {
  // Rating mapping: forgot=0, hard=1, good=2, easy=3
  const ratingMap = { forgot: 0, hard: 1, good: 2, easy: 3 };
  const quality = ratingMap[rating];

  let { easeFactor, intervalDays, reviewCount } = flashcard;

  if (quality === 0) {
    // Forgot — reset to 1 day
    intervalDays = 1;
    // Decrease ease factor but don't go below 1.3
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (quality === 1) {
    // Hard — small interval increase
    if (reviewCount === 0) {
      intervalDays = 1;
    } else if (reviewCount === 1) {
      intervalDays = 2;
    } else {
      intervalDays = Math.ceil(intervalDays * 1.2);
    }
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (quality === 2) {
    // Good — normal interval increase
    if (reviewCount === 0) {
      intervalDays = 1;
    } else if (reviewCount === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.ceil(intervalDays * easeFactor);
    }
    // Slight ease factor adjustment
    easeFactor = easeFactor + 0.0;
  } else if (quality === 3) {
    // Easy — larger interval increase
    if (reviewCount === 0) {
      intervalDays = 3;
    } else if (reviewCount === 1) {
      intervalDays = 7;
    } else {
      intervalDays = Math.ceil(intervalDays * easeFactor * 1.3);
    }
    easeFactor = easeFactor + 0.15;
  }

  // Cap interval at 365 days
  intervalDays = Math.min(intervalDays, 365);

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    nextReviewAt,
    reviewCount: reviewCount + 1,
    lastReviewedAt: new Date(),
  };
}

export const flashcardService = {
  async list(userId, { due, sessionId, status, page = 1, limit = 20 }) {
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 20, 50);

    const { flashcards, totalItems } = await flashcardRepository.findByUserId(
      userId,
      {
        due: due === "true" || due === true,
        sessionId,
        status,
        page,
        limit,
      },
    );

    const formatted = flashcards.map((f) => ({
      id: f.id,
      sessionId: f.sessionId,
      question: f.question,
      answer: f.answer,
      sourceTopic: f.session?.topic || null,
      nextReviewAt: f.nextReviewAt,
      intervalDays: f.intervalDays,
      easeFactor: f.easeFactor,
      reviewCount: f.reviewCount,
      lastReviewedAt: f.lastReviewedAt,
      status: f.status,
      createdAt: f.createdAt,
    }));

    return {
      flashcards: formatted,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  },

  async getStats(userId) {
    const [dueTodayResult, upcomingResult, masteredResult, totalResult] =
      await Promise.allSettled([
        flashcardRepository.countDue(userId),
        flashcardRepository.countUpcoming(userId),
        flashcardRepository.countMastered(userId),
        flashcardRepository.countTotal(userId),
      ]);

    return {
      dueToday:
        dueTodayResult.status === "fulfilled"
          ? dueTodayResult.value
          : { error: dueTodayResult.reason?.message || "Failed to load" },
      upcoming:
        upcomingResult.status === "fulfilled"
          ? upcomingResult.value
          : { error: upcomingResult.reason?.message || "Failed to load" },
      mastered:
        masteredResult.status === "fulfilled"
          ? masteredResult.value
          : { error: masteredResult.reason?.message || "Failed to load" },
      total:
        totalResult.status === "fulfilled"
          ? totalResult.value
          : { error: totalResult.reason?.message || "Failed to load" },
    };
  },

  async review(userId, flashcardId, rating) {
    const validRatings = ["forgot", "hard", "good", "easy"];
    if (!validRatings.includes(rating)) {
      throw new AppError(
        "Rating must be one of: forgot, hard, good, easy",
        400,
        "INVALID_RATING",
      );
    }

    const flashcard = await flashcardRepository.findById(flashcardId);

    if (!flashcard) {
      throw new AppError("Flashcard not found", 404, "FLASHCARD_NOT_FOUND");
    }

    if (flashcard.userId !== userId) {
      throw new AppError(
        "You do not have access to this flashcard",
        403,
        "FORBIDDEN",
      );
    }

    if (flashcard.status !== "active") {
      throw new AppError(
        "This flashcard is archived",
        400,
        "FLASHCARD_ARCHIVED",
      );
    }

    const updates = applySM2(flashcard, rating);

    const updated = await flashcardRepository.update(flashcardId, updates);

    return {
      id: updated.id,
      nextReviewAt: updated.nextReviewAt,
      intervalDays: updated.intervalDays,
      easeFactor: updated.easeFactor,
      reviewCount: updated.reviewCount,
      lastReviewedAt: updated.lastReviewedAt,
    };
  },
};
