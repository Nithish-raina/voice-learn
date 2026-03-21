import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function getAccessToken() {
  const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
  return match ? match[1] : null;
}

export function setAccessToken(token) {
  if (token) {
    document.cookie = `accessToken=${token}; path=/; max-age=900; SameSite=Strict`;
  } else {
    document.cookie =
      "accessToken=; path=/; max-age=0; SameSite=Strict";
  }
}

const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshRequest = original.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isRefreshRequest
    ) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
