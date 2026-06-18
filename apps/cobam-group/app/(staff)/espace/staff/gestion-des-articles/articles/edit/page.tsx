"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, Loader2, XCircle } from "lucide-react";
import ArticleCTABannersEditor from "@/components/staff/articles/article-cta-banners-editor";
import ArticleFaqEditor from "@/components/staff/articles/article-faq-editor";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import AutosaveIndicator from "@/components/staff/articles/AutosaveIndicator";
import SeoChecks from "@/components/staff/articles/SeoChecks";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  StaffBadge,
  DescriptionSEOTextArea,
  StaffEditorActionsPanel,
  StaffEditorInfoPanel,
  StaffEditorLayout,
  StaffNotice,
  StaffPageHeader,
  StaffSearchSelect,
  StaffStateCard,
  StaffTagInput,
  UnsavedChangesGuard,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useArticleCategoryOptions } from "@/features/article-categories/hooks/use-article-category-options";
import { useArticleEditor } from "@/features/articles/hooks/use-article-editor";
import {
  getNextFiveMinuteLocalInputValue,
  isDatetimeLocalValueFiveMinuteAligned,
} from "@/features/articles/scheduling";
import { MEDIA_FOLDER_SCOPE_IDS, MEDIA_FOLDER_SCOPE_LABELS } from "@/features/media/folder-scopes";

function LoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  );
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function parseLocalDateTime(value: string) {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTimeLocalValue(date: Date, time: string) {
  const [hours = "00", minutes = "00"] = time.split(":");

  return [
    date.getFullYear(),
    "-",
    padDatePart(date.getMonth() + 1),
    "-",
    padDatePart(date.getDate()),
    "T",
    hours.padStart(2, "0"),
    ":",
    minutes.padStart(2, "0"),
  ].join("");
}

function getTimeValueFromDate(date: Date | null) {
  if (!date) {
    return "";
  }

  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
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
        actionHref="/espace/staff/gestion-des-articles/articles"
        actionLabel="Retour aux articles"
      />
    );
  }

  const isPublished = editor.state.status === "published";
  const isScheduled = !isPublished && Boolean(editor.article?.scheduledPublishAt);
  const scheduleInputIsAligned =
    !editor.state.scheduledPublishAt ||
    isDatetimeLocalValueFiveMinuteAligned(editor.state.scheduledPublishAt);
  const scheduleMinValue = getNextFiveMinuteLocalInputValue();
  const scheduleMinDateTime = parseLocalDateTime(scheduleMinValue);
  const scheduleDateTime = parseLocalDateTime(editor.state.scheduledPublishAt);
  const selectedScheduleDate = scheduleDateTime ?? undefined;
  const scheduleTimeValue =
    getTimeValueFromDate(scheduleDateTime) || getTimeValueFromDate(scheduleMinDateTime) || "09:00";
  const earliestScheduleDay = scheduleMinDateTime ? new Date(scheduleMinDateTime) : new Date();
  earliestScheduleDay.setHours(0, 0, 0, 0);
  const scheduleTimeMin =
    selectedScheduleDate?.toDateString() === earliestScheduleDay.toDateString()
      ? getTimeValueFromDate(scheduleMinDateTime)
      : undefined;
  const scheduledAtLabel = editor.article?.scheduledPublishAt
    ? new Date(editor.article.scheduledPublishAt).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;
  const articleAbilities = editor.article?.abilities ?? null;
  const canEditArticle = editor.mode === "create" ? true : Boolean(articleAbilities?.canEdit);
  const canDeleteArticle = editor.mode === "edit" && Boolean(articleAbilities?.canDelete);
  const canPublishArticle = editor.mode === "create" ? true : Boolean(articleAbilities?.canPublish);
  const isArticleActionBusy =
    editor.isSaving ||
    editor.isPublishing ||
    editor.isUnpublishing ||
    editor.isScheduling ||
    editor.isCancelingSchedule;
  const articlePublicHref = editor.article?.slug ? `/actualites/${editor.article.slug}` : null;

  const handleDeleteArticle = () => {
    if (!canDeleteArticle || editor.isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      "Supprimer définitivement cet article ? Cette action est irréversible.",
    );

    if (confirmed) {
      void editor.deleteArticle();
    }
  };

  const handleScheduleDateSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    editor.setField("scheduledPublishAt", formatDateTimeLocalValue(date, scheduleTimeValue));
  };

  const handleScheduleTimeChange = (value: string) => {
    if (!value) {
      editor.setField("scheduledPublishAt", "");
      return;
    }

    editor.setField(
      "scheduledPublishAt",
      formatDateTimeLocalValue(selectedScheduleDate ?? scheduleMinDateTime ?? new Date(), value),
    );
  };

  return (
    <div className="space-y-6">
      <UnsavedChangesGuard
        isDirty={editor.isDirty}
        onSaveAndContinue={async () => Boolean(await editor.save())}
      />

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
      />

      {editor.error ? (
        <StaffNotice variant="error" title="Opération impossible">
          {editor.error}
        </StaffNotice>
      ) : null}

      {editor.notice ? (
        <StaffNotice variant="success" title="Opération terminée">
          {editor.notice}
        </StaffNotice>
      ) : null}

      <StaffEditorLayout
        sidebar={
          <>
            <StaffEditorActionsPanel
              mode={editor.mode === "create" ? "create" : "edit"}
              onSave={() => void editor.save()}
              isSaving={editor.isSaving}
              saveDisabled={!canEditArticle}
              onDelete={canDeleteArticle ? handleDeleteArticle : undefined}
              isDeleting={editor.isDeleting}
              description="Retrouvez ici la sauvegarde, la publication et la planification."
              topContent={
                <div className="flex flex-wrap items-center gap-2">
                  <StaffBadge
                    size="sm"
                    color={isPublished ? "green" : isScheduled ? "info" : "default"}
                    icon={isPublished ? "badge-check" : isScheduled ? "calendar" : "file-text"}
                  >
                    {isPublished ? "Publié" : isScheduled ? "Planifié" : "Brouillon"}
                  </StaffBadge>
                  {canEditArticle ? (
                    <StaffBadge size="sm" color="info" icon="none">
                      Édition du contenu
                    </StaffBadge>
                  ) : null}
                </div>
              }
            >
              <div className="grid gap-3">
                {articlePublicHref ? (
                  <AnimatedUIButton
                    href={articlePublicHref}
                    target="_blank"
                    variant="outline"
                    icon="external-link"
                    iconPosition="left"
                    className="w-full"
                  >
                    Voir l&apos;article
                  </AnimatedUIButton>
                ) : null}

                <AnimatedUIButton
                  type="button"
                  variant="outline"
                  icon="copy"
                  iconPosition="left"
                  onClick={() => void editor.copyPlainText()}
                  className="w-full"
                >
                  Copier le texte
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
                    disabled={isArticleActionBusy || !editor.canPublishBySeo}
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
                    loadingText="Dépublication..."
                    onClick={() => void editor.unpublish()}
                    className="w-full"
                  >
                    Repasser en brouillon
                  </AnimatedUIButton>
                ) : null}

                {!isPublished && canPublishArticle ? (
                  <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarClock className="text-cobam-water-blue h-4 w-4" />
                      <span>Planification</span>
                    </div>

                    <div className="grid gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 w-full justify-start border-slate-300 bg-white text-left font-medium"
                            aria-invalid={!scheduleInputIsAligned}
                          >
                            <CalendarClock className="text-cobam-water-blue h-4 w-4" />
                            {selectedScheduleDate
                              ? selectedScheduleDate.toLocaleDateString("fr-FR", {
                                  dateStyle: "medium",
                                })
                              : "Choisir une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedScheduleDate}
                            onSelect={handleScheduleDateSelect}
                            disabled={(date) => date < earliestScheduleDay}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>

                      <Input
                        type="time"
                        step={300}
                        min={scheduleTimeMin}
                        value={scheduleTimeValue}
                        onChange={(event) => handleScheduleTimeChange(event.target.value)}
                        aria-invalid={!scheduleInputIsAligned}
                        className="h-10 border-slate-300 bg-white"
                      />
                    </div>

                    {editor.state.scheduledPublishAt && !scheduleInputIsAligned ? (
                      <p className="text-xs leading-5 text-amber-700">
                        Choisissez une heure alignée sur un multiple de 5 minutes.
                      </p>
                    ) : null}

                    {scheduledAtLabel ? (
                      <p className="text-xs leading-5 text-slate-500">
                        Publication prévue le {scheduledAtLabel}.
                      </p>
                    ) : null}

                    <div className="grid gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-10 w-full"
                        onClick={() => void editor.schedulePublication()}
                        disabled={
                          isArticleActionBusy ||
                          !editor.state.scheduledPublishAt ||
                          !scheduleInputIsAligned ||
                          !editor.canPublishBySeo
                        }
                      >
                        {editor.isScheduling ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CalendarClock className="h-4 w-4" />
                        )}
                        Planifier
                      </Button>

                      {editor.article?.scheduledPublishAt ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full"
                          onClick={() => void editor.cancelSchedule()}
                          disabled={isArticleActionBusy}
                        >
                          {editor.isCancelingSchedule ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Annuler
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </StaffEditorActionsPanel>

            <StaffEditorInfoPanel description="Repères rapides sur cet article et son état actuel.">
              <div className="flex flex-wrap gap-2">
                <StaffBadge size="sm" color="secondary" icon="folder">
                  {editor.state.categoryId ? "1 catégorie" : "Sans catégorie"}
                </StaffBadge>
                <StaffBadge size="sm" color="default" icon="tag">
                  {editor.state.tagNames.length} tag
                  {editor.state.tagNames.length > 1 ? "s" : ""}
                </StaffBadge>
                <StaffBadge size="sm" color="info" icon="badge-check">
                  {editor.seoAnalysis.status}
                </StaffBadge>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                  Slug
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {editor.state.slug || "slug-de-l-article"}
                </p>
              </div>

              {editor.article ? (
                <>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                      Créé le
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(editor.article.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                      Dernière mise à jour
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(editor.article.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {scheduledAtLabel ? (
                    <div>
                      <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                        Publication planifiée
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{scheduledAtLabel}</p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </StaffEditorInfoPanel>
          </>
        }
      >
        <Panel pretitle="" title="Rédaction de l'article" allowOverflow>
          <div className="grid gap-6">
            <PanelField id="article-title" label="Titre">
              <Textarea
                id="article-title"
                value={editor.state.title}
                onChange={(event) => editor.setField("title", event.target.value)}
                placeholder="Titre de l'article"
                disabled={!canEditArticle}
                aria-label="Titre de l'article"
                rows={1}
                className="text-cobam-dark-blue [field-sizing:content] min-h-14 w-full resize-none overflow-hidden !rounded-none border-0 bg-transparent p-0 text-3xl leading-tight font-bold shadow-none outline-none placeholder:text-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60 md:text-4xl"
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
                  Générer
                </AnimatedUIButton>
              </div>
            </PanelField>

            <PanelField id="article-category" label="Catégorie d'article">
              <StaffSearchSelect
                value={editor.state.categoryId}
                onValueChange={(value) => editor.setField("categoryId", value)}
                emptyLabel="Choisir une catégorie"
                options={articleCategories.map((category) => ({
                  value: String(category.id),
                  label: category.name,
                }))}
                disabled={!canEditArticle || isLoadingArticleCategories}
                fullWidth
                searchPlaceholder="Rechercher une catégorie..."
                noResultsLabel="Aucune catégorie trouvée"
              />

              {articleCategoryOptionsError ? (
                <p className="mt-2 text-sm leading-6 text-amber-700">
                  {articleCategoryOptionsError}
                </p>
              ) : null}
            </PanelField>

            <div className="self-start">
              <MediaImageField
                label="Image principale"
                description="Cette image sert de couverture d'article et de repère éditorial."
                dialogTitle="Choisir l'image principale"
                dialogDescription="Sélectionnez une image 16:9 depuis la médiathèque ou importez-en une nouvelle."
                mediaId={editor.state.coverMediaId ? Number(editor.state.coverMediaId) : null}
                onChange={(value) => editor.setField("coverMediaId", value ? String(value) : "")}
                aspectRatio="16:9"
                folderId={MEDIA_FOLDER_SCOPE_IDS.ARTICLES}
                folderLabel={MEDIA_FOLDER_SCOPE_LABELS[MEDIA_FOLDER_SCOPE_IDS.ARTICLES]}
                disabled={!canEditArticle}
              />
            </div>
          </div>

          <div className="grid gap-6">
            <PanelField id="article-excerpt" label="Extrait">
              <Textarea
                id="article-excerpt"
                value={editor.state.excerpt}
                onChange={(event) => editor.setField("excerpt", event.target.value)}
                rows={4}
                placeholder="Résumé court de l'article..."
                disabled={!canEditArticle}
                className="min-h-32 border-slate-300 px-4 py-3 text-base"
              />
            </PanelField>

            <PanelField id="article-introduction" label="Introduction">
              <ArticleRichTextEditor
                editorId="article-introduction-content"
                value={editor.state.introductionContent}
                onChange={(value) => editor.setField("introductionContent", value)}
                placeholder="Introduction de l'article..."
                editable={canEditArticle}
              />
            </PanelField>

            <PanelField id="article-body" label="Suite de l'article">
              <ArticleRichTextEditor
                editorId="article-body-content"
                value={editor.state.bodyContent}
                onChange={(value) => editor.setField("bodyContent", value)}
                placeholder="Corps principal de l'article..."
                editable={canEditArticle}
              />
            </PanelField>

            <PanelField id="article-conclusion" label="Conclusion">
              <ArticleRichTextEditor
                editorId="article-conclusion-content"
                value={editor.state.conclusionContent}
                onChange={(value) => editor.setField("conclusionContent", value)}
                placeholder="Conclusion..."
                editable={canEditArticle}
              />
            </PanelField>

            <ArticleCTABannersEditor
              value={editor.state.ctaBanners}
              onChange={(nextBanners) => editor.setField("ctaBanners", nextBanners)}
              disabled={!canEditArticle}
            />

            <ArticleFaqEditor
              value={editor.state.faqQuestions}
              onChange={(nextQuestions) => editor.setField("faqQuestions", nextQuestions)}
              disabled={!canEditArticle}
            />
          </div>
        </Panel>

        <Panel pretitle="" title="Référencement et tags" description="">
          <div className="grid gap-5">
            <PanelField id="article-focus-keyword" label="Mot-clé principal">
              <PanelInput
                id="article-focus-keyword"
                value={editor.state.focusKeyword}
                onChange={(event) => editor.setField("focusKeyword", event.target.value)}
                placeholder="mot-clé-principal"
                disabled={!canEditArticle}
                fullWidth
              />
            </PanelField>

            <PanelField id="article-title-seo" label="Titre SEO">
              <PanelInput
                id="article-title-seo"
                value={editor.state.titleSeo}
                onChange={(event) => editor.setField("titleSeo", event.target.value)}
                placeholder="Titre affiché dans Google..."
                disabled={!canEditArticle}
                fullWidth
              />
            </PanelField>

            <PanelField id="article-description-seo" label="Description SEO">
              <DescriptionSEOTextArea
                id="article-description-seo"
                value={editor.state.descriptionSeo}
                onValueChange={(value) => editor.setField("descriptionSeo", value)}
                rows={4}
                placeholder="Description pour les moteurs de recherche..."
                disabled={!canEditArticle}
                className="min-h-[120px] rounded-lg border-slate-300 px-4 py-3 text-base"
              />
            </PanelField>

            <PanelField id="article-tags" label="Tags">
              <StaffTagInput
                value={editor.state.tagNames}
                onChange={(nextTags) => editor.setField("tagNames", nextTags)}
                placeholder="Ex. robinetterie premium"
                disabled={!canEditArticle}
              />
            </PanelField>

            <div className="rounded-[24px] border border-slate-300 bg-slate-50/70 p-4">
              <SeoChecks articlePublicHref={articlePublicHref} analysis={editor.seoAnalysis} />
            </div>
          </div>
        </Panel>
      </StaffEditorLayout>
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
