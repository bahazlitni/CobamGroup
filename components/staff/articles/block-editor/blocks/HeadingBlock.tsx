// components/staff/articles/block-editor/blocks/HeadingBlock.tsx

"use client";

import { useRef } from "react";
import type { HeadingBlockData } from "../block-types";
import { cn } from "@/lib/utils";

interface HeadingBlockProps {
  data: HeadingBlockData;
  onChange: (data: HeadingBlockData) => void;
}

const HEADING_STYLES: Record<string, string> = {
  h1: "text-3xl font-bold",
  h2: "text-2xl font-bold",
  h3: "text-xl font-semibold",
  h4: "text-lg font-semibold",
  h5: "text-base font-semibold",
  h6: "text-sm font-semibold uppercase tracking-wide",
};

const HEADING_PLACEHOLDERS: Record<string, string> = {
  h1: "Heading 1…",
  h2: "Heading 2…",
  h3: "Heading 3…",
  h4: "Heading 4…",
  h5: "Heading 5…",
  h6: "Heading 6…",
};

export function HeadingBlock({ data, onChange }: HeadingBlockProps) {
  const Tag = data.type as keyof JSX.IntrinsicElements;

  return (
    <div className="px-2 py-1">
      {/* Level switcher */}
      <div className="flex gap-0.5 mb-1 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity">
        {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange({ ...data, type: level })}
            className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors",
              data.type === level
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            {level.toUpperCase()}
          </button>
        ))}
      </div>
      <Tag
        contentEditable
        suppressContentEditableWarning
        data-placeholder={HEADING_PLACEHOLDERS[data.type]}
        className={cn(
          HEADING_STYLES[data.type],
          "w-full outline-none bg-transparent leading-tight",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
        )}
        onInput={(e) =>
          onChange({ ...data, text: (e.target as HTMLElement).innerText })
        }
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
    </div>
  );
}