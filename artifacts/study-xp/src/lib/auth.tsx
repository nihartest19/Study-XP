import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

interface AuthContextType {
  isLoggedIn: boolean;
  guestId: string | null;
  login: () => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("study_xp_auth") === "true";
  });
  const [guestId, setGuestId] = useState<string | null>(() => {
    return localStorage.getItem("study_xp_guest_id");
  });
  const [, setLocation] = useLocation();

  const login = () => {
    const id = getOrCreateGuestId();
    setGuestId(id);
    localStorage.setItem("study_xp_auth", "true");
    setIsLoggedIn(true);
    setLocation("/");
  };

  const logout = () => {
    localStorage.removeItem("study_xp_auth");
    // Keep guestId so data persists if they log back in
    setIsLoggedIn(false);
    setLocation("/");
  };

  useEffect(() => {
    const isAuth = localStorage.getItem("study_xp_auth") === "true";
    setIsLoggedIn(isAuth);
    if (isAuth) {
      // Ensure a guestId always exists for logged-in users (handles upgrade path)
      const id = getOrCreateGuestId();
      setGuestId(id);
    } else {
      setGuestId(localStorage.getItem("study_xp_guest_id"));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, guestId, login, logout }}>
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
