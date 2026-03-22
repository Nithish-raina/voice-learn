import { useApi } from "../../../shared/hooks/useApi";

export function useConversations() {
  return useApi("/chat/conversations");
}
