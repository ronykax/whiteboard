import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useGesture } from "@use-gesture/react";
import { cn } from "cn";
import { CopyIcon, Trash2Icon } from "lucide-react";
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
  "prose-h1:tracking-tight prose-h1:font-bold",
  "prose-h2:tracking-tight prose-h2:font-bold",
  "prose-h3:tracking-tight prose-h3:font-bold",
  "prose-h4:tracking-tight prose-h4:font-bold",
  "prose-h5:tracking-tight prose-h5:font-bold",
  "prose-h6:tracking-tight prose-h6:font-bold",

  "prose-p:font-medium prose-hr:border-black prose-li:marker:text-black",
  "prose-blockquote:font-serif prose-blockquote:border-black",

  // code
  "prose-code:font-mono",
  "prose-pre:bg-black prose-pre:text-white",
].join(" ");

export const NoteItem = ({
  note,
}: {
  note: typeof notesTable.$inferSelect;
}) => {
  const updateNote = useCanvasStore((state) => state.updateNote);
  const deleteNote = useCanvasStore((state) => state.deleteNote);
  const { selectedNoteId, setSelectedNoteId } = useSelectedNoteIdStore();
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
    extensions: [StarterKit.configure()],
    immediatelyRender: true,
    onBlur: () => setIsEditingState(false),
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

        setSelectedNoteId(note.id);
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
    (color: Color) => updateNote({ ...note, color }),
    [updateNote, note]
  );

  const handleCopy = useCallback(
    () => navigator.clipboard.writeText(editor.getText()),
    [editor]
  );

  const handleDelete = useCallback(() => deleteNote(note), [deleteNote, note]);

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
      <div
        className={cn(
          isSelected ? "flex" : "hidden",
          "absolute -top-12 left-1/2 z-999 -translate-x-1/2 rounded-sm border border-zinc-200 bg-zinc-100"
        )}
      >
        <div className="flex gap-1 p-1">
          {Object.keys(COLORS)
            .filter((k): k is Color => k in COLORS)
            .map((k) => (
              <button
                type="button"
                aria-label={k}
                onClick={() => handleColorChange(k)}
                key={COLORS[k]}
                className={cn("size-6 rounded-xs", COLORS[k])}
              />
            ))}
        </div>

        <div className="h-8 w-px bg-zinc-200" />

        <div className="flex gap-0.5 p-1">
          <button
            type="button"
            aria-label="Copy"
            className="flex size-6 items-center justify-center rounded-xs hover:bg-zinc-200"
            onClick={handleCopy}
          >
            <CopyIcon className="size-4.5" />
          </button>

          <button
            type="button"
            aria-label="Delete"
            className="flex size-6 items-center justify-center rounded-xs hover:bg-zinc-200"
            onClick={handleDelete}
          >
            <Trash2Icon className="size-4.5 text-red-500" />
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

  if (isSelected) {
    return (
      <DismissableLayer asChild onDismiss={() => setSelectedNoteId(null)}>
        {noteContent}
      </DismissableLayer>
    );
  }

  return noteContent;
};
