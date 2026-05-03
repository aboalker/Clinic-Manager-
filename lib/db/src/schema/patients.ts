import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { doctorsTable } from "./doctors";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctorsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  bloodType: text("blood_type"),
  notes: text("notes"),
  lastVisitDate: timestamp("last_visit_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  doctorIdx: index("patients_doctor_idx").on(table.doctorId),
}));

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, createdAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
