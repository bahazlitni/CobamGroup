"use client";

import type { ChangeEvent, ComponentProps, KeyboardEvent } from "react";
import PanelAutoCompleteInput from "./PanelAutoCompleteInput";
import {
  AiSuggestionActionsRow,
  getAiGhostSuffix,
  handleAiTabAccept,
  type AiSuggestionActions,
} from "./ai-suggestion";
import { cn } from "@/lib/utils";

type PanelAutoCompleteInputProps = ComponentProps<
  typeof PanelAutoCompleteInput
>;

export type AiPanelAutocompleteInputProps = Omit<
  PanelAutoCompleteInputProps,
  "value" | "onChange"
> &
  AiSuggestionActions<string> & {
    value: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: string) => void;
  };

export default function AiPanelAutocompleteInput({
  value,
  onChange,
  onValueChange,
  aiSuggestion,
  onAcceptAiSuggestion,
  onRejectAiSuggestion,
  onKeyDown,
  fullWidth = false,
  ...props
}: AiPanelAutocompleteInputProps) {
  const ghostSuffix = getAiGhostSuffix(value, aiSuggestion);

  const handleValueChange = (nextValue: string) => {
    if (
      aiSuggestion &&
      nextValue.trim() &&
      !aiSuggestion
        .trim()
        .toLocaleLowerCase("fr-FR")
        .startsWith(nextValue.trim().toLocaleLowerCase("fr-FR"))
    ) {
      onRejectAiSuggestion?.();
    }

    onValueChange?.(nextValue);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
    <div className={cn("relative", fullWidth && "w-full")}>
      <div className="relative">
        <PanelAutoCompleteInput
          {...props}
          fullWidth={fullWidth}
          value={value}
          onChange={handleChange}
          onValueChange={handleValueChange}
          onKeyDown={handleKeyDown}
        />

        {ghostSuffix ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex h-10 items-center text-base"
          >
            {value ? (
              <span className="invisible whitespace-pre px-4">{value}</span>
            ) : null}
            <span className="whitespace-pre text-cobam-water-blue/70">
              {ghostSuffix}
            </span>
          </div>
        ) : null}
      </div>

      <AiSuggestionActionsRow
        suggestion={aiSuggestion}
        onAcceptSuggestion={onAcceptAiSuggestion}
        onRejectSuggestion={onRejectAiSuggestion}
      />
    </div>
  );
}
