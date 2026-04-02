"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Package, Search } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { listAllProductsClient, AllProductsClientError } from "@/features/all-products/client";
import type { AllProductListItemDto } from "@/features/all-products/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

function VariantResultCard({
  item,
  selected,
  blocked,
  onToggle,
}: {
  item: AllProductListItemDto;
  selected: boolean;
  blocked: boolean;
  onToggle: (item: AllProductListItemDto) => void;
}) {
  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => onToggle(item)}
      className={cn(
        "grid w-full grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border px-4 py-3 text-left transition",
        blocked
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
          : selected
            ? "border-cobam-water-blue bg-cobam-water-blue/5"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {item.coverMediaId != null ? (
          <Image
            src={`/api/staff/medias/${item.coverMediaId}/file?variant=thumbnail`}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Package className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-semibold text-cobam-dark-blue">{item.name}</p>
        <p className="truncate text-xs text-slate-500">SKU {item.sku}</p>
        <p className="truncate text-xs text-slate-400">{item.slug}</p>
      </div>

      <div className="flex min-w-0 flex-col items-end gap-2">
        {item.basePriceAmount ? (
          <span className="text-xs font-semibold text-cobam-dark-blue">
            {item.basePriceAmount} TND
          </span>
        ) : (
          <span className="text-xs text-slate-400">Prix derive</span>
        )}

        {selected ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cobam-water-blue text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function ProductPackVariantSelectorDialog({
  open,
  onOpenChange,
  selectedVariantIds,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVariantIds: number[];
  onSelect: (items: AllProductListItemDto[]) => void;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [items, setItems] = useState<AllProductListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<Record<number, AllProductListItemDto>>({});

  const selectedIds = useMemo(() => new Set(selectedVariantIds), [selectedVariantIds]);
  const selectedItems = useMemo(() => Object.values(selectedMap), [selectedMap]);

  const loadVariants = useCallback(
    async (nextPage: number, reset: boolean) => {
      if (!open) {
        return;
      }

      setError(null);
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await listAllProductsClient({
          page: nextPage,
          pageSize: PAGE_SIZE,
          q: deferredSearch || undefined,
          sourceType: "VARIANT",
        });

        setItems((current) => (reset ? result.items : [...current, ...result.items]));
        setPage(nextPage);
        setHasMore(nextPage * PAGE_SIZE < result.total);
      } catch (err: unknown) {
        const message =
          err instanceof AllProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erreur lors du chargement des variantes.";
        setError(message);
      } finally {
        if (reset) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [deferredSearch, open],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadVariants(1, true);
  }, [deferredSearch, loadVariants, open]);

  useEffect(() => {
    setSelectedMap((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([variantId]) => !selectedIds.has(Number(variantId))),
      ) as Record<number, AllProductListItemDto>,
    );
  }, [selectedIds]);

  const handleClose = () => {
    setSearch("");
    setItems([]);
    setPage(1);
    setHasMore(false);
    setError(null);
    setSelectedMap({});
    onOpenChange(false);
  };

  const handleToggle = (item: AllProductListItemDto) => {
    if (selectedIds.has(item.sourceId)) {
      return;
    }

    setSelectedMap((current) => {
      const next = { ...current };

      if (next[item.sourceId]) {
        delete next[item.sourceId];
      } else {
        next[item.sourceId] = item;
      }

      return next;
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}
    >
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-base font-semibold text-cobam-dark-blue">
            Ajouter des variantes au pack
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-hidden px-6 py-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par nom, SKU, slug ou description..."
              className="h-10 border-slate-300 pl-9"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-sm text-slate-500">
                Aucune variante ne correspond a cette recherche.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <VariantResultCard
                    key={`${item.sourceId}-${item.slug}`}
                    item={item}
                    selected={Boolean(selectedMap[item.sourceId])}
                    blocked={selectedIds.has(item.sourceId)}
                    onToggle={handleToggle}
                  />
                ))}

                {hasMore ? (
                  <div className="flex justify-center pt-2">
                    <AnimatedUIButton
                      type="button"
                      variant="light"
                      onClick={() => void loadVariants(page + 1, false)}
                      loading={isLoadingMore}
                      loadingText="Chargement..."
                      disabled={isLoadingMore}
                    >
                      Charger plus
                    </AnimatedUIButton>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 px-6 py-4">
          <div className="flex w-full items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {selectedItems.length} variante{selectedItems.length > 1 ? "s" : ""} selectionnee
              {selectedItems.length > 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-3">
              <AnimatedUIButton type="button" variant="light" onClick={handleClose}>
                Annuler
              </AnimatedUIButton>

              <AnimatedUIButton
                type="button"
                variant="primary"
                icon="plus"
                iconPosition="left"
                disabled={selectedItems.length === 0}
                onClick={() => {
                  onSelect(selectedItems);
                  handleClose();
                }}
              >
                Ajouter au pack
              </AnimatedUIButton>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
