"use client";

import { FormEvent, useEffect, useState } from "react";
import { Package } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts } from "@/features/products/access";
import { listProductsClient, ProductsClientError } from "@/features/products/client";
import type { ProductFamilyListItemDto } from "@/features/products/types";

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
  }, [activeSearch, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

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

      <PanelTable
        columns={[
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
        {items.map((family) => (
          <tr key={family.id} className="hover:bg-slate-50/70">
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
    </div>
  );
}
