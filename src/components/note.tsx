import { useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useGesture } from "@use-gesture/react";
import { cn } from "cn";
import { generateKeyBetween } from "fractional-indexing";
import {
  CheckIcon,
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
import type { Camera, Color } from "@/types";

const COLORS: Record<Color, string> = {
  blue: "bg-note-blue border border-note-blue-border",
  emerald: "bg-note-emerald border border-note-emerald-border",
  orange: "bg-note-orange border border-note-orange-border",
  pink: "bg-note-pink border border-note-pink-border",
  purple: "bg-note-purple border border-note-purple-border",
  red: "bg-note-red border border-note-red-border",
  sky: "bg-note-sky border border-note-sky-border",
  yellow: "bg-note-yellow border border-note-yellow-border",
};

const editorClassNames = [
  "prose leading-normal focus:outline-none dark:prose-invert",

  // elements
  "prose-h1:tracking-tight prose-h1:font-bold prose-h1:text-2xl",
  "prose-h2:tracking-tight prose-h2:font-bold prose-h2:text-xl",
  "prose-h3:tracking-tight prose-h3:font-bold prose-h3:text-lg",

  "prose-p:font-medium prose-hr:border-foreground prose-li:marker:text-foreground prose-blockquote:border-foreground",
  "prose-pre:bg-foreground prose-pre:text-background",
  "prose-blockquote:font-serif",
  "prose-code:font-mono",
].join(" ");

export const NoteItem = ({
  note,
  camera,
}: {
  note: typeof notesTable.$inferSelect;
  camera: Camera;
}) => {
  const updateNote = useCanvasStore((s) => s.updateNote);
  const deleteNote = useCanvasStore((s) => s.deleteNote);
  const notes = useCanvasStore((s) => s.notes);

  const selectedNoteId = useSelectedNoteIdStore((s) => s.selectedNoteId);
  const setSelectedNoteId = useSelectedNoteIdStore((s) => s.setSelectedNoteId);

  const [isEditingState, setIsEditingState] = useState(false);

  const isSelected = selectedNoteId === note.id;
  const isEditing = isSelected && isEditingState;

  const {
    context,
    refs: { setReference },
  } = useFloating({
    onOpenChange: (open) => {
      if (!open) {
        setSelectedNoteId(null);
        setIsEditingState(false);
      }
    },
    open: isSelected,
  });

  const dismiss = useDismiss(context);
  const { getReferenceProps } = useInteractions([dismiss]);

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

        updateNote({
          ...note,
          x: note.x + x / camera.scale,
          y: note.y + y / camera.scale,
        });
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

  return (
    <div
      ref={setReference}
      style={{ left: note.x, top: note.y }}
      className={cn(
        "pointer-events-auto absolute h-fit w-sm rounded-sm p-4 shadow-md",
        COLORS[note.color],
        !isEditing && "touch-none select-none",
        isSelected && "ring-2 ring-blue-500"
      )}
      {...bind()}
      {...getReferenceProps()}
    >
      {/* top bar */}
      <div
        className={cn(
          isSelected ? "flex" : "hidden",
          "border-panel-border bg-panel text-foreground absolute bottom-full left-1/2 z-999 origin-bottom -translate-x-1/2 rounded-md border shadow-lg backdrop-blur-sm"
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
                  "relative flex size-8 items-center justify-center rounded-sm transition-transform hover:scale-105 active:scale-95",
                  COLORS[k]
                )}
                disabled={note.color === k}
              >
                {note.color === k && (
                  // <div className="bg-foreground size-2 rounded-full shadow-xs" />
                  <CheckIcon className="size-4.5" />
                )}
              </button>
            ))}
        </div>

        <div className="bg-panel-border h-11 w-px" />

        <div className="flex gap-0 p-1.5">
          <button
            type="button"
            aria-label="Duplicate"
            className="text-foreground hover:bg-panel-hover flex size-8 items-center justify-center rounded-sm"
            onClick={handleDuplicate}
          >
            <CopyPlusIcon className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Delete"
            className="hover:bg-panel-hover flex size-8 items-center justify-center rounded-sm text-red-500"
            onClick={handleDelete}
          >
            <TrashIcon className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Bring forward"
            className="text-foreground hover:bg-panel-hover flex size-8 items-center justify-center rounded-sm"
            onClick={handleBringForward}
          >
            <LayersArrowUpIcon className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Send backward"
            className="text-foreground hover:bg-panel-hover flex size-8 items-center justify-center rounded-sm"
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
};
