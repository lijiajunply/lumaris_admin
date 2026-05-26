import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { setAdminToken, clearAdminToken } from "@/services/request";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lumaris-token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);

  useEffect(() => {
    if (token) {
      setAdminToken(token);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("lumaris-token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("lumaris-token");
    clearAdminToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
