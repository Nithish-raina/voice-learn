import { useMutation } from "../../../shared/hooks/useApi";

export function useCreateConversation() {
  return useMutation("post", "/chat/conversations");
}
