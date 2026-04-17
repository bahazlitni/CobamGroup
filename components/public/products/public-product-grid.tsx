"use client";

import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicProductListResult } from "@/features/products/public";
import { normalizeThemeColor, withThemeAlpha } from "@/lib/theme-color";
import PublicProductCard from "./public-product-card";
import { motion } from "framer-motion";

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
  if (input.product.entityType === "FAMILY") {
    return `/produits/${input.categorySlug}/${input.subcategorySlug}/famille/${input.product.slug}`;
  }

  return `/produits/${input.categorySlug}/${input.subcategorySlug}/${input.product.slug}`;
}

function PublicProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="aspect-[4/5] w-full animate-pulse rounded-3xl bg-[#f0efed]" />
      <div className="space-y-4 px-1">
        <div className="h-3 w-1/4 rounded-full bg-[#f0efed]" />
        <div className="h-8 w-3/4 rounded-lg bg-[#f0efed]" />
        <div className="h-4 w-1/2 rounded-lg bg-[#f0efed]" />
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

  /* ─── Shared search bar ─── */
  const searchBar = (
    <div className="relative w-full md:max-w-md">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-cobam-carbon-grey/50" />
      <input
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Rechercher par nom, SKU, marque…"
        className="h-12 w-full border-b border-cobam-quill-grey/40 bg-transparent pl-12 pr-12 text-sm text-[#14202e] outline-none transition-colors focus:border-cobam-water-blue placeholder:text-cobam-carbon-grey/40"
      />
      {searchInput ? (
        <button
          type="button"
          onClick={() => setSearchInput("")}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-cobam-carbon-grey/50 transition hover:bg-cobam-quill-grey/20 hover:text-cobam-dark-blue"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );

  if (items.length === 0 && !isRefreshing && !errorMessage) {
    return (
      <div className="space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: resolvedThemeColor }}
            >
              0 produit
            </p>
          </div>
          {searchBar}
        </div>

        <div
          className="border border-dashed bg-white/80 px-6 py-14 text-center text-sm text-cobam-carbon-grey font-light"
          style={{
            borderColor: withThemeAlpha(resolvedThemeColor, 0.24),
            backgroundColor: withThemeAlpha(resolvedThemeColor, 0.04),
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
    <div className="space-y-10">
      {/* Toolbar: count + search */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: resolvedThemeColor }}
          >
            {isRefreshing
              ? "Recherche en cours…"
              : activeSearchQuery
                ? `${total} produit${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`
                : `${total} produit${total > 1 ? "s" : ""}`}
          </p>
        </div>
        {searchBar}
      </div>

      {/* Error state — full width */}
      {errorMessage && items.length === 0 && !isRefreshing ? (
        <div className="flex flex-col items-center gap-3 border border-rose-200 bg-rose-50 px-5 py-6 text-center text-sm text-rose-700">
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

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isRefreshing
          ? Array.from({ length: Math.min(initialResult.pageSize, 6) }).map((_, index) => (
              <PublicProductCardSkeleton key={`refresh-skeleton-${index}`} />
            ))
          : items.map((product, index) => (
              <motion.div
                key={`${product.entityType}-${product.id}`}
                initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: (index % 12) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <PublicProductCard
                  product={product}
                  themeColor={resolvedThemeColor}
                  href={buildPublicProductHref({
                    categorySlug,
                    subcategorySlug,
                    product,
                  })}
                />
              </motion.div>
            ))}

        {!isRefreshing && isLoadingMore
          ? Array.from({ length: Math.min(initialResult.pageSize, 3) }).map((_, index) => (
              <PublicProductCardSkeleton key={`append-skeleton-${index}`} />
            ))
          : null}
      </div>

      {/* Sentinel / loading indicator */}
      <div ref={sentinelRef} className="flex min-h-10 items-center justify-center">
        {errorMessage && items.length > 0 ? (
          <div className="flex flex-col items-center gap-3 border border-rose-200 bg-rose-50 px-5 py-4 text-center text-sm text-rose-700">
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
            className="inline-flex items-center gap-3 border-b px-2 py-2 text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{
              borderColor: withThemeAlpha(resolvedThemeColor, 0.3),
              color: resolvedThemeColor,
            }}
          >
            <Loader2
              className={`h-4 w-4 ${isLoadingMore ? "animate-spin" : ""}`}
              style={{ color: resolvedThemeColor }}
            />
            {isLoadingMore
              ? "Chargement…"
              : "Chargement automatique"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
