import type { Request, Response, NextFunction } from "express";
import { createHmac, timingSafeEqual } from "crypto";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export interface TokenPayload {
  userId: string;
  username: string;
  iat: number;
}

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export function signToken(payload: Omit<TokenPayload, "iat">): string {
  const data: TokenPayload = { ...payload, iat: Date.now() };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(encoded).digest("base64url");
  try {
    const expectedBuf = Buffer.from(expected);
    const sigBuf = Buffer.from(sig);
    if (expectedBuf.length !== sigBuf.length || !timingSafeEqual(expectedBuf, sigBuf)) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(encoded, "base64url").toString()) as TokenPayload;
    if (Date.now() - data.iat > TOKEN_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"];
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Session expired or invalid. Please log in again." });
    return;
  }

  req.userId = payload.userId;
  next();
}
