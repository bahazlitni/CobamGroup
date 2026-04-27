"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Package } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Checkbox } from "@/components/ui/checkbox";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { PanelAutoCompleteInput, StaffSelect } from "@/components/staff/ui";
import formatEnumLabel from "@/lib/formatEnumLabel";
import { getProductBrandSuggestions } from "@/lib/static_tables/brands";
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
  deleteProductFamiliesBulkClient,
  listProductsClient,
  ProductsClientError,
  updateProductFamiliesBulkClient,
} from "@/features/products/client";
import type { ProductFamilyListItemDto } from "@/features/products/types";
import { ProductCommercialMode, ProductLifecycle, ProductStockUnit } from "@prisma/client";

const PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function formatPrice(value: string | null) {
  return value ? `${value} TND` : "-";
}

function formatStock(value: string | null, unit: string | null) {
  if (!value) {
    return "-";
  }

  return unit ? `${value} ${unit}` : value;
}

export default function ProductsListPage() {
  const { user } = useStaffSessionContext();
  const canCreate = user ? canCreateProducts(user) : false;
  const [items, setItems] = useState<ProductFamilyListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const shiftKeyRef = useRef(false);
  const [bulkForm, setBulkForm] = useState({
    brand: null as string | null,
    vatRate: null as number | null,
    stockUnit: null as ProductFamilyListItemDto["stockUnit"] | null,
    lifecycle: null as ProductFamilyListItemDto["lifecycle"] | null,
    commercialMode: null as ProductFamilyListItemDto["commercialMode"] | null,
    visibility: null as ProductFamilyListItemDto["visibility"] | null,
    priceVisibility: null as ProductFamilyListItemDto["priceVisibility"] | null,
    stockVisibility: null as ProductFamilyListItemDto["stockVisibility"] | null,
    mixed: {
      brand: false,
      vatRate: false,
      stockUnit: false,
      lifecycle: false,
      commercialMode: false,
      visibility: false,
      priceVisibility: false,
      stockVisibility: false,
    },
    enabled: {
      brand: false,
      vatRate: false,
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
        const result = await listProductsClient({
          page,
          pageSize,
          q: activeSearch,
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
          err instanceof ProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger les familles produit.",
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
  }, [activeSearch, page, pageSize, reloadToken]);

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
    setActiveSearch(searchInput.trim());
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
    const vatRate = getValue((item) => item.vatRate ?? null);
    const stockUnit = getValue((item) => item.stockUnit ?? null);
    const lifecycle = getValue((item) => item.lifecycle ?? null);
    const commercialMode = getValue((item) => item.commercialMode ?? null);
    const visibility = getValue((item) => item.visibility ?? null);
    const priceVisibility = getValue((item) => item.priceVisibility ?? null);
    const stockVisibility = getValue((item) => item.stockVisibility ?? null);

    setBulkForm({
      brand: brand.mixed ? null : brand.value,
      vatRate: vatRate.mixed ? null : vatRate.value,
      stockUnit: stockUnit.mixed ? null : stockUnit.value,
      lifecycle: lifecycle.mixed ? null : lifecycle.value,
      commercialMode: commercialMode.mixed ? null : commercialMode.value,
      visibility: visibility.mixed ? null : visibility.value,
      priceVisibility: priceVisibility.mixed ? null : priceVisibility.value,
      stockVisibility: stockVisibility.mixed ? null : stockVisibility.value,
      mixed: {
        brand: brand.mixed,
        vatRate: vatRate.mixed,
        stockUnit: stockUnit.mixed,
        lifecycle: lifecycle.mixed,
        commercialMode: commercialMode.mixed,
        visibility: visibility.mixed,
        priceVisibility: priceVisibility.mixed,
        stockVisibility: stockVisibility.mixed,
      },
      enabled: {
        brand: false,
        vatRate: false,
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

    if (enabled.brand) {
      data.brand = bulkForm.brand ?? null;
    }
    if (enabled.vatRate) {
      data.vatRate = bulkForm.vatRate ?? null;
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
      `Supprimer ${selectedIds.length} famille(s) selectionnee(s) ?`,
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

  const handleBulkFieldToggle = (
    field: keyof typeof bulkForm.enabled,
    checked: boolean,
  ) => {
    setBulkForm((current) => {
      const next = { ...current };
      next.enabled = { ...current.enabled, [field]: checked };
      if (checked && current.mixed[field]) {
        switch (field) {
          case "brand":
            next.brand = selectedItems[0]?.brand ?? null;
            break;
          case "vatRate":
            next.vatRate = selectedItems[0]?.vatRate ?? null;
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
    "brand",
    "vatRate",
    "stockUnit",
    "lifecycle",
    "commercialMode",
    "visibility",
    "priceVisibility",
    "stockVisibility",
  ];
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
            href="/espace/staff/gestion-des-produits/familles/edit"
            variant="secondary"
            icon="plus"
            iconPosition="left"
          >
            Creer une famille
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
        <div className="fixed bottom-6 right-6 z-30 flex w-[min(560px,calc(100vw-3rem))] flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-slate-600">
            {selectedIds.length} famille(s) selectionnee(s)
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
            aria-label="Selectionner toutes les familles"
          />,
          "Famille",
          "Variante par defaut",
          "Marque",
          "Prix",
          "Stock",
          "Sous-categories",
          "Variantes",
          "Actions",
        ]}
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Aucune famille ne correspond a ces criteres."
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
          itemLabel: "famille",
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
                <p className="font-semibold text-cobam-dark-blue">{family.name}</p>
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
              {formatPrice(family.basePriceAmount)}
            </td>
            <td className="px-4 py-3 align-top text-sm text-slate-600">
              {formatStock(family.stock, family.stockUnit)}
            </td>
            <td className="px-4 py-3 align-top text-sm text-slate-600">
              {family.subcategories.length > 0
                ? family.subcategories.map((subcategory) => subcategory.name).join(", ")
                : "-"}
            </td>
            <td className="px-4 py-3 align-top text-sm text-slate-600">
              {family.variantCount}
            </td>
            <td className="px-4 py-3 align-top text-right">
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
                  Ces valeurs communes seront appliquees a toutes les variantes des familles selectionnees.
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
          <div className="grid gap-6 md:grid-cols-5">
            <PanelField id="family-common-brand" label={labelNode("brand", "Marque")}>
              <PanelAutoCompleteInput
                id="family-common-brand"
                fullWidth
                value={bulkForm.brand ?? ""}
                placeholder={bulkForm.mixed.brand ? "Mixed" : undefined}
                disabled={isDisabled("brand")}
                suggestions={getProductBrandSuggestions(bulkForm.brand ?? "")}
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

            <PanelField id="family-common-vat" label={labelNode("vatRate", "TVA")}>
              <PanelInput
                fullWidth
                id="family-common-vat"
                type="number"
                value={bulkForm.vatRate == null ? "" : String(bulkForm.vatRate)}
                placeholder={bulkForm.mixed.vatRate ? "Mixed" : undefined}
                disabled={isDisabled("vatRate")}
                onChange={(event) =>
                  setBulkForm((current) => ({
                    ...current,
                    vatRate: event.target.value ? Number(event.target.value) : null,
                    mixed: { ...current.mixed, vatRate: false },
                    touched: { ...current.touched, vatRate: true },
                  }))
                }
              />
            </PanelField>

            <PanelField id="family-common-stock-unit" label={labelNode("stockUnit", "Unite de stock")}>
              <StaffSelect
                id="family-common-stock-unit"
                fullWidth
                value={bulkForm.stockUnit ?? ""}
                placeholder={bulkForm.mixed.stockUnit ? "Mixed" : undefined}
                disabled={isDisabled("stockUnit")}
                onValueChange={(value: string) =>
                  setBulkForm((current) => ({
                    ...current,
                    stockUnit: value ? (value as ProductStockUnit) : null,
                    mixed: { ...current.mixed, stockUnit: false },
                    touched: { ...current.touched, stockUnit: true },
                  }))
                }
                options={Object.values(ProductStockUnit).map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>

            <PanelField id="family-common-lifecycle" label={labelNode("lifecycle", "Cycle de vie")}>
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
                options={Object.values(ProductLifecycle).map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>

            <PanelField id="family-common-commercial" label={labelNode("commercialMode", "Mode commercial")}>
              <StaffSelect
                id="family-common-commercial"
                fullWidth
                value={bulkForm.commercialMode ?? ""}
                placeholder={bulkForm.mixed.commercialMode ? "Mixed" : undefined}
                disabled={isDisabled("commercialMode")}
                onValueChange={(value: string) =>
                  setBulkForm((current) => ({
                    ...current,
                    commercialMode: value ? (value as ProductCommercialMode) : null,
                    mixed: { ...current.mixed, commercialMode: false },
                    touched: { ...current.touched, commercialMode: true },
                  }))
                }
                options={Object.values(ProductCommercialMode).map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>

            <PanelField id="family-common-visibility" label={labelNode("visibility", "Visible")}>
              <StaffSelect
                id="family-common-visibility"
                fullWidth
                value={bulkForm.visibility == null ? "" : String(bulkForm.visibility)}
                placeholder={bulkForm.mixed.visibility ? "Mixed" : undefined}
                disabled={isDisabled("visibility")}
                onValueChange={(value: string) =>
                  setBulkForm((current) => ({
                    ...current,
                    visibility: value ? value === "true" : null,
                    mixed: { ...current.mixed, visibility: false },
                    touched: { ...current.touched, visibility: true },
                  }))
                }
                options={[
                  { value: "true", label: "Oui" },
                  { value: "false", label: "Non" },
                ]}
              />
            </PanelField>

            <PanelField id="family-common-price-visibility" label={labelNode("priceVisibility", "Prix visible")}>
              <StaffSelect
                id="family-common-price-visibility"
                fullWidth
                value={
                  bulkForm.priceVisibility == null ? "" : String(bulkForm.priceVisibility)
                }
                placeholder={bulkForm.mixed.priceVisibility ? "Mixed" : undefined}
                disabled={isDisabled("priceVisibility")}
                onValueChange={(value: string) =>
                  setBulkForm((current) => ({
                    ...current,
                    priceVisibility: value ? value === "true" : null,
                    mixed: { ...current.mixed, priceVisibility: false },
                    touched: { ...current.touched, priceVisibility: true },
                  }))
                }
                options={[
                  { value: "true", label: "Oui" },
                  { value: "false", label: "Non" },
                ]}
              />
            </PanelField>

            <PanelField id="family-common-stock-visibility" label={labelNode("stockVisibility", "Stock visible")}>
              <StaffSelect
                id="family-common-stock-visibility"
                fullWidth
                value={
                  bulkForm.stockVisibility == null ? "" : String(bulkForm.stockVisibility)
                }
                placeholder={bulkForm.mixed.stockVisibility ? "Mixed" : undefined}
                disabled={isDisabled("stockVisibility")}
                onValueChange={(value: string) =>
                  setBulkForm((current) => ({
                    ...current,
                    stockVisibility: value ? value === "true" : null,
                    mixed: { ...current.mixed, stockVisibility: false },
                    touched: { ...current.touched, stockVisibility: true },
                  }))
                }
                options={[
                  { value: "true", label: "Oui" },
                  { value: "false", label: "Non" },
                ]}
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
