"use client";

import type { ChangeEvent, ComponentProps, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AiSuggestionActionsRow,
  AiSuggestionBlock,
  aiSuggestionStartsWith,
  handleAiTabAccept,
  type AiSuggestionActions,
} from "./ai-suggestion";

type TextareaProps = ComponentProps<typeof Textarea>;

export type AiPanelTextareaProps = Omit<
  TextareaProps,
  "value" | "onChange"
> &
  AiSuggestionActions<string> & {
    value: string;
    fullWidth?: boolean;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onValueChange?: (value: string) => void;
  };

export default function AiPanelTextarea({
  value,
  onChange,
  onValueChange,
  aiSuggestion,
  onAcceptAiSuggestion,
  onRejectAiSuggestion,
  onKeyDown,
  fullWidth = true,
  className,
  ...props
}: AiPanelTextareaProps) {
  const suggestionIsCompatible =
    aiSuggestion && aiSuggestionStartsWith(value, aiSuggestion);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;

    if (
      aiSuggestion &&
      nextValue.trim() &&
      !aiSuggestionStartsWith(nextValue, aiSuggestion)
    ) {
      onRejectAiSuggestion?.();
    }

    onChange?.(event);
    onValueChange?.(nextValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const accepted = handleAiTabAccept(
      event,
      aiSuggestion,
      onAcceptAiSuggestion,
    );

    if (!accepted) {
      onKeyDown?.(event);
    }
  };

  return (
    <div className={cn(fullWidth && "w-full")}>
      <Textarea
        {...props}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-h-28 rounded-md border-slate-300 bg-white px-4 py-3 text-base",
          className,
        )}
      />

      {suggestionIsCompatible ? (
        <AiSuggestionBlock>{aiSuggestion}</AiSuggestionBlock>
      ) : null}

      <AiSuggestionActionsRow
        suggestion={aiSuggestion}
        onAcceptSuggestion={onAcceptAiSuggestion}
        onRejectSuggestion={onRejectAiSuggestion}
      />
    </div>
  );
}
