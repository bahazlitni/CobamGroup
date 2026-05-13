"use client";

import {
  type ChangeEvent,
  type ChangeEventHandler,
  type ComponentProps,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PanelInput from "./PanelInput";

export type PanelAutoCompleteOption = {
  value?: string;
  key?: string;
  label?: string;
  tag?: string;
};

type InputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onValueChange?: (value: string) => void;
};


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

  const normalizedValue = suggestion.value ?? suggestion.key ?? "";

  return {
    value: normalizedValue,
    label: suggestion.label ?? normalizedValue,
    tag: suggestion.tag?.trim() || undefined,
  };
}

function dedupeSuggestions(
  suggestions: readonly PanelAutoCompleteOption[],
): PanelAutoCompleteOption[] {
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

function normalizeText(value?: string | null): string {
  return (value ?? "").trim().toLocaleLowerCase("fr-FR");
}

function getSuggestionOutput(
  suggestion: PanelAutoCompleteOption,
  emitSuggestionValue: boolean,
): string {
  const outputValue = suggestion.value ?? suggestion.key ?? suggestion.label ?? "";
  return emitSuggestionValue ? outputValue : (suggestion.label ?? outputValue);
}


interface PanelAutoCompleteInputProps extends InputProps {
  fullWidth?: boolean;
  suggestions?: Array<string | PanelAutoCompleteOption>;
  displayValue?: string;
  emitSuggestionValue?: boolean;
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
}: PanelAutoCompleteInputProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();

  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputValue = displayValue ?? value ?? "";
  const normalizedInputValue = normalizeText(inputValue);

  const normalizedSuggestions = useMemo(
    () =>
      dedupeSuggestions(
        (suggestions ?? [])
          .filter(Boolean)
          .map(normalizeSuggestion)
          .filter((suggestion) => (suggestion.label ?? suggestion.value ?? "").trim()),
      ),
    [suggestions],
  );

  const displayedSuggestions = useMemo(() => {
    if (!normalizedSuggestions.length) return [];

    if (!normalizedInputValue) {
      return normalizedSuggestions;
    }

    const scored = normalizedSuggestions
      .map((suggestion) => {
        const label = suggestion.label ?? suggestion.value ?? "";
        const normalizedLabel = normalizeText(label);

        let score = -1;

        if (normalizedLabel === normalizedInputValue) {
          score = 0;
        } else if (normalizedLabel.startsWith(normalizedInputValue)) {
          score = 1;
        } else if (normalizedLabel.includes(normalizedInputValue)) {
          score = 2;
        }

        return { suggestion, score, label };
      })
      .filter((item) => item.score >= 0)
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return a.label.localeCompare(b.label, "fr");
      });

    return scored.map((item) => item.suggestion);
  }, [normalizedInputValue, normalizedSuggestions]);

  const safeHighlightedIndex = displayedSuggestions.length
    ? Math.min(Math.max(highlightedIndex, 0), displayedSuggestions.length - 1)
    : 0;

  useEffect(() => {
    const highlightedOption = optionRefs.current[safeHighlightedIndex];
    highlightedOption?.scrollIntoView({ block: "nearest" });
  }, [safeHighlightedIndex]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      if (rootRef.current?.contains(target)) return;
      setIsFocused(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  const menuOpen =
    !disabled &&
    isFocused &&
    displayedSuggestions.length > 0;

  const selectedSuggestion =
    displayedSuggestions[safeHighlightedIndex] ?? displayedSuggestions[0] ?? null;

  const selectedSuggestionLabel = selectedSuggestion?.label ?? null;

  const ghostSuffix =
    selectedSuggestionLabel &&
    inputValue &&
    normalizeText(selectedSuggestionLabel).startsWith(normalizedInputValue) &&
    selectedSuggestionLabel.length > inputValue.length
      ? selectedSuggestionLabel.slice(inputValue.length)
      : "";

  const emitValue = (nextValue: string) => {
    onValueChange?.(nextValue);
    onChange?.(createSyntheticChangeEvent(nextValue));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setHighlightedIndex(0);
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  const handleSuggestionSelect = (suggestion: PanelAutoCompleteOption) => {
    emitValue(getSuggestionOutput(suggestion, emitSuggestionValue));
    setHighlightedIndex(0);
    setIsFocused(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const nextValue = getSuggestionOutput(suggestion, emitSuggestionValue);
      inputRef.current?.setSelectionRange(nextValue.length, nextValue.length);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!menuOpen && displayedSuggestions.length > 0) {
        setIsFocused(true);
        setHighlightedIndex(0);
        return;
      }

      setHighlightedIndex((current) =>
        Math.min(current + 1, displayedSuggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!menuOpen && displayedSuggestions.length > 0) {
        setIsFocused(true);
        setHighlightedIndex(displayedSuggestions.length - 1);
        return;
      }

      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      if (menuOpen) {
        event.preventDefault();
        setIsFocused(false);
      }
      return;
    }

    if (!menuOpen || !selectedSuggestion) return;

    if (event.key === "Tab") {
      event.preventDefault();
      handleSuggestionSelect(selectedSuggestion);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSuggestionSelect(selectedSuggestion);
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setHighlightedIndex(0);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const nextFocusedElement = event.relatedTarget as Node | null;

    if (nextFocusedElement && rootRef.current?.contains(nextFocusedElement)) {
      return;
    }

    // Delay slightly so mouse selection can happen first
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (activeElement && rootRef.current?.contains(activeElement)) {
        return;
      }

      setIsFocused(false);
      onBlur?.(event);
    });
  };

  if (!normalizedSuggestions.length) {
    return (
      <PanelInput
        {...props}
        ref={inputRef}
        autoComplete={autoComplete ?? "off"}
        disabled={disabled}
        fullWidth={fullWidth}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative", fullWidth && "w-full")}
    >
      <div className="relative">
        <PanelInput
          {...props}
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? listboxId : undefined}
          aria-activedescendant={
            menuOpen && selectedSuggestion
              ? `${listboxId}-option-${safeHighlightedIndex}`
              : undefined
          }
          autoComplete={autoComplete ?? "off"}
          disabled={disabled}
          fullWidth={fullWidth}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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

      {menuOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[80] mt-2 max-h-72 overflow-y-auto rounded-md border border-slate-300 bg-white p-1 shadow-sm"
        >
          {displayedSuggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;

            return (
              <button
                key={`${suggestion.value}-${suggestion.label}-${suggestion.tag ?? ""}`}
                id={`${listboxId}-option-${index}`}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="option"
                aria-selected={isHighlighted}
                tabIndex={-1}
                className={cn(
                  "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors",
                  isHighlighted
                    ? "bg-slate-100 text-cobam-dark-blue"
                    : "text-slate-700 hover:bg-slate-100",
                )}
                onMouseEnter={() => {
                  setHighlightedIndex(index);
                }}
                onMouseDown={(event) => {
                  // Prevent input blur before selection
                  event.preventDefault();
                  handleSuggestionSelect(suggestion);
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
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
