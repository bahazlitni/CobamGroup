"use client";

import type { FormEvent } from "react";
import { StaffBadge, StaffFilterBar, StaffPageHeader, StaffSelect } from "@/components/staff/ui";
import PanelTable from "@/components/staff/ui/PanelTable";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useArticlesList } from "@/features/articles/hooks/use-articles-list";
import type { ArticleListItemDto, ArticleStatus } from "@/features/articles/types";
import { usePathname } from "next/navigation";

function getArticleStatusBadge(status: ArticleStatus, scheduledPublishAt?: string | null) {
  switch (status) {
    case "PUBLISHED":
      return {
        label: "Publié",
        color: "green" as const,
        icon: "badge-check" as const,
      };
    case "ARCHIVED":
      return {
        label: "Archivé",
        color: "amber" as const,
        icon: "folder" as const,
      };
    case "DRAFT":
    default:
      if (scheduledPublishAt) {
        return {
          label: "Planifié",
          color: "info" as const,
          icon: "calendar" as const,
        };
      }

      return {
        label: "Brouillon",
        color: "default" as const,
        icon: "file-text" as const,
      };
  }
}

const columns = ["Titre", "Auteur public", "Catégorie", "Statut", "Publication", "Mis à jour", "Actions"];

export default function ArticlesListPage() {
  const {
    items,
    total,
    search,
    status,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    sentinelRef,
    setSearch,
    setStatus,
    submitSearch,
    loadMore,
  } = useArticlesList(12);

  const pathname = usePathname();

  const handleSearchSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submitSearch();
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <StaffPageHeader eyebrow="Articles" title="Gestion des articles">
          <AnimatedUIButton
            href={`${pathname}/edit`}
            variant="secondary"
            icon="plus"
            iconPosition="left"
          >
            Créer un article
          </AnimatedUIButton>
        </StaffPageHeader>

        <form onSubmit={handleSearchSubmit}>
          <StaffFilterBar searchValue={search} onSearchChange={(value: string) => setSearch(value)}>
            <StaffSelect
              value={status}
              onValueChange={setStatus}
              emptyLabel="Tous les statuts"
              options={[
                { value: "PUBLISHED", label: "Publiés" },
                { value: "DRAFT", label: "Brouillons" },
                { value: "ARCHIVED", label: "Archivés" },
              ]}
            />
          </StaffFilterBar>
        </form>

        <PanelTable
          columns={columns}
          isLoading={isLoading}
          error={error}
          isEmpty={items.length === 0}
          emptyMessage="Aucun article ne correspond à ces critères."
          infiniteScroll={{
            hasMore,
            isLoadingMore,
            onLoadMore: loadMore,
            loaded: items.length,
            total,
            itemLabel: "article",
            sentinelRef,
          }}
        >
          {items.map((article: ArticleListItemDto) => {
            const statusBadge = getArticleStatusBadge(article.status, article.scheduledPublishAt);
            const scheduledDateLabel = article.scheduledPublishAt
              ? new Date(article.scheduledPublishAt).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : null;
            const scheduledDateTooltipLabel = article.scheduledPublishAt
              ? new Date(article.scheduledPublishAt).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })
              : null;
            const statusBadgeNode = (
              <StaffBadge size="md" color={statusBadge.color} icon={statusBadge.icon}>
                {statusBadge.label}
              </StaffBadge>
            );

            return (
              <tr key={article.id} className="hover:bg-slate-50/60">
                <td className="text-cobam-dark-blue px-4 py-3 align-top font-semibold">
                  {article.title}
                </td>

                <td className="px-4 py-3 align-top text-slate-600">COBAM Group</td>

                <td className="px-4 py-3 align-top text-slate-600">
                  {article.category?.name ?? "-"}
                </td>

                <td className="px-4 py-3 align-top">
                  {scheduledDateTooltipLabel && article.status === "DRAFT" ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">{statusBadgeNode}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Publication planifiée le {scheduledDateTooltipLabel}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    statusBadgeNode
                  )}
                </td>

                <td className="px-4 py-3 align-top text-xs text-slate-600">
                  {article.publishedAt ? (
                    new Date(article.publishedAt).toLocaleDateString("fr-FR")
                  ) : scheduledDateLabel ? (
                    <span className="text-cobam-water-blue font-medium">{scheduledDateLabel}</span>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-4 py-3 align-top text-xs text-slate-600">
                  {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
                </td>

                <td className="px-4 py-3 align-top">
                  <div className="flex justify-end gap-2">
                    <AnimatedUIButton
                      href={`/actualites/${article.slug}`}
                      target="_blank"
                      variant="outline"
                      size="sm"
                    >
                      Voir
                    </AnimatedUIButton>
                    <AnimatedUIButton
                      href={`${pathname}/edit?id=${article.id}`}
                      icon="modify"
                      variant="ghost"
                      iconPosition="left"
                      size="sm"
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
    </TooltipProvider>
  );
}
