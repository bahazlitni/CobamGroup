"use client";

import {
  type ChangeEvent,
  type ChangeEventHandler,
  type ComponentProps,
  type KeyboardEvent,
  useMemo,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import PanelInput from "./PanelInput";

export type PanelAutoCompleteOption = {
  value: string;
  label?: string;
  tag?: string;
};

type InputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onValueChange?: (value: string) => void;
};

interface Props extends InputProps {
  fullWidth?: boolean;
  suggestions?: Array<string | PanelAutoCompleteOption>;
  displayValue?: string;
  emitSuggestionValue?: boolean;
}

function createSyntheticChangeEvent(
  nextValue: string,
): ChangeEvent<HTMLInputElement> {
  return {
    target: { value: nextValue } as EventTarget & HTMLInputElement,
    currentTarget: { value: nextValue } as EventTarget & HTMLInputElement,
  } as ChangeEvent<HTMLInputElement>;
}

function normalizeSuggestion(
  suggestion: string | PanelAutoCompleteOption,
): PanelAutoCompleteOption {
  if (typeof suggestion === "string") {
    return {
      value: suggestion,
      label: suggestion,
    };
  }

  return {
    value: suggestion.value,
    label: suggestion.label ?? suggestion.value,
    tag: suggestion.tag?.trim() || undefined,
  };
}

function dedupeSuggestions(
  suggestions: readonly PanelAutoCompleteOption[],
) {
  return suggestions.filter(
    (suggestion, index) =>
      suggestions.findIndex(
        (candidate) =>
          candidate.value === suggestion.value &&
          candidate.label === suggestion.label &&
          candidate.tag === suggestion.tag,
      ) === index,
  );
}

export default function PanelAutoCompleteInput({
  fullWidth = false,
  suggestions,
  displayValue,
  emitSuggestionValue = false,
  onChange,
  onValueChange,
  value,
  onFocus,
  onBlur,
  onKeyDown,
  disabled = false,
  autoComplete,
  ...props
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputValue = displayValue ?? value;

  const normalizedSuggestions = useMemo(
    () =>
      dedupeSuggestions(
        (suggestions ?? [])
          .filter(Boolean)
          .map(normalizeSuggestion)
          .filter((suggestion) => suggestion.label?.trim()),
      ),
    [suggestions],
  );

  const hasSuggestions = normalizedSuggestions.length > 0;

  const displayedSuggestions = useMemo(() => {
    if (!hasSuggestions) {
      return [];
    }

    return normalizedSuggestions;
  }, [hasSuggestions, normalizedSuggestions]);

  const menuOpen = !disabled && isFocused && displayedSuggestions.length > 0;
  const selectedSuggestion =
    displayedSuggestions[highlightedIndex] ?? displayedSuggestions[0] ?? null;
  const selectedSuggestionLabel = selectedSuggestion?.label ?? null;

  const ghostSuffix =
    selectedSuggestionLabel &&
    inputValue &&
    selectedSuggestionLabel.toLocaleLowerCase("fr-FR").startsWith(
      inputValue.toLocaleLowerCase("fr-FR"),
    ) &&
    selectedSuggestionLabel.length > inputValue.length
      ? selectedSuggestionLabel.slice(inputValue.length)
      : "";

  const emitValue = (nextValue: string) => {
    onValueChange?.(nextValue);
    onChange?.(createSyntheticChangeEvent(nextValue));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHighlightedIndex(0);
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  const handleSuggestionSelect = (nextValue: string) => {
    emitValue(nextValue);
    setHighlightedIndex(0);
    setIsFocused(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented || !menuOpen) {
      return;
    }

    if (event.key === "Tab" && selectedSuggestion) {
      event.preventDefault();
      handleSuggestionSelect(
        emitSuggestionValue
          ? selectedSuggestion.value
          : (selectedSuggestion.label ?? selectedSuggestion.value),
      );
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        Math.min(current + 1, displayedSuggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && selectedSuggestion) {
      event.preventDefault();
      handleSuggestionSelect(
        emitSuggestionValue
          ? selectedSuggestion.value
          : (selectedSuggestion.label ?? selectedSuggestion.value),
      );
    }
  };

  if (!hasSuggestions) {
    return (
      <PanelInput
        {...props}
        autoComplete={autoComplete ?? "off"}
        disabled={disabled}
        fullWidth={fullWidth}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <Popover open={menuOpen} modal={false}>
      <PopoverAnchor asChild>
        <div className="relative">
          <PanelInput
            {...props}
            autoComplete={autoComplete ?? "off"}
            disabled={disabled}
            fullWidth={fullWidth}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={(event) => {
              setIsFocused(true);
              setHighlightedIndex(0);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              window.setTimeout(() => {
                setIsFocused(false);
              }, 100);
              onBlur?.(event);
            }}
            onKeyDown={handleKeyDown}
          />

          {ghostSuffix && inputValue ? (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 flex h-10 items-center text-base",
                fullWidth ? "w-full" : "w-auto",
              )}
            >
              <span className="invisible whitespace-pre px-2">{inputValue}</span>
              <span className="whitespace-pre text-slate-300">{ghostSuffix}</span>
            </div>
          ) : null}
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="z-[80] w-[var(--radix-popper-anchor-width)] min-w-[18rem] rounded-md border border-slate-300 bg-white p-1 shadow-sm"
      >
        {displayedSuggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.value}-${suggestion.label}-${suggestion.tag ?? ""}`}
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors",
              index === highlightedIndex
                ? "bg-slate-100 text-cobam-dark-blue"
                : "text-slate-700 hover:bg-slate-100",
            )}
            onMouseDown={(event) => {
              event.preventDefault();
              handleSuggestionSelect(
                emitSuggestionValue
                  ? suggestion.value
                  : (suggestion.label ?? suggestion.value),
              );
            }}
          >
            <span className="min-w-0 flex-1 truncate">
              {suggestion.label ?? suggestion.value}
            </span>
            {suggestion.tag ? (
              <span className="ml-4 shrink-0 text-xs text-slate-400">
                {suggestion.tag}
              </span>
            ) : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
