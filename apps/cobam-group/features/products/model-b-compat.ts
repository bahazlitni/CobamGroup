import { Prisma, type ProductLifecycle } from "@prisma/client";

export type RichTextDescriptionValue = Prisma.JsonValue | null | undefined;

export function stringToRichTextDescription(value: string | null | undefined) {
  const text = value?.trim();

  if (!text) {
    return Prisma.DbNull;
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text,
          },
        ],
      },
    ],
  } satisfies Prisma.InputJsonObject;
}

function readRichTextNodeText(value: unknown): string {
  if (typeof value === "string") {
    const parsed = parseMaybeJsonString(value);

    if (parsed !== value) {
      return readRichTextNodeText(parsed);
    }

    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const record = value as { text?: unknown; content?: unknown };

  if (typeof record.text === "string") {
    return record.text;
  }

  if (Array.isArray(record.content)) {
    return record.content.map(readRichTextNodeText).join("");
  }

  return "";
}

function parseMaybeJsonString(value: string, depth = 0): unknown {
  if (depth >= 3) {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed || !/^[{["]/.test(trimmed)) {
    return value;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (typeof parsed === "string") {
      return parseMaybeJsonString(parsed, depth + 1);
    }

    return parsed;
  } catch {
    return value;
  }
}

export function richTextDescriptionToString(value: RichTextDescriptionValue) {
  return readRichTextNodeText(value).trim() || null;
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
