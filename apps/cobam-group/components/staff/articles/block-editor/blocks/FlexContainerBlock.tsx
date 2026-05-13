// components/staff/articles/block-editor/blocks/FlexContainerBlock.tsx

"use client";

import type { FlexContainerBlockData, BlockType, BlockData } from "../block-types";
import { BlockCanvas } from "../BlockCanvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

interface FlexContainerBlockProps {
  data: FlexContainerBlockData;
  onChange: (data: FlexContainerBlockData) => void;
}

export function FlexContainerBlock({ data, onChange }: FlexContainerBlockProps) {
  return (
    <div className="px-2 py-2 space-y-2">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity pb-1 border-b border-dashed">
        <div className="flex items-center gap-1.5">
          <Label className="text-[10px] uppercase text-muted-foreground">Direction</Label>
          <Select
            value={data.direction}
            onValueChange={(v) => onChange({ ...data, direction: v as "row" | "column" })}
          >
            <SelectTrigger className="h-6 text-xs w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="row">Row</SelectItem>
              <SelectItem value="column">Column</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <Label className="text-[10px] uppercase text-muted-foreground">Align</Label>
          <Select
            value={data.align}
            onValueChange={(v) => onChange({ ...data, align: v as FlexContainerBlockData["align"] })}
          >
            <SelectTrigger className="h-6 text-xs w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["start", "center", "end", "stretch"].map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
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

      {/* Nested canvas */}
      <div
        className={cn(
          "rounded border border-dashed border-border/60 p-2 min-h-[60px]",
          data.direction === "row" ? "flex flex-wrap" : "flex flex-col",
          `gap-${data.gap}`,
          data.align === "center" && "items-center",
          data.align === "end" && "items-end",
          data.align === "stretch" && "items-stretch"
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