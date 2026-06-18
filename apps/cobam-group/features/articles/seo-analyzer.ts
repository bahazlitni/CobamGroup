import type { ArticleStatus } from "@prisma/client";
import type { JSONContent } from "@tiptap/core";
import { getArticlePlainText, parseArticleContent } from "./document";

export type ArticleSeoStatus = "SEO_READY" | "NEEDS_IMPROVEMENT" | "NOT_READY";

export type ArticleSeoFeedbackItem = {
  code: string;
  message: string;
};

export type ArticleSeoSearchPreview = {
  title: string;
  url: string;
  description: string;
};

export type ArticleSeoComparisonArticle = {
  id: number;
  slug: string;
  title: string;
  titleSeo: string | null;
  descriptionSeo: string | null;
  focusKeyword: string | null;
  introductionContent?: string | null;
  bodyContent?: string | null;
  conclusionContent?: string | null;
  faqQuestions?: Array<{
    question?: string | null;
    content?: string | null;
  }>;
};

export type ArticleSeoAnalyzerInput = {
  id?: number | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  introductionContent: string;
  bodyContent: string;
  conclusionContent: string;
  faqQuestions?: Array<{
    question?: string | null;
    content: string;
  }>;
  titleSeo?: string | null;
  descriptionSeo?: string | null;
  focusKeyword?: string | null;
  status?: ArticleStatus | "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  noIndex?: boolean;
  categoryName?: string | null;
  coverMediaId?: number | null;
  coverImageAlt?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageMediaId?: number | null;
  publicUrl?: string | null;
  mode?: "publish" | "public";
  existingArticles?: ArticleSeoComparisonArticle[];
};

export type ArticleSeoAnalyzerResult = {
  status: ArticleSeoStatus;
  score: number;
  criticalIssues: ArticleSeoFeedbackItem[];
  warnings: ArticleSeoFeedbackItem[];
  passedChecks: ArticleSeoFeedbackItem[];
  recommendations: ArticleSeoFeedbackItem[];
  searchPreview: ArticleSeoSearchPreview;
};

type DocumentStats = {
  headings: Array<{ level: number; text: string }>;
  links: Array<{ href: string; text: string }>;
  images: Array<{ alt: string | null; mediaId: number | null }>;
  paragraphTexts: string[];
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function lower(value: string | null | undefined) {
  return normalizeText(value).toLocaleLowerCase("fr-FR");
}

function countWords(value: string) {
  return normalizeText(value).split(/\s+/).filter(Boolean).length;
}

function isSlugValid(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function collectDocumentStats(contents: readonly string[]): DocumentStats {
  const headings: DocumentStats["headings"] = [];
  const links: DocumentStats["links"] = [];
  const images: DocumentStats["images"] = [];
  const paragraphTexts: string[] = [];

  const textFromNode = (node: JSONContent): string => {
    if (node.type === "text" && typeof node.text === "string") {
      return node.text;
    }

    return Array.isArray(node.content) ? node.content.map(textFromNode).join(" ") : "";
  };

  const walk = (node: JSONContent) => {
    const text = normalizeText(textFromNode(node));

    if (node.type === "heading" && node.attrs && typeof node.attrs.level === "number") {
      headings.push({ level: node.attrs.level, text });
    }

    if (node.type === "paragraph" && text) {
      paragraphTexts.push(text);
    }

    if (node.type === "image") {
      const attrs = node.attrs && typeof node.attrs === "object" ? node.attrs : {};
      const alt = typeof attrs.alt === "string" ? normalizeText(attrs.alt) : null;
      const mediaId =
        typeof attrs.mediaId === "number"
          ? attrs.mediaId
          : typeof attrs.mediaId === "string" && /^\d+$/.test(attrs.mediaId)
            ? Number(attrs.mediaId)
            : null;

      images.push({ alt, mediaId });
    }

    if (node.marks?.length && text) {
      node.marks.forEach((mark) => {
        if (mark.type === "link") {
          const href = mark.attrs?.href;
          if (typeof href === "string" && href.trim()) {
            links.push({ href: href.trim(), text });
          }
        }
      });
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  };

  contents.forEach((content) => {
    walk(parseArticleContent(content));
  });

  return { headings, links, images, paragraphTexts };
}

function makeItem(code: string, message: string): ArticleSeoFeedbackItem {
  return { code, message };
}

function getAnalyzerContents(input: ArticleSeoAnalyzerInput) {
  return [
    input.introductionContent,
    input.bodyContent,
    input.conclusionContent,
    ...(input.faqQuestions ?? []).map((item) => item.content),
  ];
}

export function analyzeArticleSeoStatus(input: ArticleSeoAnalyzerInput): ArticleSeoStatus {
  const title = normalizeText(input.title);
  const titleSeo = normalizeText(input.titleSeo) || title;
  const descriptionSeo = normalizeText(input.descriptionSeo);
  const focusKeyword = normalizeText(input.focusKeyword);
  const slug = normalizeText(input.slug);
  const publicUrl = input.publicUrl || (slug ? `/actualites/${slug}` : "");
  const existingArticles = input.existingArticles ?? [];

  if (
    (input.mode === "public" && input.status !== "PUBLISHED") ||
    input.status === "ARCHIVED" ||
    input.noIndex ||
    !slug ||
    !isSlugValid(slug) ||
    existingArticles.some((article) => article.slug === slug) ||
    !publicUrl ||
    !publicUrl.startsWith("/actualites/") ||
    !title ||
    !descriptionSeo
  ) {
    return "NOT_READY";
  }

  const documentContents = getAnalyzerContents(input);
  const introductionText = getArticlePlainText(input.introductionContent);
  const bodyText = getArticlePlainText(input.bodyContent);
  const plainText = documentContents
    .map((content) => getArticlePlainText(content))
    .filter(Boolean)
    .join(" ");
  const wordCount = countWords(plainText);

  if (!plainText || wordCount < 120 || !bodyText || countWords(bodyText) < 80) {
    return "NOT_READY";
  }

  const stats = collectDocumentStats(documentContents);
  const h2Count = stats.headings.filter((heading) => heading.level === 2).length;
  const brokenHierarchy = stats.headings.some((heading, index) => {
    const previous = stats.headings[index - 1];
    return previous && heading.level - previous.level > 1;
  });
  const internalLinks = stats.links.filter((link) => link.href.startsWith("/"));
  const externalLinks = stats.links.filter((link) => /^https?:\/\//i.test(link.href));

  const scoreParts = [
    Math.min(15, (isSlugValid(slug) ? 5 : 0) + (publicUrl ? 5 : 0) + 5),
    Math.min(
      15,
      (titleSeo ? 4 : 0) +
        (titleSeo.length >= 35 && titleSeo.length <= 60 ? 4 : 0) +
        (descriptionSeo ? 4 : 0) +
        (descriptionSeo.length >= 120 && descriptionSeo.length <= 160 ? 3 : 0),
    ),
    Math.min(
      15,
      (focusKeyword ? 4 : 0) +
        (focusKeyword && lower(titleSeo || title).includes(lower(focusKeyword)) ? 4 : 0) +
        (focusKeyword && lower(introductionText).includes(lower(focusKeyword)) ? 4 : 0) +
        (focusKeyword && lower(plainText).includes(lower(focusKeyword)) ? 3 : 0),
    ),
    Math.min(25, (wordCount >= 500 ? 10 : 0) + (wordCount >= 800 ? 8 : 0) + 7),
    Math.min(10, (h2Count > 0 || wordCount <= 500 ? 5 : 0) + (!brokenHierarchy ? 5 : 0)),
    Math.min(7, (internalLinks.length > 0 ? 5 : 0) + (externalLinks.length > 0 ? 2 : 0)),
    Math.min(
      5,
      (input.coverMediaId ? 3 : 0) + (input.ogImageMediaId || input.coverMediaId ? 2 : 0),
    ),
    Math.min(5, titleSeo && (descriptionSeo || input.excerpt) && publicUrl ? 5 : 0),
    Math.min(3, input.categoryName ? 3 : 0),
  ];
  const score = Math.max(
    0,
    Math.min(
      100,
      scoreParts.reduce((sum, part) => sum + part, 0),
    ),
  );

  return score >= 80 ? "SEO_READY" : "NEEDS_IMPROVEMENT";
}

export function analyzeArticleSeo(input: ArticleSeoAnalyzerInput): ArticleSeoAnalyzerResult {
  const title = normalizeText(input.title);
  const titleSeo = normalizeText(input.titleSeo) || title;
  const descriptionSeo = normalizeText(input.descriptionSeo);
  const focusKeyword = normalizeText(input.focusKeyword);
  const slug = normalizeText(input.slug);
  const documentContents = getAnalyzerContents(input);
  const introductionText = getArticlePlainText(input.introductionContent);
  const bodyText = getArticlePlainText(input.bodyContent);
  const conclusionText = getArticlePlainText(input.conclusionContent);
  const hasFaq = (input.faqQuestions ?? []).some((item) => getArticlePlainText(item.content));
  const plainText = documentContents
    .map((content) => getArticlePlainText(content))
    .filter(Boolean)
    .join(" ");
  const stats = collectDocumentStats(documentContents);
  const wordCount = countWords(plainText);
  const publicUrl = input.publicUrl || (slug ? `/actualites/${slug}` : "");
  const existingArticles = input.existingArticles ?? [];

  const criticalIssues: ArticleSeoFeedbackItem[] = [];
  const warnings: ArticleSeoFeedbackItem[] = [];
  const passedChecks: ArticleSeoFeedbackItem[] = [];
  const recommendations: ArticleSeoFeedbackItem[] = [];

  const addPass = (code: string, message: string) => passedChecks.push(makeItem(code, message));
  const addWarning = (code: string, message: string) => warnings.push(makeItem(code, message));
  const addCritical = (code: string, message: string) =>
    criticalIssues.push(makeItem(code, message));
  const addRecommendation = (code: string, message: string) =>
    recommendations.push(makeItem(code, message));

  if (input.mode === "public" && input.status !== "PUBLISHED") {
    addCritical("status.public", "L'article n'est pas publié.");
  } else if (input.status === "ARCHIVED") {
    addCritical("status.archived", "Un article archivé ne peut pas être publié.");
  } else {
    addPass("status.publishable", "Le statut permet une publication après validation.");
  }

  if (input.noIndex) {
    addCritical("indexability.no_index", "L'option noIndex empêche l'indexation.");
  } else {
    addPass("indexability.indexable", "L'article est autorisé à l'indexation.");
  }

  if (!slug) {
    addCritical("slug.missing", "Le slug est obligatoire.");
  } else if (!isSlugValid(slug)) {
    addCritical("slug.invalid", "Le slug doit être en minuscules, sans espaces, avec des tirets.");
  } else {
    addPass("slug.valid", "Le slug est propre et lisible.");
  }

  if (slug.length > 80) {
    addWarning("slug.long", "Le slug est long : raccourcissez-le si possible.");
  }

  const duplicateSlug = existingArticles.find((article) => article.slug === slug);
  if (duplicateSlug) {
    addCritical("slug.duplicate", `Un autre article utilise déjà ce slug (#${duplicateSlug.id}).`);
  }

  if (!publicUrl || !publicUrl.startsWith("/actualites/")) {
    addCritical(
      "url.invalid",
      "L'URL publique de l'article ne peut pas être générée correctement.",
    );
  } else {
    addPass("url.valid", "L'URL publique peut être générée.");
  }

  if (!title) {
    addCritical("title.missing", "Le titre de l'article est obligatoire.");
  } else {
    addPass("title.present", "Le titre éditorial est renseigné.");
  }

  if (!plainText || wordCount < 120) {
    addCritical("content.missing_or_too_thin", "Le contenu est absent ou trop court pour publier.");
  } else {
    addPass("content.present", "Le contenu contient une base exploitable.");
  }

  if (introductionText) {
    addPass("content.introduction", "L'introduction est renseignée.");
  } else {
    addWarning("content.introduction_missing", "Ajoutez une introduction courte et claire.");
  }

  if (!bodyText || countWords(bodyText) < 80) {
    addCritical("content.body_missing", "Le corps de l'article est absent ou trop court.");
  } else {
    addPass("content.body", "Le corps de l'article contient une base exploitable.");
  }

  if (conclusionText) {
    addPass("content.conclusion", "La conclusion est renseignée.");
  } else {
    addWarning("content.conclusion_missing", "Ajoutez une conclusion pour fermer l'article.");
  }

  if (hasFaq) {
    addPass("content.faq", "La FAQ est renseignée.");
  }

  if (wordCount < 500) {
    addWarning("content.thin", "Moins de 500 mots : l'article risque d'être léger pour le SEO.");
  } else if (wordCount >= 800) {
    addPass("content.depth", "La profondeur de contenu est solide pour un article standard.");
  }

  if (wordCount >= 1200) {
    addPass("content.competitive_depth", "La longueur convient à un guide plus concurrentiel.");
  }

  if (!descriptionSeo) {
    addCritical("description.missing", "La description SEO est obligatoire pour publier.");
    addRecommendation(
      "description.write",
      "Rédigez une description SEO claire avant de demander la validation.",
    );
  }

  if (titleSeo.length >= 35 && titleSeo.length <= 60) {
    addPass("title_seo.length", "Le titre SEO est dans la plage recommandée.");
  } else if (titleSeo.length < 25 || titleSeo.length > 65) {
    addWarning("title_seo.length", "Visez un titre SEO entre 35 et 60 caractères.");
  }

  if (descriptionSeo.length >= 120 && descriptionSeo.length <= 160) {
    addPass("description.length", "La description SEO est dans la plage recommandée.");
  } else if (descriptionSeo && (descriptionSeo.length < 90 || descriptionSeo.length > 170)) {
    addWarning("description.length", "Visez une description SEO entre 120 et 160 caractères.");
  }

  if (focusKeyword) {
    const keyword = lower(focusKeyword);
    const keywordInTitle = lower(titleSeo || title).includes(keyword);
    const keywordInIntro = lower(introductionText).includes(keyword);
    const keywordInHeading = stats.headings.some((heading) =>
      lower(heading.text).includes(keyword),
    );
    const keywordInBody = lower(plainText).includes(keyword);

    if (keywordInTitle)
      addPass("keyword.title", "Le mot-clé apparaît naturellement dans le titre.");
    else
      addWarning(
        "keyword.title",
        "Ajoutez le mot-clé principal dans le titre si cela reste naturel.",
      );

    if (keywordInIntro) addPass("keyword.intro", "Le mot-clé est présent dans l'introduction.");
    else addWarning("keyword.intro", "L'introduction devrait mentionner le mot-clé principal.");

    if (keywordInHeading || keywordInBody) {
      addPass("keyword.body", "Le mot-clé apparaît dans le corps de l'article.");
    } else {
      addWarning("keyword.body", "Le mot-clé n'apparaît pas dans les sections de l'article.");
    }
  } else {
    addWarning("keyword.missing", "Ajoutez un mot-clé principal pour guider l'analyse SEO.");
    addRecommendation(
      "keyword.define",
      "Renseignez un mot-clé principal validé par l'équipe éditoriale.",
    );
  }

  const duplicateTitle = existingArticles.find(
    (article) => lower(article.titleSeo || article.title) === lower(titleSeo),
  );
  if (duplicateTitle) {
    addWarning(
      "title_seo.duplicate",
      `Titre SEO proche d'un autre article (#${duplicateTitle.id}).`,
    );
  }

  const duplicateDescription = descriptionSeo
    ? existingArticles.find((article) => lower(article.descriptionSeo) === lower(descriptionSeo))
    : null;
  if (duplicateDescription) {
    addWarning(
      "description.duplicate",
      `Description SEO identique à un autre article (#${duplicateDescription.id}).`,
    );
  }

  const cannibalized = focusKeyword
    ? existingArticles.find((article) => lower(article.focusKeyword) === lower(focusKeyword))
    : null;
  if (cannibalized) {
    addWarning(
      "keyword.cannibalization",
      `Un autre article cible déjà ce mot-clé (#${cannibalized.id}).`,
    );
  }

  const h1Count = stats.headings.filter((heading) => heading.level === 1).length;
  const h2Count = stats.headings.filter((heading) => heading.level === 2).length;

  if (h1Count > 1) {
    addWarning("headings.multiple_h1", "Gardez un seul H1 : le titre de page sert déjà de H1.");
  } else {
    addPass("headings.h1", "La structure H1 est compatible avec le rendu public.");
  }

  if (wordCount > 500 && h2Count === 0) {
    addWarning("headings.no_h2", "Ajoutez des H2 pour structurer les longues lectures.");
    addRecommendation(
      "headings.add_h2",
      "Découpez le corps de l'article avec des titres H2 lisibles.",
    );
  } else if (h2Count > 0) {
    addPass("headings.h2", "L'article contient des sections H2.");
  }

  const brokenHierarchy = stats.headings.some((heading, index) => {
    const previous = stats.headings[index - 1];
    return previous && heading.level - previous.level > 1;
  });
  if (brokenHierarchy) {
    addWarning("headings.hierarchy", "La hiérarchie des titres saute un niveau.");
  }

  const internalLinks = stats.links.filter((link) => link.href.startsWith("/"));
  const externalLinks = stats.links.filter((link) => /^https?:\/\//i.test(link.href));

  if (internalLinks.length >= 2 && internalLinks.length <= 5) {
    addPass("links.internal", "Le maillage interne est bien dosé.");
  } else if (internalLinks.length === 0) {
    addWarning("links.internal_missing", "Ajoutez 2 à 5 liens internes pertinents.");
    addRecommendation(
      "links.add_internal",
      "Ajoutez au moins deux liens internes vers des pages ou articles COBAM utiles.",
    );
  } else if (internalLinks.length > 5) {
    addWarning(
      "links.internal_many",
      "Le nombre de liens internes est élevé : gardez les plus utiles.",
    );
  }

  if (externalLinks.length > 0) {
    addPass("links.external", "L'article cite au moins une ressource externe.");
  }

  if (input.coverMediaId) {
    addPass("images.cover", "Une image de couverture est sélectionnée.");
  } else {
    addWarning("images.cover_missing", "Ajoutez une image de couverture.");
    addRecommendation("images.cover", "Sélectionnez une image de couverture avant publication.");
  }

  if (stats.images.some((image) => image.alt === "" || image.alt == null)) {
    addWarning("images.alt_missing", "Certaines images intégrées n'ont pas de texte alternatif.");
  }

  if (input.ogImageMediaId || input.coverMediaId) {
    addPass("images.og", "Une image Open Graph peut être générée.");
  } else {
    addWarning("images.og_missing", "Ajoutez une image OG ou une couverture pour les partages.");
  }

  if (input.categoryName) {
    addPass("category.present", "La catégorie est renseignée.");
  } else {
    addWarning("category.missing", "Associez une catégorie à l'article.");
    addRecommendation("category.assign", "Associez l'article à une catégorie éditoriale.");
  }

  if (titleSeo && (descriptionSeo || input.excerpt) && publicUrl) {
    addPass("schema.ready", "Les données nécessaires au JSON-LD BlogPosting sont disponibles.");
  } else {
    addWarning("schema.incomplete", "Complétez titre, description et URL pour un JSON-LD robuste.");
  }

  const scoreParts = [
    Math.min(15, (input.noIndex ? 0 : 5) + (isSlugValid(slug) ? 5 : 0) + (publicUrl ? 5 : 0)),
    Math.min(
      15,
      (titleSeo ? 4 : 0) +
        (titleSeo.length >= 35 && titleSeo.length <= 60 ? 4 : 0) +
        (descriptionSeo ? 4 : 0) +
        (descriptionSeo.length >= 120 && descriptionSeo.length <= 160 ? 3 : 0),
    ),
    Math.min(
      15,
      (focusKeyword ? 4 : 0) +
        (focusKeyword && lower(titleSeo || title).includes(lower(focusKeyword)) ? 4 : 0) +
        (focusKeyword && lower(introductionText).includes(lower(focusKeyword)) ? 4 : 0) +
        (focusKeyword && lower(plainText).includes(lower(focusKeyword)) ? 3 : 0),
    ),
    Math.min(25, (wordCount >= 500 ? 10 : 0) + (wordCount >= 800 ? 8 : 0) + (plainText ? 7 : 0)),
    Math.min(10, (h2Count > 0 || wordCount <= 500 ? 5 : 0) + (!brokenHierarchy ? 5 : 0)),
    Math.min(7, (internalLinks.length > 0 ? 5 : 0) + (externalLinks.length > 0 ? 2 : 0)),
    Math.min(
      5,
      (input.coverMediaId ? 3 : 0) + (input.ogImageMediaId || input.coverMediaId ? 2 : 0),
    ),
    Math.min(5, titleSeo && (descriptionSeo || input.excerpt) && publicUrl ? 5 : 0),
    Math.min(3, input.categoryName ? 3 : 0),
  ];

  const score = Math.max(
    0,
    Math.min(
      100,
      scoreParts.reduce((sum, part) => sum + part, 0),
    ),
  );
  const status: ArticleSeoStatus =
    criticalIssues.length > 0 ? "NOT_READY" : score >= 80 ? "SEO_READY" : "NEEDS_IMPROVEMENT";

  return {
    status,
    score,
    criticalIssues,
    warnings,
    passedChecks,
    recommendations,
    searchPreview: {
      title: titleSeo || title || "Titre de l'article",
      url: publicUrl || "/actualites/slug-de-l-article",
      description:
        descriptionSeo ||
        normalizeText(input.excerpt) ||
        "Ajoutez une description SEO claire pour cet article.",
    },
  };
}
