import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useGesture } from "@use-gesture/react";
import { cn } from "cn";
import { generateKeyBetween } from "fractional-indexing";
import {
  CopyPlusIcon,
  LayersArrowDownIcon,
  LayersArrowUpIcon,
  TrashIcon,
} from "lucide-react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import type { notesTable } from "@/db/schema";
import { useCanvasStore } from "@/stores/canvas";
import { useSelectedNoteIdStore } from "@/stores/selected-note";
import type { Color } from "@/types";

const COLORS: Record<Color, string> = {
  blue: "bg-blue-200 border border-blue-300",
  emerald: "bg-emerald-200 border border-emerald-300",
  orange: "bg-orange-200 border border-orange-300",
  pink: "bg-pink-200 border border-pink-300",
  purple: "bg-purple-200 border border-purple-300",
  red: "bg-red-200 border border-red-300",
  sky: "bg-sky-200 border border-sky-300",
  yellow: "bg-yellow-200 border border-yellow-300",
};

const editorClassNames = [
  "prose leading-normal focus:outline-none",

  // elements
  "prose-h1:tracking-tight prose-h1:font-bold prose-h1:text-2xl",
  "prose-h2:tracking-tight prose-h2:font-bold prose-h2:text-xl",
  "prose-h3:tracking-tight prose-h3:font-bold prose-h3:text-lg",

  "prose-p:font-medium prose-hr:border-black prose-li:marker:text-black prose-blockquote:border-black",
  "prose-pre:bg-black prose-pre:text-white",
  "prose-blockquote:font-serif",
  "prose-code:font-mono",
].join(" ");

export const NoteItem = ({
  note,
  camera,
}: {
  note: typeof notesTable.$inferSelect;
  camera: { x: number; y: number; scale: number };
}) => {
  const updateNote = useCanvasStore((s) => s.updateNote);
  const deleteNote = useCanvasStore((s) => s.deleteNote);
  const notes = useCanvasStore((s) => s.notes);

  const selectedNoteId = useSelectedNoteIdStore((s) => s.selectedNoteId);
  const setSelectedNoteId = useSelectedNoteIdStore((s) => s.setSelectedNoteId);

  const [isEditingState, setIsEditingState] = useState(false);

  const isSelected = selectedNoteId === note.id;
  const isEditing = isSelected && isEditingState;

  const editor = useEditor({
    content: note.html,
    editable: false,
    editorProps: {
      attributes: {
        class: editorClassNames,
      },
    },
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    immediatelyRender: true,
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      if (html !== note.html) {
        updateNote({ ...note, html });
      }
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (editor.isEditable !== isEditing) {
      editor.setEditable(isEditing, false);
    }

    if (isEditing) {
      editor.commands.focus("end");
    }
  }, [editor, isEditing]);

  const bind = useGesture(
    {
      onClick: () => {
        if (isSelected) {
          setIsEditingState(true);
        } else {
          setSelectedNoteId(note.id);
          setIsEditingState(false);
        }
      },
      onDrag: ({ delta: [x, y], event, cancel, tap }) => {
        if (tap) {
          return;
        }

        if ("touches" in event && event.touches.length > 1) {
          cancel();
          return;
        }

        if (!isSelected) {
          setSelectedNoteId(note.id);
          setIsEditingState(false);
        }
        updateNote({ ...note, x: note.x + x, y: note.y + y });
      },
    },
    {
      drag: {
        filterTaps: true,
        pointer: { touch: true },
      },
      enabled: !isEditing,
    }
  );

  const handleColorChange = useCallback(
    (
      event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
      color: Color
    ) => {
      event.stopPropagation();
      updateNote({ ...note, color });
    },
    [updateNote, note]
  );

  const handleDuplicate = useCallback(
    (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      // handle note duplication
    },
    []
  );

  const handleDelete = useCallback(
    (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      deleteNote(note);
    },
    [deleteNote, note]
  );

  // src/components/note.tsx

  const handleBringForward = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const index = notes.findIndex((n) => n.id === note.id);
      // Already at the top (or note not found)
      if (index === -1 || index === notes.length - 1) {
        return;
      }

      const currentNote = notes[index];
      const nextNote = notes[index + 1];
      const nextNextNote = notes[index + 2];

      // Place between the note above and the one above that (or null if reaching top)
      const newPosition = generateKeyBetween(
        nextNote.position,
        nextNextNote?.position || null
      );

      updateNote({ ...currentNote, position: newPosition });
    },
    [notes, note.id, updateNote]
  );

  const handleSendBackward = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const index = notes.findIndex((n) => n.id === note.id);
      // Already at the bottom
      if (index <= 0) {
        return;
      }

      const currentNote = notes[index];
      const prevNote = notes[index - 1];
      const prevPrevNote = notes[index - 2];

      // Place between the note 2 steps below (or null if reaching bottom) and the note below
      const newPosition = generateKeyBetween(
        prevPrevNote?.position || null,
        prevNote.position
      );

      updateNote({ ...currentNote, position: newPosition });
    },
    [notes, note.id, updateNote]
  );

  const noteContent = (
    <div
      style={{ left: note.x, top: note.y }}
      className={cn(
        "pointer-events-auto absolute h-fit w-sm rounded-sm p-4 shadow-md",
        COLORS[note.color],
        !isEditing && "touch-none select-none",
        isSelected && "ring-2 ring-blue-500"
      )}
      {...bind()}
    >
      {/* top bar */}
      <div
        className={cn(
          isSelected ? "flex" : "hidden",
          "absolute bottom-full left-1/2 z-999 origin-bottom -translate-x-1/2 rounded-md border border-zinc-200 bg-zinc-100"
        )}
        style={{
          transform: `scale(${1 / camera.scale}) translateY(${camera.scale * -12}px)`,
        }}
      >
        <div className="flex gap-2 p-1.5">
          {Object.keys(COLORS)
            .filter((k): k is Color => k in COLORS)
            .map((k) => (
              <button
                type="button"
                aria-label={k}
                onClick={(e) => handleColorChange(e, k)}
                key={COLORS[k]}
                className={cn(
                  "flex size-8 items-center justify-center rounded-sm",
                  COLORS[k]
                )}
              >
                <div className={cn(COLORS[k], "rounded-full border-10")} />
              </button>
            ))}
        </div>

        <div className="h-11 w-px bg-zinc-200" />

        <div className="flex gap-1 p-1.5">
          <button
            type="button"
            aria-label="Duplicate"
            className="flex size-8 items-center justify-center rounded-sm hover:bg-zinc-200"
            onClick={handleDuplicate}
          >
            <CopyPlusIcon className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Delete"
            className="flex size-8 items-center justify-center rounded-sm hover:bg-zinc-200"
            onClick={handleDelete}
          >
            <TrashIcon className="size-5 text-red-500" />
          </button>

          <button
            type="button"
            aria-label="Bring forward"
            className="flex size-8 items-center justify-center rounded-sm hover:bg-zinc-200"
            onClick={handleBringForward}
          >
            <LayersArrowUpIcon className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Send backward"
            className="flex size-8 items-center justify-center rounded-sm hover:bg-zinc-200"
            onClick={handleSendBackward}
          >
            <LayersArrowDownIcon className="size-5" />
          </button>
        </div>
      </div>

      <div
        className={isEditing ? "pointer-events-auto" : "pointer-events-none"}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );

  return (
    <DismissableLayer
      asChild
      onDismiss={
        isSelected
          ? () => {
              setSelectedNoteId(null);
              setIsEditingState(false);
            }
          : undefined
      }
    >
      {noteContent}
    </DismissableLayer>
  );
};
