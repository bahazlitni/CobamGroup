import { Prisma, type ProductLifecycle } from "@prisma/client";
import {
  getArticlePlainText,
  normalizeArticleContent,
  parseArticleContent,
  type ArticleDocument,
} from "@/features/articles/document";

export type RichTextDescriptionValue = Prisma.JsonValue | null | undefined;

export function stringToRichTextDescription(value: string | null | undefined) {
  const text = getArticlePlainText(value ?? "").trim();

  if (!text) {
    return Prisma.DbNull;
  }

  return parseArticleContent(value ?? "") as Prisma.InputJsonObject;
}

function toArticleDocumentInput(value: RichTextDescriptionValue): string | ArticleDocument | null {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as ArticleDocument;
  }

  return null;
}

export function richTextDescriptionToString(value: RichTextDescriptionValue) {
  return getArticlePlainText(toArticleDocumentInput(value)).trim() || null;
}

export function richTextDescriptionToEditorValue(value: RichTextDescriptionValue) {
  const input = toArticleDocumentInput(value);

  if (!getArticlePlainText(input).trim()) {
    return null;
  }

  return normalizeArticleContent(input);
}

export function productLifecycleFromVisibility(record: {
  visibleEcommerce: boolean;
  visibleVitrine: boolean;
}): ProductLifecycle {
  return record.visibleEcommerce || record.visibleVitrine ? "ACTIVE" : "DRAFT";
}

export function visibilityFromProductLifecycle(lifecycle: ProductLifecycle | null | undefined) {
  const visible = lifecycle !== "DRAFT";

  return {
    visibleEcommerce: visible,
    visibleVitrine: visible,
  };
}

export function productBrandLabel(brand: { name: string } | null | undefined) {
  return brand?.name || null;
}
