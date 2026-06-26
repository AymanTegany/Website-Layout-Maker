import { pgTable, serial, text, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomStatusEnum = pgEnum("room_status", ["Normal", "Alert", "Warning"]);

export const roomsTable = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  floor: integer("floor").notNull(),
  area: real("area").notNull(),
  capacity: integer("capacity").notNull(),
  students: integer("students").notNull(),
  temperature: real("temperature").notNull(),
  energyUsage: real("energy_usage").notNull(),
  status: roomStatusEnum("status").notNull().default("Normal"),
  occupancyRate: real("occupancy_rate").notNull(),
});

export const insertRoomSchema = createInsertSchema(roomsTable).omit({ id: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof roomsTable.$inferSelect;
