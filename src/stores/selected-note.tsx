import { create } from "zustand";

interface SelectedNoteIdStore {
  selectedNoteId: string | null;
  setSelectedNoteId: (selectedNote: string | null) => void;
}

export const useSelectedNoteIdStore = create<SelectedNoteIdStore>((set) => ({
  selectedNoteId: null,
  setSelectedNoteId: (selectedNote) => set({ selectedNoteId: selectedNote }),
}));
