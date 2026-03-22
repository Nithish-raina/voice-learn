import { useMutation } from "../../../shared/hooks/useApi";

export function useCreateSession() {
  return useMutation("post", "/sessions");
}
