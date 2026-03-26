// components/staff/articles/block-editor/blocks/ListBlock.tsx

"use client";

import { useRef } from "react";
import type { ListBlockData } from "../block-types";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListBlockProps {
  data: ListBlockData;
  onChange: (data: ListBlockData) => void;
}

export function ListBlock({ data, onChange }: ListBlockProps) {
  const updateItem = (index: number, value: string) => {
    const items = [...data.items];
    items[index] = value;
    onChange({ ...data, items });
  };

  const addItem = (afterIndex: number) => {
    const items = [...data.items];
    items.splice(afterIndex + 1, 0, "");
    onChange({ ...data, items });
  };

  const removeItem = (index: number) => {
    if (data.items.length === 1) return;
    const items = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(index);
    }
    if (e.key === "Backspace" && data.items[index] === "" && data.items.length > 1) {
      e.preventDefault();
      removeItem(index);
    }
  };

  return (
    <div className="px-2 py-1">
      <div className="flex gap-1 mb-1 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onChange({ ...data, type: "ul" })}
          className={cn(
            "text-[10px] px-2 py-0.5 rounded border transition-colors",
            data.type === "ul"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:bg-accent"
          )}
        >
          Bullet
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...data, type: "ol" })}
          className={cn(
            "text-[10px] px-2 py-0.5 rounded border transition-colors",
            data.type === "ol"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:bg-accent"
          )}
        >
          Numbered
        </button>
      </div>

      {data.type === "ol" ? (
        <ol className="list-decimal list-inside space-y-1">
          {data.items.map((item, i) => (
            <li key={i} className="flex items-start gap-1 group/item">
              <div
                contentEditable
                suppressContentEditableWarning
                data-placeholder={`Item ${i + 1}…`}
                className={cn(
                  "flex-1 outline-none text-sm bg-transparent leading-relaxed",
                  "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
                )}
                onInput={(e) => updateItem(i, (e.target as HTMLElement).innerText)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                dangerouslySetInnerHTML={{ __html: item }}
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="opacity-0 group-hover/item:opacity-100 p-0.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {data.items.map((item, i) => (
            <li key={i} className="flex items-start gap-1 group/item">
              <div
                contentEditable
                suppressContentEditableWarning
                data-placeholder={`Item ${i + 1}…`}
                className={cn(
                  "flex-1 outline-none text-sm bg-transparent leading-relaxed",
                  "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
                )}
                onInput={(e) => updateItem(i, (e.target as HTMLElement).innerText)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                dangerouslySetInnerHTML={{ __html: item }}
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="opacity-0 group-hover/item:opacity-100 p-0.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => addItem(data.items.length - 1)}
        className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <Plus className="w-3 h-3" /> Add item
      </button>
    </div>
  );
}