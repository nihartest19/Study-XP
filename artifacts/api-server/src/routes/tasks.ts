import { Router, type IRouter } from "express";
import { eq, and, sql, gte } from "drizzle-orm";
import { db, tasksTable, subjectsTable, profileTable, badgeDefinitionsTable, earnedBadgesTable } from "@workspace/db";
import {
  GetTasksQueryParams,
  GetTasksResponse,
  CreateTaskBody,
  UpdateTaskParams,
  UpdateTaskBody,
  DeleteTaskParams,
  UpdateTaskResponse,
  GetTasksResponseItem,
} from "@workspace/api-zod";
import { calcLevel, xpForLevel } from "./profile";

const router: IRouter = Router();

const XP_BY_PRIORITY: Record<string, number> = {
  low: 25,
  medium: 50,
  high: 100,
};

async function getTasksWithSubjects(filters?: { subjectId?: number | null; completed?: boolean | null }) {
  const subjects = await db.select().from(subjectsTable);
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  let query = db.select().from(tasksTable).$dynamic();

  if (filters?.subjectId != null) {
    query = query.where(eq(tasksTable.subjectId, filters.subjectId));
  }
  if (filters?.completed != null) {
    query = query.where(eq(tasksTable.completed, filters.completed));
  }

  const tasks = await query.orderBy(tasksTable.createdAt);
  return tasks.map((t) => {
    const subject = t.subjectId ? subjectMap.get(t.subjectId) : null;
    return {
      id: t.id,
      title: t.title,
      description: t.description ?? null,
      completed: t.completed,
      xpReward: t.xpReward,
      priority: t.priority,
      subjectId: t.subjectId ?? null,
      subjectName: subject?.name ?? null,
      subjectColor: subject?.color ?? null,
      dueDate: t.dueDate ?? null,
      completedAt: t.completedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    };
  });
}

async function checkAndAwardBadges(profileXp: number, profileStreak: number, totalCompleted: number) {
  const definitions = await db.select().from(badgeDefinitionsTable);
  const earned = await db.select().from(earnedBadgesTable);
  const earnedIds = new Set(earned.map((e) => e.badgeId));
  const newBadges = [];

  for (const badge of definitions) {
    if (earnedIds.has(badge.id)) continue;
    let qualifies = false;
    if (badge.category === "xp" && profileXp >= badge.requiredValue) qualifies = true;
    if (badge.category === "streak" && profileStreak >= badge.requiredValue) qualifies = true;
    if (badge.category === "tasks" && totalCompleted >= badge.requiredValue) qualifies = true;
    if (badge.category === "level" && calcLevel(profileXp) >= badge.requiredValue) qualifies = true;
    if (qualifies) {
      await db.insert(earnedBadgesTable).values({ badgeId: badge.id });
      newBadges.push({ ...badge, earned: true, earnedAt: new Date().toISOString() });
    }
  }
  return newBadges;
}

router.get("/tasks", async (req, res): Promise<void> => {
  const parsed = GetTasksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const tasks = await getTasksWithSubjects({
    subjectId: parsed.data.subjectId ?? undefined,
    completed: parsed.data.completed ?? undefined,
  });
  res.json(GetTasksResponse.parse(tasks));
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const xpReward = parsed.data.xpReward ?? XP_BY_PRIORITY[parsed.data.priority] ?? 50;
  const [task] = await db
    .insert(tasksTable)
    .values({ ...parsed.data, xpReward })
    .returning();

  const subjects = await db.select().from(subjectsTable);
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const subject = task.subjectId ? subjectMap.get(task.subjectId) : null;

  res.status(201).json(
    GetTasksResponseItem.parse({
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      completed: task.completed,
      xpReward: task.xpReward,
      priority: task.priority,
      subjectId: task.subjectId ?? null,
      subjectName: subject?.name ?? null,
      subjectColor: subject?.color ?? null,
      dueDate: task.dueDate ?? null,
      completedAt: task.completedAt?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
    })
  );
});

router.patch("/tasks/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateTaskParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  let xpAwarded = 0;

  // Completing task for first time
  if (parsed.data.completed === true && !existing.completed) {
    updates.completedAt = new Date();
    xpAwarded = existing.xpReward;
  }

  const [task] = await db.update(tasksTable).set(updates).where(eq(tasksTable.id, params.data.id)).returning();

  // Update XP and streak if task was completed
  let profileData = null;
  let newBadges: any[] = [];

  if (xpAwarded > 0) {
    let [profile] = await db.select().from(profileTable).limit(1);
    if (!profile) {
      [profile] = await db.insert(profileTable).values({ name: "Student" }).returning();
    }

    const today = new Date().toISOString().split("T")[0];
    const lastDate = profile.lastStudiedDate;
    let newStreak = profile.streak;

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      if (lastDate === yesterdayStr) {
        newStreak = profile.streak + 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }
    }

    const newXp = profile.xp + xpAwarded;
    const newLongestStreak = Math.max(profile.longestStreak, newStreak);

    const [updatedProfile] = await db
      .update(profileTable)
      .set({
        xp: newXp,
        streak: newStreak,
        longestStreak: newLongestStreak,
        lastStudiedDate: today,
        level: calcLevel(newXp),
      })
      .where(eq(profileTable.id, profile.id))
      .returning();

    // Count total completed tasks
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasksTable)
      .where(eq(tasksTable.completed, true));

    newBadges = await checkAndAwardBadges(newXp, newStreak, count);

    const level = calcLevel(updatedProfile.xp);
    const currentLevelXp = xpForLevel(level);
    const nextLevelXp = xpForLevel(level + 1);

    profileData = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      xp: updatedProfile.xp,
      level,
      streak: updatedProfile.streak,
      xpToNextLevel: nextLevelXp - updatedProfile.xp,
      xpForCurrentLevel: nextLevelXp - currentLevelXp,
      avatar: updatedProfile.avatar ?? null,
    };
  }

  const subjects = await db.select().from(subjectsTable);
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const subject = task.subjectId ? subjectMap.get(task.subjectId) : null;

  const taskResult = {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    completed: task.completed,
    xpReward: task.xpReward,
    priority: task.priority,
    subjectId: task.subjectId ?? null,
    subjectName: subject?.name ?? null,
    subjectColor: subject?.color ?? null,
    dueDate: task.dueDate ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
  };

  res.json(
    UpdateTaskResponse.parse({
      task: taskResult,
      xpAwarded,
      newBadges: newBadges.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        earned: true,
        earnedAt: b.earnedAt,
        category: b.category,
      })),
      profile: profileData,
    })
  );
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteTaskParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(tasksTable).where(eq(tasksTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
