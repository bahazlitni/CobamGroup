"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Package } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Checkbox } from "@/components/ui/checkbox";
import PanelField from "@/components/staff/ui/PanelField";
import { StaffSelect } from "@/components/staff/ui";
import formatEnumLabel from "@/lib/formatEnumLabel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts } from "@/features/products/access";
import {
  mergeUniqueById,
  readStaffInfiniteListCache,
  useStaffInfiniteScroll,
  useStaffScrollRestoration,
  writeStaffInfiniteListCache,
} from "@/lib/client/use-staff-infinite-scroll";
import {
  deleteProductFamiliesBulkClient,
  listProductsClient,
  ProductsClientError,
  updateProductFamiliesBulkClient,
} from "@/features/products/client";
import type { ProductFamilyListItemDto } from "@/features/products/types";
import type { ProductLifecycle } from "@prisma/client";
import { PRODUCT_LIFECYCLE_VALUES } from "@/features/products/lifecycle";

const PAGE_SIZE = 20;
const LIST_CACHE_KEY = "product-families";

type ProductFamiliesListCacheExtra = {
  productBrandOptions: string[];
  searchInput: string;
  activeSearch: string;
};

export default function ProductsListPage() {
  const { user } = useStaffSessionContext();
  const canCreate = user ? canCreateProducts(user) : false;
  const [listCache] = useState(() =>
    readStaffInfiniteListCache<
      ProductFamilyListItemDto,
      ProductFamiliesListCacheExtra
    >(LIST_CACHE_KEY),
  );
  const [items, setItems] = useState<ProductFamilyListItemDto[]>(
    () => listCache?.items ?? [],
  );
  const [productBrandOptions, setProductBrandOptions] = useState<string[]>(
    () => listCache?.extra?.productBrandOptions ?? [],
  );
  const [page, setPage] = useState(() => listCache?.page ?? 1);
  const [pageSize] = useState(() => listCache?.pageSize ?? PAGE_SIZE);
  const [total, setTotal] = useState(() => listCache?.total ?? 0);
  const [searchInput, setSearchInput] = useState(
    () => listCache?.extra?.searchInput ?? "",
  );
  const [activeSearch, setActiveSearch] = useState(
    () => listCache?.extra?.activeSearch ?? "",
  );
  const [isLoading, setIsLoading] = useState(listCache == null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() =>
    listCache ? listCache.items.length < listCache.total : true,
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const shiftKeyRef = useRef(false);
  const listRequestIdRef = useRef(0);
  const didLoadInitialRef = useRef(listCache != null);
  const pageRef = useRef(page);
  const activeSearchRef = useRef(activeSearch);
  const [bulkForm, setBulkForm] = useState({
    brand: null as string | null,
    lifecycle: null as ProductFamilyListItemDto["lifecycle"] | null,
    mixed: {
      brand: false,
      lifecycle: false,
    },
    enabled: {
      brand: false,
      lifecycle: false,
    },
    touched: {} as Record<string, boolean>,
  });

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    activeSearchRef.current = activeSearch;
  }, [activeSearch]);

  const fetchPage = useCallback(
    async (options?: {
      page?: number;
      search?: string;
      reset?: boolean;
    }) => {
      const nextPage = options?.page ?? pageRef.current;
      const reset = options?.reset ?? nextPage === 1;
      const nextSearch = options?.search ?? activeSearchRef.current;
      const requestId = ++listRequestIdRef.current;

      if (reset) {
        setIsLoading(true);
        setItems([]);
        setPage(1);
        setHasMore(true);
        setActiveSearch(nextSearch);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const result = await listProductsClient({
          page: nextPage,
          pageSize,
          q: nextSearch,
        });

        if (requestId !== listRequestIdRef.current) {
          return;
        }

        setItems((current) =>
          reset ? result.items : mergeUniqueById(current, result.items),
        );
        setProductBrandOptions(
          Array.isArray(result.productBrandOptions) ? result.productBrandOptions : [],
        );
        setTotal(result.total);
        setPage(result.page);
        setHasMore(result.page * result.pageSize < result.total);
      } catch (err: unknown) {
        if (requestId !== listRequestIdRef.current) {
          return;
        }

        setError(
          err instanceof ProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger les familles produit.",
        );
        if (reset) {
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        if (requestId === listRequestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [pageSize],
  );

  useEffect(() => {
    if (didLoadInitialRef.current) {
      return;
    }

    didLoadInitialRef.current = true;
    void fetchPage({ page: 1, reset: true });
  }, [fetchPage]);

  useEffect(() => {
    if (reloadToken === 0) {
      return;
    }

    void fetchPage({ page: 1, search: activeSearch, reset: true });
  }, [activeSearch, fetchPage, reloadToken]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    await fetchPage({ page: page + 1, reset: false });
  }, [fetchPage, hasMore, isLoading, isLoadingMore, page]);

  const sentinelRef = useStaffInfiniteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
    enabled: !error,
  });

  useStaffScrollRestoration(LIST_CACHE_KEY, !isLoading);

  useEffect(() => {
    if (isLoading && items.length === 0 && total === 0) {
      return;
    }

    writeStaffInfiniteListCache<
      ProductFamilyListItemDto,
      ProductFamiliesListCacheExtra
    >(LIST_CACHE_KEY, {
      items,
      total,
      page,
      pageSize,
      extra: {
        productBrandOptions,
        searchInput,
        activeSearch,
      },
    });
  }, [
    activeSearch,
    isLoading,
    items,
    page,
    pageSize,
    productBrandOptions,
    searchInput,
    total,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "a") {
        return;
      }

      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      setSelectedIds(items.map((item) => item.id));
      setLastSelectedIndex(items.length > 0 ? items.length - 1 : null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchPage({ page: 1, search: searchInput.trim(), reset: true });
  };

  const handleToggleSelection = (
    index: number,
    id: number,
    checked: boolean,
    useRange: boolean,
  ) => {
    if (useRange && lastSelectedIndex != null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = items.slice(start, end + 1).map((item) => item.id);

      setSelectedIds((current) => {
        if (checked) {
          return Array.from(new Set([...current, ...rangeIds]));
        }

        return current.filter((value) => !rangeIds.includes(value));
      });
      setLastSelectedIndex(index);
      return;
    }

    setSelectedIds((current) =>
      checked
        ? [...current, id].filter((value, idx, array) => array.indexOf(value) === idx)
        : current.filter((value) => value !== id),
    );
    setLastSelectedIndex(index);
  };

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  const buildBulkForm = () => {
    if (selectedItems.length === 0) {
      return;
    }

    const getValue = <T,>(getter: (item: ProductFamilyListItemDto) => T) => {
      const values = selectedItems.map(getter);
      const first = values[0];
      const mixed = values.some((value) => value !== first);
      return { value: mixed ? null : first, mixed };
    };

    const brand = getValue((item) => item.brand ?? null);
    const lifecycle = getValue((item) => item.lifecycle ?? null);

    setBulkForm({
      brand: brand.mixed ? null : brand.value,
      lifecycle: lifecycle.mixed ? null : lifecycle.value,
      mixed: {
        brand: brand.mixed,
        lifecycle: lifecycle.mixed,
      },
      enabled: {
        brand: false,
        lifecycle: false,
      },
      touched: {},
    });
  };

  const handleBulkEditOpen = () => {
    buildBulkForm();
    setBulkEditOpen(true);
  };

  const buildBulkPayload = () => {
    const data: Record<string, unknown> = {};
    const enabled = bulkForm.enabled;

    if (enabled.brand) {
      data.brand = bulkForm.brand ?? null;
    }
    if (enabled.lifecycle) {
      data.lifecycle = bulkForm.lifecycle ?? null;
    }

    return data;
  };

  const handleBulkEditSubmit = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    const data = buildBulkPayload();
    if (Object.keys(data).length === 0) {
      setBulkEditOpen(false);
      return;
    }

    setBulkEditLoading(true);
    try {
      await updateProductFamiliesBulkClient({ ids: selectedIds, data });
      setBulkEditOpen(false);
      setSelectedIds([]);
      setReloadToken((current) => current + 1);
    } catch (err: unknown) {
      setError(
        err instanceof ProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de mettre a jour les familles.",
      );
    } finally {
      setBulkEditLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer ${selectedIds.length} famille(s) sélectionnée(s) ?`,
    );
    if (!confirmed) {
      return;
    }

    setBulkEditLoading(true);
    try {
      await deleteProductFamiliesBulkClient(selectedIds);
      setSelectedIds([]);
      setReloadToken((current) => current + 1);
    } catch (err: unknown) {
      setError(
        err instanceof ProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de supprimer les familles.",
      );
    } finally {
      setBulkEditLoading(false);
    }
  };

  const handleBulkFieldToggle = (field: keyof typeof bulkForm.enabled, checked: boolean) => {
    setBulkForm((current) => {
      const next = { ...current };
      next.enabled = { ...current.enabled, [field]: checked };
      if (checked && current.mixed[field]) {
        switch (field) {
          case "brand":
            next.brand = selectedItems[0]?.brand ?? null;
            break;
          case "lifecycle":
            next.lifecycle = selectedItems[0]?.lifecycle ?? null;
            break;
          default:
            break;
        }
        next.mixed = { ...current.mixed, [field]: false };
      }
      if (!checked) {
        next.touched = { ...current.touched, [field]: false };
      }
      return next;
    });
  };

  const allFieldKeys: Array<keyof typeof bulkForm.enabled> = ["brand", "lifecycle"];
  const allFieldsChecked = allFieldKeys.every((field) => bulkForm.enabled[field]);
  const someFieldsChecked = allFieldKeys.some((field) => bulkForm.enabled[field]);

  const labelNode = (field: keyof typeof bulkForm.enabled, label: string) => (
    <span className="inline-flex items-center gap-2">
      <Checkbox
        checked={bulkForm.enabled[field]}
        onCheckedChange={(checked) => handleBulkFieldToggle(field, Boolean(checked))}
        aria-label={`Modifier ${label}`}
      />
      <span>{label}</span>
    </span>
  );

  const isDisabled = (field: keyof typeof bulkForm.enabled) => !bulkForm.enabled[field];

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Produits" title="Familles" icon={Package}>
        {canCreate ? (
          <AnimatedUIButton
            href="/espace/staff/gestion-des-produits/familles/new"
            variant="secondary"
            icon="plus"
            iconPosition="left"
          >
            Créer une famille
          </AnimatedUIButton>
        ) : null}
      </StaffPageHeader>

      <form onSubmit={handleSubmit}>
        <StaffFilterBar
          searchValue={searchInput}
          searchPlaceholder="Rechercher une famille, un slug ou un SKU de variante..."
          onSearchChange={setSearchInput}
        />
      </form>

      {selectedIds.length > 0 ? (
        <div className="fixed right-6 bottom-6 z-30 flex w-[min(560px,calc(100vw-3rem))] flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-slate-600">{selectedIds.length} famille(s) sélectionnée(s)</p>
          <div className="flex flex-wrap gap-2">
            <AnimatedUIButton
              type="button"
              variant="ghost"
              icon="modify"
              iconPosition="left"
              onClick={handleBulkEditOpen}
            >
              Modifier
            </AnimatedUIButton>
            <AnimatedUIButton
              type="button"
              variant="outline"
              color="error"
              icon="trash"
              iconPosition="left"
              onClick={handleBulkDelete}
              disabled={bulkEditLoading}
            >
              Supprimer
            </AnimatedUIButton>
          </div>
        </div>
      ) : null}

      <PanelTable
        columns={[
          <Checkbox
            key="select-all"
            checked={allSelected ? true : isIndeterminate ? "indeterminate" : false}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedIds(items.map((item) => item.id));
              } else {
                setSelectedIds([]);
              }
            }}
            aria-label="Selectionner toutes les familles"
          />,
          "Famille",
          "Variante par défaut",
          "Marque",
          "Sous-categories",
          "Variantes",
          "Actions",
        ]}
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Aucune famille ne correspond a ces criteres."
        infiniteScroll={{
          hasMore,
          isLoadingMore,
          onLoadMore: loadMore,
          loaded: items.length,
          total,
          itemLabel: "famille",
          sentinelRef,
        }}
      >
        {items.map((family, index) => (
          <tr key={family.id} className="hover:bg-slate-50/70">
            <td className="px-4 py-3 align-top">
              <Checkbox
                checked={selectedIds.includes(family.id)}
                onCheckedChange={(checked) => {
                  handleToggleSelection(index, family.id, Boolean(checked), shiftKeyRef.current);
                  shiftKeyRef.current = false;
                }}
                onMouseDown={(event) => {
                  shiftKeyRef.current = event.shiftKey;
                }}
                aria-label={`Selectionner ${family.name}`}
              />
            </td>
            <td className="px-4 py-3 align-top">
              <div className="space-y-1">
                <p className="text-cobam-dark-blue font-semibold">{family.name}</p>
                <p className="text-xs text-slate-500">{family.slug}</p>
                {family.subtitle ? (
                  <p className="text-xs text-slate-500">{family.subtitle}</p>
                ) : null}
              </div>
            </td>
            <td className="px-4 py-3 align-top text-sm text-slate-600">
              {family.defaultVariantSku ?? "-"}
            </td>
            <td className="px-4 py-3 align-top">
              {family.brand ? (
                <StaffBadge size="sm" color="secondary">
                  {family.brand}
                </StaffBadge>
              ) : (
                <span className="text-sm text-slate-400">-</span>
              )}
            </td>
            <td className="px-4 py-3 align-top text-sm text-slate-600">
              {family.subcategories.length > 0
                ? family.subcategories.map((subcategory) => subcategory.name).join(", ")
                : "-"}
            </td>
            <td className="px-4 py-3 align-top text-sm text-slate-600">{family.variantCount}</td>
            <td className="px-4 py-3 text-right align-top">
              <AnimatedUIButton
                href={`/espace/staff/gestion-des-produits/familles/edit?id=${family.id}`}
                variant="ghost"
                icon="modify"
                iconPosition="left"
              >
                Modifier
              </AnimatedUIButton>
            </td>
          </tr>
        ))}
      </PanelTable>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>Modifier les familles</DialogTitle>
                <DialogDescription>
                  Ces valeurs communes seront appliquees a toutes les variantes des familles
                  sélectionnées.
                </DialogDescription>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Checkbox
                  checked={allFieldsChecked ? true : someFieldsChecked ? "indeterminate" : false}
                  onCheckedChange={(checked) => {
                    const value = Boolean(checked);
                    allFieldKeys.forEach((field) => handleBulkFieldToggle(field, value));
                  }}
                  aria-label="Selectionner tous les champs"
                />
                Tout
              </label>
            </div>
          </DialogHeader>
          <div className="px-6 pb-4">
            <div className="grid gap-6 md:grid-cols-2">
              <PanelField id="family-common-brand" label={labelNode("brand", "Marque")}>
                <StaffSelect
                  id="family-common-brand"
                  fullWidth
                  value={bulkForm.brand ?? null}
                  placeholder={bulkForm.mixed.brand ? "Mixed" : undefined}
                  emptyLabel="Aucune marque"
                  disabled={isDisabled("brand")}
                  options={productBrandOptions.map((brand) => ({
                    value: brand,
                    label: brand,
                  }))}
                  onValueChange={(value) =>
                    setBulkForm((current) => ({
                      ...current,
                      brand: value || null,
                      mixed: { ...current.mixed, brand: false },
                      touched: { ...current.touched, brand: true },
                    }))
                  }
                />
              </PanelField>

              <PanelField
                id="family-common-lifecycle"
                label={labelNode("lifecycle", "Cycle de vie")}
              >
                <StaffSelect
                  id="family-common-lifecycle"
                  fullWidth
                  value={bulkForm.lifecycle ?? ""}
                  placeholder={bulkForm.mixed.lifecycle ? "Mixed" : undefined}
                  disabled={isDisabled("lifecycle")}
                  onValueChange={(value: string) =>
                    setBulkForm((current) => ({
                      ...current,
                      lifecycle: value ? (value as ProductLifecycle) : null,
                      mixed: { ...current.mixed, lifecycle: false },
                      touched: { ...current.touched, lifecycle: true },
                    }))
                  }
                  options={PRODUCT_LIFECYCLE_VALUES.map((value) => ({
                    value,
                    label: formatEnumLabel(value),
                  }))}
                />
              </PanelField>
            </div>
          </div>
          <DialogFooter>
            <AnimatedUIButton
              type="button"
              variant="outline"
              onClick={() => setBulkEditOpen(false)}
            >
              Annuler
            </AnimatedUIButton>
            <AnimatedUIButton
              type="button"
              variant="primary"
              onClick={() => void handleBulkEditSubmit()}
              loading={bulkEditLoading}
              loadingText="Enregistrement..."
            >
              Enregistrer
            </AnimatedUIButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
