import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  db,
  usersTable,
  profileTable,
  tasksTable,
  subjectsTable,
  earnedBadgesTable,
} from "@workspace/db";
import { randomUUID } from "crypto";
import { signToken, requireAuth } from "../middleware/require-auth";

const router: IRouter = Router();

// POST /api/auth/login
// - If username doesn't exist → create account + return signed token
// - If username exists → verify password → return signed token, or 401
router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body as { username?: unknown; password?: unknown };

  if (
    typeof username !== "string" || username.trim().length < 2 || username.trim().length > 64 ||
    typeof password !== "string" || password.length < 4 || password.length > 256
  ) {
    res.status(400).json({ error: "Username must be 2–64 characters, password at least 4." });
    return;
  }

  const trimmedUsername = username.trim();
  const normalised = trimmedUsername.toLowerCase();

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, normalised));

  let userId: string;
  let isNew: boolean;

  if (!existing) {
    // New user — create account
    const passwordHash = await bcrypt.hash(password, 12);
    userId = randomUUID();
    await db.insert(usersTable).values({ id: userId, username: normalised, passwordHash });
    isNew = true;
  } else {
    // Existing user — verify password
    const valid = await bcrypt.compare(password, existing.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Incorrect password for that username." });
      return;
    }
    userId = existing.id;
    isNew = false;
  }

  const token = signToken({ userId, username: normalised });
  const status = isNew ? 201 : 200;
  res.status(status).json({ token, userId, username: normalised, isNew });
});

// POST /api/auth/migrate
// Copies guest progress into the authenticated account when the account is brand-new.
// Body: { fromUserId: string }  — the old guest UUID stored in localStorage
router.post("/auth/migrate", requireAuth, async (req, res): Promise<void> => {
  const { fromUserId } = req.body as { fromUserId?: string };
  const toUserId = req.userId;

  if (!fromUserId || typeof fromUserId !== "string" || fromUserId === toUserId) {
    res.json({ migrated: false, reason: "nothing to migrate" });
    return;
  }

  // Check if the target (authenticated) account already has progress
  const [targetProfile] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.userId, toUserId));

  if (targetProfile && targetProfile.xp > 0) {
    res.json({ migrated: false, reason: "target account already has progress" });
    return;
  }

  // Check if the source (guest) account has any profile
  const [sourceProfile] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.userId, fromUserId));

  if (!sourceProfile) {
    res.json({ migrated: false, reason: "no guest data found" });
    return;
  }

  // Delete existing empty target data first
  await db.delete(profileTable).where(eq(profileTable.userId, toUserId));
  await db.delete(tasksTable).where(eq(tasksTable.userId, toUserId));
  await db.delete(subjectsTable).where(eq(subjectsTable.userId, toUserId));
  await db.delete(earnedBadgesTable).where(eq(earnedBadgesTable.userId, toUserId));

  // Re-insert source data under the new userId
  await db
    .insert(profileTable)
    .values({ ...sourceProfile, id: undefined as unknown as number, userId: toUserId });

  const sourceTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, fromUserId));
  if (sourceTasks.length > 0) {
    await db
      .insert(tasksTable)
      .values(sourceTasks.map((t) => ({ ...t, id: undefined as unknown as number, userId: toUserId })));
  }

  const sourceSubjects = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.userId, fromUserId));
  if (sourceSubjects.length > 0) {
    await db
      .insert(subjectsTable)
      .values(sourceSubjects.map((s) => ({ ...s, id: undefined as unknown as number, userId: toUserId })));
  }

  const sourceBadges = await db
    .select()
    .from(earnedBadgesTable)
    .where(eq(earnedBadgesTable.userId, fromUserId));
  if (sourceBadges.length > 0) {
    await db
      .insert(earnedBadgesTable)
      .values(sourceBadges.map((b) => ({ ...b, id: undefined as unknown as number, userId: toUserId })));
  }

  res.json({ migrated: true });
});

export default router;
