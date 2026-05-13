"use client";

import type { ChangeEvent, ComponentProps, KeyboardEvent } from "react";
import PanelInput from "./PanelInput";
import {
  AiSuggestionActionsRow,
  getAiGhostSuffix,
  handleAiTabAccept,
  type AiSuggestionActions,
} from "./ai-suggestion";
import { cn } from "@/lib/utils";

type PanelInputProps = ComponentProps<typeof PanelInput>;

export type AiPanelInputProps = Omit<
  PanelInputProps,
  "value" | "onChange"
> &
  AiSuggestionActions<string> & {
    value: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: string) => void;
  };

export default function AiPanelInput({
  value,
  onChange,
  onValueChange,
  aiSuggestion,
  onAcceptAiSuggestion,
  onRejectAiSuggestion,
  onKeyDown,
  fullWidth = false,
  className,
  ...props
}: AiPanelInputProps) {
  const ghostSuffix = getAiGhostSuffix(value, aiSuggestion);

  const emitValue = (nextValue: string) => {
    onValueChange?.(nextValue);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

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

    onChange?.(event);
    emitValue(nextValue);
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
        <PanelInput
          {...props}
          className={className}
          fullWidth={fullWidth}
          value={value}
          onChange={handleChange}
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
