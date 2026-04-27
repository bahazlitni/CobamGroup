"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Search, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeThemeColor, withThemeAlpha } from "@/lib/theme-color";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PublicProductIndexItem, PublicProductIndexResult } from "@/features/products/public";
import PublicProductCard from "./public-product-card";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";

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

function parseSearchQueryToAdvancedState(q: string) {
  const isAdvancedSearch = /^(?:brand|sku|name)(?::[123])?=/i.test(q);
  if (!isAdvancedSearch) return null;

  const result = {
    brandValue: "", brandOp: "1",
    nameValue: "", nameOp: "1",
    skuValue: "", skuOp: "1",
    bindBrandName: "&",
    bindNameSku: "&"
  };

  const tokens = [];
  let remainder = q;
  while (remainder.length > 0) {
    if (remainder.startsWith('||')) { tokens.push('||'); remainder = remainder.slice(2); }
    else if (remainder.startsWith('|')) { tokens.push('|'); remainder = remainder.slice(1); }
    else if (remainder.startsWith('&')) { tokens.push('&'); remainder = remainder.slice(1); }
    else {
      const match = remainder.match(/^((?:brand|sku|name)(?::[123])?=[^&|]*)/i);
      if (match) {
        tokens.push(match[1]);
        remainder = remainder.slice(match[1].length);
      } else return null;
    }
  }

  let lastKey: "brand" | "name" | "sku" | null = null;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '&' || token === '|' || token === '||') {
      if (lastKey === 'brand') result.bindBrandName = token;
      if (lastKey === 'name') result.bindNameSku = token;
    } else {
      const [prefix, val] = token.split('=');
      const prefixParts = prefix.split(':');
      const key = prefixParts[0];
      const op = prefixParts[1] || '1';
      const k = key.toLowerCase();
      if (k === 'brand') { result.brandValue = val; result.brandOp = op; lastKey = 'brand'; }
      if (k === 'name') { result.nameValue = val; result.nameOp = op; lastKey = 'name'; }
      if (k === 'sku') { result.skuValue = val; result.skuOp = op; lastKey = 'sku'; }
    }
  }

  return result;
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

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const parsedAdvancedState = useMemo(() => parseSearchQueryToAdvancedState(initialSearch ?? ""), [initialSearch]);

  const [advBrandValue, setAdvBrandValue] = useState(parsedAdvancedState?.brandValue ?? "");
  const [advBrandOp, setAdvBrandOp] = useState(parsedAdvancedState?.brandOp ?? "1");
  const [advBindBrandName, setAdvBindBrandName] = useState(parsedAdvancedState?.bindBrandName ?? "&");
  const [advNameValue, setAdvNameValue] = useState(parsedAdvancedState?.nameValue ?? "");
  const [advNameOp, setAdvNameOp] = useState(parsedAdvancedState?.nameOp ?? "1");
  const [advBindNameSku, setAdvBindNameSku] = useState(parsedAdvancedState?.bindNameSku ?? "&");
  const [advSkuValue, setAdvSkuValue] = useState(parsedAdvancedState?.skuValue ?? "");
  const [advSkuOp, setAdvSkuOp] = useState(parsedAdvancedState?.skuOp ?? "1");

  useEffect(() => {
    if (parsedAdvancedState) {
      setIsAdvancedSearchOpen(true);
    }
  }, [parsedAdvancedState]);

  const compileAdvancedSearch = useCallback(() => {
    const parts = [];
    if (advBrandValue.trim()) parts.push(`brand:${advBrandOp}=${advBrandValue.trim()}`);
    if (advNameValue.trim()) {
      if (parts.length > 0) parts.push(advBindBrandName);
      parts.push(`name:${advNameOp}=${advNameValue.trim()}`);
    }
    if (advSkuValue.trim()) {
      if (parts.length > 0) parts.push(advBindNameSku);
      parts.push(`sku:${advSkuOp}=${advSkuValue.trim()}`);
    }
    return parts.join('');
  }, [advBrandValue, advBrandOp, advBindBrandName, advNameValue, advNameOp, advBindNameSku, advSkuValue, advSkuOp]);

  useEffect(() => {
    if (isAdvancedSearchOpen) {
      const q = compileAdvancedSearch();
      setSearchInput(q);
    }
  }, [compileAdvancedSearch, isAdvancedSearchOpen]);

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
      {searchInput && !isAdvancedSearchOpen ? (
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

  const advancedSearchForm = (
    <div className={cn("transition-all duration-300", isAdvancedSearchOpen ? "mt-5 border-t border-cobam-quill-grey/20 pt-5 opacity-100" : "max-h-0 opacity-0")}>
      <div className="flex flex-col lg:flex-row lg:flex-wrap items-center gap-3">

        {/* Brand */}
        <div className="flex items-center bg-white p-1.5 rounded-lg border border-cobam-quill-grey/40 gap-2 shrink-0 focus-within:border-cobam-water-blue focus-within:ring-1 focus-within:ring-cobam-water-blue transition-all shadow-sm">
          <span className="pl-3 text-[10px] font-bold uppercase tracking-[0.1em] text-cobam-water-blue">Marque</span>
          <Select value={advBrandOp} onValueChange={setAdvBrandOp}>
            <SelectTrigger className="h-8 bg-transparent border-0 shadow-none text-xs text-cobam-carbon-grey focus:ring-0">
              <SelectValue placeholder="Opérateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Commence par</SelectItem>
              <SelectItem value="2">Est égal à</SelectItem>
              <SelectItem value="3">Contient</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-4 bg-cobam-quill-grey/30 mx-1" />
          <Input
            value={advBrandValue}
            onChange={(e) => setAdvBrandValue(e.target.value)}
            placeholder="Ex : Sika"
            className="h-8 bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm px-2 text-cobam-dark-blue placeholder:text-cobam-carbon-grey/40"
          />
        </div>

        {/* Bind 1 */}
        <Select value={advBindBrandName} onValueChange={setAdvBindBrandName}>
          <SelectTrigger className="h-9 border-cobam-quill-grey/30 bg-[#f9fafb] font-bold text-[10px] uppercase shadow-none text-cobam-carbon-grey focus:ring-0 rounded-lg">
            <SelectValue placeholder="Liaison" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="&">ET (&amp;)</SelectItem>
            <SelectItem value="|">OU (|)</SelectItem>
            <SelectItem value="||">OU AVEC (||)</SelectItem>
          </SelectContent>
        </Select>

        {/* Name */}
        <div className="flex items-center bg-white p-1.5 rounded-lg border border-cobam-quill-grey/40 gap-2 shrink-0 focus-within:border-cobam-water-blue focus-within:ring-1 focus-within:ring-cobam-water-blue transition-all shadow-sm">
          <span className="pl-3 text-[10px] font-bold uppercase tracking-[0.1em] text-cobam-water-blue">Nom</span>
          <Select value={advNameOp} onValueChange={setAdvNameOp}>
            <SelectTrigger className="h-8 bg-transparent border-0 shadow-none text-xs text-cobam-carbon-grey focus:ring-0">
              <SelectValue placeholder="Opérateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Commence par</SelectItem>
              <SelectItem value="2">Est égal à</SelectItem>
              <SelectItem value="3">Contient</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-4 bg-cobam-quill-grey/30 mx-1" />
          <Input
            value={advNameValue}
            onChange={(e) => setAdvNameValue(e.target.value)}
            placeholder="Ex : Ciment Colle"
            className="h-8 bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm px-2 text-cobam-dark-blue placeholder:text-cobam-carbon-grey/40"
          />
        </div>

        {/* Bind 2 */}
        <Select value={advBindNameSku} onValueChange={setAdvBindNameSku}>
          <SelectTrigger className="h-9 border-cobam-quill-grey/30 bg-[#f9fafb] font-bold text-[10px] uppercase shadow-none text-cobam-carbon-grey focus:ring-0 rounded-lg">
            <SelectValue placeholder="Liaison" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="&">ET (&amp;)</SelectItem>
            <SelectItem value="|">OU (|)</SelectItem>
            <SelectItem value="||">OU AVEC (||)</SelectItem>
          </SelectContent>
        </Select>

        {/* SKU */}
        <div className="flex items-center bg-white p-1.5 rounded-lg border border-cobam-quill-grey/40 gap-2 shrink-0 focus-within:border-cobam-water-blue focus-within:ring-1 focus-within:ring-cobam-water-blue transition-all shadow-sm">
          <span className="pl-3 text-[10px] font-bold uppercase tracking-[0.1em] text-cobam-water-blue">SKU</span>
          <Select value={advSkuOp} onValueChange={setAdvSkuOp}>
            <SelectTrigger className="h-8 bg-transparent border-0 shadow-none text-xs text-cobam-carbon-grey focus:ring-0">
              <SelectValue placeholder="Opérateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Commence par</SelectItem>
              <SelectItem value="2">Est égal à</SelectItem>
              <SelectItem value="3">Contient</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-4 bg-cobam-quill-grey/30 mx-1" />
          <Input
            value={advSkuValue}
            onChange={(e) => setAdvSkuValue(e.target.value)}
            placeholder="..."
            className="w-[130px] h-8 bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm px-2 text-cobam-dark-blue placeholder:text-cobam-carbon-grey/40"
          />
        </div>

        <div className="flex-1 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setAdvBrandValue(""); setAdvBrandOp("1"); setAdvBindBrandName("&");
              setAdvNameValue(""); setAdvNameOp("1"); setAdvBindNameSku("&");
              setAdvSkuValue(""); setAdvSkuOp("1");
            }}
            className="text-[10px] font-bold uppercase tracking-widest text-cobam-carbon-grey hover:text-rose-500 hover:bg-rose-50 transition-colors h-10 px-4"
          >
            Réinitialiser
          </Button>
        </div>

      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="mx-6 bg-cobam-light-bg/90 px-6 py-5 backdrop-blur-md md:-mx-12 md:px-12">
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
          <div className="w-fit flex items-center gap-3">
            {searchBar}
            <AnimatedUIButton
              variant="secondary"
              icon={isAdvancedSearchOpen ? "chevron-up" : "chevron-down"}
              className="px-6 hidden md:flex"
              onClick={() => {
                if (isAdvancedSearchOpen) {
                  setSearchInput("");
                  setAdvBrandValue(""); setAdvBrandOp("1"); setAdvBindBrandName("&");
                  setAdvNameValue(""); setAdvNameOp("1"); setAdvBindNameSku("&");
                  setAdvSkuValue(""); setAdvSkuOp("1");
                }
                setIsAdvancedSearchOpen((curr) => !curr);
              }}
            >
              Avancée
            </AnimatedUIButton>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (isAdvancedSearchOpen) {
                  setSearchInput("");
                  setAdvBrandValue(""); setAdvBrandOp("1"); setAdvBindBrandName("&");
                  setAdvNameValue(""); setAdvNameOp("1"); setAdvBindNameSku("&");
                  setAdvSkuValue(""); setAdvSkuOp("1");
                }
                setIsAdvancedSearchOpen((curr) => !curr);
              }}
              className={cn(
                "h-12 w-12 shrink-0 border-cobam-quill-grey/40 md:hidden transition-colors",
                isAdvancedSearchOpen ? "bg-cobam-water-blue text-white border-transparent" : "bg-transparent text-cobam-carbon-grey"
              )}
              aria-label="Recherche Avancée"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {advancedSearchForm}
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
            Réessayer
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
