import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

interface AuthContextType {
  isLoggedIn: boolean;
  guestId: string | null;
  login: () => void;
  loginWithCredentials: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getOrCreateGuestId(): string {
  const existing = localStorage.getItem("study_xp_guest_id");
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem("study_xp_guest_id", id);
  return id;
}

function setUserId(id: string) {
  localStorage.setItem("study_xp_guest_id", id);
  localStorage.setItem("study_xp_auth", "true");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("study_xp_auth") === "true";
  });
  const [guestId, setGuestId] = useState<string | null>(() => {
    return localStorage.getItem("study_xp_guest_id");
  });
  const [, setLocation] = useLocation();

  // Demo mode — random UUID, no credentials required
  const login = () => {
    const id = getOrCreateGuestId();
    setGuestId(id);
    localStorage.setItem("study_xp_auth", "true");
    setIsLoggedIn(true);
    setLocation("/");
  };

  // Real login — username + password verified against the database
  const loginWithCredentials = async (
    username: string,
    password: string,
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.status === 401) {
        return { error: "Incorrect password. Try again." };
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { error: (body as { error?: string }).error ?? "Something went wrong. Please try again." };
      }

      const data = (await res.json()) as { userId: string; username: string; isNew: boolean };
      setUserId(data.userId);
      setGuestId(data.userId);
      setIsLoggedIn(true);
      setLocation("/");
      return {};
    } catch {
      return { error: "Could not reach the server. Check your connection." };
    }
  };

  const logout = () => {
    localStorage.removeItem("study_xp_auth");
    setIsLoggedIn(false);
    setLocation("/");
  };

  useEffect(() => {
    const isAuth = localStorage.getItem("study_xp_auth") === "true";
    setIsLoggedIn(isAuth);
    if (isAuth) {
      const id = getOrCreateGuestId();
      setGuestId(id);
    } else {
      setGuestId(localStorage.getItem("study_xp_guest_id"));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, guestId, login, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
