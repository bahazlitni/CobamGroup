"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ArticleAuthorsPanel from "@/components/staff/articles/article-authors-panel";
import ArticleDocumentReader from "@/components/staff/articles/article-document-reader";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import AutosaveIndicator from "@/components/staff/articles/AutosaveIndicator";
import SeoChecks from "@/components/staff/articles/SeoChecks";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  StaffBadge,
  StaffNotice,
  StaffPageHeader,
  StaffSearchSelect,
  StaffStateCard,
  StaffTagInput,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { Textarea } from "@/components/ui/textarea";
import { useArticleCategoryOptions } from "@/features/article-categories/hooks/use-article-category-options";
import { useArticleEditor } from "@/features/articles/hooks/use-article-editor";

function LoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  );
}

function ArticleEditPageContent() {
  const params = useSearchParams();
  const rawId = params.get("id");
  const articleId = useMemo(() => {
    if (!rawId) {
      return null;
    }

    const parsed = Number(rawId);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [rawId]);
  const editor = useArticleEditor(articleId);
  const {
    items: articleCategories,
    isLoading: isLoadingArticleCategories,
    error: articleCategoryOptionsError,
  } = useArticleCategoryOptions(true);

  if (editor.isLoadingInitial) {
    return <LoadingState />;
  }

  if (editor.error && editor.mode === "edit" && !editor.article) {
    return (
      <StaffStateCard
        title="Erreur"
        description={editor.error}
        actionHref="/espace/staff/gestion/articles"
        actionLabel="Retour aux articles"
      />
    );
  }

  const isPublished = editor.state.status === "published";
  const previewTitle =
    editor.state.displayTitle.trim() || editor.state.title.trim() || "Titre de l'article";
  const previewExcerpt =
    editor.state.excerpt.trim() ||
    "Ajoutez un extrait pour presenter rapidement le contenu avant la lecture complete.";
  const articleAbilities = editor.article?.abilities ?? null;
  const canEditArticle = editor.mode === "create" ? true : Boolean(articleAbilities?.canEdit);
  const canManageAuthors =
    editor.mode === "edit" && Boolean(articleAbilities?.canManageAuthors);
  const canDeleteArticle =
    editor.mode === "edit" && Boolean(articleAbilities?.canDelete);
  const canPublishArticle =
    editor.mode === "create" ? true : Boolean(articleAbilities?.canPublish);

  const handleDeleteArticle = () => {
    if (!canDeleteArticle || editor.isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      "Supprimer definitivement cet article ? Cette action est irreversible.",
    );

    if (confirmed) {
      void editor.deleteArticle();
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Articles"
        title={editor.mode === "create" ? "Nouvel article" : "Modifier l'article"}
        actions={
          <AutosaveIndicator
            isDirty={editor.isDirty}
            isSubmitting={editor.isSaving}
            lastSavedAt={editor.lastSavedAt}
          />
        }
      >
        <StaffBadge
          size="md"
          color={isPublished ? "green" : "default"}
          icon={isPublished ? "badge-check" : "file-text"}
        >
          {isPublished ? "Publie" : "Brouillon"}
        </StaffBadge>
      </StaffPageHeader>

      {editor.error ? (
        <StaffNotice variant="error" title="Operation impossible">
          {editor.error}
        </StaffNotice>
      ) : null}

      {editor.notice ? (
        <StaffNotice variant="success" title="Operation terminee">
          {editor.notice}
        </StaffNotice>
      ) : null}

      {editor.mode === "edit" && !canEditArticle && canManageAuthors ? (
        <StaffNotice variant="warning" title="Edition limitee">
          Vous pouvez gerer les auteurs de cet article, mais le contenu et la
          publication restent en lecture seule pour votre compte.
        </StaffNotice>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
        <Panel
          pretitle="Contenu"
          title="Edition de l'article"
          description="Structurez le texte, inserez des images depuis la mediatheque et construisez la mise en page directement dans l'editeur."
        >
          <div className="grid gap-6">
            <PanelField id="article-title" label="Titre interne">
              <PanelInput
                id="article-title"
                value={editor.state.title}
                onChange={(event) => editor.setField("title", event.target.value)}
                placeholder="Titre de l'article"
                disabled={!canEditArticle}
                fullWidth
              />
            </PanelField>

            <div className="grid gap-6 lg:grid-cols-2">
              <PanelField id="article-display-title" label="Titre affiche">
                <PanelInput
                  id="article-display-title"
                  value={editor.state.displayTitle}
                  onChange={(event) =>
                    editor.setField("displayTitle", event.target.value)
                  }
                  placeholder="Titre visible"
                  disabled={!canEditArticle}
                  fullWidth
                />
              </PanelField>
            </div>

            <PanelField
              id="article-categories"
              label="Categories d'articles"
              hint="Ajoutez une ou plusieurs categories. Les scores saisis restent libres pendant l'edition, puis sont normalises a 100% lors de l'enregistrement."
            >
              <div className="space-y-4">
                {editor.state.categoryAssignments.length > 0 ? (
                  editor.state.categoryAssignments.map((assignment, index) => {
                    const selectedIds = editor.state.categoryAssignments
                      .map((item, itemIndex) =>
                        itemIndex === index ? null : item.categoryId,
                      )
                      .filter(Boolean);
                    const options = articleCategories.map((category) => ({
                      value: String(category.id),
                      label: category.name,
                      disabled: selectedIds.includes(String(category.id)),
                    }));

                    if (
                      assignment.categoryId &&
                      !options.some(
                        (option) => option.value === assignment.categoryId,
                      )
                    ) {
                      options.unshift({
                        value: assignment.categoryId,
                        label: `Categorie indisponible (#${assignment.categoryId})`,
                        disabled: false,
                      });
                    }

                    const selectedCategory = articleCategories.find(
                      (category) =>
                        String(category.id) === assignment.categoryId,
                    );

                    return (
                      <div
                        key={assignment.rowId}
                        className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/50 p-4"
                      >
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_132px_auto_auto_auto] lg:items-center">
                          <StaffSearchSelect
                            value={assignment.categoryId}
                            onValueChange={(value) =>
                              editor.setCategoryAssignmentCategory(index, value)
                            }
                            emptyLabel="Choisir une categorie"
                            options={options}
                            disabled={!canEditArticle || isLoadingArticleCategories}
                            fullWidth
                            searchPlaceholder="Rechercher une categorie..."
                            noResultsLabel="Aucune categorie trouvee"
                          />

                          <div className="flex items-center gap-2">
                            <PanelInput
                              type="number"
                              min={1}
                              max={100}
                              step={1}
                              value={assignment.score}
                              onChange={(event) => {
                                const parsed = Number(event.target.value);
                                editor.setCategoryAssignmentScore(
                                  index,
                                  Number.isFinite(parsed) ? parsed : assignment.score,
                                );
                              }}
                              disabled={!canEditArticle}
                              fullWidth
                            />
                            <span className="text-sm font-semibold text-slate-500">
                              %
                            </span>
                          </div>

                          <AnimatedUIButton
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              editor.changeCategoryAssignmentScoreBy(index, -1)
                            }
                            disabled={!canEditArticle}
                          >
                            -1
                          </AnimatedUIButton>

                          <AnimatedUIButton
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              editor.changeCategoryAssignmentScoreBy(index, 1)
                            }
                            disabled={!canEditArticle}
                          >
                            +1
                          </AnimatedUIButton>

                          <AnimatedUIButton
                            type="button"
                            size="sm"
                            variant="ghost"
                            icon="close"
                            onClick={() => editor.removeCategoryAssignment(index)}
                            disabled={!canEditArticle}
                          >
                            Retirer
                          </AnimatedUIButton>
                        </div>

                        {selectedCategory ? (
                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-slate-200"
                              style={{ backgroundColor: selectedCategory.color }}
                              aria-hidden="true"
                            />
                            <span>{selectedCategory.name}</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm leading-6 text-slate-500">
                    Aucune categorie liee pour le moment.
                  </div>
                )}

                <AnimatedUIButton
                  type="button"
                  variant="outline"
                  icon="plus"
                  iconPosition="left"
                  onClick={editor.addCategoryAssignment}
                  disabled={!canEditArticle || isLoadingArticleCategories}
                  size="md"
                  className="w-full py-6"          
                >
                  Ajouter une categorie
                </AnimatedUIButton>


                {articleCategoryOptionsError ? (
                  <p className="text-sm leading-6 text-amber-700">
                    {articleCategoryOptionsError}
                  </p>
                ) : null}
              </div>
            </PanelField>

            <PanelField
              id="article-tags"
              label="Tags"
              hint="Tapez un tag puis espace pour le valider. La suggestion grisee se confirme avec Tab."
            >
              <StaffTagInput
                value={editor.state.tagNames}
                onChange={(nextTags) => editor.setField("tagNames", nextTags)}
                placeholder="Ex. robinetterie premium"
                disabled={!canEditArticle}
              />
            </PanelField>

            <PanelField id="article-slug" label="Slug">
              <div className="flex flex-col gap-3 sm:flex-row">
                <PanelInput
                  id="article-slug"
                  value={editor.state.slug}
                  onChange={(event) => editor.setField("slug", event.target.value)}
                  placeholder="slug-de-l-article"
                  disabled={!canEditArticle}
                  fullWidth
                />
                <AnimatedUIButton
                  type="button"
                  variant="outline"
                  icon="restart"
                  iconPosition="left"
                  onClick={editor.generateSlugFromTitle}
                  disabled={!canEditArticle}
                >
                  Generer
                </AnimatedUIButton>
              </div>
            </PanelField>

            <MediaImageField
              label="Image principale"
              description="Cette image sert de couverture d'article et de repere editorial."
              dialogTitle="Choisir l'image principale"
              dialogDescription="Selectionnez une image 16:9 depuis la mediatheque ou importez-en une nouvelle."
              mediaId={
                editor.state.coverMediaId ? Number(editor.state.coverMediaId) : null
              }
              onChange={(value) =>
                editor.setField("coverMediaId", value ? String(value) : "")
              }
              aspectRatio="16:9"
              disabled={!canEditArticle}
            />

            <PanelField id="article-excerpt" label="Extrait">
              <Textarea
                id="article-excerpt"
                value={editor.state.excerpt}
                onChange={(event) => editor.setField("excerpt", event.target.value)}
                rows={4}
                placeholder="Resume court de l'article..."
                disabled={!canEditArticle}
                className="min-h-[120px] rounded-2xl border-slate-300 px-4 py-3 text-base"
              />
            </PanelField>

            <PanelField
              id="article-content"
              label="Contenu"
              hint="Paragraphes, titres, listes, tableaux, citations, couleurs et images de la mediatheque sont pris en charge."
            >
              <ArticleRichTextEditor
                editorId="article-content"
                value={editor.state.content}
                onChange={(value) => editor.setField("content", value)}
                placeholder="Commencez a ecrire votre article..."
                editable={canEditArticle}
              />
            </PanelField>
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          {editor.mode === "edit" && editor.article ? (
            <ArticleAuthorsPanel
              articleId={editor.article.id}
              authors={editor.article.authors}
              selectedAuthorIds={editor.state.authorIds}
              canManageAuthors={canManageAuthors}
              onChange={(authorIds) => editor.setField("authorIds", authorIds)}
            />
          ) : null}

          <Panel
            pretitle="Publication"
            title="Actions"
            description="Sauvegardez un brouillon ou publiez l'article."
          >
            <div className="space-y-3">
              <AnimatedUIButton
                type="button"
                variant="primary"
                icon="save"
                iconPosition="left"
                loading={editor.isSaving}
                loadingText="Enregistrement..."
                onClick={() => void editor.save()}
                disabled={!canEditArticle && !canManageAuthors}
                className="w-full"
              >
                {editor.mode === "create"
                  ? "Creer un brouillon"
                  : !canEditArticle && canManageAuthors
                    ? "Enregistrer les auteurs"
                    : "Enregistrer"}
              </AnimatedUIButton>

              {!isPublished && canPublishArticle ? (
                <AnimatedUIButton
                  type="button"
                  variant="secondary"
                  icon="globe"
                  iconPosition="left"
                  loading={editor.isPublishing}
                  loadingText="Publication..."
                  onClick={() => void editor.publish()}
                  className="w-full"
                >
                  Publier
                </AnimatedUIButton>
              ) : null}

              {isPublished && canPublishArticle ? (
                <AnimatedUIButton
                  type="button"
                  variant="outline"
                  icon="eye-off"
                  iconPosition="left"
                  loading={editor.isUnpublishing}
                  loadingText="Depublication..."
                  onClick={() => void editor.unpublish()}
                  className="w-full"
                >
                  Repasser en brouillon
                </AnimatedUIButton>
              ) : null}
            </div>
          </Panel>

          {canDeleteArticle ? (
            <Panel
              pretitle="Suppression"
              title="Zone sensible"
              description="La suppression retire definitivement l'article et son contenu."
            >
              <div className="space-y-4">
                <StaffNotice variant="warning" title="Action irreversible">
                  Les medias lies restent dans la mediatheque, mais l&apos;article
                  sera supprime definitivement.
                </StaffNotice>

                <AnimatedUIButton
                  type="button"
                  variant="outline"
                  icon="delete"
                  iconPosition="left"
                  loading={editor.isDeleting}
                  loadingText="Suppression..."
                  onClick={handleDeleteArticle}
                  className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  Supprimer l&apos;article
                </AnimatedUIButton>
              </div>
            </Panel>
          ) : null}

          <Panel
            pretitle="Lecture"
            title="Apercu"
            description="Le lecteur relit le meme document structure que celui qui est enregistre."
          >
            <div className="space-y-5">
              <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <h1 className="text-3xl font-semibold tracking-tight text-cobam-dark-blue">
                  {previewTitle}
                </h1>
                <p className="text-sm leading-7 text-slate-600">{previewExcerpt}</p>
              </div>

              <div className="max-h-[40rem] overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-5">
                <ArticleDocumentReader
                  content={editor.state.content}
                  emptyLabel="Le contenu de l'article apparaitra ici."
                />
              </div>
            </div>
          </Panel>

          <Panel
            pretitle="SEO"
            title="Analyse rapide"
            description="Controlez rapidement les elements essentiels."
          >
            <SeoChecks
              title={editor.state.title}
              slug={editor.state.slug}
              description={editor.state.descriptionSeo}
              content={editor.state.content}
              focusKeyword={editor.state.focusKeyword}
            />
          </Panel>

          <Panel
            pretitle="Meta"
            title="Referencement"
            description="Ajustez les informations de recherche et de partage."
          >
            <div className="grid gap-4">
              <PanelField id="article-focus-keyword" label="Mot-cle principal">
                <PanelInput
                  id="article-focus-keyword"
                  value={editor.state.focusKeyword}
                  onChange={(event) =>
                    editor.setField("focusKeyword", event.target.value)
                  }
                  placeholder="mot-cle principal"
                  disabled={!canEditArticle}
                  fullWidth
                />
              </PanelField>

              <PanelField id="article-description-seo" label="Description SEO">
                <Textarea
                  id="article-description-seo"
                  value={editor.state.descriptionSeo}
                  onChange={(event) =>
                    editor.setField("descriptionSeo", event.target.value)
                  }
                  rows={4}
                  placeholder="Description pour les moteurs de recherche..."
                  disabled={!canEditArticle}
                  className="min-h-[120px] rounded-2xl border-slate-300 px-4 py-3 text-base"
                />
              </PanelField>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default function ArticleEditPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ArticleEditPageContent />
    </Suspense>
  );
}
