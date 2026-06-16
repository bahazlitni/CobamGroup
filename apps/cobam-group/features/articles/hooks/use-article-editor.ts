"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearStaffInfiniteListCache } from "@/lib/client/use-staff-infinite-scroll";
import { normalizeOwnedTagNames } from "@/features/tags/owned";
import { slugify } from "@/lib/slugify";
import { normalizeArticleContent } from "../document";
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

export type ArticleEditorCategoryAssignment = {
  rowId: string;
  categoryId: string;
  score: number;
};

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
  displayTitle: string;
  slug: string;
  categoryAssignments: ArticleEditorCategoryAssignment[];
  tagNames: string[];
  authorIds: string[];
  excerpt: string;
  content: string;
  descriptionSeo: string;
  focusKeyword: string;
  coverMediaId: string;
  ogTitle: string;
  ogDescription: string;
  ogImageMediaId: string;
  noIndex: boolean;
  noFollow: boolean;
  schemaType: string;
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

function createAssignmentRowId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `article-category-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createCtaBannerRowId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `article-cta-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapCtaButtonToEditorState(
  button: ArticleCTABannerDto["buttons"][number],
): ArticleEditorCTABannerButton {
  return {
    rowId: createCtaBannerRowId(),
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
    rowId: createCtaBannerRowId(),
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

function distributeScores(weights: readonly number[], total: number, minimumEach: number) {
  const count = weights.length;

  if (count === 0) {
    return [];
  }

  if (count === 1) {
    return [Math.max(0, Math.round(total))];
  }

  const safeMinimum = Math.max(0, Math.round(minimumEach));
  const roundedTotal = Math.max(0, Math.round(total));
  const reserved = safeMinimum * count;

  if (roundedTotal < reserved) {
    return Array.from({ length: count }, (_, index) => (index < roundedTotal ? 1 : 0));
  }

  const distributable = roundedTotal - reserved;
  const safeWeights = weights.map((weight) => Math.max(0, weight));
  const totalWeight = safeWeights.reduce((sum, weight) => sum + weight, 0);

  if (distributable === 0) {
    return Array(count).fill(safeMinimum);
  }

  if (totalWeight === 0) {
    const baseShare = Math.floor(distributable / count);
    const remainder = distributable % count;

    return Array.from(
      { length: count },
      (_, index) => safeMinimum + baseShare + (index < remainder ? 1 : 0),
    );
  }

  const rawShares = safeWeights.map((weight) => (weight / totalWeight) * distributable);
  const flooredShares = rawShares.map((share) => Math.floor(share));
  let remainder = distributable - flooredShares.reduce((sum, share) => sum + share, 0);

  const byFraction = rawShares
    .map((share, index) => ({
      index,
      fraction: share - flooredShares[index],
    }))
    .sort((left, right) => right.fraction - left.fraction);

  const extraShares = Array(count).fill(0);
  let cursor = 0;

  while (remainder > 0 && byFraction.length > 0) {
    extraShares[byFraction[cursor % byFraction.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }

  return flooredShares.map((share, index) => safeMinimum + share + extraShares[index]);
}

function normalizeCategoryAssignments(
  assignments: readonly ArticleEditorCategoryAssignment[],
): ArticleEditorCategoryAssignment[] {
  if (assignments.length === 0) {
    return [];
  }

  if (assignments.length === 1) {
    return [{ ...assignments[0], score: 100 }];
  }

  const weights = assignments.map((assignment) => Math.max(Math.round(assignment.score) - 1, 0));
  const distributedScores = distributeScores(weights, 100, 1);

  return assignments.map((assignment, index) => ({
    ...assignment,
    score: distributedScores[index],
  }));
}

function addCategoryAssignmentRow(assignments: readonly ArticleEditorCategoryAssignment[]) {
  return [
    ...assignments,
    {
      rowId: createAssignmentRowId(),
      categoryId: "",
      score: assignments.length === 0 ? 100 : 1,
    },
  ];
}

function removeCategoryAssignmentRow(
  assignments: readonly ArticleEditorCategoryAssignment[],
  indexToRemove: number,
) {
  const nextAssignments = assignments.filter((_, index) => index !== indexToRemove);

  return nextAssignments;
}

function rebalanceCategoryAssignmentScore(
  assignments: readonly ArticleEditorCategoryAssignment[],
  targetIndex: number,
  nextScore: number,
) {
  if (assignments.length === 0 || !assignments[targetIndex]) {
    return [];
  }

  const safeScore = Math.max(1, Math.round(nextScore));

  return assignments.map((assignment, index) => {
    if (index === targetIndex) {
      return {
        ...assignment,
        score: safeScore,
      };
    }

    return assignment;
  });
}

function getCategoryAssignmentsTotal(assignments: readonly ArticleEditorCategoryAssignment[]) {
  return assignments.reduce((sum, assignment) => sum + assignment.score, 0);
}

function getEmptyEditorState(): ArticleEditorState {
  return {
    title: "",
    displayTitle: "",
    slug: "",
    categoryAssignments: [],
    tagNames: [],
    authorIds: [],
    excerpt: "",
    content: normalizeArticleContent(""),
    descriptionSeo: "",
    focusKeyword: "",
    coverMediaId: "",
    ogTitle: "",
    ogDescription: "",
    ogImageMediaId: "",
    noIndex: false,
    noFollow: false,
    schemaType: "Article",
    ctaBanners: [],
    scheduledPublishAt: "",
    status: "draft",
  };
}

function mapArticleToEditorState(article: ArticleDetailDto): ArticleEditorState {
  return {
    title: article.title ?? "",
    displayTitle: article.displayTitle ?? "",
    slug: article.slug ?? "",
    categoryAssignments: normalizeCategoryAssignments(
      article.categories.map((category) => ({
        rowId: createAssignmentRowId(),
        categoryId: String(category.categoryId),
        score: category.score,
      })),
    ),
    tagNames: article.tags.map((tag) => tag.name),
    authorIds: article.authors
      .filter((author) => !author.isOriginalAuthor)
      .map((author) => author.id),
    excerpt: article.excerpt ?? "",
    content: normalizeArticleContent(article.content),
    descriptionSeo: article.descriptionSeo ?? "",
    focusKeyword: deriveFocusKeyword(article.title ?? ""),
    coverMediaId: article.coverMediaId != null ? String(article.coverMediaId) : "",
    ogTitle: article.ogTitle ?? "",
    ogDescription: article.ogDescription ?? "",
    ogImageMediaId: article.ogImageMediaId != null ? String(article.ogImageMediaId) : "",
    noIndex: article.noIndex,
    noFollow: article.noFollow,
    schemaType: article.schemaType ?? "Article",
    ctaBanners: article.ctaBanners.map(mapCtaBannerToEditorState),
    scheduledPublishAt: toDatetimeLocalInputValue(article.scheduledPublishAt),
    status: article.status === "PUBLISHED" ? "published" : "draft",
  };
}

function validateCategoryAssignmentsForSave(state: ArticleEditorState) {
  const emptyCategoryRow = state.categoryAssignments.find(
    (assignment) => !assignment.categoryId.trim(),
  );

  if (emptyCategoryRow) {
    throw new Error("Sélectionnez une catégorie pour chaque ligne ou supprimez la ligne vide.");
  }

  const categoryIds = state.categoryAssignments.map((assignment) => assignment.categoryId.trim());

  if (new Set(categoryIds).size !== categoryIds.length) {
    throw new Error("Une catégorie d'articles ne peut être sélectionnée qu'une seule fois.");
  }

  if (state.categoryAssignments.some((assignment) => assignment.score <= 0)) {
    throw new Error("Chaque catégorie d'articles doit avoir un score supérieur à 0.");
  }
}

function validateCtaBannersForSave(state: ArticleEditorState) {
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
  validateCategoryAssignmentsForSave(state);
  validateCtaBannersForSave(state);
  const normalizedCategoryAssignments =
    state.categoryAssignments.length === 0
      ? []
      : distributeScores(
          state.categoryAssignments.map((assignment) => assignment.score),
          100,
          1,
        ).map((score, index) => ({
          categoryId: Number(state.categoryAssignments[index].categoryId),
          score,
        }));
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
    displayTitle: state.displayTitle.trim() || null,
    slug: state.slug.trim(),
    tagNames: normalizeOwnedTagNames(state.tagNames),
    authorIds: state.authorIds,
    excerpt: state.excerpt.trim() || null,
    content: normalizeArticleContent(state.content),
    descriptionSeo: state.descriptionSeo.trim() || null,
    categoryAssignments: normalizedCategoryAssignments,
    coverMediaId: state.coverMediaId.trim() ? Number(state.coverMediaId) : null,
    ogTitle: state.ogTitle.trim() || null,
    ogDescription: state.ogDescription.trim() || null,
    ogImageMediaId: state.ogImageMediaId.trim() ? Number(state.ogImageMediaId) : null,
    noIndex: state.noIndex,
    noFollow: state.noFollow,
    schemaType: state.schemaType.trim() || null,
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

  const categoryAssignmentsTotal = useMemo(
    () => getCategoryAssignmentsTotal(state.categoryAssignments),
    [state.categoryAssignments],
  );
  const categoryAssignmentsWillNormalize = useMemo(
    () => state.categoryAssignments.length > 0 && categoryAssignmentsTotal !== 100,
    [categoryAssignmentsTotal, state.categoryAssignments.length],
  );

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

  const setCategoryAssignmentCategory = useCallback((index: number, categoryId: string) => {
    setState((prev) => ({
      ...prev,
      categoryAssignments: prev.categoryAssignments.map((assignment, rowIndex) =>
        rowIndex === index
          ? {
              ...assignment,
              categoryId,
            }
          : assignment,
      ),
    }));
  }, []);

  const setCategoryAssignmentScore = useCallback((index: number, score: number) => {
    setState((prev) => ({
      ...prev,
      categoryAssignments: rebalanceCategoryAssignmentScore(prev.categoryAssignments, index, score),
    }));
  }, []);

  const changeCategoryAssignmentScoreBy = useCallback((index: number, delta: number) => {
    setState((prev) => {
      const current = prev.categoryAssignments[index];

      if (!current) {
        return prev;
      }

      return {
        ...prev,
        categoryAssignments: rebalanceCategoryAssignmentScore(
          prev.categoryAssignments,
          index,
          current.score + delta,
        ),
      };
    });
  }, []);

  const addCategoryAssignment = useCallback(() => {
    setState((prev) => ({
      ...prev,
      categoryAssignments: addCategoryAssignmentRow(prev.categoryAssignments),
    }));
  }, []);

  const removeCategoryAssignment = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      categoryAssignments: removeCategoryAssignmentRow(prev.categoryAssignments, index),
    }));
  }, []);

  const generateSlugFromTitle = useCallback(() => {
    setState((prev) => ({ ...prev, slug: slugify(prev.title) }));
  }, []);

  const syncSmartDerivedFieldsFromTitle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      slug: prev.slug || slugify(prev.title),
      focusKeyword: prev.focusKeyword || deriveFocusKeyword(prev.title),
      displayTitle: prev.displayTitle || prev.title,
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
      const saved = await persistWithDesiredStatus(state.status);
      setNotice(mode === "create" ? "Article created." : "Article saved.");
      return saved;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save"));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [mode, persistWithDesiredStatus, state.status]);

  const publish = useCallback(async () => {
    setIsPublishing(true);
    try {
      const saved = await persistWithDesiredStatus("published");
      setNotice("Article published.");
      return saved;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to publish"));
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [persistWithDesiredStatus]);

  const unpublish = useCallback(async () => {
    setIsUnpublishing(true);
    try {
      const saved = await persistWithDesiredStatus("draft");
      setNotice("Article unpublished.");
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
  }, [persistWithDesiredStatus, state.scheduledPublishAt]);

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
      router.push("/espace/staff/gestion-des-aritcles/articles");
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
    categoryAssignmentsTotal,
    categoryAssignmentsWillNormalize,
    setField,
    setState,
    setCategoryAssignmentCategory,
    setCategoryAssignmentScore,
    changeCategoryAssignmentScoreBy,
    addCategoryAssignment,
    removeCategoryAssignment,
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
