"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ProductColorClientError,
  suggestProductColorsClient,
} from "@/features/product-colors/client";
import type { ProductColorSuggestionDto } from "@/features/product-colors/types";
import {
  ProductFinishClientError,
  suggestProductFinishesClient,
} from "@/features/product-finishes/client";
import type { ProductFinishSuggestionDto } from "@/features/product-finishes/types";
import type { ProductAttributeDataType } from "@/features/products/types";
import { cn } from "@/lib/utils";

type SuggestionItem = {
  id: number;
  value: string;
  label: string;
  hexValue: string;
  mediaId?: number | null;
};

function normalizeValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLookupKey(value: string) {
  return normalizeValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR");
}

function getSuggestionSource(attributeName: string) {
  const normalized = normalizeLookupKey(attributeName);

  if (normalized === "finition") {
    return "finish";
  }

  if (normalized === "couleur") {
    return "color";
  }

  return null;
}

function mapFinishSuggestion(item: ProductFinishSuggestionDto): SuggestionItem {
  return {
    id: item.id,
    value: item.value,
    label: item.label,
    hexValue: item.colorHex,
    mediaId: item.mediaId,
  };
}

function mapColorSuggestion(item: ProductColorSuggestionDto): SuggestionItem {
  return {
    id: item.id,
    value: item.value,
    label: item.label,
    hexValue: item.hexValue,
  };
}

export default function ProductAttributeValueInput({
  value,
  onChange,
  attributeName,
  dataType,
  placeholder,
  disabled = false,
  className,
  id,
  inputType = "text",
  inputMode,
}: {
  value: string;
  onChange: (value: string) => void;
  attributeName: string;
  dataType: ProductAttributeDataType;
  unit: string | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  inputType?: "text" | "number";
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestIdRef = useRef(0);

  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [lastAppliedSuggestionValue, setLastAppliedSuggestionValue] =
    useState("");

  const normalizedValue = normalizeValue(value);
  const suggestionSource = useMemo(
    () => (dataType === "TEXT" ? getSuggestionSource(attributeName) : null),
    [attributeName, dataType],
  );

  useEffect(() => {
    if (!suggestionSource) {
      return;
    }

    if (
      !normalizedValue ||
      normalizeValue(lastAppliedSuggestionValue).toLocaleLowerCase("fr-FR") ===
        normalizedValue.toLocaleLowerCase("fr-FR")
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextRequestId = requestIdRef.current + 1;
      requestIdRef.current = nextRequestId;
      setIsLoading(true);

      const request =
        suggestionSource === "finish"
          ? suggestProductFinishesClient({
              q: normalizedValue,
              limit: 8,
            }).then((items) => items.map(mapFinishSuggestion))
          : suggestProductColorsClient({
              q: normalizedValue,
              limit: 8,
            }).then((items) => items.map(mapColorSuggestion));

      void request
        .then((items) => {
          if (requestIdRef.current !== nextRequestId) {
            return;
          }

          setSuggestions(items);
          setHighlightedIndex(0);
        })
        .catch((error: unknown) => {
          if (requestIdRef.current !== nextRequestId) {
            return;
          }

          if (
            !(error instanceof ProductFinishClientError) &&
            !(error instanceof ProductColorClientError)
          ) {
            console.error("PRODUCT_ATTRIBUTE_VALUE_INPUT_ERROR:", error);
          }

          setSuggestions([]);
          setHighlightedIndex(0);
        })
        .finally(() => {
          if (requestIdRef.current === nextRequestId) {
            setIsLoading(false);
          }
        });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [lastAppliedSuggestionValue, normalizedValue, suggestionSource]);

  const visibleSuggestions = useMemo(
    () => (suggestionSource ? suggestions.slice(0, 8) : []),
    [suggestionSource, suggestions],
  );
  const primarySuggestion = visibleSuggestions[0] ?? null;
  const ghostSuffix =
    primarySuggestion &&
    normalizedValue &&
    primarySuggestion.value
      .toLocaleLowerCase("fr-FR")
      .startsWith(normalizedValue.toLocaleLowerCase("fr-FR")) &&
    primarySuggestion.value.length > normalizedValue.length
      ? primarySuggestion.value.slice(normalizedValue.length)
      : "";

  const applySuggestion = (suggestion: SuggestionItem | null | undefined) => {
    if (!suggestion) {
      return false;
    }

    onChange(suggestion.value);
    setLastAppliedSuggestionValue(suggestion.value);
    setSuggestions([]);
    setHighlightedIndex(0);
    return true;
  };

  const handleInputChange = (nextValue: string) => {
    onChange(nextValue);

    if (!normalizeValue(nextValue)) {
      setSuggestions([]);
      setHighlightedIndex(0);
      setIsLoading(false);
    }

    if (
      normalizeValue(lastAppliedSuggestionValue).toLocaleLowerCase("fr-FR") !==
      normalizeValue(nextValue).toLocaleLowerCase("fr-FR")
    ) {
      setLastAppliedSuggestionValue("");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "Tab" && visibleSuggestions.length > 0) {
      event.preventDefault();
      applySuggestion(visibleSuggestions[highlightedIndex] ?? primarySuggestion);
      return;
    }

    if (event.key === "ArrowDown" && visibleSuggestions.length > 0) {
      event.preventDefault();
      setHighlightedIndex((current) =>
        Math.min(current + 1, visibleSuggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp" && visibleSuggestions.length > 0) {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && visibleSuggestions.length > 0) {
      event.preventDefault();
      applySuggestion(visibleSuggestions[highlightedIndex] ?? primarySuggestion);
    }
  };

  const showSuggestionMenu = Boolean(
    suggestionSource != null &&
      isFocused &&
      normalizedValue &&
      (isLoading || visibleSuggestions.length > 0),
  );

  return (
    <Popover open={showSuggestionMenu} modal={false}>
      <PopoverAnchor asChild>
        <div className="relative">
          <div
            className={cn(
              "relative flex min-h-10 items-center rounded-2xl border border-slate-300 bg-white px-4 transition-colors",
              disabled
                ? "cursor-not-allowed bg-slate-100/80 opacity-70"
                : "focus-within:border-cobam-water-blue",
              className,
            )}
            onClick={() => {
              if (!disabled) {
                inputRef.current?.focus();
              }
            }}
          >
            <input
              id={id}
              ref={inputRef}
              value={value}
              onChange={(event) => handleInputChange(event.target.value)}
              onKeyDown={handleKeyDown}
              type={inputType}
              inputMode={inputMode}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                window.setTimeout(() => {
                  setIsFocused(false);
                }, 100);
              }}
              placeholder={placeholder}
              disabled={disabled}
              className="h-10 w-full border-0 bg-transparent px-0 text-base text-slate-700 outline-none placeholder:text-slate-400"
            />

            {ghostSuffix && value ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 text-base"
              >
                <span className="invisible whitespace-pre">{value}</span>
                <span className="whitespace-pre text-slate-300">{ghostSuffix}</span>
              </div>
            ) : null}
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="z-[80] w-[var(--radix-popper-anchor-width)] min-w-[18rem] rounded-2xl border border-slate-300 bg-white p-2 shadow-xl shadow-slate-200/70"
      >
        {isLoading ? (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Recherche des suggestions…</span>
          </div>
        ) : null}

        {!isLoading
          ? visibleSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  index === highlightedIndex
                    ? "bg-slate-100 text-cobam-dark-blue"
                    : "text-slate-600 hover:bg-slate-50",
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  applySuggestion(suggestion);
                  inputRef.current?.focus();
                }}
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300"
                    style={{ backgroundColor: suggestion.hexValue }}
                  />
                  <span className="truncate font-medium">{suggestion.label}</span>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {suggestion.hexValue}
                </span>
              </button>
            ))
          : null}
      </PopoverContent>
    </Popover>
  );
}
