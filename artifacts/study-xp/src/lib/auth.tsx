import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("study_xp_auth") === "true";
  });
  const [location, setLocation] = useLocation();

  const login = () => {
    localStorage.setItem("study_xp_auth", "true");
    setIsLoggedIn(true);
    setLocation("/");
  };

  const logout = () => {
    localStorage.removeItem("study_xp_auth");
    setIsLoggedIn(false);
    setLocation("/login");
  };

  useEffect(() => {
    const isAuth = localStorage.getItem("study_xp_auth") === "true";
    setIsLoggedIn(isAuth);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
