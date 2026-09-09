import { create } from "zustand";

import {
  createNote as createNoteAction,
  deleteNote as deleteNoteAction,
  updateNote as updateNoteAction,
} from "@/actions";
import type { notesTable } from "@/db/schema";

interface CanvasStore {
  notes: (typeof notesTable.$inferSelect)[];
  setNotes: (notes: (typeof notesTable.$inferSelect)[]) => void;
  updateNote: (note: typeof notesTable.$inferSelect) => void;
  createNote: (note: typeof notesTable.$inferInsert) => void;
  deleteNote: (note: typeof notesTable.$inferSelect) => void;
}

let updateTimeout: ReturnType<typeof setTimeout> | null = null;

const sortNotes = (notes: (typeof notesTable.$inferSelect)[]) =>
  [...notes].toSorted((a, b) => {
    if (a.position < b.position) {
      return -1;
    }
    if (a.position > b.position) {
      return 1;
    }
    return 0;
  });

export const useCanvasStore = create<CanvasStore>()((set) => ({
  createNote: async (note) => {
    const result = await createNoteAction(note);
    set((state) => ({
      notes: sortNotes([...state.notes, result]),
    }));
  },
  deleteNote: async (note) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== note.id),
    }));
    await deleteNoteAction(note);
  },
  notes: [],
  setNotes: (notes) => set({ notes: sortNotes(notes) }),
  updateNote: (note) => {
    set((state) => ({
      notes: sortNotes(state.notes.map((n) => (n.id === note.id ? note : n))),
    }));
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(async () => await updateNoteAction(note), 500);
  },
}));
