"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Boxes } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import {
  canCreateProducts,
  canToggleProductLifecycle,
} from "@/features/products/access";
import {
  listProductPacksClient,
  ProductPacksClientError,
} from "@/features/product-packs/client";
import {
  AllProductsClientError,
  updateAllProductLifecycleClient,
} from "@/features/all-products/client";
import type { ProductPackListItemDto } from "@/features/product-packs/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const COLUMNS = [
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

function formatStock(value: string | null) {
  return value ? `${value} ITEM` : "-";
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
  }, [page, pageSize, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
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
            Creer un pack
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

      <PanelTable
        columns={COLUMNS}
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
        {items.map((pack) => {
          const lifecycleBadge = formatLifecycleBadge(pack.lifecycle);
          const visibilityBadge = formatVisibilityBadge(pack.visibility);
          const lifecycleAction = getLifecycleAction(pack);

          return (
            <tr key={pack.id} className="hover:bg-slate-50/70">
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
                {formatStock(pack.stock)}
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
    </div>
  );
}
