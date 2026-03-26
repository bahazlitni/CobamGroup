// components/staff/articles/block-editor/BlockInserter.tsx

"use client";

import { useState } from "react";
import { BlockPicker } from "./BlockPicker";
import type { BlockType } from "./block-types";
import { cn } from "@/lib/utils";

interface BlockInserterProps {
  afterIndex: number;
  onInsert: (type: BlockType, afterIndex: number) => void;
}

export function BlockInserter({ afterIndex, onInsert }: BlockInserterProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center group my-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "absolute inset-x-0 h-px transition-all duration-150",
          hovered ? "bg-primary/40" : "bg-transparent group-hover:bg-border"
        )}
      />
      <div
        className={cn(
          "relative z-10 mx-auto transition-opacity duration-150",
          hovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <BlockPicker onInsert={(type) => onInsert(type, afterIndex)} />
      </div>
    </div>
  );
}