import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// Grades/classes available in the school
export const GRADES = pgTable("grades", {
  id: serial("id").primaryKey(),
  grade: varchar("grade", { length: 10 }).notNull(),
});

// Students
export const STUDENTS = pgTable("students", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 10 }).notNull(),
  contact: varchar("contact", { length: 20 }),
  address: varchar("address", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance records — one row per student per date
export const ATTENDANCE = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => STUDENTS.id, { onDelete: "cascade" }),
  present: boolean("present").notNull().default(false),
  date: date("date").notNull(),             // e.g. "2024-10-30"
  grade: varchar("grade", { length: 10 }),  // denormalised for fast queries
});
