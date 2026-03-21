import { useApi } from "../../../shared/hooks/useApi";

export function useSession(sessionId) {
  return useApi(`/sessions/${sessionId}`);
}
