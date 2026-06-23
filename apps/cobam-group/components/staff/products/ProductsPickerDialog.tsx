"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { Check, ImageIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchInput from "@/components/staff/ui/SearchInput";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import {
  listProductFamilyGroupingCandidatesClient,
  ProductsClientError,
} from "@/features/products/client";
import type { ProductFamilyGroupingCandidateDto } from "@/features/products/types";
import formatEnumLabel from "@/lib/formatEnumLabel";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 18;
const EMPTY_EXCLUDED_PRODUCT_IDS: number[] = [];

export type ProductsPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (products: ProductFamilyGroupingCandidateDto[]) => void;
  excludedProductIds?: number[];
  excludeVariants?: boolean;
  ungroupedOnly?: boolean;
  title?: string;
  description?: string;
};

export default function ProductsPickerDialog({
  open,
  onOpenChange,
  onAdd,
  excludedProductIds = EMPTY_EXCLUDED_PRODUCT_IDS,
  excludeVariants = true,
  ungroupedOnly = true,
  title = "Ajouter des produits",
  description = "Sélectionnez un ou plusieurs produits simples à ajouter.",
}: ProductsPickerDialogProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [items, setItems] = useState<ProductFamilyGroupingCandidateDto[]>([]);
  const [pendingProducts, setPendingProducts] = useState<ProductFamilyGroupingCandidateDto[]>([]);
  const [lastAnchorProductId, setLastAnchorProductId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const normalizedExcludedProductIds = useMemo(
    () =>
      Array.from(
        new Set(
          excludedProductIds.filter(
            (productId) => Number.isInteger(productId) && productId > 0,
          ),
        ),
      ),
    [excludedProductIds],
  );
  const pendingProductIds = useMemo(
    () => new Set(pendingProducts.map((product) => product.id)),
    [pendingProducts],
  );
  const hasMore = items.length < total;

  const fetchProducts = useCallback(
    async (nextPage: number, reset: boolean) => {
      const requestId = ++requestIdRef.current;

      setError(null);
      if (reset) {
        setIsLoading(true);
        setItems([]);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await listProductFamilyGroupingCandidatesClient({
          page: nextPage,
          pageSize: PAGE_SIZE,
          q: deferredSearch,
          excludeVariants,
          ungroupedOnly,
          excludedProductIds: normalizedExcludedProductIds,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setItems((current) => (reset ? result.items : [...current, ...result.items]));
        setTotal(result.total);
        setPage(result.page);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(
          err instanceof ProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger les produits.",
        );
        if (reset) {
          setTotal(0);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [deferredSearch, excludeVariants, normalizedExcludedProductIds, ungroupedOnly],
  );

  useEffect(() => {
    if (!open) {
      requestIdRef.current += 1;
      setSearch("");
      setItems([]);
      setPendingProducts([]);
      setLastAnchorProductId(null);
      setPage(1);
      setTotal(0);
      setError(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    void fetchProducts(1, true);
  }, [fetchProducts, open]);

  const loadNextPage = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore) {
      return;
    }

    void fetchProducts(page + 1, false);
  }, [fetchProducts, hasMore, isLoading, isLoadingMore, page]);

  useEffect(() => {
    if (!open || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    const root = scrollContainerRef.current;
    const target = loadMoreRef.current;
    if (!root || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextPage();
        }
      },
      {
        root,
        rootMargin: "220px 0px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, loadNextPage, open]);

  const toggleProduct = (product: ProductFamilyGroupingCandidateDto, shiftKey: boolean) => {
    setPendingProducts((current) => {
      const alreadySelected = current.some((entry) => entry.id === product.id);

      if (shiftKey && lastAnchorProductId != null) {
        const anchorIndex = items.findIndex((entry) => entry.id === lastAnchorProductId);
        const productIndex = items.findIndex((entry) => entry.id === product.id);

        if (anchorIndex >= 0 && productIndex >= 0) {
          const start = Math.min(anchorIndex, productIndex);
          const end = Math.max(anchorIndex, productIndex);
          const nextById = new Map(current.map((entry) => [entry.id, entry]));

          for (const rangeProduct of items.slice(start, end + 1)) {
            nextById.set(rangeProduct.id, rangeProduct);
          }

          return [...nextById.values()];
        }
      }

      if (alreadySelected) {
        return current.filter((entry) => entry.id !== product.id);
      }

      return [...current, product];
    });
    setLastAnchorProductId(product.id);
  };

  const handleConfirm = () => {
    if (pendingProducts.length === 0) {
      return;
    }

    onAdd(pendingProducts);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[82vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2">{description}</DialogDescription>
          <div className="pt-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              fullWidth
              placeholder="Rechercher un SKU, nom ou slug..."
            />
          </div>
        </DialogHeader>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-5">
          {error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : !error && items.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              Aucun produit disponible.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => {
                const selected = pendingProductIds.has(product.id);

                return (
                  <Card
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    size="sm"
                    onClick={(event) => toggleProduct(product, event.shiftKey)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleProduct(product, event.shiftKey);
                      }
                    }}
                    className={cn(
                      "cursor-pointer gap-0 border bg-white py-0 text-left outline-none transition data-[size=sm]:py-0 focus-visible:ring-2 focus-visible:ring-cobam-water-blue/35",
                      selected
                        ? "border-cobam-water-blue ring-2 ring-cobam-water-blue/25 shadow-sm"
                        : "border-slate-200 hover:border-cobam-water-blue/40 hover:shadow-sm",
                    )}
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {product.imageThumbnailUrl ? (
                        <Image
                          src={product.imageThumbnailUrl}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
                          className="object-contain transition duration-300 group-hover/card:scale-[1.03]"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}

                      <Badge
                        variant={product.lifecycle ? "secondary" : "outline"}
                        className="absolute left-2 top-2 bg-white/95"
                      >
                        {product.lifecycle ? formatEnumLabel(product.lifecycle) : "-"}
                      </Badge>

                      {selected ? (
                        <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-cobam-water-blue text-white shadow-sm">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </div>

                    <CardHeader className="p-3">
                      <CardDescription className="font-mono text-xs">{product.sku}</CardDescription>
                      <CardTitle className="line-clamp-2 text-cobam-dark-blue">
                        {product.name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}

          {hasMore ? <div ref={loadMoreRef} className="h-8" /> : null}

          {isLoadingMore ? (
            <div className="flex justify-center py-4 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-slate-200 px-6 py-4">
          <span className="mr-auto text-xs text-slate-500">
            {pendingProducts.length} produit(s) à ajouter
          </span>
          <AnimatedUIButton type="button" variant="light" onClick={() => onOpenChange(false)}>
            Annuler
          </AnimatedUIButton>
          <AnimatedUIButton
            type="button"
            variant="primary"
            icon="plus"
            iconPosition="left"
            disabled={pendingProducts.length === 0}
            onClick={handleConfirm}
          >
            Ajouter
          </AnimatedUIButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
