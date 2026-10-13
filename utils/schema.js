
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const GRADES = pgTable("grades", {
  id: serial("id").primaryKey(),
  grade: varchar("grade", { length: 10 }).notNull(),
});
