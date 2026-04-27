"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { cn } from "@/lib/utils";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("fr-FR");
}

export const AI_SUGGESTION_TEXT_CLASS = "text-cobam-water-blue/70";
export const AI_SUGGESTION_TOKEN_CLASS =
  "border-cobam-water-blue/25 bg-cobam-water-blue/10 text-cobam-water-blue/70";

export type AiSuggestionActions<T> = {
  aiSuggestion?: T | null;
  onAcceptAiSuggestion?: (value: T) => void;
  onRejectAiSuggestion?: () => void;
};

export function hasAiSuggestion<T>(
  suggestion: T | null | undefined,
): suggestion is T {
  if (Array.isArray(suggestion)) {
    return suggestion.length > 0;
  }

  return suggestion !== null && suggestion !== undefined && suggestion !== "";
}

export function aiSuggestionStartsWith(value: string, suggestion: string) {
  const normalizedValue = normalizeText(value);
  const normalizedSuggestion = normalizeText(suggestion);

  if (!normalizedValue) {
    return true;
  }

  return normalizedSuggestion.startsWith(normalizedValue);
}

export function getAiGhostSuffix(value: string, suggestion?: string | null) {
  if (!suggestion || !aiSuggestionStartsWith(value, suggestion)) {
    return "";
  }

  if (!value) {
    return suggestion;
  }

  return suggestion.length > value.length ? suggestion.slice(value.length) : "";
}

export function handleAiTabAccept<T>(
  event: KeyboardEvent,
  suggestion: T | null | undefined,
  onAcceptSuggestion?: (value: T) => void,
) {
  if (event.key !== "Tab" || !hasAiSuggestion(suggestion) || !onAcceptSuggestion) {
    return false;
  }

  event.preventDefault();
  onAcceptSuggestion(suggestion);
  return true;
}

export function AiSuggestionActionsRow<T>({
  suggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
  className,
}: {
  suggestion?: T | null;
  onAcceptSuggestion?: (value: T) => void;
  onRejectSuggestion?: () => void;
  className?: string;
}) {
  if (!hasAiSuggestion(suggestion)) {
    return null;
  }

  return (
    <div className={cn("mt-2 flex items-center gap-2", className)}>
      <AnimatedUIButton
        type="button"
        size="sm"
        variant="ghost"
        color="secondary"
        onClick={() => onAcceptSuggestion?.(suggestion)}
      >
        Accepter
      </AnimatedUIButton>
      <AnimatedUIButton
        type="button"
        size="sm"
        variant="ghost"
        color="error"
        onClick={onRejectSuggestion}
      >
        Rejeter
      </AnimatedUIButton>
    </div>
  );
}

export function AiSuggestionBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-2 rounded-md border border-cobam-water-blue/20 bg-cobam-water-blue/5 px-3 py-2 text-sm leading-6",
        AI_SUGGESTION_TEXT_CLASS,
        className,
      )}
    >
      {children}
    </div>
  );
}
