import { generateKeyBetween } from "fractional-indexing";
import { PlusIcon, Loader2 } from "lucide-react";
import { useTransition } from "react";

import { useCanvasStore } from "@/canvas-store";
import type { Camera } from "@/types";

export const Bottom = ({ camera }: { camera: Camera }) => {
  const createNote = useCanvasStore((state) => state.createNote);
  const notes = useCanvasStore((state) => state.notes);
  const [isPending, startTransition] = useTransition();

  const handleNewNote = () => {
    const lastNote = notes.at(-1);
    const position = generateKeyBetween(lastNote?.position || null, null);
    startTransition(() => {
      createNote({
        color: "blue",
        html: "The quick brown jumps over the lazy dog.",
        position,
        x: (window.innerWidth / 2 - camera.x) / camera.scale,
        y: (window.innerHeight / 2 - camera.y) / camera.scale,
      });
    });
  };

  return (
    <div className="fixed right-6 bottom-6 flex gap-4">
      <button
        type="button"
        disabled={isPending}
        className="border-panel-border bg-panel text-foreground hover:bg-panel-hover flex items-center gap-2 rounded-sm border px-3 py-2 font-medium shadow-sm duration-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleNewNote}
      >
        {isPending ? (
          <Loader2 className="size-4.5 animate-spin" />
        ) : (
          <PlusIcon className="size-4.5" />
        )}

        {isPending ? "Creating..." : "New Note"}
      </button>
    </div>
  );
};
