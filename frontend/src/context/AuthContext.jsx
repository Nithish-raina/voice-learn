import { createContext, useContext, useState, useEffect } from "react";
import api, { setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        await api.get("/auth/csrf-token");

        // If accessToken cookie exists, fetch user
        // If expired, the 401 interceptor will refresh and retry
        const me = await api.get("/users/me");
        setUser(me.data.data);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function signup(name, email, password) {
    const { data } = await api.post("/auth/signup", { name, email, password });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error logging out:", error);
    }
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
