"use client";

import type { ChangeEvent, ComponentProps, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  DESCRIPTION_SEO_MAX_LENGTH,
  truncateDescriptionSeo,
} from "@/lib/seo-description";
import { cn } from "@/lib/utils";
import {
  AiSuggestionActionsRow,
  AiSuggestionBlock,
  aiSuggestionStartsWith,
  handleAiTabAccept,
  type AiSuggestionActions,
} from "./ai-suggestion";

type TextareaProps = ComponentProps<typeof Textarea>;

export type DescriptionSEOTextAreaProps = Omit<
  TextareaProps,
  "maxLength" | "value" | "onChange"
> &
  AiSuggestionActions<string> & {
    value: string;
    fullWidth?: boolean;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onValueChange?: (value: string) => void;
  };

export default function DescriptionSEOTextArea({
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
}: DescriptionSEOTextAreaProps) {
  const safeValue = truncateDescriptionSeo(value);
  const safeSuggestion = aiSuggestion
    ? truncateDescriptionSeo(aiSuggestion)
    : undefined;
  const suggestionIsCompatible =
    safeSuggestion && aiSuggestionStartsWith(safeValue, safeSuggestion);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = truncateDescriptionSeo(event.target.value);

    if (
      safeSuggestion &&
      nextValue.trim() &&
      !aiSuggestionStartsWith(nextValue, safeSuggestion)
    ) {
      onRejectAiSuggestion?.();
    }

    if (nextValue !== event.target.value) {
      event.currentTarget.value = nextValue;
    }

    onChange?.(event);
    onValueChange?.(nextValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const accepted = handleAiTabAccept(
      event,
      safeSuggestion,
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
        value={safeValue}
        maxLength={DESCRIPTION_SEO_MAX_LENGTH}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-h-24 rounded-md border-slate-300 bg-white px-4 py-3 text-base",
          className,
        )}
      />

      <div className="mt-1 text-right text-xs text-slate-500">
        {safeValue.length}/{DESCRIPTION_SEO_MAX_LENGTH}
      </div>

      {suggestionIsCompatible ? (
        <AiSuggestionBlock>{safeSuggestion}</AiSuggestionBlock>
      ) : null}

      <AiSuggestionActionsRow
        suggestion={safeSuggestion}
        onAcceptSuggestion={onAcceptAiSuggestion}
        onRejectSuggestion={onRejectAiSuggestion}
      />
    </div>
  );
}
