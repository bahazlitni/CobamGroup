// components/staff/articles/block-editor/blocks/GridContainerBlock.tsx

"use client";

import type { GridContainerBlockData } from "../block-types";
import { BlockCanvas } from "../BlockCanvas";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface GridContainerBlockProps {
  data: GridContainerBlockData;
  onChange: (data: GridContainerBlockData) => void;
}

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function GridContainerBlock({ data, onChange }: GridContainerBlockProps) {
  return (
    <div className="px-2 py-2 space-y-2">
      {/* Controls */}
      <div className="flex gap-3 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity pb-1 border-b border-dashed">
        <div className="flex items-center gap-1.5">
          <Label className="text-[10px] uppercase text-muted-foreground">Columns</Label>
          <Select
            value={String(data.columns)}
            onValueChange={(v) => onChange({ ...data, columns: Number(v) })}
          >
            <SelectTrigger className="h-6 text-xs w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((v) => (
                <SelectItem key={v} value={String(v)}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <Label className="text-[10px] uppercase text-muted-foreground">Gap</Label>
          <Select
            value={data.gap}
            onValueChange={(v) => onChange({ ...data, gap: v })}
          >
            <SelectTrigger className="h-6 text-xs w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["0", "2", "4", "6", "8"].map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Nested grid canvas */}
      <div
        className={cn(
          "rounded border border-dashed border-border/60 p-2 min-h-[60px] grid",
          GRID_COLS[data.columns] ?? "grid-cols-2",
          `gap-${data.gap}`
        )}
      >
        <BlockCanvas
          blocks={data.children}
          onChange={(children) => onChange({ ...data, children })}
          isNested
        />
      </div>
    </div>
  );
}