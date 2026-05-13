// components/staff/articles/block-editor/BlockPicker.tsx

"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BLOCK_PICKER_ITEMS, type BlockType } from "./block-types";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<string, string> = {
  text: "Text",
  media: "Media",
  lists: "Lists & Tables",
  advanced: "Layout",
};

interface BlockPickerProps {
  onInsert: (type: BlockType) => void;
  variant?: "inline" | "floating";
}

export function BlockPicker({ onInsert, variant = "inline" }: BlockPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? BLOCK_PICKER_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      )
    : BLOCK_PICKER_ITEMS;

  const groups = Array.from(new Set(filtered.map((i) => i.group)));

  const handleSelect = (type: BlockType) => {
    onInsert(type);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center justify-center rounded-full transition-all",
            variant === "inline"
              ? "w-7 h-7 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary"
              : "w-9 h-9 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-105"
          )}
          aria-label="Insert block"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start" sideOffset={8}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Insert Block
        </p>
        <Input
          placeholder="Search blocks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 h-8 text-sm"
          autoFocus
        />
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 px-1">
                {GROUP_LABELS[group] ?? group}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {filtered
                  .filter((i) => i.group === group)
                  .map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleSelect(item.type)}
                      className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-left transition-colors"
                    >
                      <span className="text-base leading-none mt-0.5 w-5 shrink-0 font-mono text-muted-foreground">
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-xs font-medium leading-none">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No blocks found.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}