import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertSeverityEnum = pgEnum("alert_severity", ["red", "yellow", "green"]);

export const aiAlertsTable = pgTable("ai_alerts", {
  id: serial("id").primaryKey(),
  roomName: text("room_name").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  severity: alertSeverityEnum("severity").notNull().default("yellow"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAiAlertSchema = createInsertSchema(aiAlertsTable).omit({ id: true });
export type InsertAiAlert = z.infer<typeof insertAiAlertSchema>;
export type AiAlert = typeof aiAlertsTable.$inferSelect;
