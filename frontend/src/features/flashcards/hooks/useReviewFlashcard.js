import { useMutation } from "../../../shared/hooks/useApi";

export function useReviewFlashcard() {
  const { mutate, loading, error } = useMutation("patch", "/flashcards");

  async function review(flashcardId, rating) {
    return mutate({ rating }, `/flashcards/${flashcardId}/review`);
  }

  return { review, loading, error };
}
