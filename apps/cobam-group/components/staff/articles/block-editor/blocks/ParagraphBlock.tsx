// components/staff/articles/block-editor/blocks/ParagraphBlock.tsx

"use client";

import { useRef, useEffect } from "react";
import type { ParagraphBlockData } from "../block-types";
import { cn } from "@/lib/utils";

// Minimal inline format toolbar
const FORMATS = [
  { cmd: "bold", label: "B", style: "font-bold" },
  { cmd: "italic", label: "I", style: "italic" },
  { cmd: "underline", label: "U", style: "underline" },
  { cmd: "strikeThrough", label: "S", style: "line-through" },
];

interface ParagraphBlockProps {
  data: ParagraphBlockData;
  onChange: (data: ParagraphBlockData) => void;
}

export function ParagraphBlock({ data, onChange }: ParagraphBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== data.html) {
      ref.current.innerHTML = data.html;
    }
  }, []); // Only on mount to preserve cursor

  const execFormat = (cmd: string) => {
    document.execCommand(cmd, false);
    if (ref.current) {
      onChange({ ...data, html: ref.current.innerHTML });
    }
  };

  return (
    <div className="px-2 py-1">
      {/* Inline format bar */}
      <div className="flex gap-0.5 mb-1 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity">
        {FORMATS.map((f) => (
          <button
            key={f.cmd}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat(f.cmd);
            }}
            className={cn(
              "text-xs font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-accent transition-colors",
              f.style
            )}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Link URL:");
            if (url) document.execCommand("createLink", false, url);
            if (ref.current) onChange({ ...data, html: ref.current.innerHTML });
          }}
          className="text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-accent"
        >
          🔗
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Start writing…"
        className={cn(
          "w-full outline-none bg-transparent text-sm leading-relaxed min-h-[1.5em]",
          "prose prose-sm max-w-none",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
        )}
        onInput={(e) =>
          onChange({ ...data, html: (e.target as HTMLElement).innerHTML })
        }
      />
    </div>
  );
}