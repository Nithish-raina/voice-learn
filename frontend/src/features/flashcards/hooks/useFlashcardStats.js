import { useApi } from "../../../shared/hooks/useApi";

export function useFlashcardStats() {
  return useApi("/flashcards/stats");
}
