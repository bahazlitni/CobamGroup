"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SquareStack } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import {
  canCreateProducts,
  canToggleProductLifecycle,
} from "@/features/products/access";
import {
  AllProductsClientError,
  listAllProductsClient,
  updateAllProductLifecycleClient,
} from "@/features/all-products/client";
import type { AllProductsListItemDto } from "@/features/all-products/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const COLUMNS = ["Produit", "Marque", "Type", "Prix", "Stock", "Sous-categories", "Etat", "Actions"];

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
        const result = await listAllProductsClient({
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
  }, [page, pageSize, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
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
        />
      </form>

      <PanelTable
        columns={COLUMNS}
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
        {items.map((item) => {
          const kindBadge = getProductKindBadge(item.kind);
          const lifecycleAction = getLifecycleAction(item);
          const action = getAction(item);
          const stateBadges = getStateBadges(item);

          return (
            <tr key={item.id} className="hover:bg-slate-50/70">
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
    </div>
  );
}
