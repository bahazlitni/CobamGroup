"use client";

import type { DragEventHandler } from "react";
import { GripVertical } from "lucide-react";
import { AnimatedUIButton, type ButtonVariant } from "@/components/ui/custom/AnimatedUIButton";
import type { AnimatedIconName } from "@/components/ui/custom/AnimatedIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ArticleEditorCardHeaderAction = {
  key: string;
  label: string;
  icon: AnimatedIconName;
  variant?: ButtonVariant;
  disabled?: boolean;
  tone?: "default" | "danger";
  onClick: () => void;
};

type ArticleEditorCardHeaderProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  dragHandleLabel: string;
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
  onDragEnd?: DragEventHandler<HTMLButtonElement>;
  actions: ArticleEditorCardHeaderAction[];
  className?: string;
};

export default function ArticleEditorCardHeader({
  value,
  onChange,
  placeholder,
  disabled = false,
  dragHandleLabel,
  draggable = false,
  onDragStart,
  onDragEnd,
  actions,
  className,
}: ArticleEditorCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-slate-100 bg-slate-50/75 p-4",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          draggable={draggable && !disabled}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          disabled={disabled}
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition",
            "hover:border-sky-200 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label={dragHandleLabel}
        >
          <GripVertical className="size-4" />
        </button>

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-cobam-dark-blue h-auto min-h-11 w-full border-0 bg-transparent p-0 text-lg leading-tight font-semibold shadow-none outline-none placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <AnimatedUIButton
            key={action.key}
            type="button"
            variant={action.variant ?? "ghost"}
            size="sm"
            icon={action.icon}
            iconPosition="left"
            onClick={action.onClick}
            disabled={action.disabled}
            textClassName={action.tone === "danger" ? "text-red-600" : undefined}
            iconClassName={action.tone === "danger" ? "text-red-600" : undefined}
          >
            {action.label}
          </AnimatedUIButton>
        ))}
      </div>
    </div>
  );
}
