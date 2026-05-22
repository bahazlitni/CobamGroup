"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import type { CommerceCatalogResult } from "@/lib/commerce";
import type { CatalogFilters } from "@/lib/catalog-query";
import {
  CATALOG_AVAILABILITY_OPTIONS,
  CATALOG_SORT_OPTIONS,
  catalogHref,
} from "@/lib/catalog-query";
import { cn } from "@/lib/cn";
import { formatCompactNumber, formatPriceTnd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/commerce/product-card";

const CATALOG_PAGE_SIZE = 36;

type CatalogBrowserProps = {
  initialResult: CommerceCatalogResult;
  initialFilters: CatalogFilters;
};

type PriceFilterProps = {
  minBound: number | null;
  maxBound: number | null;
  selectedMin: number | null;
  selectedMax: number | null;
  onCommit: (range: { minPrice: number | null; maxPrice: number | null }) => void;
  onReset: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSelectedMin(value: number | null, bounds: { min: number; max: number }) {
  if (value == null || value > bounds.max) {
    return bounds.min;
  }

  return clamp(Math.floor(value), bounds.min, bounds.max);
}

function normalizeSelectedMax(value: number | null, bounds: { min: number; max: number }) {
  if (value == null || value < bounds.min) {
    return bounds.max;
  }

  return clamp(Math.ceil(value), bounds.min, bounds.max);
}

function apiHref(filters: CatalogFilters) {
  const href = catalogHref(filters);
  const query = href.includes("?") ? href.slice(href.indexOf("?")) : "";

  return `/api/catalogue${query}`;
}

function sameValues(left: string[], right: string[]) {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function toggleValue(values: string[], value: string, checked: boolean) {
  const next = checked
    ? Array.from(new Set([...values, value]))
    : values.filter((item) => item !== value);

  return sameValues(values, next) ? values : next;
}

function PriceFilter({
  minBound,
  maxBound,
  selectedMin,
  selectedMax,
  onCommit,
  onReset,
}: PriceFilterProps) {
  const bounds = useMemo(() => {
    const min = Math.max(0, Math.floor(minBound ?? 0));
    const max = Math.max(min, Math.ceil(maxBound ?? min));

    return { min, max };
  }, [maxBound, minBound]);
  const hasRange = bounds.max > bounds.min;
  const [minValue, setMinValue] = useState(() => normalizeSelectedMin(selectedMin, bounds));
  const [maxValue, setMaxValue] = useState(() => normalizeSelectedMax(selectedMax, bounds));
  const normalizedMin = Math.min(minValue, maxValue);
  const normalizedMax = Math.max(minValue, maxValue);
  const hasActivePrice = selectedMin != null || selectedMax != null;

  useEffect(() => {
    setMinValue(normalizeSelectedMin(selectedMin, bounds));
    setMaxValue(normalizeSelectedMax(selectedMax, bounds));
  }, [bounds, selectedMax, selectedMin]);

  function updateRange(values: number[]) {
    const [nextMin = bounds.min, nextMax = bounds.max] = values;
    setMinValue(clamp(nextMin, bounds.min, bounds.max));
    setMaxValue(clamp(nextMax, bounds.min, bounds.max));
  }

  function commitRange(values: number[]) {
    if (!hasRange) {
      return;
    }

    const [nextMin = bounds.min, nextMax = bounds.max] = values;
    const nextNormalizedMin = Math.min(nextMin, nextMax);
    const nextNormalizedMax = Math.max(nextMin, nextMax);

    onCommit({
      minPrice: nextNormalizedMin > bounds.min ? nextNormalizedMin : null,
      maxPrice: nextNormalizedMax < bounds.max ? nextNormalizedMax : null,
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-ec-stone rounded-2xl px-4 py-3">
        <p className="text-ec-muted text-xs font-semibold tracking-[0.18em] uppercase">Plage</p>
        <p className="text-ec-ink mt-1 text-lg font-black">
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
          onValueCommit={commitRange}
          aria-label="Filtrer par fourchette de prix"
          className="py-5"
        />
        <div className="text-ec-muted flex items-center justify-between text-xs font-semibold">
          <span>{formatPriceTnd(bounds.min) ?? bounds.min}</span>
          <span>{formatPriceTnd(bounds.max) ?? bounds.max}</span>
        </div>
      </div>

      {hasActivePrice ? (
        <button
          type="button"
          onClick={onReset}
          className="text-ec-muted hover:text-ec-ink text-sm font-semibold transition"
        >
          Effacer le prix
        </button>
      ) : null}
    </div>
  );
}

function FilterCheckbox({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="hover:bg-ec-stone flex items-center gap-3 rounded-2xl px-2 py-2.5 transition">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      <label
        htmlFor={id}
        className="text-ec-ink flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-sm font-semibold"
      >
        <span className="min-w-0 truncate">{label}</span>
        {count != null ? (
          <span className="text-ec-muted shrink-0 text-xs font-bold">
            {formatCompactNumber(count)}
          </span>
        ) : null}
      </label>
    </div>
  );
}

export function CatalogBrowser({ initialResult, initialFilters }: CatalogBrowserProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState(initialResult);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState(initialFilters.search ?? "");
  const didMountRef = useRef(false);
  const requestIdRef = useRef(0);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const sidebarCategories = initialResult.categories;
  const sidebarBrands = initialResult.brands;
  const totalPages = Math.max(1, Math.ceil(result.total / CATALOG_PAGE_SIZE));
  const priceRangeMin = result.priceRange.min;
  const priceRangeMax = result.priceRange.max;
  const selectedCategorySet = useMemo(() => new Set(filters.category), [filters.category]);
  const selectedBrandSet = useMemo(() => new Set(filters.brand), [filters.brand]);
  const selectedAvailabilitySet = useMemo(
    () => new Set(filters.availability),
    [filters.availability],
  );
  const sortOptions = useMemo(
    () =>
      filters.search
        ? CATALOG_SORT_OPTIONS.map((option) =>
            option.value === "latest" ? { ...option, label: "Pertinence" } : option,
          )
        : CATALOG_SORT_OPTIONS,
    [filters.search],
  );
  const categorySummary =
    filters.category.length === 0
      ? "Toutes les catégories"
      : filters.category.length === 1
        ? (result.activeCategory?.name ?? "1 catégorie")
        : `${filters.category.length} catégories`;
  const availabilityLabels = filters.availability
    .map((value) => CATALOG_AVAILABILITY_OPTIONS.find((item) => item.value === value)?.label)
    .filter((label): label is string => Boolean(label));
  const activeFilterSummary = [
    filters.category.length > 0 ? categorySummary : null,
    filters.brand.length > 0
      ? `${filters.brand.length} marque${filters.brand.length > 1 ? "s" : ""}`
      : null,
    availabilityLabels.length > 0 ? availabilityLabels.join(", ") : null,
    filters.promotedOnly ? "Sélections COBAM" : null,
    filters.search ? `recherche "${filters.search}"` : null,
  ].filter(Boolean);

  function updateFilters(patch: Partial<CatalogFilters>, options: { keepPage?: boolean } = {}) {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: options.keepPage ? (patch.page ?? current.page) : (patch.page ?? 1),
    }));
  }

  function retry() {
    setFilters((current) => ({ ...current }));
  }

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const href = catalogHref(filters);
    window.history.replaceState(null, "", href);

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(apiHref(filters), {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Catalogue request failed");
        }

        const nextResult = (await response.json()) as CommerceCatalogResult;

        if (requestIdRef.current === requestId) {
          setResult(nextResult);
        }
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(fetchError);
        if (requestIdRef.current === requestId) {
          setError("Le catalogue n'a pas pu se charger.");
        }
      } finally {
        if (requestIdRef.current === requestId && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filters]);

  useEffect(() => {
    const nextMinPrice =
      filters.minPrice != null &&
      priceRangeMin != null &&
      priceRangeMax != null &&
      filters.minPrice >= priceRangeMin &&
      filters.minPrice <= priceRangeMax
        ? filters.minPrice
        : null;
    const nextMaxPrice =
      filters.maxPrice != null &&
      priceRangeMin != null &&
      priceRangeMax != null &&
      filters.maxPrice >= priceRangeMin &&
      filters.maxPrice <= priceRangeMax
        ? filters.maxPrice
        : null;

    if (nextMinPrice !== filters.minPrice || nextMaxPrice !== filters.maxPrice) {
      setFilters((current) => ({
        ...current,
        minPrice: nextMinPrice,
        maxPrice: nextMaxPrice,
      }));
    }
  }, [filters.maxPrice, filters.minPrice, priceRangeMax, priceRangeMin]);

  return (
    <section className="grid gap-8 lg:grid-cols-[330px_1fr]">
      <aside className="lg:sticky lg:top-[8.875rem] lg:self-start">
        <div className="commerce-thin-scrollbar border-ec-line overflow-hidden rounded-[1.6rem] border bg-white shadow-sm lg:max-h-[calc(100svh-9.625rem)] lg:overflow-y-auto lg:overscroll-contain">
          <section className="border-ec-line border-b p-4">
            <div className="text-ec-muted mb-3 flex items-center gap-2 px-2 text-sm font-semibold tracking-[0.18em] uppercase">
              <SlidersHorizontal className="size-4" />
              Prix
            </div>
            <PriceFilter
              minBound={result.priceRange.min}
              maxBound={result.priceRange.max}
              selectedMin={filters.minPrice}
              selectedMax={filters.maxPrice}
              onCommit={(range) => updateFilters(range)}
              onReset={() => updateFilters({ minPrice: null, maxPrice: null })}
            />
          </section>

          <section className="border-ec-line border-b p-4">
            <div className="text-ec-muted mb-3 flex items-center gap-2 px-2 text-sm font-semibold tracking-[0.18em] uppercase">
              <Filter className="size-4" />
              Catégories
            </div>
            <div className="space-y-1">
              {sidebarCategories.map((item) => {
                const id = `categorie-${item.slug}`.replace(/[^a-zA-Z0-9_-]/g, "-");

                return (
                  <FilterCheckbox
                    key={item.slug}
                    id={id}
                    label={item.name}
                    count={item.productCount}
                    checked={selectedCategorySet.has(item.slug)}
                    onChange={(checked) =>
                      updateFilters({ category: toggleValue(filters.category, item.slug, checked) })
                    }
                  />
                );
              })}
            </div>
          </section>

          <section className="border-ec-line border-b p-4">
            <div className="text-ec-muted mb-3 flex items-center gap-2 px-2 text-sm font-semibold tracking-[0.18em] uppercase">
              <SlidersHorizontal className="size-4" />
              Marques
            </div>
            <div className="space-y-1">
              {sidebarBrands.slice(0, 18).map((item) => {
                const id = `marque-${item.slug}`.replace(/[^a-zA-Z0-9_-]/g, "-");

                return (
                  <FilterCheckbox
                    key={item.slug}
                    id={id}
                    label={item.name}
                    checked={selectedBrandSet.has(item.slug)}
                    onChange={(checked) =>
                      updateFilters({ brand: toggleValue(filters.brand, item.slug, checked) })
                    }
                  />
                );
              })}
            </div>
          </section>

          <section className="border-ec-line border-b p-4">
            <div className="text-ec-muted mb-3 flex items-center gap-2 px-2 text-sm font-semibold tracking-[0.18em] uppercase">
              <SlidersHorizontal className="size-4" />
              Disponibilité
            </div>
            <div className="space-y-1">
              {CATALOG_AVAILABILITY_OPTIONS.map((item) => {
                const id = `disponibilité-${item.value}`;

                return (
                  <FilterCheckbox
                    key={item.value}
                    id={id}
                    label={item.label}
                    checked={selectedAvailabilitySet.has(item.value)}
                    onChange={(checked) =>
                      updateFilters({
                        availability: toggleValue(
                          filters.availability,
                          item.value,
                          checked,
                        ) as CatalogFilters["availability"],
                      })
                    }
                  />
                );
              })}
            </div>
          </section>

          <section className="border-ec-line border-b p-4">
            <FilterCheckbox
              id="selection-promotion"
              label="Sélections COBAM"
              checked={filters.promotedOnly}
              onChange={(checked) => updateFilters({ promotedOnly: checked })}
            />
          </section>
        </div>
      </aside>

      <div ref={resultsRef}>
        <div className="border-ec-line mb-5 grid gap-4 rounded-[1.5rem] border bg-white p-4 lg:grid-cols-[minmax(10rem,1fr)_minmax(18rem,28rem)_auto] lg:items-center">
          <div>
            <p className="text-ec-ink text-sm font-semibold">
              {formatCompactNumber(result.total)} résultat{result.total > 1 ? "s" : ""}
            </p>
            <p className="text-ec-muted mt-1 text-sm">
              {categorySummary}
              {filters.search ? ` · recherche "${filters.search}"` : ""}
            </p>
          </div>
          {activeFilterSummary.length > 0 ? (
            <p className="text-ec-blue text-xs font-semibold sm:text-right">
              {activeFilterSummary.join(" · ")}
            </p>
          ) : null}
          <form
            onSubmit={(event) => event.preventDefault()}
            className="border-ec-line bg-ec-paper focus-within:border-ec-blue focus-within:ring-ec-blue/10 flex h-11 items-center gap-2 rounded-full border px-4 focus-within:ring-4"
          >
            <Search className="text-ec-muted size-4 shrink-0" />
            <input
              value={searchDraft}
              onChange={(event) => {
                const value = event.target.value;
                setSearchDraft(value);
                updateFilters({ search: value.trim() || null });
              }}
              placeholder="Rechercher dans les résultats..."
              className="text-ec-ink placeholder:text-ec-muted/70 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
            />
            <button className="sr-only">Rechercher</button>
          </form>
          <div className="flex items-center justify-end gap-2">
            <label className="text-ec-muted text-sm" htmlFor="tri">
              Trier
            </label>
            <Select value={filters.sort} onValueChange={(value) => updateFilters({ sort: value })}>
              <SelectTrigger id="tri" className="h-11 min-w-44 rounded-full bg-white">
                <SelectValue placeholder="Trier" />
              </SelectTrigger>
              <SelectContent align="end">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative min-h-80">
          {isLoading ? (
            <div className="bg-ec-paper/55 pointer-events-none absolute inset-0 z-10 rounded-[1.5rem] backdrop-blur-[1px]">
              <div className="border-ec-line text-ec-blue sticky top-[9rem] mx-auto mt-20 w-fit rounded-full border bg-white px-4 py-2 text-xs font-black tracking-[0.18em] uppercase shadow-sm">
                Actualisation
              </div>
            </div>
          ) : null}

          <div className={cn("transition-opacity duration-200", isLoading && "opacity-45")}>
            {error ? (
              <div className="border-ec-line rounded-[2rem] border border-dashed bg-white p-10 text-center">
                <h2 className="text-ec-ink text-2xl font-black">
                  Le catalogue n&apos;a pas pu se charger.
                </h2>
                <p className="text-ec-muted mx-auto mt-3 max-w-lg text-sm leading-7">
                  Réessayez dans un instant. Vos filtres restent en place.
                </p>
                <Button type="button" onClick={retry} className="mt-6" variant="secondary">
                  Réessayer
                </Button>
              </div>
            ) : result.items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {result.items.map((product, index) => (
                  <ProductCard
                    key={`${product.entityType}-${product.id}`}
                    product={product}
                    priority={index < 4}
                  />
                ))}
              </div>
            ) : (
              <div className="border-ec-line rounded-[2rem] border border-dashed bg-white p-10 text-center">
                <h2 className="text-ec-ink text-2xl font-black">Aucun produit trouvé</h2>
                <p className="text-ec-muted mx-auto mt-3 max-w-lg text-sm leading-7">
                  Essayez un terme plus court, retirez une marque ou revenez au catalogue complet.
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setSearchDraft("");
                    updateFilters({
                      search: null,
                      category: [],
                      brand: [],
                      sort: "latest",
                      availability: [],
                      promotedOnly: false,
                      minPrice: null,
                      maxPrice: null,
                      page: 1,
                    });
                  }}
                  className="mt-6"
                  variant="secondary"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            {filters.page > 1 ? (
              <Button
                type="button"
                onClick={() => updateFilters({ page: filters.page - 1 }, { keepPage: true })}
                variant="secondary"
              >
                Page précédente
              </Button>
            ) : null}
            <span className="text-ec-muted text-sm font-semibold">
              Page {filters.page} / {totalPages}
            </span>
            {filters.page < totalPages ? (
              <Button
                type="button"
                onClick={() => updateFilters({ page: filters.page + 1 }, { keepPage: true })}
                variant="secondary"
              >
                Page suivante
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
