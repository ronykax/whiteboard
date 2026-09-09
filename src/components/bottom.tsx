import { PlusIcon, Loader2 } from "lucide-react";
import { useTransition } from "react";

import { useCanvasStore } from "@/stores/canvas";

export const Bottom = () => {
  const createNote = useCanvasStore((state) => state.createNote);
  const [isPending, startTransition] = useTransition();

  const handleNewNote = () => {
    startTransition(() => {
      createNote({
        color: "blue",
        html: "The quick brown jumps over the lazy dog.",
        x: 24,
        y: 24,
      });
    });
  };

  return (
    <div className="fixed right-6 bottom-6 flex gap-4">
      <button
        type="button"
        disabled={isPending}
        className="flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-100 px-3 py-2 font-medium shadow-sm duration-100 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
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
