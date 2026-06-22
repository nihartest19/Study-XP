import { Router, type IRouter } from "express";
import { inArray } from "drizzle-orm";
import { db, badgeDefinitionsTable, earnedBadgesTable } from "@workspace/db";
import { GetBadgesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/badges", async (req, res): Promise<void> => {
  const definitions = await db.select().from(badgeDefinitionsTable).orderBy(badgeDefinitionsTable.id);
  const earned = await db.select().from(earnedBadgesTable);
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));
  const result = definitions.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    earned: earnedMap.has(b.id),
    earnedAt: earnedMap.get(b.id)?.toISOString() ?? null,
    category: b.category,
  }));
  res.json(GetBadgesResponse.parse(result));
});

export default router;
