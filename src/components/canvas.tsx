"use client";

import { useGesture } from "@use-gesture/react";
import { useEffect, useRef, useState } from "react";

import { useCanvasStore } from "@/canvas-store";
import type { notesTable } from "@/db/schema";
import type { Camera } from "@/types";

import { Bottom } from "./bottom";
import { NoteItem } from "./note";

const INITIAL_CAMERA: Camera = { scale: 1, x: 0, y: 0 };

export const Canvas = ({
  initialNotes,
}: {
  initialNotes: (typeof notesTable.$inferSelect)[];
}) => {
  const [camera, setCamera] = useState(INITIAL_CAMERA);
  const notes = useCanvasStore((state) => state.notes);
  const setNotes = useCanvasStore((state) => state.setNotes);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    () =>
      // oxlint-disable-next-line react/set-state-in-effect
      setCamera(
        JSON.parse(
          localStorage.getItem("cam") ?? JSON.stringify(INITIAL_CAMERA)
        )
      ),
    [setCamera]
  );

  useEffect(() => {
    if (camera !== INITIAL_CAMERA) {
      localStorage.setItem("cam", JSON.stringify(camera));
    }
  }, [camera]);

  useEffect(() => setNotes(initialNotes), [setNotes, initialNotes]);

  useGesture(
    {
      onPinch: ({ origin: [ox, oy], first, memo = [ox, oy], offset: [s] }) => {
        if (first) {
          return [ox, oy];
        }

        setCamera((cam) => {
          const d = s / cam.scale;
          return {
            scale: s,
            x: ox - (memo[0] - cam.x) * d,
            y: oy - (memo[1] - cam.y) * d,
          };
        });

        return [ox, oy];
      },
      onWheel: ({ delta: [dx, dy], pinching }) => {
        if (pinching) {
          return;
        }
        setCamera((cam) => ({ ...cam, x: cam.x - dx, y: cam.y - dy }));
      },
    },
    {
      pinch: {
        from: () => [camera.scale, 0],
        scaleBounds: { max: 6, min: 0.1 },
      },
      target: canvasRef,
    }
  );

  // dotted background
  const scale = Math.max(camera.scale, 0.1);
  const gap = 36 * scale;
  const dotRadius = (2 / 2) * scale;
  const offsetX = (((camera.x - gap / 2) % gap) + gap) % gap;
  const offsetY = (((camera.y - gap / 2) % gap) + gap) % gap;

  return (
    <>
      <div
        className="relative h-screen w-screen touch-none overflow-hidden overscroll-none"
        ref={canvasRef}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden select-none"
        >
          <div
            style={{
              backgroundImage: `radial-gradient(circle at ${gap / 2}px ${gap / 2}px, var(--color-foreground) ${dotRadius}px, transparent ${dotRadius + 0.75}px)`,
              backgroundSize: `${gap}px ${gap}px`,
              height: `calc(100% + ${gap * 4}px)`,
              left: -gap * 2,
              opacity: "25%",
              position: "absolute",
              top: -gap * 2,
              transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
              width: `calc(100% + ${gap * 4}px)`,
              willChange: "transform",
            }}
          />
        </div>

        <div
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
            transformOrigin: "0 0",
          }}
          className="pointer-events-none relative"
        >
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} camera={camera} />
          ))}
        </div>
      </div>

      <Bottom camera={camera} />
    </>
  );
};
