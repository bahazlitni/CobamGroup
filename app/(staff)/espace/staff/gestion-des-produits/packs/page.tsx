"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Boxes } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Checkbox } from "@/components/ui/checkbox";
import ProductEssentialEntries from "@/components/staff/products/ProductEssentialEntries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import {
  canCreateProducts,
  canToggleProductLifecycle,
} from "@/features/products/access";
import {
  listProductPacksClient,
  deleteProductPacksBulkClient,
  ProductPacksClientError,
  updateProductPacksBulkClient,
} from "@/features/product-packs/client";
import {
  AllProductsClientError,
  updateAllProductLifecycleClient,
} from "@/features/all-products/client";
import type { ProductPackListItemDto } from "@/features/product-packs/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const COLUMN_LABELS = [
  "Pack",
  "Prix derive",
  "Stock",
  "Sous-categories",
  "Marque",
  "Cycle",
  "Visible",
  "Lignes",
  "Actions",
];

function formatLifecycleBadge(lifecycle: ProductPackListItemDto["lifecycle"]) {
  return lifecycle === "ACTIVE"
    ? { label: "Actif", color: "green" as const, icon: "check-circle" as const }
    : { label: "Brouillon", color: "default" as const, icon: "modify" as const };
}

function formatVisibilityBadge(visibility: boolean) {
  return visibility
    ? { label: "Visible", color: "blue" as const, icon: "eye" as const }
    : { label: "Masque", color: "default" as const, icon: "eye-off" as const };
}

function formatPrice(value: string | null) {
  if (!value) {
    return "Masque";
  }

  return `${value} TND`;
}

function formatStock(value: string | null, unit: string | null) {
  if (!value) {
    return "-";
  }

  return unit ? `${value} ${unit}` : value;
}

function getLifecycleAction(pack: ProductPackListItemDto) {
  return pack.lifecycle === "ACTIVE"
    ? {
        label: "Remise en brouillon",
        nextLifecycle: "DRAFT" as const,
      }
    : {
        label: "Activer",
        nextLifecycle: "ACTIVE" as const,
      };
}

export default function ProductPacksListPage() {
  const { user } = useStaffSessionContext();
  const canCreatePack = user ? canCreateProducts(user) : false;
  const [items, setItems] = useState<ProductPackListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingLifecycleId, setPendingLifecycleId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const shiftKeyRef = useRef(false);
  const [bulkForm, setBulkForm] = useState({
    sku: "",
    name: "",
    brand: null as string | null,
    basePriceAmount: null as string | null,
    vatRate: null as number | null,
    stock: null as string | null,
    stockUnit: null as ProductPackListItemDto["stockUnit"] | null,
    lifecycle: null as ProductPackListItemDto["lifecycle"] | null,
    commercialMode: null as ProductPackListItemDto["commercialMode"] | null,
    visibility: null as ProductPackListItemDto["visibility"] | null,
    priceVisibility: null as ProductPackListItemDto["priceVisibility"] | null,
    stockVisibility: null as ProductPackListItemDto["stockVisibility"] | null,
    mixed: {
      sku: false,
      name: false,
      brand: false,
      basePriceAmount: false,
      vatRate: false,
      stock: false,
      stockUnit: false,
      lifecycle: false,
      commercialMode: false,
      visibility: false,
      priceVisibility: false,
      stockVisibility: false,
    },
    touched: {} as Record<string, boolean>,
  });

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const result = await listProductPacksClient({
          page,
          pageSize,
          q: search,
        });

        if (cancelled) {
          return;
        }

        setItems(result.items);
        setTotal(result.total);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof ProductPacksClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger les packs.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, search, reloadToken]);

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
    setSelectedIds((current) =>
      current.filter((id) => items.some((item) => item.id === id)),
    );
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
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

  const handleLifecycleToggle = async (pack: ProductPackListItemDto) => {
    const lifecycleAction = getLifecycleAction(pack);

    if (!user || !canToggleProductLifecycle(user, lifecycleAction.nextLifecycle)) {
      return;
    }

    setPendingLifecycleId(pack.id);
    setError(null);

    try {
      const updated = await updateAllProductLifecycleClient(
        pack.id,
        lifecycleAction.nextLifecycle,
      );

      setItems((current) =>
        current.map((entry) =>
          entry.id === pack.id
            ? {
                ...entry,
                lifecycle: updated.lifecycle ?? lifecycleAction.nextLifecycle,
              }
            : entry,
        ),
      );
    } catch (err: unknown) {
      setError(
        err instanceof AllProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de mettre a jour le cycle de vie du pack.",
      );
    } finally {
      setPendingLifecycleId(null);
    }
  };

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  const buildBulkForm = () => {
    const selectedCount = selectedItems.length;
    if (selectedCount === 0) {
      return;
    }

    const getValue = <T,>(getter: (item: ProductPackListItemDto) => T) => {
      const values = selectedItems.map(getter);
      const first = values[0];
      const mixed = values.some((value) => value !== first);
      return { value: mixed ? null : first, mixed };
    };

    const skuMixed =
      selectedCount > 1 ||
      selectedItems.some((item) => item.sku !== selectedItems[0].sku);
    const nameMixed =
      selectedCount > 1 ||
      selectedItems.some((item) => item.name !== selectedItems[0].name);

    const brand = getValue((item) => item.brands?.[0] ?? null);
    const basePriceAmount = getValue((item) => item.basePriceAmount ?? null);
    const vatRate = getValue((item) => item.vatRate ?? null);
    const stock = getValue((item) => item.stock ?? null);
    const stockUnit = getValue((item) => item.stockUnit ?? null);
    const lifecycle = getValue((item) => item.lifecycle ?? null);
    const commercialMode = getValue((item) => item.commercialMode ?? null);
    const visibility = getValue((item) => item.visibility ?? null);
    const priceVisibility = getValue((item) => item.priceVisibility ?? null);
    const stockVisibility = getValue((item) => item.stockVisibility ?? null);

    setBulkForm({
      sku: skuMixed ? "" : selectedItems[0].sku,
      name: nameMixed ? "" : selectedItems[0].name,
      brand: brand.mixed ? null : brand.value,
      basePriceAmount: basePriceAmount.mixed ? null : basePriceAmount.value,
      vatRate: vatRate.mixed ? null : vatRate.value,
      stock: stock.mixed ? null : stock.value,
      stockUnit: stockUnit.mixed ? null : stockUnit.value,
      lifecycle: lifecycle.mixed ? null : lifecycle.value,
      commercialMode: commercialMode.mixed ? null : commercialMode.value,
      visibility: visibility.mixed ? null : visibility.value,
      priceVisibility: priceVisibility.mixed ? null : priceVisibility.value,
      stockVisibility: stockVisibility.mixed ? null : stockVisibility.value,
      mixed: {
        sku: skuMixed,
        name: nameMixed,
        brand: brand.mixed,
        basePriceAmount: basePriceAmount.mixed,
        vatRate: vatRate.mixed,
        stock: stock.mixed,
        stockUnit: stockUnit.mixed,
        lifecycle: lifecycle.mixed,
        commercialMode: commercialMode.mixed,
        visibility: visibility.mixed,
        priceVisibility: priceVisibility.mixed,
        stockVisibility: stockVisibility.mixed,
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
    const touched = bulkForm.touched;

    if (touched.sku) {
      data.sku = bulkForm.sku || null;
    }
    if (touched.name) {
      data.name = bulkForm.name || null;
    }
    if (touched.brand) {
      data.brand = bulkForm.brand ?? null;
    }
    if (touched.basePriceAmount) {
      data.basePriceAmount = bulkForm.basePriceAmount ?? null;
    }
    if (touched.vatRate) {
      data.vatRate = bulkForm.vatRate ?? null;
    }
    if (touched.stock) {
      data.stock = bulkForm.stock ?? null;
    }
    if (touched.stockUnit) {
      data.stockUnit = bulkForm.stockUnit ?? null;
    }
    if (touched.lifecycle) {
      data.lifecycle = bulkForm.lifecycle ?? null;
    }
    if (touched.commercialMode) {
      data.commercialMode = bulkForm.commercialMode ?? null;
    }
    if (touched.visibility) {
      data.visibility = bulkForm.visibility ?? null;
    }
    if (touched.priceVisibility) {
      data.priceVisibility = bulkForm.priceVisibility ?? null;
    }
    if (touched.stockVisibility) {
      data.stockVisibility = bulkForm.stockVisibility ?? null;
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
      await updateProductPacksBulkClient({ ids: selectedIds, data });
      setBulkEditOpen(false);
      setSelectedIds([]);
      setReloadToken((current) => current + 1);
    } catch (err: unknown) {
      setError(
        err instanceof ProductPacksClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de mettre a jour les packs.",
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
      `Supprimer ${selectedIds.length} pack(s) selectionne(s) ?`,
    );
    if (!confirmed) {
      return;
    }

    setBulkEditLoading(true);
    try {
      await deleteProductPacksBulkClient(selectedIds);
      setSelectedIds([]);
      setReloadToken((current) => current + 1);
    } catch (err: unknown) {
      setError(
        err instanceof ProductPacksClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de supprimer les packs.",
      );
    } finally {
      setBulkEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Produits" title="Gestion des packs" icon={Boxes}>
        {canCreatePack ? (
          <AnimatedUIButton
            href="/espace/staff/gestion-des-produits/packs/edit"
            variant="secondary"
            icon="plus"
            iconPosition="left"
          >
            Créer un pack
          </AnimatedUIButton>
        ) : null}
      </StaffPageHeader>

      <form onSubmit={handleSubmit}>
        <StaffFilterBar
          searchValue={searchDraft}
          searchPlaceholder="Rechercher par nom, SKU ou slug..."
          onSearchChange={setSearchDraft}
        />
      </form>

      {selectedIds.length > 0 ? (
        <div className="fixed bottom-6 right-6 z-30 flex w-[min(560px,calc(100vw-3rem))] flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-slate-600">
            {selectedIds.length} pack(s) selectionne(s)
          </p>
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
            aria-label="Selectionner tous les packs"
          />,
          ...COLUMN_LABELS,
        ]}
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Aucun pack ne correspond a ces criteres."
        pagination={{
          goPrev: () => setPage((current) => Math.max(1, current - 1)),
          goNext: () => setPage((current) => Math.min(totalPages, current + 1)),
          updatePageSize: (value) => {
            setPageSize(value as (typeof PAGE_SIZE_OPTIONS)[number]);
            setPage(1);
          },
          canPrev: page > 1,
          canNext: page < totalPages,
          pageSize,
          total,
          totalPages,
          page,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          itemLabel: "pack",
        }}
      >
        {items.map((pack, index) => {
          const lifecycleBadge = formatLifecycleBadge(pack.lifecycle);
          const visibilityBadge = formatVisibilityBadge(pack.visibility);
          const lifecycleAction = getLifecycleAction(pack);

          return (
            <tr key={pack.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 align-top">
                <Checkbox
                  checked={selectedIds.includes(pack.id)}
                  onCheckedChange={(checked) => {
                    handleToggleSelection(index, pack.id, Boolean(checked), shiftKeyRef.current);
                    shiftKeyRef.current = false;
                  }}
                  onMouseDown={(event) => {
                    shiftKeyRef.current = event.shiftKey;
                  }}
                  aria-label={`Selectionner ${pack.name}`}
                />
              </td>
              <td className="px-4 py-3 align-top">
                <div className="space-y-1">
                  <p className="font-semibold text-cobam-dark-blue">{pack.name}</p>
                  <p className="text-xs text-slate-500">SKU {pack.sku}</p>
                  <p className="text-xs text-slate-400">{pack.slug}</p>
                  {pack.description ? (
                    <p className="max-w-md line-clamp-2 text-xs text-slate-500">
                      {pack.description}
                    </p>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {formatPrice(pack.basePriceAmount)}
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {formatStock(pack.stock, pack.stockUnit ?? null)}
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {pack.subcategories.length > 0
                  ? pack.subcategories.map((subcategory) => subcategory.name).join(", ")
                  : "-"}
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {pack.brands.length > 0 ? pack.brands.join(", ") : "-"}
              </td>
              <td className="px-4 py-3 align-top">
                <StaffBadge size="md" color={lifecycleBadge.color} icon={lifecycleBadge.icon}>
                  {lifecycleBadge.label}
                </StaffBadge>
              </td>
              <td className="px-4 py-3 align-top">
                <StaffBadge size="md" color={visibilityBadge.color} icon={visibilityBadge.icon}>
                  {visibilityBadge.label}
                </StaffBadge>
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">{pack.lineCount}</td>
              <td className="px-4 py-3 align-top text-right">
                <div className="flex justify-end gap-2">
                  {user && canToggleProductLifecycle(user, lifecycleAction.nextLifecycle) ? (
                    <AnimatedUIButton
                      type="button"
                      variant="ghost"
                      onClick={() => void handleLifecycleToggle(pack)}
                      loading={pendingLifecycleId === pack.id}
                      loadingText="Mise a jour..."
                    >
                      {lifecycleAction.label}
                    </AnimatedUIButton>
                  ) : null}
                  <AnimatedUIButton
                    href={`/espace/staff/gestion-des-produits/packs/edit?id=${pack.id}`}
                    variant="ghost"
                    icon="modify"
                    iconPosition="left"
                  >
                    Modifier
                  </AnimatedUIButton>
                </div>
              </td>
            </tr>
          );
        })}
      </PanelTable>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les packs</DialogTitle>
            <DialogDescription>
              Les champs indiques "Mixed" seront unifies si vous les modifiez.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-4">
            <ProductEssentialEntries
              sku={bulkForm.sku}
              name={bulkForm.name}
              brand={bulkForm.brand}
              basePriceAmount={bulkForm.basePriceAmount}
              vatRate={bulkForm.vatRate}
              stock={bulkForm.stock}
              stockUnit={bulkForm.stockUnit}
              lifecycle={bulkForm.lifecycle}
              commercialMode={bulkForm.commercialMode}
              visibility={bulkForm.visibility}
              priceVisibility={bulkForm.priceVisibility}
              stockVisibility={bulkForm.stockVisibility}
              skuPlaceholder={bulkForm.mixed.sku ? "Mixed" : undefined}
              namePlaceholder={bulkForm.mixed.name ? "Mixed" : undefined}
              brandPlaceholder={bulkForm.mixed.brand ? "Mixed" : undefined}
              basePricePlaceholder={bulkForm.mixed.basePriceAmount ? "Mixed" : undefined}
              vatRatePlaceholder={bulkForm.mixed.vatRate ? "Mixed" : undefined}
              stockPlaceholder={bulkForm.mixed.stock ? "Mixed" : undefined}
              stockUnitPlaceholder={bulkForm.mixed.stockUnit ? "Mixed" : undefined}
              lifecyclePlaceholder={bulkForm.mixed.lifecycle ? "Mixed" : undefined}
              commercialModePlaceholder={bulkForm.mixed.commercialMode ? "Mixed" : undefined}
              visibilityPlaceholder={bulkForm.mixed.visibility ? "Mixed" : undefined}
              priceVisibilityPlaceholder={bulkForm.mixed.priceVisibility ? "Mixed" : undefined}
              stockVisibilityPlaceholder={bulkForm.mixed.stockVisibility ? "Mixed" : undefined}
              disableSku={bulkForm.mixed.sku}
              disableName={bulkForm.mixed.name}
              onSkuChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  sku: value,
                  mixed: { ...current.mixed, sku: false },
                  touched: { ...current.touched, sku: true },
                }))
              }
              onNameChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  name: value,
                  mixed: { ...current.mixed, name: false },
                  touched: { ...current.touched, name: true },
                }))
              }
              onBrandChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  brand: value,
                  mixed: { ...current.mixed, brand: false },
                  touched: { ...current.touched, brand: true },
                }))
              }
              onBasePriceAmountChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  basePriceAmount: value,
                  mixed: { ...current.mixed, basePriceAmount: false },
                  touched: { ...current.touched, basePriceAmount: true },
                }))
              }
              onVatRateChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  vatRate: value,
                  mixed: { ...current.mixed, vatRate: false },
                  touched: { ...current.touched, vatRate: true },
                }))
              }
              onStockChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  stock: value,
                  mixed: { ...current.mixed, stock: false },
                  touched: { ...current.touched, stock: true },
                }))
              }
              onStockUnitChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  stockUnit: value,
                  mixed: { ...current.mixed, stockUnit: false },
                  touched: { ...current.touched, stockUnit: true },
                }))
              }
              onLifecycleChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  lifecycle: value,
                  mixed: { ...current.mixed, lifecycle: false },
                  touched: { ...current.touched, lifecycle: true },
                }))
              }
              onCommercialModeChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  commercialMode: value,
                  mixed: { ...current.mixed, commercialMode: false },
                  touched: { ...current.touched, commercialMode: true },
                }))
              }
              onVisibilityChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  visibility: value,
                  mixed: { ...current.mixed, visibility: false },
                  touched: { ...current.touched, visibility: true },
                }))
              }
              onPriceVisibilityChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  priceVisibility: value,
                  mixed: { ...current.mixed, priceVisibility: false },
                  touched: { ...current.touched, priceVisibility: true },
                }))
              }
              onStockVisibilityChanged={(value) =>
                setBulkForm((current) => ({
                  ...current,
                  stockVisibility: value,
                  mixed: { ...current.mixed, stockVisibility: false },
                  touched: { ...current.touched, stockVisibility: true },
                }))
              }
            />
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
