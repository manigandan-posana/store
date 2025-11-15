import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchProfile, login as loginRequest } from "../api/auth";
import { clearAuthToken, setAuthToken, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuthToken();
    localStorage.removeItem("authToken");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setAuthToken(storedToken);
    setToken(storedToken);
    fetchProfile()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const login = useCallback(async ({ email, password }) => {
    const response = await loginRequest({ email, password });
    setAuthToken(response.token);
    localStorage.setItem("authToken", response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      setUser,
    }),
    [user, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
