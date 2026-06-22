import { Router, type IRouter } from "express";
import { eq, gte, sql, and } from "drizzle-orm";
import { db, tasksTable, profileTable, subjectsTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";
import { getOrCreateProfile } from "./profile";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const userId = req.userId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const userCompleted = and(eq(tasksTable.userId, userId), eq(tasksTable.completed, true));

  const [todayCompleted] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(and(userCompleted, gte(tasksTable.completedAt, today)));

  const [weekCompleted] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(and(userCompleted, gte(tasksTable.completedAt, weekAgo)));

  const [xpToday] = await db
    .select({ total: sql<number>`coalesce(sum(xp_reward), 0)::int` })
    .from(tasksTable)
    .where(and(userCompleted, gte(tasksTable.completedAt, today)));

  const [xpWeek] = await db
    .select({ total: sql<number>`coalesce(sum(xp_reward), 0)::int` })
    .from(tasksTable)
    .where(and(userCompleted, gte(tasksTable.completedAt, weekAgo)));

  const [totalCompleted] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(userCompleted);

  const profile = await getOrCreateProfile(userId);

  const subjects = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.userId, userId));

  const tasksBySubject = await db
    .select({
      subjectId: tasksTable.subjectId,
      count: sql<number>`count(*)::int`,
    })
    .from(tasksTable)
    .where(userCompleted)
    .groupBy(tasksTable.subjectId);

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const tasksPerSubject = tasksBySubject
    .filter((r) => r.subjectId != null)
    .map((r) => {
      const subject = subjectMap.get(r.subjectId!);
      return {
        subjectName: subject?.name ?? "Unknown",
        color: subject?.color ?? "#6366f1",
        count: r.count,
      };
    });

  const recentTasks = await db
    .select()
    .from(tasksTable)
    .where(userCompleted)
    .orderBy(sql`completed_at DESC`)
    .limit(10);

  const recentActivity = recentTasks.map((t) => ({
    taskTitle: t.title,
    xpAwarded: t.xpReward,
    completedAt: t.completedAt?.toISOString() ?? new Date().toISOString(),
  }));

  res.json(
    GetStatsResponse.parse({
      tasksCompletedToday: todayCompleted?.count ?? 0,
      tasksCompletedThisWeek: weekCompleted?.count ?? 0,
      xpEarnedToday: xpToday?.total ?? 0,
      xpEarnedThisWeek: xpWeek?.total ?? 0,
      totalTasksCompleted: totalCompleted?.count ?? 0,
      currentStreak: profile.streak,
      longestStreak: profile.longestStreak,
      tasksPerSubject,
      recentActivity,
    }),
  );
});

export default router;
