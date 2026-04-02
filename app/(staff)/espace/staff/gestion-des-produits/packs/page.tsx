"use client";

import type { FormEvent } from "react";
import { Boxes } from "lucide-react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { getArticleFirstParagraphText } from "@/features/articles/document";
import { StaffBadge, StaffFilterBar, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts } from "@/features/products/access";
import { useProductPacksList } from "@/features/product-packs/hooks/use-product-packs-list";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const columns = [
  "Pack",
  "Mode",
  "Prix derive",
  "Taxonomies",
  "Cycle de vie",
  "Visibilite",
  "Lignes",
  "Actions",
];

function getDescriptionPreview(description: string | null) {
  if (!description) {
    return "-";
  }

  const textPreview = getArticleFirstParagraphText(description);

  if (!textPreview) {
    return "-";
  }

  return textPreview.length > 110 ? `${textPreview.slice(0, 107)}...` : textPreview;
}

function getLifecycleBadge(status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  switch (status) {
    case "ACTIVE":
      return { label: "Actif", color: "green" as const, icon: "check-circle" as const };
    case "ARCHIVED":
      return { label: "Archive", color: "amber" as const, icon: "pause" as const };
    case "DRAFT":
    default:
      return { label: "Brouillon", color: "default" as const, icon: "modify" as const };
  }
}

function getVisibilityBadge(visibility: "HIDDEN" | "PUBLIC") {
  return visibility === "PUBLIC"
    ? { label: "Publique", color: "blue" as const, icon: "eye" as const }
    : { label: "Masquee", color: "default" as const, icon: "eye-off" as const };
}

function getCommercialModeLabel(mode: "REFERENCE_ONLY" | "QUOTE_ONLY" | "SELLABLE") {
  switch (mode) {
    case "SELLABLE":
      return "En vente";
    case "QUOTE_ONLY":
      return "Sur demande";
    case "REFERENCE_ONLY":
    default:
      return "Reference";
  }
}

export default function ProductPacksListPage() {
  const { user: authUser } = useStaffSessionContext();
  const canCreatePack = authUser ? canCreateProducts(authUser) : false;
  const {
    items,
    total,
    page,
    pageSize,
    search,
    isLoading,
    error,
    totalPages,
    canPrev,
    canNext,
    setSearch,
    submitFilters,
    updatePageSize,
    goPrev,
    goNext,
  } = useProductPacksList(20);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitFilters();
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Produits" title="Gestion des packs produit" icon={Boxes}>
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
          searchValue={search}
          searchPlaceholder="Rechercher par nom, slug, SKU ou description..."
          onSearchChange={(value: string) => setSearch(value)}
        />
      </form>

      <PanelTable
        columns={columns}
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Aucun pack ne correspond a ces criteres."
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
          itemLabel: "pack",
        }}
      >
        {items.map((pack) => {
          const lifecycleBadge = getLifecycleBadge(pack.lifecycleStatus);
          const visibilityBadge = getVisibilityBadge(pack.visibility);

          return (
            <tr key={pack.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 align-top">
                <div className="space-y-1">
                  <p className="font-semibold text-cobam-dark-blue">{pack.name}</p>
                  <p className="text-xs text-slate-500">SKU {pack.sku}</p>
                  <p className="text-xs text-slate-400">{pack.slug}</p>
                  <p className="max-w-md text-xs text-slate-500">
                    {getDescriptionPreview(pack.description)}
                  </p>
                </div>
              </td>

              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {getCommercialModeLabel(pack.commercialMode)}
              </td>

              <td className="px-4 py-3 align-top text-sm text-slate-600">
                {pack.priceVisibility === "VISIBLE" && pack.basePriceAmount
                  ? `${pack.basePriceAmount} TND`
                  : "Masque"}
              </td>

              <td className="px-4 py-3 align-top text-xs text-slate-600">
                <div>{pack.productSubcategories.length} sous-categorie(s)</div>
                <div>{pack.brandIds.length} marque(s)</div>
                <div>{pack.tags.length} tag(s)</div>
              </td>

              <td className="px-4 py-3 align-top">
                <StaffBadge
                  size="md"
                  color={lifecycleBadge.color}
                  icon={lifecycleBadge.icon}
                >
                  {lifecycleBadge.label}
                </StaffBadge>
              </td>

              <td className="px-4 py-3 align-top">
                <StaffBadge
                  size="md"
                  color={visibilityBadge.color}
                  icon={visibilityBadge.icon}
                >
                  {visibilityBadge.label}
                </StaffBadge>
              </td>

              <td className="px-4 py-3 align-top text-sm text-slate-600">{pack.lineCount}</td>

              <td className="px-4 py-3 align-top text-right">
                <AnimatedUIButton
                  href={`/espace/staff/gestion-des-produits/packs/edit?id=${pack.id}`}
                  variant="ghost"
                  icon="modify"
                  iconPosition="left"
                >
                  Modifier
                </AnimatedUIButton>
              </td>
            </tr>
          );
        })}
      </PanelTable>
    </div>
  );
}
