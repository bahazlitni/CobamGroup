"use client";

import PanelInput from "@/components/staff/ui/PanelInput";

function normalizeHexColor(value: string) {
  const normalized = value.trim().toLowerCase();

  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/.test(normalized)) {
    return normalized;
  }

  return "#0a8dc1";
}

export default function ArticleCategoryColorField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const safeColor = normalizeHexColor(value);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={safeColor}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-16 cursor-pointer rounded-xl border border-slate-300 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Choisir une couleur"
        />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span
            className="h-4 w-4 rounded-full border border-slate-300"
            style={{ backgroundColor: safeColor }}
            aria-hidden="true"
          />
          <span>Aperçu</span>
        </div>
      </div>

      <PanelInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#0a8dc1"
        disabled={disabled}
        fullWidth
      />
    </div>
  );
}
