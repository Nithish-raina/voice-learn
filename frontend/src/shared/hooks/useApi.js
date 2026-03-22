import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";

export function useApi(url, options = {}) {
  const { immediate = true, params = {} } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (overrideParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(url, { params: overrideParams || params });
        setData(res.data.data);
        return res.data.data;
      } catch (err) {
        const msg =
          err.response?.data?.error?.message || "Something went wrong";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  useEffect(() => {
    if (immediate) fetch();
  }, [fetch, immediate]);

  return { data, loading, error, refetch: fetch };
}

export function useMutation(method, url) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (body, overrideUrl) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api[method](overrideUrl || url, body);
        return res.data.data;
      } catch (err) {
        const msg =
          err.response?.data?.error?.message || "Something went wrong";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [method, url],
  );

  return { mutate, loading, error };
}
