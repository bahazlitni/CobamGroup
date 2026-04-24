"use client";

import type { ComponentProps, KeyboardEvent } from "react";
import StaffTagInput from "./tag-input";
import {
  AiSuggestionActionsRow,
  AI_SUGGESTION_TOKEN_CLASS,
  handleAiTabAccept,
  type AiSuggestionActions,
} from "./ai-suggestion";
import { cn } from "@/lib/utils";

type StaffTagInputProps = ComponentProps<typeof StaffTagInput>;

function mergeTags(currentTags: string[], suggestedTags: string[]) {
  const seen = new Set<string>();

  return [...currentTags, ...suggestedTags].filter((tag) => {
    const key = tag.trim().toLocaleLowerCase("fr-FR");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export type AiPanelTagsInputProps = StaffTagInputProps &
  AiSuggestionActions<string[]> & {
    onAcceptAiSuggestion?: (value: string[]) => void;
  };

export default function AiPanelTagsInput({
  value,
  onChange,
  aiSuggestion,
  onAcceptAiSuggestion,
  onRejectAiSuggestion,
  className,
  ...props
}: AiPanelTagsInputProps) {
  const acceptSuggestion = (suggestion: string[]) => {
    const nextValue = mergeTags(value, suggestion);
    onChange(nextValue);
    onAcceptAiSuggestion?.(nextValue);
  };

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    handleAiTabAccept(event, aiSuggestion, acceptSuggestion);
  };

  return (
    <div onKeyDownCapture={handleKeyDownCapture}>
      <StaffTagInput
        {...props}
        value={value}
        onChange={onChange}
        className={className}
      />

      {aiSuggestion?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {aiSuggestion.map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                AI_SUGGESTION_TOKEN_CLASS,
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <AiSuggestionActionsRow
        suggestion={aiSuggestion}
        onAcceptSuggestion={acceptSuggestion}
        onRejectSuggestion={onRejectAiSuggestion}
      />
    </div>
  );
}
