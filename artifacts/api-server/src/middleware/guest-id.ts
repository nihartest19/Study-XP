import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function requireGuestId(req: Request, res: Response, next: NextFunction): void {
  const raw = req.headers["x-guest-id"];
  const guestId = Array.isArray(raw) ? raw[0] : raw;
  if (!guestId || guestId.trim() === "") {
    res.status(400).json({ error: "Missing X-Guest-Id header" });
    return;
  }
  req.userId = guestId.trim();
  next();
}
