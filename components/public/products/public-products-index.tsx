"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeThemeColor, withThemeAlpha } from "@/lib/theme-color";
import type { PublicProductIndexItem, PublicProductIndexResult } from "@/features/products/public";
import PublicProductCard from "./public-product-card";

type PublicProductsIndexProps = {
  initialResult: PublicProductIndexResult;
  initialSearch?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
};

type PublicProductsIndexApiResponse =
  | (PublicProductIndexResult & { ok: true })
  | { ok: false; message?: string };

function normalizeSearchQuery(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function buildPublicProductHref(input: {
  categorySlug: string;
  subcategorySlug: string;
  product: PublicProductIndexItem["product"];
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

function groupIndexItems(items: PublicProductIndexItem[]) {
  const categories = new Map<
    string,
    {
      id: number;
      name: string;
      slug: string;
      subtitle: string | null;
      themeColor: string | null;
      sortOrder: number;
      subcategories: Map<
        string,
        {
          id: number;
          name: string;
          slug: string;
          subtitle: string | null;
          description: string | null;
          sortOrder: number;
          products: PublicProductIndexItem["product"][];
        }
      >;
    }
  >();

  for (const item of items) {
    const categoryKey = item.category.slug;
    const subcategoryKey = item.subcategory.slug;

    if (!categories.has(categoryKey)) {
      categories.set(categoryKey, {
        ...item.category,
        subcategories: new Map(),
      });
    }

    const category = categories.get(categoryKey)!;

    if (!category.subcategories.has(subcategoryKey)) {
      category.subcategories.set(subcategoryKey, {
        id: item.subcategory.id,
        name: item.subcategory.name,
        slug: item.subcategory.slug,
        subtitle: item.subcategory.subtitle,
        description: item.subcategory.description,
        sortOrder: item.subcategory.sortOrder,
        products: [],
      });
    }

    category.subcategories.get(subcategoryKey)!.products.push(item.product);
  }

  return [...categories.values()]
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }
      return left.name.localeCompare(right.name, "fr-FR");
    })
    .map((category) => ({
      ...category,
      subcategories: [...category.subcategories.values()]
        .sort((left, right) => {
          if (left.sortOrder !== right.sortOrder) {
            return left.sortOrder - right.sortOrder;
          }
          return left.name.localeCompare(right.name, "fr-FR");
        })
        .map((subcategory) => ({
          ...subcategory,
          products: [...subcategory.products].sort((left, right) =>
            left.slug.localeCompare(right.slug, "fr-FR"),
          ),
        })),
    }));
}

export default function PublicProductsIndex({
  initialResult,
  initialSearch,
  categorySlug,
  subcategorySlug,
}: PublicProductsIndexProps) {
  const [items, setItems] = useState(initialResult.items);
  const [page, setPage] = useState(initialResult.page);
  const [total, setTotal] = useState(initialResult.total);
  const [searchInput, setSearchInput] = useState(initialSearch ?? "");
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

  const groupedItems = useMemo(() => groupIndexItems(items), [items]);

  const fetchProductsPage = useCallback(
    async (nextPage: number, query: string, signal?: AbortSignal) => {
      const searchParams = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(initialResult.pageSize),
      });

      if (categorySlug) {
        searchParams.set("category", categorySlug);
      }
      if (subcategorySlug) {
        searchParams.set("subcategory", subcategorySlug);
      }
      if (query) {
        searchParams.set("search", query);
      }

      const response = await fetch(`/api/public/all-products?${searchParams.toString()}`, {
        method: "GET",
        signal,
      });
      const payload = (await response.json()) as PublicProductsIndexApiResponse;

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

  const resetToInitialResult = useCallback(() => {
    setItems(initialResult.items);
    setPage(initialResult.page);
    setTotal(initialResult.total);
    setErrorMessage(null);
    requestInFlightRef.current = false;
    setIsLoadingMore(false);
    setIsRefreshing(false);
  }, [initialResult]);

  useEffect(() => {
    setSearchInput(initialSearch ?? "");
  }, [initialSearch]);

  useEffect(() => {
    searchControllerRef.current?.abort();
    searchControllerRef.current = null;
    hasMountedSearchEffectRef.current = false;
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
    if (!hasMore || requestInFlightRef.current || searchControllerRef.current != null) {
      return;
    }

    requestInFlightRef.current = true;
    setIsLoadingMore(true);
    setErrorMessage(null);

    try {
      const payload = await fetchProductsPage(page + 1, activeSearchQuery);

      setItems((currentItems) => {
        const seenKeys = new Set(
          currentItems.map(
            (item) => `${item.product.entityType}-${item.product.id}`,
          ),
        );
        const nextItems = payload.items.filter(
          (item) =>
            !seenKeys.has(
              `${item.product.entityType}-${item.product.id}`,
            ),
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
      { rootMargin: "320px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [errorMessage, hasMore, isRefreshing, loadMore]);

  const searchBar = (
    <div className="relative w-full md:max-w-md">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-cobam-carbon-grey/50" />
      <input
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Rechercher par nom, SKU, marque..."
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

  return (
    <div className="space-y-12">
      <div className="sticky top-0 z-20 -mx-6 bg-cobam-light-bg/90 px-6 py-5 backdrop-blur-md md:-mx-12 md:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cobam-carbon-grey">
              {isRefreshing
                ? "Recherche en cours..."
                : activeSearchQuery
                  ? `${total} produit${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`
                  : `${total} produit${total > 1 ? "s" : ""}`}
            </p>
          </div>
          {searchBar}
        </div>
      </div>

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

      {groupedItems.length === 0 && !isRefreshing && !errorMessage ? (
        <div className="border border-dashed bg-white/80 px-6 py-14 text-center text-sm font-light text-cobam-carbon-grey">
          {activeSearchQuery
            ? "Aucun produit ne correspond a cette recherche."
            : "Aucun produit public n'est disponible pour le moment."}
        </div>
      ) : null}

      <div className="space-y-14">
        {groupedItems.map((category) => {
          const themeColor = normalizeThemeColor(category.themeColor);

          return (
            <section key={category.slug} className="space-y-10">
              <div className="space-y-3">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.4em]"
                  style={{ color: themeColor }}
                >
                  {category.subtitle ?? "Categorie"}
                </p>
                <h2
                  className="text-3xl font-light text-cobam-dark-blue sm:text-4xl"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {category.name}
                </h2>
                <div className="h-[1px] w-14" style={{ backgroundColor: themeColor }} />
              </div>

              <div className="space-y-12">
                {category.subcategories.map((subcategory) => (
                  <div key={`${category.slug}-${subcategory.slug}`} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold text-cobam-dark-blue">
                          {subcategory.name}
                        </h3>
                        {subcategory.subtitle ? (
                          <span className="text-sm text-cobam-carbon-grey">
                            {subcategory.subtitle}
                          </span>
                        ) : null}
                      </div>
                      <div className="h-px w-10 bg-cobam-quill-grey/50" />
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {subcategory.products.map((product) => (
                        <PublicProductCard
                          key={`${product.entityType}-${product.id}-${subcategory.slug}`}
                          product={product}
                          themeColor={themeColor}
                          href={buildPublicProductHref({
                            categorySlug: category.slug,
                            subcategorySlug: subcategory.slug,
                            product,
                          })}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {isRefreshing
          ? Array.from({ length: 6 }).map((_, index) => (
              <PublicProductCardSkeleton key={`refresh-skeleton-${index}`} />
            ))
          : null}

        {!isRefreshing && isLoadingMore
          ? Array.from({ length: 3 }).map((_, index) => (
              <PublicProductCardSkeleton key={`append-skeleton-${index}`} />
            ))
          : null}
      </div>

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
            className={cn(
              "inline-flex items-center gap-3 border-b px-2 py-2 text-[11px] font-medium uppercase tracking-[0.2em]",
              isLoadingMore ? "text-cobam-dark-blue" : "text-cobam-carbon-grey",
            )}
            style={{
              borderColor: withThemeAlpha("#0a8dc1", 0.2),
            }}
          >
            <Loader2 className={`h-4 w-4 ${isLoadingMore ? "animate-spin" : ""}`} />
            {isLoadingMore ? "Chargement..." : "Chargement automatique"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
