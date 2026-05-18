"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resolveColorHex } from "@/lib/color-values";
import { cn } from "@/lib/utils";
import type { DerivedColorOption } from "./utils";

const COMPACT_COLOR_LIMIT = 28;

function ColorBlob({
  option,
  code,
  active,
  onClick,
}: {
  option: DerivedColorOption;
  code?: string | null;
  active: boolean;
  onClick: () => void;
}) {
  const resolvedHex =
    option.reference?.hexValue ?? resolveColorHex(option.label) ?? resolveColorHex(option.key);
  const hasFailure = !resolvedHex;
  const label = code ? `${option.label} - Code ${code}` : option.label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "group inline-flex rounded-full p-1 outline-none transition focus-visible:ring-2 focus-visible:ring-cobam-water-blue/50",
            active ? "bg-white shadow-[0_0_0_1px_rgba(20,32,46,0.12)]" : "hover:bg-white",
          )}
          aria-label={`Choisir la couleur ${label}`}
          aria-pressed={active}
        >
          <span
            className={cn(
              "block size-9 rounded-full border transition sm:size-10",
              active
                ? "border-white ring-2 ring-cobam-dark-blue ring-offset-2 ring-offset-white"
                : "border-slate-200 group-hover:ring-2 group-hover:ring-cobam-water-blue/20",
              hasFailure ? "border-2 border-red-500 bg-slate-900" : "",
            )}
            style={hasFailure ? undefined : { backgroundColor: resolvedHex ?? undefined }}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

interface ColorsListProps {
  activeKey?: string;
  selectedLabel?: string | null;
  selectedCode?: string | null;
  colors: DerivedColorOption[];
  colorCodesByKey?: Record<string, string | null | undefined>;
  onSelect?: (colorKey: string) => void;
}

export default function ColorsList({
  onSelect,
  activeKey,
  selectedLabel,
  selectedCode,
  colors,
  colorCodesByKey = {},
}: ColorsListProps) {
  const [showAll, setShowAll] = useState(false);

  if (!colors.length) {
    return null;
  }

  const visibleColors = showAll ? colors : colors.slice(0, COMPACT_COLOR_LIMIT);
  const hasHiddenColors = colors.length > COMPACT_COLOR_LIMIT;

  return (
    <section className="rounded-[1.35rem] border border-cobam-quill-grey/35 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Palette
          </p>
          <p className="mt-1 text-sm font-semibold text-cobam-dark-blue">
            Couleur selectionnee: {selectedLabel ?? "A confirmer"}
            {selectedCode ? <span className="text-slate-500"> - Code {selectedCode}</span> : null}
          </p>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {colors.length} teinte{colors.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-4 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
        {visibleColors.map((color) => (
          <ColorBlob
            key={color.key}
            option={color}
            code={colorCodesByKey[color.key]}
            active={activeKey !== undefined && activeKey === color.key}
            onClick={() => onSelect?.(color.key)}
          />
        ))}
      </div>

      {hasHiddenColors ? (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-cobam-water-blue transition hover:text-cobam-dark-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/40"
        >
          {showAll ? "Reduire la palette" : "Voir toutes les couleurs"}
        </button>
      ) : null}
    </section>
  );
}
