"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { notesTable } from "@/db/schema";

export const updateNote = async (note: typeof notesTable.$inferSelect) => {
  await db.update(notesTable).set(note).where(eq(notesTable.id, note.id));
};

export const createNote = async (note: typeof notesTable.$inferInsert) => {
  const [result] = await db.insert(notesTable).values(note).returning();
  return result;
};

export const deleteNote = async (note: typeof notesTable.$inferSelect) => {
  await db.delete(notesTable).where(eq(notesTable.id, note.id));
};
