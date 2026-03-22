import { useApi } from "../../../shared/hooks/useApi";

export function useFlashcards(params = {}) {
  const queryStr = new URLSearchParams(params).toString();
  return useApi(`/flashcards?${queryStr}`);
}
