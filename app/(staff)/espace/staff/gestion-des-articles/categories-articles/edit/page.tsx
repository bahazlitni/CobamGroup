"use client";

import { Suspense, useEffect, useMemo } from "react";
import { ListTree } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ArticleCategoryColorField from "@/components/staff/article-categories/article-category-color-field";
import Loading from "@/components/staff/Loading";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  StaffBadge,
  StaffNotice,
  StaffPageHeader,
  StaffStateCard,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateArticleCategories } from "@/features/article-categories/access";
import { useArticleCategoryEditor } from "@/features/article-categories/hooks/use-article-category-editor";
import { slugifyArticleCategoryName } from "@/features/article-categories/slug";

export default function ArticleCategoryEditPage() {
  return (
    <Suspense fallback={<ArticleCategoryEditorLoading />}>
      <ArticleCategoryEditPageContent />
    </Suspense>
  );
}

function ArticleCategoryEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, isLoading: isAuthLoading } = useStaffSessionContext();

  const categoryId = useMemo(() => {
    const raw = searchParams.get("id");
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const mode = categoryId ? "edit" : "create";
  const canCreateCategory = authUser
    ? canCreateArticleCategories(authUser)
    : false;

  const {
    category,
    form,
    isLoading,
    isSaving,
    isDeleting,
    error,
    notice,
    setField,
    save,
    remove,
  } = useArticleCategoryEditor(categoryId);

  useEffect(() => {
    if (notice) {
      toast.success(notice);
    }
  }, [notice]);

  useEffect(() => {
    if (error && category) {
      toast.error(error);
    }
  }, [category, error]);

  const previewSlug = useMemo(
    () => form.slug.trim() || slugifyArticleCategoryName(form.name),
    [form.name, form.slug],
  );

  const canDelete = Boolean(category?.abilities.canDelete);
  const canForceRemove = Boolean(category?.abilities.canForceRemove);
  const isReferenced = (category?.articleCount ?? 0) > 0;
  const shouldForceRemove = isReferenced && canForceRemove;
  const deleteButtonLabel = shouldForceRemove
    ? "Forcer la suppression"
    : "Supprimer la catégorie";
  const deleteDisabled = !canDelete || (isReferenced && !canForceRemove);

  const handleNameChange = (value: string) => {
    const nextName = value;
    const shouldRegenerateSlug =
      form.slug === "" || form.slug === slugifyArticleCategoryName(form.name);

    setField("name", nextName);

    if (shouldRegenerateSlug) {
      setField("slug", slugifyArticleCategoryName(nextName));
    }
  };

  const handleSave = async () => {
    if (mode === "create" && !canCreateCategory) {
      toast.error("Accès refusé");
      return;
    }

    if (!form.name.trim() || !previewSlug || !form.color.trim()) {
      toast.error("Nom, slug et couleur requis");
      return;
    }

    const saved = await save();

    if (saved && mode === "create") {
      router.replace(
        `/espace/staff/gestion-des-articles/categories-articles/edit?id=${saved.id}`,
      );
    }
  };

  const handleDelete = async () => {
    if (!category || deleteDisabled) {
      return;
    }

    const confirmMessage = shouldForceRemove
      ? `Forcer la suppression de la catégorie ${category.name} et détacher ${category.articleCount} article(s) ?`
      : `Supprimer la catégorie ${category.name} ?`;
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    const result = await remove({ force: shouldForceRemove });
    if (!result) {
      return;
    }

    toast.success(
      shouldForceRemove && result.detachedArticlesCount > 0
        ? `Catégorie supprimée. ${result.detachedArticlesCount} article(s) détaché(s).`
        : "Catégorie supprimée.",
    );
    router.replace("/espace/staff/gestion/categories-articles");
  };

  if (isAuthLoading && !authUser) {
    return <ArticleCategoryEditorLoading />;
  }

  if (mode === "create" && !canCreateCategory) {
    return (
      <StaffStateCard
        variant="forbidden"
        title="Accès refusé"
        description="Vous n'avez pas l'autorisation de créer une catégorie d'articles."
        actionHref="/espace/staff/gestion/categories-articles"
        actionLabel="Retour aux catégories d'articles"
      />
    );
  }

  if (isLoading) {
    return <ArticleCategoryEditorLoading />;
  }

  if (error && mode === "edit" && !category) {
    return (
      <StaffStateCard
        title="Erreur"
        description={error}
        actionHref="/espace/staff/gestion/categories-articles"
        actionLabel="Retour aux catégories d'articles"
      />
    );
  }

  if (mode === "edit" && !category) {
    return null;
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader
        backHref="/espace/staff/gestion/categories-articles"
        eyebrow="Articles"
        title={
          mode === "edit" && category
            ? category.name
            : "Création d'une catégorie d'articles"
        }
        icon={ListTree}
      />

      {error ? (
        <StaffNotice
          variant="error"
          title={
            mode === "edit"
              ? "Modification impossible"
              : "Création impossible"
          }
        >
          {error}
        </StaffNotice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel
          pretitle="Édition"
          title="Informations de la catégorie"
          description="Le nom, le slug et la couleur seront utilisés pour organiser les articles dans le staff et dans les futures vues publiques."
        >
          <div className="grid gap-6">
            <PanelField id="article-category-name" label="Nom">
              <PanelInput
                id="article-category-name"
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Actualités COBAM"
                fullWidth
              />
            </PanelField>

            <PanelField id="article-category-slug" label="Slug">
              <div className="flex flex-col gap-3 sm:flex-row">
                <PanelInput
                  id="article-category-slug"
                  value={form.slug}
                  onChange={(event) =>
                    setField(
                      "slug",
                      slugifyArticleCategoryName(event.target.value),
                    )
                  }
                  placeholder="actualites-cobam"
                  fullWidth
                />
                <AnimatedUIButton
                  type="button"
                  onClick={() =>
                    setField("slug", slugifyArticleCategoryName(form.name))
                  }
                  variant="light"
                  size="sm"
                >
                  Générer
                </AnimatedUIButton>
              </div>
            </PanelField>

            <PanelField
              id="article-category-color"
              label="Couleur"
              hint="Cette couleur sera utilisée dans la vue publique de l'article."
            >
              <ArticleCategoryColorField
                value={form.color}
                onChange={(value) => setField("color", value)}
              />
            </PanelField>

            <div className="flex justify-end">
              <AnimatedUIButton
                type="button"
                onClick={() => void handleSave()}
                loading={isSaving}
                loadingText={
                  mode === "edit" ? "Enregistrement..." : "Création..."
                }
                variant="primary"
                icon={mode === "edit" ? "save" : "plus"}
              >
                {mode === "edit" ? "Enregistrer" : "Créer la catégorie"}
              </AnimatedUIButton>
            </div>
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel
            pretitle="Résumé"
            title="Aperçu"
            description="Vue rapide de l'identité de cette catégorie."
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-14 w-14 rounded-2xl border border-slate-200"
                  style={{ backgroundColor: form.color || "#0a8dc1" }}
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-cobam-dark-blue">
                    {form.name.trim() || "Nom de la catégorie"}
                  </p>
                  <StaffBadge size="md" color="default">
                    {form.color.trim() || "#0a8dc1"}
                  </StaffBadge>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Slug
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {previewSlug || "categorie-article"}
                </p>
              </div>

              {mode === "edit" && category ? (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Articles liés
                    </p>
                    <div className="mt-2">
                      <StaffBadge
                        size="md"
                        color={category.articleCount > 0 ? "blue" : "default"}
                        icon={category.articleCount > 0 ? "file-text" : undefined}
                      >
                        {category.articleCount}
                      </StaffBadge>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Créée par
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {category.createdByLabel ?? "Système"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Créée le
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(category.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Dernière mise à jour
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(category.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </Panel>

          {mode === "edit" ? (
            <Panel
              pretitle="Danger"
              title="Suppression"
              description="La suppression retire définitivement la catégorie du back-office."
            >
              <div className="space-y-4">
                {isReferenced ? (
                  <StaffNotice
                    variant={canForceRemove ? "warning" : "error"}
                    title={
                      canForceRemove
                        ? "Articles encore rattachés"
                        : "Suppression bloquée"
                    }
                  >
                    {canForceRemove
                      ? `Cette catégorie est encore liée à ${category?.articleCount ?? 0} article(s). Le bouton ci-dessous effectuera Forcer la suppression et détachera ces articles.`
                      : `Cette catégorie est encore liée à ${category?.articleCount ?? 0} article(s). Sans droit de Forcer la suppression, elle ne peut pas être supprimée.`}
                  </StaffNotice>
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    Cette catégorie n&apos;est liée à aucun article. Elle peut être
                    supprimée immédiatement.
                  </p>
                )}

                <AnimatedUIButton
                  type="button"
                  onClick={() => void handleDelete()}
                  loading={isDeleting}
                  loadingText="Suppression..."
                  disabled={deleteDisabled}
                  variant="light"
                  icon="delete"
                  iconPosition="left"
                  className="w-full border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100"
                  textClassName="text-red-700"
                  iconClassName="text-red-700"
                >
                  {deleteButtonLabel}
                </AnimatedUIButton>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ArticleCategoryEditorLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Loading />
      </div>
    </div>
  );
}
