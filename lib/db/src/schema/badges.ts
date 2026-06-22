import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const badgeDefinitionsTable = pgTable("badge_definitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  requiredValue: integer("required_value").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const earnedBadgesTable = pgTable("earned_badges", {
  id: serial("id").primaryKey(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBadgeDefinitionSchema = createInsertSchema(badgeDefinitionsTable).omit({ id: true, createdAt: true });
export type InsertBadgeDefinition = z.infer<typeof insertBadgeDefinitionSchema>;
export type BadgeDefinition = typeof badgeDefinitionsTable.$inferSelect;

export const insertEarnedBadgeSchema = createInsertSchema(earnedBadgesTable).omit({ id: true, earnedAt: true });
export type InsertEarnedBadge = z.infer<typeof insertEarnedBadgeSchema>;
export type EarnedBadge = typeof earnedBadgesTable.$inferSelect;
