import { useState, useCallback } from "react";
import api from "../../../api/client";

export function useSessions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/sessions", { params });
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}
