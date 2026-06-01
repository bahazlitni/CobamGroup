"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const OTP_LENGTH = 6;

type OtpInputProps = {
  name?: string;
  label?: string;
  className?: string;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function rangeBetween(a: number, b: number) {
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function OtpInput({ name = "code", label = "Code de vérification", className }: OtpInputProps) {
  const [values, setValues] = useState(() => Array.from({ length: OTP_LENGTH }, () => ""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const submittedRef = useRef(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const selectedValue = useMemo(() => values.join(""), [values]);

  useEffect(() => {
    if (selectedValue.length < OTP_LENGTH) {
      submittedRef.current = false;
      return;
    }

    if (submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    const form = rootRef.current?.closest("form");
    window.setTimeout(() => form?.requestSubmit(), 80);
  }, [selectedValue]);

  function focusCell(index: number) {
    const nextIndex = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    setFocusedIndex(nextIndex);
    refs.current[nextIndex]?.focus();
  }

  function updateCells(nextValues: string[], nextFocusIndex: number) {
    setValues(nextValues);
    requestAnimationFrame(() => focusCell(nextFocusIndex));
  }

  function applyText(text: string, startIndex: number) {
    const incoming = digitsOnly(text).slice(0, OTP_LENGTH);
    if (!incoming) {
      return;
    }

    const nextValues = [...values];
    if (incoming.length === OTP_LENGTH) {
      for (let index = 0; index < OTP_LENGTH; index += 1) {
        nextValues[index] = incoming[index] ?? "";
      }
      setSelectedIndexes(new Set());
      updateCells(nextValues, OTP_LENGTH - 1);
      return;
    }

    const available = OTP_LENGTH - startIndex;
    const trimmed = incoming.slice(0, available);
    for (let offset = 0; offset < trimmed.length; offset += 1) {
      nextValues[startIndex + offset] = trimmed[offset] ?? "";
    }
    setSelectedIndexes(new Set());
    updateCells(nextValues, Math.min(OTP_LENGTH - 1, startIndex + trimmed.length));
  }

  function toggleIndex(index: number) {
    setSelectedIndexes((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div ref={rootRef} className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={selectedValue} />
      <div className="flex items-center justify-between gap-4">
        <span className="text-ec-muted text-xs font-black uppercase tracking-[0.24em]">{label}</span>
        <span className="text-ec-muted text-xs font-semibold">{selectedValue.length}/{OTP_LENGTH}</span>
      </div>
      <div className="grid grid-cols-6 gap-2 sm:gap-3" role="group" aria-label={label}>
        {values.map((value, index) => {
          const isSelected = selectedIndexes.has(index);
          return (
            <input
              key={`otp-cell-${index}`}
              ref={(node) => {
                refs.current[index] = node;
              }}
              aria-label={`Chiffre ${index + 1}`}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              value={value}
              onFocus={() => setFocusedIndex(index)}
              onDoubleClick={() => {
                setSelectedIndexes((current) =>
                  current.size === OTP_LENGTH ? new Set() : new Set(rangeBetween(0, OTP_LENGTH - 1)),
                );
              }}
              onClick={(event) => {
                setFocusedIndex(index);
                if (event.shiftKey) {
                  setSelectedIndexes((current) => {
                    const next = new Set(current);
                    rangeBetween(lastClickedIndex, index).forEach((rangeIndex) => {
                      if (next.has(rangeIndex)) {
                        next.delete(rangeIndex);
                      } else {
                        next.add(rangeIndex);
                      }
                    });
                    return next;
                  });
                } else if (event.ctrlKey || event.metaKey) {
                  toggleIndex(index);
                } else {
                  setSelectedIndexes(new Set());
                }
                setLastClickedIndex(index);
              }}
              onPaste={(event) => {
                event.preventDefault();
                applyText(event.clipboardData.getData("text"), index);
              }}
              onChange={(event) => {
                applyText(event.target.value, index);
              }}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
                  event.preventDefault();
                  setSelectedIndexes(new Set(rangeBetween(0, OTP_LENGTH - 1)));
                  return;
                }

                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusCell(index - 1);
                  return;
                }

                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  focusCell(index + 1);
                  return;
                }

                if (event.key === "Backspace") {
                  event.preventDefault();
                  const nextValues = [...values];
                  if (selectedIndexes.size > 0) {
                    selectedIndexes.forEach((selectedIndex) => {
                      nextValues[selectedIndex] = "";
                    });
                    setSelectedIndexes(new Set());
                    updateCells(nextValues, Math.min(...Array.from(selectedIndexes)));
                    return;
                  }

                  nextValues[index] = "";
                  updateCells(nextValues, Math.max(0, index - 1));
                }
              }}
              className={cn(
                "border-ec-line text-ec-ink focus:border-ec-ink focus:ring-ec-ink/10 h-14 w-full border bg-white text-center font-sans text-xl font-black outline-none transition focus:ring-4 sm:h-16 sm:text-2xl",
                focusedIndex === index && "border-ec-blue",
                isSelected && "border-ec-blue bg-ec-blue/5 ring-4 ring-ec-blue/10",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
