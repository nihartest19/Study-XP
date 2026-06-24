import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { z } from "zod/v4";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const AuthBody = z.object({
  username: z.string().min(2).max(64).trim(),
  password: z.string().min(4).max(256),
});

// POST /api/auth/login
// - If username doesn't exist → create account, return userId + isNew: true
// - If username exists → verify password → return userId + isNew: false, or 401
router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = AuthBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Username must be 2–64 characters, password at least 4." });
    return;
  }

  const { username, password } = parsed.data;

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username.toLowerCase()));

  if (!existing) {
    // New user — create account
    const passwordHash = await bcrypt.hash(password, 12);
    const id = randomUUID();
    await db.insert(usersTable).values({ id, username: username.toLowerCase(), passwordHash });
    res.status(201).json({ userId: id, username: username.toLowerCase(), isNew: true });
    return;
  }

  // Existing user — verify password
  const valid = await bcrypt.compare(password, existing.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Incorrect password for that username." });
    return;
  }

  res.json({ userId: existing.id, username: existing.username, isNew: false });
});

export default router;
