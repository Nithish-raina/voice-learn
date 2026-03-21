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

        // Restore session — refresh token cookie is sent automatically
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.data.accessToken);

        const me = await api.get("/users/me");
        setUser(me.data.data);
      } catch {
        // No valid refresh token — user stays logged out
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
