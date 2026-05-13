"use client";

import PanelInput from "./PanelInput";
import { cn } from "@/lib/utils";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const HEX_COLOR_6_PATTERN = /^#[0-9a-f]{6}$/i;
const HEX_COLOR_3_PATTERN = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;

export function normalizeHexInput(value: string) {
  const trimmed = value.trim().replace(/\s+/g, "");

  if (!trimmed) {
    return "";
  }

  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return prefixed.toUpperCase();
}

function expandShortHex(value: string) {
  return value.replace(
    HEX_COLOR_3_PATTERN,
    (_, r: string, g: string, b: string) => `#${r}${r}${g}${g}${b}${b}`,
  );
}

function getPickerValue(value: string) {
  const normalized = normalizeHexInput(value);

  if (HEX_COLOR_6_PATTERN.test(normalized)) {
    return normalized;
  }

  if (HEX_COLOR_3_PATTERN.test(normalized)) {
    return expandShortHex(normalized).toUpperCase();
  }

  return "#000000";
}

function isValidHexColor(value: string) {
  return HEX_COLOR_PATTERN.test(normalizeHexInput(value));
}

type ColorHexFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowEmpty?: boolean;
};

export default function ColorHexField({
  id,
  value,
  onChange,
  placeholder = "#D4AF37",
  allowEmpty = false,
}: ColorHexFieldProps) {
  const normalizedValue = normalizeHexInput(value);
  const hasPreview = normalizedValue !== "" && isValidHexColor(normalizedValue);

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        aria-label="Sélecteur de couleur"
        value={getPickerValue(value)}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-slate-300 bg-white p-1"
      />
      <PanelInput
        id={id}
        fullWidth
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          const nextValue = normalizeHexInput(value);
          onChange(allowEmpty && !nextValue ? "" : nextValue);
        }}
        onPaste={(event) => {
          const normalizedPaste = normalizeHexInput(
            event.clipboardData.getData("text"),
          );

          if (!normalizedPaste || !isValidHexColor(normalizedPaste)) {
            return;
          }

          event.preventDefault();
          onChange(normalizedPaste);
        }}
      />
      <span
        className={cn(
          "h-10 w-10 shrink-0 rounded-md border border-slate-300 bg-slate-50",
          !hasPreview && "bg-[linear-gradient(45deg,#f8fafc_25%,#e2e8f0_25%,#e2e8f0_50%,#f8fafc_50%,#f8fafc_75%,#e2e8f0_75%,#e2e8f0_100%)] bg-[length:12px_12px]",
        )}
        style={hasPreview ? { background: normalizedValue } : undefined}
      />
    </div>
  );
}
