import { useState } from "react";
import { useFlashcards } from "../hooks/useFlashcards";
import { useFlashcardStats } from "../hooks/useFlashcardStats";
import { useReviewFlashcard } from "../hooks/useReviewFlashcard";
import FlashcardStats from "../components/FlashcardStats";
import FlashcardList from "../components/FlashcardList";
import FlashcardCard from "../components/FlashcardCard";
import FlashcardsSkeleton from "../components/FlashcardsSkeleton";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";
import Pill from "../../../shared/components/Pill";
import { ArrowLeft } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function Flashcards() {
  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useFlashcardStats();
  const {
    data: dueData,
    loading: dueLoading,
    refetch: refetchDue,
  } = useFlashcards({ due: true });
  const { review } = useReviewFlashcard();
  const isMobile = useIsMobile();

  const [reviewing, setReviewing] = useState(null);
  const [flipped, setFlipped] = useState(false);

  async function handleRate(rating) {
    await review(reviewing.id, rating);
    setReviewing(null);
    setFlipped(false);
    refetchStats();
    refetchDue();
  }

  if (statsLoading || dueLoading) return <FlashcardsSkeleton />;

  // Review mode
  if (reviewing) {
    return (
      <div style={{ padding: isMobile ? 16 : 28, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => {
              setReviewing(null);
              setFlipped(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              color: C.textDim,
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Pill>{reviewing.sourceTopic}</Pill>
          <span style={{ fontSize: 11, color: C.textDim }}>
            {reviewing.intervalDays === 1 && reviewing.reviewCount === 0
              ? "First review"
              : `${reviewing.intervalDays} day interval`}
          </span>
        </div>
        <FlashcardCard
          flashcard={reviewing}
          flipped={flipped}
          onFlip={() => setFlipped(!flipped)}
          onRate={handleRate}
        />
      </div>
    );
  }

  // Overview
  return (
    <div style={{ padding: isMobile ? 16 : 28, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700 }}>Flashcards</h2>
        <p style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>
          Auto-generated from your recording gaps · Scheduled using spaced
          repetition
        </p>
      </div>

      {statsData && (
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
          <FlashcardStats stats={statsData} />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          Due Today
        </h3>
        <p style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>
          Tap "Review" on any card to test yourself. Your rating decides when it
          comes back.
        </p>
        {dueData?.flashcards?.length === 0 && (
          <p style={{ color: C.textDim, fontSize: 13 }}>
            No cards due today. You're all caught up!
          </p>
        )}
        {dueData?.flashcards && (
          <FlashcardList
            flashcards={dueData.flashcards}
            onReview={(f) => setReviewing(f)}
          />
        )}
      </div>

      <div
        style={{
          padding: isMobile ? 12 : 16,
          borderRadius: 10,
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.textSec,
            marginBottom: 6,
          }}
        >
          How spaced repetition works
        </h4>
        <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
          When you review a card, your rating determines when it appears next.
          "Forgot" brings it back tomorrow. "Easy" pushes it out to 12+ days.
          Over time, well-known cards appear less frequently while weak ones
          keep coming back until you master them.
        </p>
      </div>
    </div>
  );
}
