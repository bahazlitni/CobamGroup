"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { formatPriceTnd } from "@/lib/format";

type HiddenField = {
  name: string;
  value: string;
};

type CatalogPriceFilterProps = {
  minBound: number | null;
  maxBound: number | null;
  selectedMin: number | null;
  selectedMax: number | null;
  hiddenFields: HiddenField[];
  resetHref: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CatalogPriceFilter({
  minBound,
  maxBound,
  selectedMin,
  selectedMax,
  hiddenFields,
  resetHref,
}: CatalogPriceFilterProps) {
  const router = useRouter();
  const bounds = useMemo(() => {
    const min = Math.max(0, Math.floor(minBound ?? 0));
    const max = Math.max(min, Math.ceil(maxBound ?? min));

    return { min, max };
  }, [maxBound, minBound]);
  const hasRange = bounds.max > bounds.min;
  const [minValue, setMinValue] = useState(() =>
    clamp(Math.floor(selectedMin ?? bounds.min), bounds.min, bounds.max),
  );
  const [maxValue, setMaxValue] = useState(() =>
    clamp(Math.ceil(selectedMax ?? bounds.max), bounds.min, bounds.max),
  );
  const normalizedMin = Math.min(minValue, maxValue);
  const normalizedMax = Math.max(minValue, maxValue);
  const minIsActive = selectedMin != null;
  const maxIsActive = selectedMax != null;
  const hasActivePrice = minIsActive || maxIsActive;

  useEffect(() => {
    setMinValue(clamp(Math.floor(selectedMin ?? bounds.min), bounds.min, bounds.max));
    setMaxValue(clamp(Math.ceil(selectedMax ?? bounds.max), bounds.min, bounds.max));
  }, [bounds.max, bounds.min, selectedMax, selectedMin]);

  function updateRange(values: number[]) {
    const [nextMin = bounds.min, nextMax = bounds.max] = values;
    setMinValue(clamp(nextMin, bounds.min, bounds.max));
    setMaxValue(clamp(nextMax, bounds.min, bounds.max));
  }

  function applyRange(values: number[]) {
    if (!hasRange) {
      return;
    }

    const [nextMin = bounds.min, nextMax = bounds.max] = values;
    const nextNormalizedMin = Math.min(nextMin, nextMax);
    const nextNormalizedMax = Math.max(nextMin, nextMax);
    const params = new URLSearchParams();

    hiddenFields.forEach((field) => {
      if (field.name !== "prixMin" && field.name !== "prixMax") {
        params.append(field.name, field.value);
      }
    });

    if (nextNormalizedMin > bounds.min) {
      params.set("prixMin", String(nextNormalizedMin));
    }

    if (nextNormalizedMax < bounds.max) {
      params.set("prixMax", String(nextNormalizedMax));
    }

    const query = params.toString();
    router.push(query ? `/catalogue?${query}` : "/catalogue");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-ec-stone px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-muted">Plage</p>
        <p className="mt-1 text-lg font-black text-ec-ink">
          {hasRange
            ? `${formatPriceTnd(normalizedMin) ?? normalizedMin} - ${
                formatPriceTnd(normalizedMax) ?? normalizedMax
              }`
            : "Prix sur demande"}
        </p>
      </div>

      <div className="space-y-4">
        <Slider
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={[normalizedMin, normalizedMax]}
          disabled={!hasRange}
          onValueChange={updateRange}
          onValueCommit={applyRange}
          aria-label="Filtrer par fourchette de prix"
          className="py-5"
        />
        <div className="flex items-center justify-between text-xs font-semibold text-ec-muted">
          <span>{formatPriceTnd(bounds.min) ?? bounds.min}</span>
          <span>{formatPriceTnd(bounds.max) ?? bounds.max}</span>
        </div>
      </div>

      {hasActivePrice ? (
        <div>
          <Link href={resetHref} className="text-sm font-semibold text-ec-muted transition hover:text-ec-ink">
            Effacer le prix
          </Link>
        </div>
      ) : null}
    </div>
  );
}
