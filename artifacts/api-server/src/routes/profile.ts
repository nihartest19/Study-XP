import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profileTable, subjectsTable, tasksTable, earnedBadgesTable } from "@workspace/db";
import { UpdateProfileBody, GetProfileResponse, UpdateProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

export function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function xpToNextLevel(xp: number): number {
  const level = calcLevel(xp);
  return xpForLevel(level + 1) - xp;
}

const DEFAULT_SUBJECTS = [
  { name: "Mathematics", color: "#6366f1" },
  { name: "Physics", color: "#f59e0b" },
  { name: "History", color: "#10b981" },
  { name: "Literature", color: "#ec4899" },
  { name: "Computer Science", color: "#3b82f6" },
];

async function getOrCreateProfile(userId: string) {
  const [existing] = await db.select().from(profileTable).where(eq(profileTable.userId, userId));
  if (existing) return existing;

  const [created] = await db
    .insert(profileTable)
    .values({ userId, name: "Student" })
    .returning();

  // Seed default subjects for this new user
  await db.insert(subjectsTable).values(DEFAULT_SUBJECTS.map((s) => ({ ...s, userId })));

  return created;
}

function buildProfileResponse(profile: typeof profileTable.$inferSelect) {
  const level = calcLevel(profile.xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return {
    id: profile.id,
    name: profile.name,
    xp: profile.xp,
    level,
    streak: profile.streak,
    xpToNextLevel: nextLevelXp - profile.xp,
    xpForCurrentLevel: nextLevelXp - currentLevelXp,
    avatar: profile.avatar,
  };
}

router.get("/profile", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req.userId);
  res.json(GetProfileResponse.parse(buildProfileResponse(profile)));
});

router.patch("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = await getOrCreateProfile(req.userId);
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.avatar !== undefined) updates.avatar = parsed.data.avatar;

  const [updated] = await db
    .update(profileTable)
    .set(updates)
    .where(eq(profileTable.userId, req.userId))
    .returning();

  res.json(UpdateProfileResponse.parse(buildProfileResponse(updated ?? profile)));
});

// Reset all progress for this user
router.delete("/profile/reset", async (req, res): Promise<void> => {
  const userId = req.userId;

  // Delete tasks and earned badges
  await db.delete(tasksTable).where(eq(tasksTable.userId, userId));
  await db.delete(earnedBadgesTable).where(eq(earnedBadgesTable.userId, userId));
  await db.delete(subjectsTable).where(eq(subjectsTable.userId, userId));

  // Reset or recreate profile
  const [existing] = await db.select().from(profileTable).where(eq(profileTable.userId, userId));
  if (existing) {
    await db
      .update(profileTable)
      .set({ xp: 0, level: 1, streak: 0, longestStreak: 0, lastStudiedDate: null })
      .where(eq(profileTable.userId, userId));
  } else {
    await db.insert(profileTable).values({ userId, name: "Student" });
  }

  // Re-seed default subjects
  await db.insert(subjectsTable).values(DEFAULT_SUBJECTS.map((s) => ({ ...s, userId })));

  res.sendStatus(204);
});

export { getOrCreateProfile };
export default router;
