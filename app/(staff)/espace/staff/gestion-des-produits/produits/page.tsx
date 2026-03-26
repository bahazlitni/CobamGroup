"use client";

import type { FormEvent } from "react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader, StaffSelect } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts } from "@/features/products/access";
import { useProductsList } from "@/features/products/hooks/use-products-list";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const columns = [
  "Produit",
  "Marque",
  "Categorie",
  "Taxonomies",
  "Etat",
  "Variantes",
  "Actions",
];

function getDescriptionPreview(description: string | null) {
  if (!description) {
    return "-";
  }

  return description.length > 100
    ? `${description.slice(0, 97)}...`
    : description;
}

function getProductStatusBadge(isActive: boolean) {
  return isActive
    ? {
        label: "Actif",
        color: "green" as const,
        icon: "check-circle" as const,
      }
    : {
        label: "Masque",
        color: "default" as const,
        icon: "eye-off" as const,
      };
}

export default function ProductsListPage() {
  const { user: authUser } = useStaffSessionContext();
  const canCreateProduct = authUser ? canCreateProducts(authUser) : false;

  const {
    items,
    total,
    page,
    pageSize,
    search,
    brandId,
    productCategoryId,
    options,
    isLoading,
    error,
    totalPages,
    canPrev,
    canNext,
    setSearch,
    setBrandId,
    setProductCategoryId,
    submitFilters,
    updatePageSize,
    goPrev,
    goNext,
  } = useProductsList(20);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitFilters();
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Produits" title="Gestion des produits">
        {canCreateProduct ? (
          <AnimatedUIButton
            href="/espace/staff/gestion-des-produits/produits/new"
            variant="secondary"
            icon="plus"
            iconPosition="left"
          >
            Creer un produit
          </AnimatedUIButton>
        ) : null}
      </StaffPageHeader>

      <form onSubmit={handleSubmit}>
        <StaffFilterBar
          searchValue={search}
          searchPlaceholder="Rechercher par nom, slug, marque ou categorie..."
          onSearchChange={(value: string) => setSearch(value)}
        >
          <StaffSelect
            value={brandId}
            onValueChange={setBrandId}
            emptyLabel="Toutes les marques"
            options={options.brands.map((option) => ({
              value: String(option.id),
              label: option.name,
            }))}
          />

          <StaffSelect
            value={productCategoryId}
            onValueChange={setProductCategoryId}
            emptyLabel="Toutes les categories"
            options={options.productCategories.map((option) => ({
              value: String(option.id),
              label: option.name,
            }))}
          />
        </StaffFilterBar>
      </form>

      <PanelTable
        columns={columns}
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Aucun produit ne correspond a ces criteres."
        pagination={{
          goPrev,
          goNext,
          updatePageSize: (value) => updatePageSize(value as 10 | 20 | 50),
          canPrev,
          canNext,
          pageSize,
          total,
          totalPages,
          page,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          itemLabel: "produit",
        }}
      >
        {items.map((product) => {
          const statusBadge = getProductStatusBadge(product.isActive);

          return (
            <tr key={product.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 align-top">
                <div className="font-semibold text-cobam-dark-blue">
                  {product.baseName}
                </div>
                <div className="text-[11px] text-slate-400">{product.baseSlug}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {getDescriptionPreview(product.description)}
                </div>
              </td>

              <td className="px-4 py-3 align-top text-slate-600">
                <div className="font-medium text-cobam-dark-blue">
                  {product.brand.name}
                </div>
                <div className="text-[11px] text-slate-400">{product.brand.slug}</div>
              </td>

              <td className="px-4 py-3 align-top text-slate-600">
                <div className="font-medium text-cobam-dark-blue">
                  {product.productCategory.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {product.productCategory.slug}
                </div>
              </td>

              <td className="px-4 py-3 align-top text-xs text-slate-600">
                <div>{product.tagCount} tag(s)</div>
              </td>

              <td className="px-4 py-3 align-top">
                <StaffBadge
                  size="md"
                  color={statusBadge.color}
                  icon={statusBadge.icon}
                >
                  {statusBadge.label}
                </StaffBadge>
              </td>

              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {product.variantCount}
              </td>

              <td className="px-4 py-3 align-top text-right">
                <AnimatedUIButton
                  href={`/espace/staff/gestion-des-produits/produits/${product.id}`}
                  variant="ghost"
                  icon="modify"
                  iconPosition="left"
                >
                  Voir / Modifier
                </AnimatedUIButton>
              </td>
            </tr>
          );
        })}
      </PanelTable>
    </div>
  );
}
