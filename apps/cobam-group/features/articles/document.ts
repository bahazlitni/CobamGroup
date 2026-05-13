import type { JSONContent } from "@tiptap/core";

export type ArticleDocument = JSONContent;

const EMPTY_PARAGRAPH: JSONContent = {
  type: "paragraph",
};

const EMPTY_ARTICLE_DOCUMENT: ArticleDocument = {
  type: "doc",
  content: [EMPTY_PARAGRAPH],
};

const BLOCK_BREAK_TYPES = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "bulletList",
  "orderedList",
  "listItem",
  "table",
  "tableRow",
  "tableCell",
  "tableHeader",
  "horizontalRule",
]);

function cloneDocument<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isArticleDocument(value: unknown): value is ArticleDocument {
  return (
    isRecord(value) &&
    typeof value.type === "string" &&
    value.type === "doc"
  );
}

function normalizeDocument(document: ArticleDocument): ArticleDocument {
  const cloned = cloneDocument(document);
  const content = Array.isArray(cloned.content) ? cloned.content : [];

  return {
    ...cloned,
    type: "doc",
    content: content.length > 0 ? content : [cloneDocument(EMPTY_PARAGRAPH)],
  };
}

function createParagraph(text: string): JSONContent {
  return {
    type: "paragraph",
    content: text
      ? [
          {
            type: "text",
            text,
          },
        ]
      : [],
  };
}

function textToDocument(value: string): ArticleDocument {
  const normalized = value.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return createEmptyArticleDocument();
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .flatMap((chunk) =>
      chunk
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    );

  if (paragraphs.length === 0) {
    return createEmptyArticleDocument();
  }

  return {
    type: "doc",
    content: paragraphs.map(createParagraph),
  };
}

function collectPlainText(node: JSONContent, parts: string[]) {
  if (node.type === "text" && typeof node.text === "string") {
    parts.push(node.text);
  }

  if (node.type === "hardBreak") {
    parts.push("\n");
  }

  if (node.type === "image") {
    const altText =
      isRecord(node.attrs) && typeof node.attrs.alt === "string"
        ? node.attrs.alt.trim()
        : "";

    if (altText) {
      parts.push(` ${altText} `);
    }
  }

  if (Array.isArray(node.content)) {
    node.content.forEach((child) => collectPlainText(child, parts));
  }

  if (BLOCK_BREAK_TYPES.has(node.type ?? "")) {
    parts.push("\n");
  }
}

function getImageMediaIdFromNode(node: JSONContent): number | null {
  if (node.type !== "image" || !isRecord(node.attrs)) {
    return null;
  }

  const mediaIdValue = node.attrs.mediaId;
  if (typeof mediaIdValue === "string" && /^\d+$/.test(mediaIdValue)) {
    return Number(mediaIdValue);
  }

  if (typeof mediaIdValue === "number" && Number.isInteger(mediaIdValue)) {
    return mediaIdValue;
  }

  const srcValue = node.attrs.src;
  if (typeof srcValue === "string") {
    const match = srcValue.match(/\/api\/(?:staff\/medias|media)\/(\d+)\/file/);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

function getNodePlainText(node: JSONContent): string {
  const parts: string[] = [];

  collectPlainText(node, parts);

  return parts
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function createEmptyArticleDocument(): ArticleDocument {
  return cloneDocument(EMPTY_ARTICLE_DOCUMENT);
}

export function parseArticleContent(
  value: string | ArticleDocument | null | undefined,
): ArticleDocument {
  if (!value) {
    return createEmptyArticleDocument();
  }

  if (isArticleDocument(value)) {
    return normalizeDocument(value);
  }

  if (typeof value !== "string") {
    return createEmptyArticleDocument();
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (isArticleDocument(parsed)) {
      return normalizeDocument(parsed);
    }
  } catch {
    // Legacy plain text is converted into paragraphs.
  }

  return textToDocument(value);
}

export function serializeArticleContent(document: ArticleDocument): string {
  return JSON.stringify(normalizeDocument(document));
}

export function normalizeArticleContent(
  value: string | ArticleDocument | null | undefined,
): string {
  return serializeArticleContent(parseArticleContent(value));
}

export function isArticleDocumentEmpty(
  value: string | ArticleDocument | null | undefined,
): boolean {
  const document = parseArticleContent(value);
  const plainText = getArticlePlainText(document);

  return plainText.length === 0;
}

export function getArticlePlainText(
  value: string | ArticleDocument | null | undefined,
): string {
  const document = parseArticleContent(value);

  return getNodePlainText(document);
}

export function getArticleFirstParagraphText(
  value: string | ArticleDocument | null | undefined,
): string {
  const document = parseArticleContent(value);
  const topLevelNodes = Array.isArray(document.content) ? document.content : [];

  for (const node of topLevelNodes) {
    const text = getNodePlainText(node);

    if (text) {
      return text;
    }
  }

  return "";
}

export function extractArticleMediaIds(
  value: string | ArticleDocument | null | undefined,
): number[] {
  const document = parseArticleContent(value);
  const mediaIds = new Set<number>();

  const walk = (node: JSONContent) => {
    const mediaId = getImageMediaIdFromNode(node);

    if (mediaId != null && Number.isInteger(mediaId) && mediaId > 0) {
      mediaIds.add(mediaId);
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  };

  walk(document);

  return [...mediaIds];
}

export function replaceArticleImageSources(
  value: string | ArticleDocument | null | undefined,
  buildSrc: (mediaId: number) => string,
): string {
  const document = cloneDocument(parseArticleContent(value));

  const walk = (node: JSONContent) => {
    const mediaId = getImageMediaIdFromNode(node);

    if (node.type === "image" && mediaId != null) {
      node.attrs = {
        ...(isRecord(node.attrs) ? node.attrs : {}),
        mediaId: String(mediaId),
        src: buildSrc(mediaId),
      };
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  };

  walk(document);

  return serializeArticleContent(document);
}
