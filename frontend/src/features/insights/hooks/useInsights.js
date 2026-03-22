import { useApi } from "../../../shared/hooks/useApi";

export function useInsights() {
  return useApi("/insights");
}
