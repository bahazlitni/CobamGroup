// components/staff/articles/block-editor/BlockWrapper.tsx

"use client";

import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockWrapperProps {
  id: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  children: React.ReactNode;
  isNested?: boolean;
}

export function BlockWrapper({
  id,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  children,
  isNested = false,
}: BlockWrapperProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "relative group/block rounded-md transition-all",
        isNested ? "border border-transparent" : "border border-transparent",
        focused && "ring-1 ring-primary/30 border-primary/20 bg-muted/20"
      )}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      data-block-id={id}
    >
      {/* Floating toolbar — appears on hover/focus */}
      <div
        className={cn(
          "absolute -top-3 right-2 z-20 flex items-center gap-0.5 rounded-md border bg-background shadow-sm px-1 py-0.5",
          "opacity-0 group-hover/block:opacity-100 transition-opacity duration-100",
          focused && "opacity-100"
        )}
      >
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
        <div className="w-px h-3 bg-border mx-0.5" />
        <button
          type="button"
          onClick={onDuplicate}
          className="p-1 rounded hover:bg-accent"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded hover:bg-destructive/10 hover:text-destructive"
          title="Remove"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        <div className="w-px h-3 bg-border mx-0.5" />
        <span
          className="p-1 cursor-grab text-muted-foreground"
          title="Drag to reorder (coming soon)"
        >
          <GripVertical className="w-3 h-3" />
        </span>
      </div>

      {/* Block content */}
      <div className="relative">{children}</div>
    </div>
  );
}