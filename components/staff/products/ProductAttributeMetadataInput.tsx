"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ProductAttributeMetadataClientError,
  suggestProductAttributeMetadataClient,
} from "@/features/product-attribute-metadata/client";
import type { ProductAttributeMetadataSuggestionDto } from "@/features/product-attribute-metadata/types";
import { cn } from "@/lib/utils";

function normalizeValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export default function ProductAttributeMetadataInput({
  value,
  onValueChange,
  onMetadataSelect,
  placeholder = "Nom de l'attribut",
  disabled = false,
  className,
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onMetadataSelect: (item: ProductAttributeMetadataSuggestionDto) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestIdRef = useRef(0);

  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<
    ProductAttributeMetadataSuggestionDto[]
  >([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [lastAppliedSuggestionName, setLastAppliedSuggestionName] = useState("");

  const normalizedValue = normalizeValue(value);

  useEffect(() => {
    if (
      !normalizedValue ||
      normalizeValue(lastAppliedSuggestionName).toLocaleLowerCase("fr-FR") ===
        normalizedValue.toLocaleLowerCase("fr-FR")
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextRequestId = requestIdRef.current + 1;
      requestIdRef.current = nextRequestId;
      setIsLoading(true);

      void suggestProductAttributeMetadataClient({
        q: normalizedValue,
        limit: 8,
      })
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

          if (!(error instanceof ProductAttributeMetadataClientError)) {
            console.error("PRODUCT_ATTRIBUTE_METADATA_INPUT_ERROR:", error);
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
  }, [lastAppliedSuggestionName, normalizedValue]);

  const visibleSuggestions = useMemo(() => suggestions.slice(0, 8), [suggestions]);
  const primarySuggestion = visibleSuggestions[0] ?? null;
  const ghostSuffix =
    primarySuggestion &&
    normalizedValue &&
    primarySuggestion.name
      .toLocaleLowerCase("fr-FR")
      .startsWith(normalizedValue.toLocaleLowerCase("fr-FR")) &&
    primarySuggestion.name.length > normalizedValue.length
      ? primarySuggestion.name.slice(normalizedValue.length)
      : "";

  const applySuggestion = (
    suggestion: ProductAttributeMetadataSuggestionDto | null | undefined,
  ) => {
    if (!suggestion) {
      return false;
    }

    onValueChange(suggestion.name);
    onMetadataSelect(suggestion);
    setLastAppliedSuggestionName(suggestion.name);
    setSuggestions([]);
    setHighlightedIndex(0);
    return true;
  };

  const handleInputChange = (nextValue: string) => {
    onValueChange(nextValue);

    if (!normalizeValue(nextValue)) {
      setSuggestions([]);
      setHighlightedIndex(0);
      setIsLoading(false);
    }

    if (
      normalizeValue(lastAppliedSuggestionName).toLocaleLowerCase("fr-FR") !==
      normalizeValue(nextValue).toLocaleLowerCase("fr-FR")
    ) {
      setLastAppliedSuggestionName("");
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
            <span>Recherche des métadonnées…</span>
          </div>
        ) : null}

        {!isLoading
          ? visibleSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
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
                <span className="font-medium">{suggestion.name}</span>
                <span className="text-xs text-slate-400">
                  {suggestion.dataType}
                  {suggestion.unit ? ` · ${suggestion.unit}` : ""}
                </span>
              </button>
            ))
          : null}
      </PopoverContent>
    </Popover>
  );
}
