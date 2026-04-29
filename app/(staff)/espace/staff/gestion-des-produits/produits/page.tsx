"use client";

import type { FormEvent } from "react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pencil, SquareStack } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffFilterBar, StaffPageHeader, StaffSelect } from "@/components/staff/ui";
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
  canManageProducts,
  canPublishProducts,
  canUnpublishProducts,
} from "@/features/products/access";
import {
  AllProductsClientError,
  deleteAllProductsBulkClient,
  listAllProductsClient,
  updateAllProductsBulkClient,
} from "@/features/all-products/client";
import type { AllProductsListItemDto } from "@/features/all-products/types";
import { EditableCell, EditingState, SelectCell } from "@/components/staff/ui/Cells";


const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const COLUMN_LABELS = ["SKU", "Nom", "Marque", "Prix", "TVA", "Stock", "Cycle", ""];

// Explicit column widths so columns never react to content changes.
// Order matches the columns array passed to PanelTable below:
// [checkbox, SKU, Nom, Marque, Prix, TVA, Stock, Cycle, Action]
const COLUMN_WIDTHS = [
  "40px",
  "140px",
  "auto",
  "140px",
  "120px",
  "80px",
  "100px",
  "140px",
  "100px",
];

// Shared box class: identical dimensions in idle and editing states.
// h-8 = 32px. border is always present (transparent when idle) so the
// 1px border on the input doesn't change the box size when swapping.


function getAction(item: AllProductsListItemDto) {
  switch (item.kind) {
    case "SINGLE":
      return `/espace/staff/gestion-des-produits/produits/edit?id=${item.id}`;
    case "VARIANT":
      return item.family
        ? `/espace/staff/gestion-des-produits/familles/edit?id=${item.family.id}`
        : null;
    case "PACK":
      return `/espace/staff/gestion-des-produits/packs/edit?id=${item.id}`;
    default:
      return null;
  }
}

export default function AllProductsPage() {
  const { user } = useStaffSessionContext();
  const canCreate = user ? canCreateProducts(user) : false;
  const canEdit = user ? canManageProducts(user) : false;
  const canChangeLifecycle = user
    ? canPublishProducts(user) || canUnpublishProducts(user)
    : false;
  const [items, setItems] = useState<AllProductsListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("ALL");
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>(null);
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

  const handleStartEdit = useCallback((rowId: number, field: string, value: string) => {
    setEditing({ rowId, field, value });
  }, []);

  const handleChangeEdit = useCallback((value: string) => {
    setEditing((prev) => (prev ? { ...prev, value } : null));
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const handleInlineSave = useCallback(async (rowId: number, field: string, rawValue: string) => {
    // Permission guard: lifecycle needs publish/unpublish, everything else needs manage
    const hasPermission = field === "lifecycle" ? canChangeLifecycle : canEdit;
    if (!hasPermission) {
      setEditing(null);
      return;
    }

    const item = items.find((i) => i.id === rowId);
    if (!item) return;

    const oldValue = String((item as Record<string, unknown>)[field] ?? "");
    if (rawValue === oldValue) {
      setEditing(null);
      return;
    }

    const data: Record<string, unknown> = {};
    let localValue: unknown = rawValue;
    if (field === "basePriceAmount" || field === "stock") {
      const trimmed = rawValue.trim();
      data[field] = trimmed === "" ? null : trimmed;
      localValue = trimmed === "" ? null : trimmed;
    } else if (field === "vatRate") {
      const trimmed = rawValue.trim();
      data[field] = trimmed === "" ? null : Number(trimmed);
      localValue = trimmed === "" ? null : Number(trimmed);
    } else {
      data[field] = rawValue;
      localValue = rawValue;
    }

    // Optimistic update: immediately reflect the change in local state
    setItems((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, [field]: localValue } : row,
      ),
    );
    setEditing(null);
    setError(null);

    // Save in background — no loading spinner, no refetch
    try {
      await updateAllProductsBulkClient({ ids: [rowId], data });
    } catch (err: unknown) {
      // Revert optimistic update on failure
      setItems((current) =>
        current.map((row) =>
          row.id === rowId ? { ...row, [field]: (item as Record<string, unknown>)[field] } : row,
        ),
      );
      setError(
        err instanceof AllProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de sauvegarder.",
      );
    }
  }, [items, canEdit, canChangeLifecycle]);

  const handleCommitEdit = useCallback(() => {
    if (!editing) return;
    void handleInlineSave(editing.rowId, editing.field, editing.value);
  }, [editing, handleInlineSave]);

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
            Créer un produit simple
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
        <div className="fixed bottom-6 right-6 z-30 flex w-[min(560px,calc(100vw-3rem))] flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-slate-600">
            {selectedIds.length} produit(s) selectionne(s)
          </p>
          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <AnimatedUIButton
                type="button"
                variant="ghost"
                icon="modify"
                iconPosition="left"
                onClick={handleBulkEditOpen}
              >
                Modifier
              </AnimatedUIButton>
            ) : null}
            {canEdit ? (
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
            ) : null}
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
        columnWidths={COLUMN_WIDTHS}
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
          const actionHref = getAction(item);

          return (
            <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
              <td className="px-4 align-middle">
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
              <td className="align-middle">
                <EditableCell
                  value={item.sku}
                  rowId={item.id}
                  field="sku"
                  editing={editing}
                  onStartEdit={handleStartEdit}
                  onChangeEdit={handleChangeEdit}
                  onCommitEdit={handleCommitEdit}
                  onCancelEdit={handleCancelEdit}
                  saving={false}
                  readOnly={!canEdit}
                />
              </td>
              <td className="align-middle">
                <EditableCell
                  value={item.name}
                  rowId={item.id}
                  field="name"
                  editing={editing}
                  onStartEdit={handleStartEdit}
                  onChangeEdit={handleChangeEdit}
                  onCommitEdit={handleCommitEdit}
                  onCancelEdit={handleCancelEdit}
                  saving={false}
                  readOnly={!canEdit}
                />
              </td>
              <td className="align-middle">
                <EditableCell
                  value={item.brand ?? ""}
                  rowId={item.id}
                  field="brand"
                  editing={editing}
                  onStartEdit={handleStartEdit}
                  onChangeEdit={handleChangeEdit}
                  onCommitEdit={handleCommitEdit}
                  onCancelEdit={handleCancelEdit}
                  saving={false}
                  readOnly={!canEdit}
                />
              </td>
              <td className="align-middle">
                <EditableCell
                  value={item.basePriceAmount ?? ""}
                  rowId={item.id}
                  field="basePriceAmount"
                  editing={editing}
                  onStartEdit={handleStartEdit}
                  onChangeEdit={handleChangeEdit}
                  onCommitEdit={handleCommitEdit}
                  onCancelEdit={handleCancelEdit}
                  saving={false}
                  readOnly={!canEdit}
                  type="number"
                />
              </td>
              <td className="align-middle">
                <EditableCell
                  value={item.vatRate != null ? String(item.vatRate) : ""}
                  rowId={item.id}
                  field="vatRate"
                  editing={editing}
                  onStartEdit={handleStartEdit}
                  onChangeEdit={handleChangeEdit}
                  onCommitEdit={handleCommitEdit}
                  onCancelEdit={handleCancelEdit}
                  saving={false}
                  readOnly={!canEdit}
                  type="number"
                />
              </td>
              <td className="align-middle">
                <EditableCell
                  value={item.stock ?? ""}
                  rowId={item.id}
                  field="stock"
                  editing={editing}
                  onStartEdit={handleStartEdit}
                  onChangeEdit={handleChangeEdit}
                  onCommitEdit={handleCommitEdit}
                  onCancelEdit={handleCancelEdit}
                  saving={false}
                  readOnly={!canEdit}
                  type="number"
                />
              </td>
              <td className="align-middle">
                <SelectCell
                  value={item.lifecycle ?? "DRAFT"}
                  onValueChange={(nextValue: string) => void handleInlineSave(item.id, "lifecycle", nextValue)}
                  saving={false}
                  readOnly={!canChangeLifecycle}
                  items={[{label:"Brouillon", value:"DRAFT"}, {label:"Actif", value:"ACTIVE"}]}
                  placeholder="Cycle de vie"
                />
              </td>
              <td className="align-middle text-right">
                {actionHref ? (
                  <AnimatedUIButton
                    href={actionHref}
                    variant="outline"
                    size="sm"
                    icon="arrow-right"
                  >
                    Voir
                  </AnimatedUIButton>
                ) : (
                  <span className="text-sm text-slate-300">—</span>
                )}
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
