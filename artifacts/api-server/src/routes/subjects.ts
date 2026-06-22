import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, subjectsTable, tasksTable } from "@workspace/db";
import { CreateSubjectBody, GetSubjectsResponse, GetSubjectsResponseItem } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/subjects", async (req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable).orderBy(subjectsTable.name);
  const taskCounts = await db
    .select({ subjectId: tasksTable.subjectId, count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .groupBy(tasksTable.subjectId);
  const countMap = new Map(taskCounts.map((r) => [r.subjectId, r.count]));
  const result = subjects.map((s) => ({ ...s, taskCount: countMap.get(s.id) ?? 0 }));
  res.json(GetSubjectsResponse.parse(result));
});

router.post("/subjects", async (req, res): Promise<void> => {
  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [subject] = await db.insert(subjectsTable).values(parsed.data).returning();
  res.status(201).json(GetSubjectsResponseItem.parse({ ...subject, taskCount: 0 }));
});

export default router;
