import { PlusIcon } from "lucide-react";
import { useCallback } from "react";

import { useCanvasStore } from "@/stores/canvas";

export const Bottom = () => {
  const createNote = useCanvasStore((state) => state.createNote);

  const handleNewNote = useCallback(
    () =>
      createNote({
        color: "blue",
        html: "The quick brown jumps over the lazy dog.",
        x: 24,
        y: 24,
      }),
    [createNote]
  );

  return (
    <div className="fixed right-6 bottom-6 flex gap-4">
      <button
        type="button"
        className="flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-100 px-3 py-2 font-medium shadow-sm duration-100 hover:bg-zinc-200"
        onClick={handleNewNote}
      >
        <PlusIcon className="size-4.5" />
        New Note
      </button>
    </div>
  );
};
