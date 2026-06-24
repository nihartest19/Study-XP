import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

const TOKEN_KEY = "study_xp_token";
const AUTH_KEY = "study_xp_auth";

interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null;
  login: () => Promise<void>;
  loginWithCredentials: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ---------------------------------------------------------------------------
// Token helpers (no external lib — same base64url encoding the server uses)
// ---------------------------------------------------------------------------

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function storeSession(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(AUTH_KEY, "true");
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_KEY);
}

function parseTokenUserId(token: string): string | null {
  try {
    const encoded = token.split(".")[0];
    const json = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json) as { userId?: string };
    return data.userId ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shared login API call — used by both demo mode and credential login
// ---------------------------------------------------------------------------

async function callLoginApi(
  username: string,
  password: string,
): Promise<{ token: string; userId: string; username: string; isNew: boolean } | { error: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 401) return { error: "Incorrect password. Try again." };
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    return { error: body.error ?? "Something went wrong. Please try again." };
  }

  return res.json() as Promise<{ token: string; userId: string; username: string; isNew: boolean }>;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => localStorage.getItem(AUTH_KEY) === "true" && Boolean(getStoredToken()),
  );
  const [userId, setUserId] = useState<string | null>(() => {
    const t = getStoredToken();
    return t ? parseTokenUserId(t) : null;
  });
  const [, setLocation] = useLocation();

  // ── Demo mode ─────────────────────────────────────────────────────────────
  // Creates a real (but anonymous) server account with a random username so
  // demo data is stored server-side exactly like a real account — no X-Guest-Id.
  const login = async (): Promise<void> => {
    const randSuffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const username = `demo_${randSuffix}`;
    const password = crypto.randomUUID(); // strong random password they'll never type

    const result = await callLoginApi(username, password);
    if ("error" in result) {
      // Non-fatal — just navigate; API will 401 and the user will be redirected
      setLocation("/");
      return;
    }

    storeSession(result.token);
    setUserId(result.userId);
    setIsLoggedIn(true);
    setLocation("/");
  };

  // ── Credential login ───────────────────────────────────────────────────────
  const loginWithCredentials = async (
    username: string,
    password: string,
  ): Promise<{ error?: string }> => {
    let result: Awaited<ReturnType<typeof callLoginApi>>;
    try {
      result = await callLoginApi(username, password);
    } catch {
      return { error: "Could not reach the server. Check your connection." };
    }

    if ("error" in result) return { error: result.error };

    storeSession(result.token);
    setUserId(result.userId);
    setIsLoggedIn(true);
    setLocation("/");
    return {};
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = (): void => {
    clearSession();
    setUserId(null);
    setIsLoggedIn(false);
    setLocation("/");
  };

  // Sync on page refresh
  useEffect(() => {
    const token = getStoredToken();
    const loggedIn = localStorage.getItem(AUTH_KEY) === "true" && Boolean(token);
    setIsLoggedIn(loggedIn);
    setUserId(loggedIn && token ? parseTokenUserId(token) : null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
