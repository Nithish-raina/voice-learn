import { useApi } from "../../../shared/hooks/useApi";

export function useDashboard() {
  return useApi("/dashboard");
}
