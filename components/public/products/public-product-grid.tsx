"use client";

import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicProductListResult } from "@/features/products/public";
import { normalizeThemeColor, withThemeAlpha } from "@/lib/theme-color";
import PublicProductCard from "./public-product-card";

type PublicProductGridProps = {
  categorySlug: string;
  subcategorySlug: string;
  initialResult: PublicProductListResult;
  themeColor?: string | null;
};

type PublicProductsApiResponse =
  | (PublicProductListResult & { ok: true })
  | { ok: false; message?: string };

function normalizeSearchQuery(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function buildPublicProductHref(input: {
  categorySlug: string;
  subcategorySlug: string;
  product: PublicProductListResult["items"][number];
}) {
  const originPath = encodeURIComponent(`${input.categorySlug}/${input.subcategorySlug}`);

  if (input.product.entityType === "SINGLE") {
    return `/produits/${input.product.slug}?originPath=${originPath}`;
  }

  if (input.product.entityType === "PACK") {
    return `/produits/packs/${input.product.slug}?originPath=${originPath}`;
  }

  return `/produits/familles/${input.product.slug}?originPath=${originPath}`;
}

function PublicProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
        <div className="h-8 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export default function PublicProductGrid({
  categorySlug,
  subcategorySlug,
  initialResult,
  themeColor,
}: PublicProductGridProps) {
  const resolvedThemeColor = normalizeThemeColor(themeColor);
  const [items, setItems] = useState(initialResult.items);
  const [page, setPage] = useState(initialResult.page);
  const [total, setTotal] = useState(initialResult.total);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearchInput = useDeferredValue(searchInput);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchRefreshToken, setSearchRefreshToken] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);
  const searchControllerRef = useRef<AbortController | null>(null);
  const hasMountedSearchEffectRef = useRef(false);
  const activeSearchQuery = normalizeSearchQuery(deferredSearchInput);

  const hasMore = !isRefreshing && items.length < total;

  const resetToInitialResult = useCallback(() => {
    setItems(initialResult.items);
    setPage(initialResult.page);
    setTotal(initialResult.total);
    setErrorMessage(null);
    requestInFlightRef.current = false;
    setIsLoadingMore(false);
    setIsRefreshing(false);
  }, [initialResult]);

  const fetchProductsPage = useCallback(
    async (nextPage: number, query: string, signal?: AbortSignal) => {
      const searchParams = new URLSearchParams({
        category: categorySlug,
        subcategory: subcategorySlug,
        page: String(nextPage),
        pageSize: String(initialResult.pageSize),
      });

      if (query) {
        searchParams.set("q", query);
      }

      const response = await fetch(`/api/public/products?${searchParams.toString()}`, {
        method: "GET",
        signal,
      });
      const payload = (await response.json()) as PublicProductsApiResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(
          "message" in payload && payload.message
            ? payload.message
            : "Impossible de charger les produits.",
        );
      }

      return payload;
    },
    [categorySlug, initialResult.pageSize, subcategorySlug],
  );

  useEffect(() => {
    searchControllerRef.current?.abort();
    searchControllerRef.current = null;
    hasMountedSearchEffectRef.current = false;
    setSearchInput("");
    setSearchRefreshToken(0);
    resetToInitialResult();
  }, [categorySlug, subcategorySlug, initialResult, resetToInitialResult]);

  useEffect(() => {
    if (!hasMountedSearchEffectRef.current) {
      hasMountedSearchEffectRef.current = true;
      return;
    }

    searchControllerRef.current?.abort();
    searchControllerRef.current = null;

    if (!activeSearchQuery) {
      resetToInitialResult();
      return;
    }

    requestInFlightRef.current = false;
    setIsLoadingMore(false);
    setIsRefreshing(true);
    setErrorMessage(null);

    const controller = new AbortController();
    searchControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const payload = await fetchProductsPage(1, activeSearchQuery, controller.signal);

          if (controller.signal.aborted) {
            return;
          }

          setItems(payload.items);
          setPage(payload.page);
          setTotal(payload.total);
        } catch (error: unknown) {
          if (controller.signal.aborted) {
            return;
          }

          setItems([]);
          setPage(1);
          setTotal(0);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Impossible de charger les produits.",
          );
        } finally {
          if (searchControllerRef.current === controller) {
            searchControllerRef.current = null;
          }

          if (!controller.signal.aborted) {
            setIsRefreshing(false);
          }
        }
      })();
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    activeSearchQuery,
    fetchProductsPage,
    resetToInitialResult,
    searchRefreshToken,
  ]);

  const loadMore = useCallback(async () => {
    if (
      !hasMore ||
      requestInFlightRef.current ||
      searchControllerRef.current != null
    ) {
      return;
    }

    requestInFlightRef.current = true;
    setIsLoadingMore(true);
    setErrorMessage(null);

    try {
      const payload = await fetchProductsPage(page + 1, activeSearchQuery);

      setItems((currentItems) => {
        const seenIds = new Set(currentItems.map((item) => `${item.entityType}-${item.id}`));
        const nextItems = payload.items.filter(
          (item) => !seenIds.has(`${item.entityType}-${item.id}`),
        );
        return [...currentItems, ...nextItems];
      });
      setPage(payload.page);
      setTotal(payload.total);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger plus de produits.",
      );
    } finally {
      requestInFlightRef.current = false;
      setIsLoadingMore(false);
    }
  }, [activeSearchQuery, fetchProductsPage, hasMore, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || errorMessage || isRefreshing) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [errorMessage, hasMore, isRefreshing, loadMore]);

  if (items.length === 0 && !isRefreshing && !errorMessage) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p
              className="text-sm font-medium"
              style={{ color: resolvedThemeColor }}
            >
              0 produit
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Rechercher par nom, SKU, marque ou tag..."
              className="h-12 w-full rounded-full border border-slate-300 bg-white pl-11 pr-12 text-sm text-cobam-dark-blue shadow-sm outline-none transition focus:border-cobam-water-blue focus:ring-2 focus:ring-cobam-water-blue/20"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div
          className="rounded-[28px] border border-dashed bg-white/80 px-6 py-14 text-center text-slate-500"
          style={{
            borderColor: withThemeAlpha(resolvedThemeColor, 0.24),
            backgroundColor: withThemeAlpha(resolvedThemeColor, 0.05),
          }}
        >
          {activeSearchQuery
            ? "Aucun produit ne correspond a cette recherche."
            : "Aucun produit public n'est disponible pour le moment."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p
            className="text-sm font-medium"
            style={{ color: resolvedThemeColor }}
          >
            {isRefreshing
              ? "Recherche des produits en cours..."
              : activeSearchQuery
                ? `${total} produit${total > 1 ? "s" : ""} trouve${total > 1 ? "s" : ""}`
                : `${total} produit${total > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Rechercher par nom, SKU, marque ou tag..."
            className="h-12 w-full rounded-full border border-slate-300 bg-white pl-11 pr-12 text-sm text-cobam-dark-blue shadow-sm outline-none transition focus:border-cobam-water-blue focus:ring-2 focus:ring-cobam-water-blue/20"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {errorMessage && items.length === 0 && !isRefreshing ? (
        <div className="flex flex-col items-center gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-6 text-center text-sm text-rose-700">
          <span>{errorMessage}</span>
          <Button
            type="button"
            variant="outline"
            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
            onClick={() => {
              if (activeSearchQuery) {
                setSearchRefreshToken((current) => current + 1);
                return;
              }

              void loadMore();
            }}
          >
            Reessayer
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isRefreshing
          ? Array.from({ length: Math.min(initialResult.pageSize, 6) }).map((_, index) => (
              <PublicProductCardSkeleton key={`refresh-skeleton-${index}`} />
            ))
          : items.map((product) => (
              <PublicProductCard
                key={`${product.entityType}-${product.id}`}
                product={product}
                themeColor={resolvedThemeColor}
                href={buildPublicProductHref({
                  categorySlug,
                  subcategorySlug,
                  product,
                })}
              />
            ))}

        {!isRefreshing && isLoadingMore
          ? Array.from({ length: Math.min(initialResult.pageSize, 3) }).map((_, index) => (
              <PublicProductCardSkeleton key={`append-skeleton-${index}`} />
            ))
          : null}
      </div>

      <div ref={sentinelRef} className="flex min-h-10 items-center justify-center">
        {errorMessage && items.length > 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-center text-sm text-rose-700">
            <span>{errorMessage}</span>
            <Button
              type="button"
              variant="outline"
              className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
              onClick={() => void loadMore()}
            >
              Reessayer
            </Button>
          </div>
        ) : hasMore ? (
          <div
            className="inline-flex items-center gap-3 rounded-full border bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm"
            style={{
              borderColor: withThemeAlpha(resolvedThemeColor, 0.22),
              backgroundColor: withThemeAlpha(resolvedThemeColor, 0.06),
            }}
          >
            <Loader2
              className={`h-4 w-4 ${isLoadingMore ? "animate-spin" : ""}`}
              style={{ color: resolvedThemeColor }}
            />
            {isLoadingMore
              ? "Chargement d'autres produits..."
              : "Chargement automatique..."}
          </div>
        ) : !isRefreshing && items.length > 0 ? (
          <p className="text-sm font-medium text-slate-400">
            Tous les produits visibles de cette sous-categorie sont affiches.
          </p>
        ) : null}
      </div>
    </div>
  );
}
