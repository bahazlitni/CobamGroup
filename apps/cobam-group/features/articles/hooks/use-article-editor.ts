"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearStaffInfiniteListCache } from "@/lib/client/use-staff-infinite-scroll";
import { normalizeOwnedTagNames } from "@/features/tags/owned";
import { slugify } from "@/lib/slugify";
import { normalizeArticleContent } from "../document";
import { analyzeArticleSeo } from "../seo-analyzer";
import {
  cancelArticlePublicationScheduleClient,
  createArticleClient,
  deleteArticleClient,
  getArticleByIdClient,
  publishArticleClient,
  scheduleArticlePublicationClient,
  unpublishArticleClient,
  updateArticleClient,
} from "../client";
import {
  datetimeLocalValueToIso,
  isDatetimeLocalValueFiveMinuteAligned,
  toDatetimeLocalInputValue,
} from "../scheduling";
import type {
  ArticleCTABannerAnchor,
  ArticleCTABannerDto,
  ArticleCTABannerHorizontalAspectRatio,
  ArticleDetailDto,
} from "../types";

const ARTICLE_LIST_CACHE_KEY = "articles";

export type ArticleEditorCTABannerButton = {
  rowId: string;
  id: number | null;
  text: string;
  iconCode: string;
  sortOrder: number;
  href: string;
};

export type ArticleEditorCTABanner = {
  rowId: string;
  id: number | null;
  title: string;
  description: string;
  imageId: string;
  backgroundColor: string;
  horizontalAspectRatio: ArticleCTABannerHorizontalAspectRatio;
  anchor: ArticleCTABannerAnchor;
  approxPositionPercentage: number;
  href: string;
  buttons: ArticleEditorCTABannerButton[];
};

export type ArticleEditorState = {
  title: string;
  slug: string;
  categoryId: string;
  tagNames: string[];
  excerpt: string;
  content: string;
  titleSeo: string;
  descriptionSeo: string;
  focusKeyword: string;
  coverMediaId: string;
  ogTitle: string;
  ogDescription: string;
  ogImageMediaId: string;
  noIndex: boolean;
  ctaBanners: ArticleEditorCTABanner[];
  scheduledPublishAt: string;
  status: "draft" | "published";
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function deriveFocusKeyword(title: string) {
  return title.trim().split(/\s+/).slice(0, 4).join(" ").toLowerCase();
}

function createRowId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapCtaButtonToEditorState(
  button: ArticleCTABannerDto["buttons"][number],
): ArticleEditorCTABannerButton {
  return {
    rowId: createRowId("article-cta-button"),
    id: button.id,
    text: button.text ?? "",
    iconCode: button.iconCode ?? "arrow-right",
    sortOrder: button.sortOrder,
    href: button.href ?? "",
  };
}

function mapCtaBannerToEditorState(
  banner: ArticleCTABannerDto,
): ArticleEditorCTABanner {
  return {
    rowId: createRowId("article-cta"),
    id: banner.id,
    title: banner.title,
    description: banner.description ?? "",
    imageId: banner.imageId != null ? String(banner.imageId) : "",
    backgroundColor: banner.backgroundColor,
    horizontalAspectRatio: banner.horizontalAspectRatio,
    anchor: banner.anchor,
    approxPositionPercentage: banner.approxPositionPercentage,
    href: banner.href ?? "",
    buttons: banner.buttons.map(mapCtaButtonToEditorState),
  };
}

function getEmptyEditorState(): ArticleEditorState {
  return {
    title: "",
    slug: "",
    categoryId: "",
    tagNames: [],
    excerpt: "",
    content: normalizeArticleContent(""),
    titleSeo: "",
    descriptionSeo: "",
    focusKeyword: "",
    coverMediaId: "",
    ogTitle: "",
    ogDescription: "",
    ogImageMediaId: "",
    noIndex: false,
    ctaBanners: [],
    scheduledPublishAt: "",
    status: "draft",
  };
}

function mapArticleToEditorState(article: ArticleDetailDto): ArticleEditorState {
  return {
    title: article.title ?? "",
    slug: article.slug ?? "",
    categoryId: article.category ? String(article.category.id) : "",
    tagNames: article.tags.map((tag) => tag.name),
    excerpt: article.excerpt ?? "",
    content: normalizeArticleContent(article.content),
    titleSeo: article.titleSeo ?? "",
    descriptionSeo: article.descriptionSeo ?? "",
    focusKeyword: article.focusKeyword ?? deriveFocusKeyword(article.title ?? ""),
    coverMediaId: article.coverMediaId != null ? String(article.coverMediaId) : "",
    ogTitle: article.ogTitle ?? "",
    ogDescription: article.ogDescription ?? "",
    ogImageMediaId: article.ogImageMediaId != null ? String(article.ogImageMediaId) : "",
    noIndex: article.noIndex,
    ctaBanners: article.ctaBanners.map(mapCtaBannerToEditorState),
    scheduledPublishAt: toDatetimeLocalInputValue(article.scheduledPublishAt),
    status: article.status === "PUBLISHED" ? "published" : "draft",
  };
}

function validateEditorStateForSave(state: ArticleEditorState) {
  state.ctaBanners.forEach((banner, index) => {
    if (!banner.title.trim()) {
      throw new Error(`La bannière CTA #${index + 1} doit avoir un titre.`);
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(banner.backgroundColor.trim())) {
      throw new Error(`La bannière CTA #${index + 1} doit utiliser une couleur hexadécimale.`);
    }

    if (banner.buttons.length > 2) {
      throw new Error("Une bannière CTA ne peut pas avoir plus de deux boutons.");
    }
  });
}

function mapEditorStateToPayload(state: ArticleEditorState) {
  validateEditorStateForSave(state);

  const ctaBanners = state.ctaBanners.map((banner) => ({
    title: banner.title.trim(),
    description: banner.description.trim() || null,
    imageId: banner.imageId.trim() ? Number(banner.imageId) : null,
    backgroundColor: banner.backgroundColor.trim() || "#14202e",
    horizontalAspectRatio: banner.horizontalAspectRatio,
    anchor: banner.anchor,
    approxPositionPercentage: Math.min(
      100,
      Math.max(0, Math.round(banner.approxPositionPercentage)),
    ),
    href: banner.href.trim() || null,
    buttons: banner.buttons.slice(0, 2).map((button, index) => ({
      text: button.text.trim() || null,
      iconCode: button.iconCode.trim() || null,
      sortOrder: index,
      href: button.href.trim() || null,
    })),
  }));

  return {
    title: state.title.trim(),
    slug: state.slug.trim(),
    tagNames: normalizeOwnedTagNames(state.tagNames),
    excerpt: state.excerpt.trim() || null,
    content: normalizeArticleContent(state.content),
    titleSeo: state.titleSeo.trim() || null,
    descriptionSeo: state.descriptionSeo.trim() || null,
    focusKeyword: state.focusKeyword.trim() || null,
    categoryId: state.categoryId.trim() ? Number(state.categoryId) : null,
    coverMediaId: state.coverMediaId.trim() ? Number(state.coverMediaId) : null,
    ogTitle: state.ogTitle.trim() || null,
    ogDescription: state.ogDescription.trim() || null,
    ogImageMediaId: state.ogImageMediaId.trim() ? Number(state.ogImageMediaId) : null,
    noIndex: state.noIndex,
    ctaBanners,
  };
}

export function useArticleEditor(articleId: number | null) {
  const router = useRouter();
  const mode = useMemo(() => (articleId ? "edit" : "create"), [articleId]);

  const [state, setState] = useState<ArticleEditorState>(getEmptyEditorState());
  const [loadedState, setLoadedState] = useState<ArticleEditorState>(getEmptyEditorState());
  const [article, setArticle] = useState<ArticleDetailDto | null>(null);

  const [isLoadingInitial, setIsLoadingInitial] = useState(Boolean(articleId));
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCancelingSchedule, setIsCancelingSchedule] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(loadedState),
    [state, loadedState],
  );

  const seoAnalysis = useMemo(
    () =>
      analyzeArticleSeo({
        id: article?.id ?? null,
        title: state.title,
        slug: state.slug,
        excerpt: state.excerpt,
        content: state.content,
        titleSeo: state.titleSeo,
        descriptionSeo: state.descriptionSeo,
        focusKeyword: state.focusKeyword,
        status: state.status === "published" ? "PUBLISHED" : "DRAFT",
        noIndex: state.noIndex,
        categoryName: article?.category?.id === Number(state.categoryId) ? article.category.name : null,
        coverMediaId: state.coverMediaId.trim() ? Number(state.coverMediaId) : null,
        ogTitle: state.ogTitle,
        ogDescription: state.ogDescription,
        ogImageMediaId: state.ogImageMediaId.trim() ? Number(state.ogImageMediaId) : null,
        publicUrl: state.slug.trim() ? `/actualites/${state.slug.trim()}` : null,
        mode: "publish",
      }),
    [article?.category, article?.id, state],
  );

  const canPublishBySeo = seoAnalysis.status === "SEO_READY";

  const loadArticle = useCallback(async () => {
    if (!articleId) {
      const empty = getEmptyEditorState();
      setArticle(null);
      setState(empty);
      setLoadedState(empty);
      setIsLoadingInitial(false);
      return;
    }

    setIsLoadingInitial(true);
    setError(null);

    try {
      const result = await getArticleByIdClient(articleId);
      const nextState = mapArticleToEditorState(result);
      setArticle(result);
      setState(nextState);
      setLoadedState(nextState);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load article"));
    } finally {
      setIsLoadingInitial(false);
    }
  }, [articleId]);

  useEffect(() => {
    void loadArticle();
  }, [loadArticle]);

  const setField = useCallback(
    <K extends keyof ArticleEditorState>(key: K, value: ArticleEditorState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const generateSlugFromTitle = useCallback(() => {
    setState((prev) => ({ ...prev, slug: slugify(prev.title) }));
  }, []);

  const syncSmartDerivedFieldsFromTitle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      slug: prev.slug || slugify(prev.title),
      focusKeyword: prev.focusKeyword || deriveFocusKeyword(prev.title),
      titleSeo: prev.titleSeo || prev.title,
      ogTitle: prev.ogTitle || prev.title,
    }));
  }, []);

  const persistWithDesiredStatus = useCallback(
    async (desiredStatus: "draft" | "published") => {
      setError(null);
      setNotice(null);

      const payload = mapEditorStateToPayload({ ...state, status: desiredStatus });

      let saved =
        articleId != null
          ? await updateArticleClient(articleId, payload)
          : await createArticleClient(payload);

      if (desiredStatus === "published" && saved.status !== "PUBLISHED") {
        await publishArticleClient(saved.id);
        saved = await getArticleByIdClient(saved.id);
      } else if (desiredStatus === "draft" && saved.status === "PUBLISHED") {
        await unpublishArticleClient(saved.id);
        saved = await getArticleByIdClient(saved.id);
      }

      const nextState = mapArticleToEditorState(saved);
      setArticle(saved);
      setState(nextState);
      setLoadedState(nextState);
      setLastSavedAt(new Date());
      clearStaffInfiniteListCache(ARTICLE_LIST_CACHE_KEY);

      if (articleId == null) {
        router.replace(`/espace/staff/gestion-des-articles/articles/edit?id=${saved.id}`);
      }

      return saved;
    },
    [articleId, router, state],
  );

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      let desiredStatus = state.status;

      if (state.status === "published" && seoAnalysis.status !== "SEO_READY") {
        const confirmed = window.confirm(
          "Cet article publié n'est plus prêt pour le SEO. Sauvegarder va le repasser en brouillon. Continuer ?",
        );

        if (!confirmed) {
          return null;
        }

        desiredStatus = "draft";
      }

      const saved = await persistWithDesiredStatus(desiredStatus);
      setNotice(
        desiredStatus === "draft" && state.status === "published"
          ? "Article sauvegardé et repassé en brouillon."
          : mode === "create"
            ? "Article créé."
            : "Article sauvegardé.",
      );
      return saved;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save"));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [mode, persistWithDesiredStatus, seoAnalysis.status, state.status]);

  const publish = useCallback(async () => {
    if (!canPublishBySeo) {
      setError("L'article doit être SEO_READY avant publication.");
      return null;
    }

    setIsPublishing(true);
    try {
      const saved = await persistWithDesiredStatus("published");
      setNotice("Article publié.");
      return saved;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to publish"));
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [canPublishBySeo, persistWithDesiredStatus]);

  const unpublish = useCallback(async () => {
    setIsUnpublishing(true);
    try {
      const saved = await persistWithDesiredStatus("draft");
      setNotice("Article repassé en brouillon.");
      return saved;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to unpublish"));
      return null;
    } finally {
      setIsUnpublishing(false);
    }
  }, [persistWithDesiredStatus]);

  const schedulePublication = useCallback(async () => {
    const scheduledPublishAtIso = datetimeLocalValueToIso(state.scheduledPublishAt);

    if (!canPublishBySeo) {
      setError("L'article doit être SEO_READY avant planification.");
      return null;
    }

    if (
      !scheduledPublishAtIso ||
      !isDatetimeLocalValueFiveMinuteAligned(state.scheduledPublishAt)
    ) {
      setError("Choisissez une date de publication alignée sur un multiple de 5 minutes.");
      return null;
    }

    setIsScheduling(true);
    setError(null);
    setNotice(null);

    try {
      const savedDraft = await persistWithDesiredStatus("draft");

      const scheduledArticle = await scheduleArticlePublicationClient(
        savedDraft.id,
        scheduledPublishAtIso,
      );
      const nextState = mapArticleToEditorState(scheduledArticle);

      setArticle(scheduledArticle);
      setState(nextState);
      setLoadedState(nextState);
      setLastSavedAt(new Date());
      clearStaffInfiniteListCache(ARTICLE_LIST_CACHE_KEY);
      setNotice("Publication planifiée.");

      return scheduledArticle;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to schedule publication"));
      return null;
    } finally {
      setIsScheduling(false);
    }
  }, [canPublishBySeo, persistWithDesiredStatus, state.scheduledPublishAt]);

  const cancelSchedule = useCallback(async () => {
    if (!article?.id) {
      setError("Sauvegardez d'abord l'article avant de modifier sa planification.");
      return null;
    }

    setIsCancelingSchedule(true);
    setError(null);
    setNotice(null);

    try {
      const nextArticle = await cancelArticlePublicationScheduleClient(article.id);

      setArticle(nextArticle);
      setState((prev) => ({ ...prev, scheduledPublishAt: "" }));
      setLoadedState((prev) => ({ ...prev, scheduledPublishAt: "" }));
      clearStaffInfiniteListCache(ARTICLE_LIST_CACHE_KEY);
      setNotice("Planification annulée.");

      return nextArticle;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to cancel schedule"));
      return null;
    } finally {
      setIsCancelingSchedule(false);
    }
  }, [article?.id]);

  const resetToLoaded = useCallback(() => {
    setState(loadedState);
    setError(null);
    setNotice(null);
  }, [loadedState]);

  const deleteArticle = useCallback(async () => {
    if (articleId == null) {
      setError("Impossible de supprimer un article qui n'existe pas encore.");
      return false;
    }

    setIsDeleting(true);
    setError(null);
    setNotice(null);

    try {
      await deleteArticleClient(articleId);
      clearStaffInfiniteListCache(ARTICLE_LIST_CACHE_KEY);
      router.push("/espace/staff/gestion-des-articles/articles");
      router.refresh();
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete"));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [articleId, router]);

  return {
    mode,
    article,
    state,
    error,
    notice,
    isDirty,
    lastSavedAt,
    isLoadingInitial,
    isSaving,
    isPublishing,
    isUnpublishing,
    isScheduling,
    isCancelingSchedule,
    isDeleting,
    seoAnalysis,
    canPublishBySeo,
    setField,
    setState,
    save,
    publish,
    unpublish,
    schedulePublication,
    cancelSchedule,
    deleteArticle,
    resetToLoaded,
    generateSlugFromTitle,
    syncSmartDerivedFieldsFromTitle,
    reload: loadArticle,
  };
}
