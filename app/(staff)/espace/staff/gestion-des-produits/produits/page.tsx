"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SquareStack } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader, StaffSelect } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
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
  AllProductsClientError,
  deleteAllProductsBulkClient,
  listAllProductsClient,
  updateAllProductsBulkClient,
  updateAllProductLifecycleClient,
} from "@/features/all-products/client";
import type { AllProductsListItemDto } from "@/features/all-products/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const COLUMN_LABELS = ["Produit", "Marque", "Type", "Prix", "Stock", "Sous-categories", "Etat", "Actions"];

function getProductKindBadge(kind: AllProductsListItemDto["kind"]) {
  switch (kind) {
    case "SINGLE":
      return { label: "Simple", color: "blue" as const };
    case "VARIANT":
      return { label: "Variante", color: "secondary" as const };
    case "PACK":
      return { label: "Pack", color: "green" as const };
    default:
      return { label: kind, color: "default" as const };
  }
}

function getLifecycleAction(item: AllProductsListItemDto) {
  const currentLifecycle = item.lifecycle ?? "DRAFT";

  return currentLifecycle === "ACTIVE"
    ? {
        label: "Remise en brouillon",
        nextLifecycle: "DRAFT" as const,
      }
    : {
        label: "Activer",
        nextLifecycle: "ACTIVE" as const,
      };
}

function formatPrice(value: string | null) {
  return value ? `${value} TND` : "-";
}

function formatStock(value: string | null, unit: string | null) {
  if (!value) {
    return "-";
  }

  return unit ? `${value} ${unit}` : value;
}

function getStateBadges(item: AllProductsListItemDto) {
  const badges: Array<{
    label: string;
    color: "warning" | "error" | "default";
  }> = [];

  if (!item.hasImage) {
    badges.push({
      label: "Sans image",
      color: "warning",
    });
  }

  if (item.kind !== "PACK" && !item.hasDatasheet) {
    badges.push({
      label: "Sans fiche technique",
      color: "warning",
    });
  }

  if (item.visibility !== true) {
    badges.push({
      label: "Masque",
      color: "default",
    });
  }

  if (item.lifecycle !== "ACTIVE") {
    badges.push({
      label: "Brouillon",
      color: "default",
    });
  }

  return badges;
}

function getAction(item: AllProductsListItemDto) {
  switch (item.kind) {
    case "SINGLE":
      return {
        href: `/espace/staff/gestion-des-produits/produits/edit?id=${item.id}`,
        label: "Modifier",
      };
    case "VARIANT":
      return item.family
        ? {
            href: `/espace/staff/gestion-des-produits/familles/edit?id=${item.family.id}`,
            label: "Ouvrir la famille",
          }
        : null;
    case "PACK":
      return {
        href: `/espace/staff/gestion-des-produits/packs/edit?id=${item.id}`,
        label: "Modifier",
      };
    default:
      return null;
  }
}

export default function AllProductsPage() {
  const { user } = useStaffSessionContext();
  const canCreate = user ? canCreateProducts(user) : false;
  const [items, setItems] = useState<AllProductsListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("ALL");
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
    stockUnit: null as AllProductsListItemDto["stockUnit"] | null,
    lifecycle: null as AllProductsListItemDto["lifecycle"] | null,
    commercialMode: null as AllProductsListItemDto["commercialMode"] | null,
    visibility: null as AllProductsListItemDto["visibility"] | null,
    priceVisibility: null as AllProductsListItemDto["priceVisibility"] | null,
    stockVisibility: null as AllProductsListItemDto["stockVisibility"] | null,
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
    enabled: {
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
        const result = await listAllProductsClient({
          page,
          pageSize,
          q: search,
          kind: kindFilter === "ALL" ? null : kindFilter,
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
          err instanceof AllProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger les produits.",
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
  }, [page, pageSize, search, kindFilter, reloadToken]);

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

  const handleLifecycleToggle = async (item: AllProductsListItemDto) => {
    const lifecycleAction = getLifecycleAction(item);

    if (!user || !canToggleProductLifecycle(user, lifecycleAction.nextLifecycle)) {
      return;
    }

    setPendingLifecycleId(item.id);
    setError(null);

    try {
      const updated = await updateAllProductLifecycleClient(
        item.id,
        lifecycleAction.nextLifecycle,
      );

      setItems((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
    } catch (err: unknown) {
      setError(
        err instanceof AllProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de mettre a jour le cycle de vie du produit.",
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

    const getValue = <T,>(getter: (item: AllProductsListItemDto) => T) => {
      const values = selectedItems.map(getter);
      const first = values[0];
      const mixed = values.some((value) => value !== first);
      return { value: mixed ? null : first, mixed };
    };

    const skuMixed = selectedCount > 1 || selectedItems.some((item) => item.sku !== selectedItems[0].sku);
    const nameMixed = selectedCount > 1 || selectedItems.some((item) => item.name !== selectedItems[0].name);

    const brand = getValue((item) => item.brand ?? null);
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
      enabled: {
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

    if (enabled.sku) {
      data.sku = bulkForm.sku || null;
    }
    if (enabled.name) {
      data.name = bulkForm.name || null;
    }
    if (enabled.brand) {
      data.brand = bulkForm.brand ?? null;
    }
    if (enabled.basePriceAmount) {
      data.basePriceAmount = bulkForm.basePriceAmount ?? null;
    }
    if (enabled.vatRate) {
      data.vatRate = bulkForm.vatRate ?? null;
    }
    if (enabled.stock) {
      data.stock = bulkForm.stock ?? null;
    }
    if (enabled.stockUnit) {
      data.stockUnit = bulkForm.stockUnit ?? null;
    }
    if (enabled.lifecycle) {
      data.lifecycle = bulkForm.lifecycle ?? null;
    }
    if (enabled.commercialMode) {
      data.commercialMode = bulkForm.commercialMode ?? null;
    }
    if (enabled.visibility) {
      data.visibility = bulkForm.visibility ?? null;
    }
    if (enabled.priceVisibility) {
      data.priceVisibility = bulkForm.priceVisibility ?? null;
    }
    if (enabled.stockVisibility) {
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
      await updateAllProductsBulkClient({ ids: selectedIds, data });
      setBulkEditOpen(false);
      setSelectedIds([]);
      setReloadToken((current) => current + 1);
    } catch (err: unknown) {
      setError(
        err instanceof AllProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de mettre a jour les produits.",
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
          case "sku":
            next.sku = selectedItems[0]?.sku ?? "";
            break;
          case "name":
            next.name = selectedItems[0]?.name ?? "";
            break;
          case "brand":
            next.brand = selectedItems[0]?.brand ?? null;
            break;
          case "basePriceAmount":
            next.basePriceAmount = selectedItems[0]?.basePriceAmount ?? null;
            break;
          case "vatRate":
            next.vatRate = selectedItems[0]?.vatRate ?? null;
            break;
          case "stock":
            next.stock = selectedItems[0]?.stock ?? null;
            break;
          case "stockUnit":
            next.stockUnit = selectedItems[0]?.stockUnit ?? null;
            break;
          case "lifecycle":
            next.lifecycle = selectedItems[0]?.lifecycle ?? null;
            break;
          case "commercialMode":
            next.commercialMode = selectedItems[0]?.commercialMode ?? null;
            break;
          case "visibility":
            next.visibility = selectedItems[0]?.visibility ?? null;
            break;
          case "priceVisibility":
            next.priceVisibility = selectedItems[0]?.priceVisibility ?? null;
            break;
          case "stockVisibility":
            next.stockVisibility = selectedItems[0]?.stockVisibility ?? null;
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

  const allFieldKeys: Array<keyof typeof bulkForm.enabled> = [
    "sku",
    "name",
    "brand",
    "basePriceAmount",
    "vatRate",
    "stock",
    "stockUnit",
    "lifecycle",
    "commercialMode",
    "visibility",
    "priceVisibility",
    "stockVisibility",
  ];

  const allFieldsChecked = allFieldKeys.every((field) => bulkForm.enabled[field]);
  const someFieldsChecked = allFieldKeys.some((field) => bulkForm.enabled[field]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer ${selectedIds.length} produit(s) selectionne(s) ?`,
    );
    if (!confirmed) {
      return;
    }

    setBulkEditLoading(true);
    try {
      await deleteAllProductsBulkClient(selectedIds);
      setSelectedIds([]);
      setReloadToken((current) => current + 1);
    } catch (err: unknown) {
      setError(
        err instanceof AllProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de supprimer les produits.",
      );
    } finally {
      setBulkEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Produits" title="Tous les produits" icon={SquareStack}>
        {canCreate ? (
          <AnimatedUIButton
            href="/espace/staff/gestion-des-produits/produits/edit"
            variant="secondary"
            icon="plus"
            iconPosition="left"
          >
            Creer un produit simple
          </AnimatedUIButton>
        ) : null}
      </StaffPageHeader>

      <form onSubmit={handleSubmit}>
        <StaffFilterBar
          searchValue={searchDraft}
          searchPlaceholder="Rechercher par nom, SKU, slug ou famille..."
          onSearchChange={setSearchDraft}
        >
          <div className="min-w-[200px]">
            <StaffSelect
              id="all-products-kind"
              fullWidth
              value={kindFilter}
              placeholder="Tous les types"
              onValueChange={(value) => {
                setKindFilter(value);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "Tous les types" },
                { value: "SINGLE", label: "Simple" },
                { value: "VARIANT", label: "Variante" },
                { value: "PACK", label: "Pack" },
              ]}
            />
          </div>
        </StaffFilterBar>
      </form>

      {selectedIds.length > 0 ? (
        <div className="fixed bottom-6 right-6 z-30 flex w-[min(560px,calc(100vw-3rem))] flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-slate-600">
            {selectedIds.length} produit(s) selectionne(s)
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
            aria-label="Selectionner tous les produits"
          />,
          ...COLUMN_LABELS,
        ]}
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Aucun produit ne correspond a ces criteres."
        pagination={{
          goPrev: () => setPage((current) => Math.max(1, current - 1)),
          goNext: () => setPage((current) => Math.min(totalPages, current + 1)),
          updatePageSize: (value) => {
            setPage(1);
            setPageSize(value as (typeof PAGE_SIZE_OPTIONS)[number]);
          },
          canPrev: page > 1,
          canNext: page < totalPages,
          page,
          pageSize,
          total,
          totalPages,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          itemLabel: "produit",
        }}
      >
        {items.map((item, index) => {
          const kindBadge = getProductKindBadge(item.kind);
          const lifecycleAction = getLifecycleAction(item);
          const action = getAction(item);
          const stateBadges = getStateBadges(item);

          return (
            <tr key={item.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 align-top">
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={(checked) => {
                    handleToggleSelection(
                      index,
                      item.id,
                      Boolean(checked),
                      shiftKeyRef.current,
                    );
                    shiftKeyRef.current = false;
                  }}
                  onMouseDown={(event) => {
                    shiftKeyRef.current = event.shiftKey;
                  }}
                  aria-label={`Selectionner ${item.name}`}
                />
              </td>
              <td className="px-4 py-3 align-top">
                <div className="space-y-1">
                  <p className="font-semibold text-cobam-dark-blue">{item.name}</p>
                  <p className="text-xs text-slate-500">SKU {item.sku}</p>
                  {item.kind === "VARIANT" && item.family ? (
                    <p className="text-xs text-slate-400">
                      Famille {item.family.name}
                    </p>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {item.brand ?? "-"}
              </td>
              <td className="px-4 py-3 align-top">
                <StaffBadge size="sm" color={kindBadge.color}>
                  {kindBadge.label}
                </StaffBadge>
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {formatPrice(item.basePriceAmount)}
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {formatStock(item.stock, item.stockUnit)}
              </td>
              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {item.subcategories.length > 0
                  ? item.subcategories.map((subcategory) => subcategory.name).join(", ")
                  : "-"}
              </td>
              <td className="px-4 py-3 align-top">
                {stateBadges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stateBadges.map((badge) => (
                      <StaffBadge
                        key={`${item.id}-${badge.label}`}
                        size="sm"
                        color={badge.color}
                      >
                        {badge.label}
                      </StaffBadge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 align-top text-right">
                <div className="flex justify-end gap-2">
                  {user && canToggleProductLifecycle(user, lifecycleAction.nextLifecycle) ? (
                    <AnimatedUIButton
                      type="button"
                      variant="ghost"
                      onClick={() => void handleLifecycleToggle(item)}
                      loading={pendingLifecycleId === item.id}
                      loadingText="Mise a jour..."
                    >
                      {lifecycleAction.label}
                    </AnimatedUIButton>
                  ) : null}
                  {action ? (
                    <AnimatedUIButton
                      href={action.href}
                      variant="ghost"
                      icon="modify"
                      iconPosition="left"
                    >
                      {action.label}
                    </AnimatedUIButton>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </PanelTable>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>Modifier les produits</DialogTitle>
                <DialogDescription>
                  Les champs indiques "Mixed" seront unifies si vous les modifiez.
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
              showFieldChecks
              fieldChecks={bulkForm.enabled}
              onFieldCheckChange={(field, checked) =>
                handleBulkFieldToggle(field as keyof typeof bulkForm.enabled, checked)
              }
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
