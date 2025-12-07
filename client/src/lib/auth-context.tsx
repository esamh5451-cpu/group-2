import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

interface JWTPayload {
  username: string;
  role: string;
  userId: number;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  role: string | null;
  userId: number | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return false;
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  const getToken = useCallback(() => {
    return localStorage.getItem("admin_session");
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("admin_session");
    setUsername(null);
    setRole(null);
    setUserId(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  function checkAuth() {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      setLoading(false);
      return;
    }

    const payload = parseJWT(token);
    if (!payload || isTokenExpired(payload)) {
      clearAuth();
      setLoading(false);
      return;
    }

    setUsername(payload.username);
    setRole(payload.role);
    setUserId(payload.userId);
    setIsAuthenticated(true);
    setLoading(false);
  }

  async function login(username: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    const token = data.token;
    
    localStorage.setItem("admin_session", token);
    
    const payload = parseJWT(token);
    if (payload) {
      setUsername(payload.username);
      setRole(payload.role);
      setUserId(payload.userId);
    } else {
      setUsername(data.username);
    }
    
    setIsAuthenticated(true);
    setLocation("/admin");
  }

  async function logout() {
    const token = localStorage.getItem("admin_session");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    clearAuth();
    setLocation("/admin/login");
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      username, 
      role, 
      userId, 
      login, 
      logout, 
      loading, 
      getToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
