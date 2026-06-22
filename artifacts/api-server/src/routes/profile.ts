import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profileTable } from "@workspace/db";
import { UpdateProfileBody, GetProfileResponse, UpdateProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

function xpToNextLevel(xp: number): number {
  const level = calcLevel(xp);
  return xpForLevel(level + 1) - xp;
}

router.get("/profile", async (req, res): Promise<void> => {
  let [profile] = await db.select().from(profileTable).limit(1);
  if (!profile) {
    [profile] = await db.insert(profileTable).values({ name: "Student" }).returning();
  }
  const level = calcLevel(profile.xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  res.json(
    GetProfileResponse.parse({
      id: profile.id,
      name: profile.name,
      xp: profile.xp,
      level,
      streak: profile.streak,
      xpToNextLevel: nextLevelXp - profile.xp,
      xpForCurrentLevel: nextLevelXp - currentLevelXp,
      avatar: profile.avatar,
    })
  );
});

router.patch("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let [profile] = await db.select().from(profileTable).limit(1);
  if (!profile) {
    [profile] = await db.insert(profileTable).values({ name: "Student" }).returning();
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.avatar !== undefined) updates.avatar = parsed.data.avatar;

  const [updated] = await db.update(profileTable).set(updates).where(eq(profileTable.id, profile.id)).returning();
  const level = calcLevel(updated.xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  res.json(
    UpdateProfileResponse.parse({
      id: updated.id,
      name: updated.name,
      xp: updated.xp,
      level,
      streak: updated.streak,
      xpToNextLevel: nextLevelXp - updated.xp,
      xpForCurrentLevel: nextLevelXp - currentLevelXp,
      avatar: updated.avatar,
    })
  );
});

export { calcLevel, xpForLevel, xpToNextLevel };
export default router;
