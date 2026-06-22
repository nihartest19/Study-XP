import { Router, type IRouter } from "express";
import { eq, gte, sql, and } from "drizzle-orm";
import { db, tasksTable, profileTable, subjectsTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayCompleted = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(and(eq(tasksTable.completed, true), gte(tasksTable.completedAt, today)));

  const weekCompleted = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(and(eq(tasksTable.completed, true), gte(tasksTable.completedAt, weekAgo)));

  const xpToday = await db
    .select({ total: sql<number>`coalesce(sum(xp_reward), 0)::int` })
    .from(tasksTable)
    .where(and(eq(tasksTable.completed, true), gte(tasksTable.completedAt, today)));

  const xpWeek = await db
    .select({ total: sql<number>`coalesce(sum(xp_reward), 0)::int` })
    .from(tasksTable)
    .where(and(eq(tasksTable.completed, true), gte(tasksTable.completedAt, weekAgo)));

  const totalCompleted = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(eq(tasksTable.completed, true));

  let [profile] = await db.select().from(profileTable).limit(1);
  if (!profile) {
    [profile] = await db.insert(profileTable).values({ name: "Student" }).returning();
  }

  // Tasks per subject
  const subjects = await db.select().from(subjectsTable);
  const tasksBySubject = await db
    .select({
      subjectId: tasksTable.subjectId,
      count: sql<number>`count(*)::int`,
    })
    .from(tasksTable)
    .where(eq(tasksTable.completed, true))
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

  // Recent activity (last 10 completed tasks)
  const recentTasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.completed, true))
    .orderBy(sql`completed_at DESC`)
    .limit(10);

  const recentActivity = recentTasks.map((t) => ({
    taskTitle: t.title,
    xpAwarded: t.xpReward,
    completedAt: t.completedAt?.toISOString() ?? new Date().toISOString(),
  }));

  res.json(
    GetStatsResponse.parse({
      tasksCompletedToday: todayCompleted[0]?.count ?? 0,
      tasksCompletedThisWeek: weekCompleted[0]?.count ?? 0,
      xpEarnedToday: xpToday[0]?.total ?? 0,
      xpEarnedThisWeek: xpWeek[0]?.total ?? 0,
      totalTasksCompleted: totalCompleted[0]?.count ?? 0,
      currentStreak: profile.streak,
      longestStreak: profile.longestStreak,
      tasksPerSubject,
      recentActivity,
    })
  );
});

export default router;
