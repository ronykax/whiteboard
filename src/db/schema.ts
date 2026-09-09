import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

import type { Color } from "@/types";

export const notesTable = sqliteTable("notes", {
  color: text().$type<Color>().notNull().default("red"),
  html: text(),
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid(6)),
  x: int().notNull(),
  y: int().notNull(),
});
