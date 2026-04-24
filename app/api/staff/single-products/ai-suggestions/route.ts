import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI, Type } from "@google/genai";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import {
  normalizeProductAttributeKind,
  PRODUCT_ATTRIBUTES,
} from "@/lib/static_tables/attributes";
import { COLORS } from "@/lib/static_tables/colors";
import { FINISHES } from "@/lib/static_tables/finishes";
import {
  type ArticleDocument,
  getArticlePlainText,
  normalizeArticleContent,
} from "@/features/articles/document";
import type {
  SingleProductAiSuggestionRequest,
  SingleProductAiSuggestionResponse,
} from "@/features/single-products/types";

class SingleProductAiSuggestionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function parseOptionalString(value: unknown) {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function resolvePublicOrigin() {
  const rawHost = (process.env.NEXT_PUBLIC_HOST ?? "").trim();
  const rawPort = (process.env.NEXT_PUBLIC_PORT ?? "").trim().replace(/^"+|"+$/g, "");

  if (!rawHost) {
    return null;
  }

  if (/^https?:\/\//i.test(rawHost)) {
    return rawPort && !new URL(rawHost).port
      ? `${rawHost.replace(/\/$/, "")}:${rawPort}`
      : rawHost.replace(/\/$/, "");
  }

  const protocol =
    rawHost === "localhost" ||
    rawHost === "127.0.0.1" ||
    rawHost.startsWith("192.168.") ||
    rawHost.startsWith("10.") ||
    rawHost.startsWith("172.")
      ? "http"
      : "https";

  const portSegment = rawPort ? `:${rawPort}` : "";
  return `${protocol}://${rawHost}${portSegment}`;
}

function toAbsolutePublicUrl(value: string | null) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const origin = resolvePublicOrigin();
  if (!origin) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${origin}${normalizedPath}`;
}

function parseStringArray(value: unknown, fieldName: string) {
  if (!Array.isArray(value)) {
    throw new SingleProductAiSuggestionError(`Liste invalide pour ${fieldName}.`);
  }

  return value
    .map((entry) => String(entry).trim())
    .filter(Boolean)
    .slice(0, 30);
}

const TAG_STOP_WORDS = new Set([
  "a",
  "au",
  "aux",
  "avec",
  "ce",
  "ces",
  "dans",
  "de",
  "des",
  "du",
  "en",
  "et",
  "la",
  "le",
  "les",
  "ou",
  "par",
  "pour",
  "sur",
  "un",
  "une",
  "d",
  "l",
]);

function normalizeAiTag(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .trim()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalized || TAG_STOP_WORDS.has(normalized)) {
    return "";
  }

  return normalized;
}

function parseTags(value: unknown) {
  const rawTags = parseStringArray(value, "tags");
  const seen = new Set<string>();
  const normalizedTags: string[] = [];

  for (const rawTag of rawTags) {
    const normalizedTag = normalizeAiTag(rawTag);

    if (!normalizedTag || seen.has(normalizedTag)) {
      continue;
    }

    seen.add(normalizedTag);
    normalizedTags.push(normalizedTag);
  }

  return normalizedTags.slice(0, 30);
}

function parseAttributes(value: unknown) {
  if (!Array.isArray(value)) {
    throw new SingleProductAiSuggestionError("Liste invalide pour attributes.");
  }

  const seenKinds = new Set<string>();
  const attributes: SingleProductAiSuggestionResponse["attributes"] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const record = entry as Record<string, unknown>;
    const kind = normalizeProductAttributeKind(parseOptionalString(record.kind));
    const attributeValue = parseOptionalString(record.value);

    if (!kind || !attributeValue || seenKinds.has(kind)) {
      continue;
    }

    seenKinds.add(kind);
    attributes.push({
      kind,
      value: attributeValue,
    });
  }

  return attributes.slice(0, 12);
}

function parseSubcategoryOptions(value: unknown) {
  if (!Array.isArray(value)) {
    throw new SingleProductAiSuggestionError(
      "Liste invalide pour subcategoryOptions.",
    );
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const id = Number(record.id);
      const categoryId = Number(record.categoryId);
      const categoryName = parseOptionalString(record.categoryName);
      const categorySlug = parseOptionalString(record.categorySlug);
      const name = parseOptionalString(record.name);
      const slug = parseOptionalString(record.slug);

      if (
        !Number.isInteger(id) ||
        id <= 0 ||
        !Number.isInteger(categoryId) ||
        categoryId <= 0 ||
        !categoryName ||
        !categorySlug ||
        !name ||
        !slug
      ) {
        return null;
      }

      return {
        id,
        categoryId,
        categoryName,
        categorySlug,
        name,
        slug,
      };
    })
    .filter((option): option is NonNullable<typeof option> => Boolean(option));
}

function parseSubcategoryIds(value: unknown, allowedIds: Set<number>) {
  if (!Array.isArray(value)) {
    throw new SingleProductAiSuggestionError(
      "Liste invalide pour subcategoryIds.",
      502,
    );
  }

  return value
    .map((entry) => Number(entry))
    .filter((id) => Number.isInteger(id) && id > 0 && allowedIds.has(id))
    .slice(0, 12);
}

function parseRequestBody(input: unknown): SingleProductAiSuggestionRequest {
  if (!input || typeof input !== "object") {
    throw new SingleProductAiSuggestionError("Corps de requete invalide.");
  }

  const record = input as Record<string, unknown>;
  const name = parseOptionalString(record.name);

  if (!name) {
    throw new SingleProductAiSuggestionError("Le nom du produit est requis.");
  }

  return {
    name,
    description: parseOptionalString(record.description),
    descriptionSeo: parseOptionalString(record.descriptionSeo),
    tags: parseTags(Array.isArray(record.tags) ? record.tags : []),
    attributes: parseAttributes(record.attributes),
    datasheetUrl: toAbsolutePublicUrl(parseOptionalString(record.datasheetUrl)),
    mediaUrls: parseStringArray(
      Array.isArray(record.mediaUrls) ? record.mediaUrls : [],
      "mediaUrls",
    )
      .map((url) => toAbsolutePublicUrl(url))
      .filter((url): url is string => Boolean(url))
      .slice(0, 8),
    brand: parseOptionalString(record.brand),
    subcategoryOptions: parseSubcategoryOptions(record.subcategoryOptions),
  };
}

function extractJsonObject(value: string) {
  const trimmed = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  return match?.[0] ?? trimmed;
}

function parseAiSuggestions(
  value: string,
  allowedSubcategoryIds: Set<number>,
): SingleProductAiSuggestionResponse {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonObject(value));
  } catch {
    throw new SingleProductAiSuggestionError(
      "La reponse IA n'est pas un JSON valide.",
      502,
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new SingleProductAiSuggestionError("La reponse IA est invalide.", 502);
  }

  const record = parsed as Record<string, unknown>;
  const descriptionText = parseOptionalString(record.descriptionText) ?? "";
  const descriptionInput =
    typeof record.descriptionRichText === "string" ||
    (typeof record.descriptionRichText === "object" &&
      record.descriptionRichText !== null)
      ? (record.descriptionRichText as string | ArticleDocument)
      : descriptionText;
  const normalizedDescriptionRichText = normalizeArticleContent(descriptionInput);
  const hasRenderableRichText =
    getArticlePlainText(normalizedDescriptionRichText).trim().length > 0;
  const descriptionRichText =
    hasRenderableRichText || !descriptionText.trim()
      ? normalizedDescriptionRichText
      : normalizeArticleContent(descriptionText);

  return {
    descriptionText:
      descriptionText || getArticlePlainText(descriptionRichText).trim(),
    descriptionRichText,
    descriptionSeo: parseOptionalString(record.descriptionSeo) ?? "",
    tags: parseTags(Array.isArray(record.tags) ? record.tags : []),
    attributes: parseAttributes(record.attributes),
    subcategoryIds: parseSubcategoryIds(
      Array.isArray(record.subcategoryIds) ? record.subcategoryIds : [],
      allowedSubcategoryIds,
    ),
  };
}

function formatAttributesReference() {
  return PRODUCT_ATTRIBUTES.map(
    (attribute) =>
      `- key: ${attribute.key}; label: ${attribute.label}; unit: ${attribute.unit ?? "none"}`,
  ).join("\n");
}

function formatColorKeysReference() {
  return COLORS.map((color) => `- ${color.key} (${color.label})`).join("\n");
}

function formatFinishKeysReference() {
  return FINISHES.map((finish) => `- ${finish.key} (${finish.label})`).join("\n");
}

function formatSubcategoriesTree(
  subcategoryOptions: SingleProductAiSuggestionRequest["subcategoryOptions"],
) {
  const grouped = new Map<
    string,
    {
      categoryName: string;
      categorySlug: string;
      items: { id: number; name: string; slug: string }[];
    }
  >();

  for (const option of subcategoryOptions) {
    const key = `${option.categoryId}:${option.categorySlug}`;
    const current =
      grouped.get(key) ??
      {
        categoryName: option.categoryName,
        categorySlug: option.categorySlug,
        items: [],
      };

    current.items.push({
      id: option.id,
      name: option.name,
      slug: option.slug,
    });
    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .map((group) => {
      const children = group.items
        .map(
          (item) =>
            `  - id: ${item.id}; name: ${item.name}; slug: ${item.slug}`,
        )
        .join("\n");

      return `- category: ${group.categoryName}; slug: ${group.categorySlug}\n${children}`;
    })
    .join("\n");
}

function buildProductSuggestionPrompt(input: SingleProductAiSuggestionRequest) {
  return (
    "You are preparing a product enrichment JSON payload for a French catalog editor.\n\n" +
    "Important rules:\n" +
    "- Return strict JSON only. No markdown. No code fences. No explanations.\n" +
    "- Your response will be parsed by JSON.parse, so it must be valid JSON.\n" +
    "- The prompt is in English, but every natural-language value in the response must be in French.\n" +
    "- The only allowed top-level JSON shape is:\n" +
    '{"descriptionText":"...","descriptionRichText":{"type":"doc","content":[]},"descriptionSeo":"...","tags":["..."],"attributes":[{"kind":"...","value":"..."}],"subcategoryIds":[1,2]}' +
    "\n- descriptionText must contain the full French description as readable plain text.\n" +
    "\n- descriptionRichText must be a valid TipTap/ProseMirror JSON document with root type \"doc\".\n" +
    "- Use only these rich text nodes/marks: paragraph, heading, bulletList, orderedList, listItem, text, bold, italic, underline.\n" +
    "- descriptionSeo must be concise, professional, in French, and at most 160 characters.\n" +
    "- tags must be useful French SEO tokens, without duplicates.\n" +
    "- Every tag will later be joined using spaces in the database, so each tag item must be a single token without spaces.\n" +
    "- Never return stop words such as: de, des, du, le, la, les, et, pour, avec.\n" +
    "- Prefer lowercase slug-style tokens such as 'carrojoint', 'anthracite-37', 'joint-carrelage', 'mortier-jointoiement'.\n" +
    "- attributes must use only the allowed attribute keys listed below.\n" +
    "- Do not include measurement units inside attribute values. Units are already encoded by the attribute key.\n" +
    "- For FINISH values, use only the exact finish keys listed below.\n" +
    "- For COLOR values, use only the exact color keys listed below.\n" +
    "- If you are unsure about an attribute or subcategory, leave it out.\n" +
    "- Return at most 12 attributes and at most 12 subcategoryIds.\n\n" +
    `Allowed attribute keys:\n${formatAttributesReference()}\n\n` +
    `Allowed finish keys:\n${formatFinishKeysReference()}\n\n` +
    `Allowed color keys:\n${formatColorKeysReference()}\n\n` +
    `Available categories tree:\n${formatSubcategoriesTree(input.subcategoryOptions)}\n\n` +
    `Current product draft:\n${JSON.stringify(
      {
        name: input.name,
        description: input.description,
        descriptionSeo: input.descriptionSeo,
        tags: input.tags,
        attributes: input.attributes,
        datasheetUrl: input.datasheetUrl,
        mediaUrls: input.mediaUrls,
        brand: input.brand,
      },
      null,
      2,
    )}`
  );
}

const systemInstruction =
  "You help enrich product data for a French construction and finishes catalog. " +
  "Return only strict valid JSON, because the response will be parsed by a JSON parser. " +
  "Do not include any prose outside the JSON object. " +
  "All natural-language content inside the JSON must be written in French. " +
  "Use a professional, concrete tone suitable for building materials, sanitary equipment, surfaces, finishes, and home improvement products.";

async function generateWithAnthropic(input: SingleProductAiSuggestionRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new SingleProductAiSuggestionError(
      "ANTHROPIC_API_KEY n'est pas configure.",
      501,
    );
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model:
      process.env.ANTHROPIC_PRODUCT_AI_MODEL ??
      "claude-sonnet-4-5-20250929",
    max_tokens: 1200,
    temperature: 0.2,
    system: systemInstruction,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: buildProductSuggestionPrompt(input),
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new SingleProductAiSuggestionError(
      "Claude n'a retourne aucun texte.",
      502,
    );
  }

  return parseAiSuggestions(
    textBlock.text,
    new Set(input.subcategoryOptions.map((option) => option.id)),
  );
}

async function generateWithGemini(input: SingleProductAiSuggestionRequest) {
  if (!process.env.GEMINI_API_KEY) {
    throw new SingleProductAiSuggestionError(
      "GEMINI_API_KEY n'est pas configure.",
      501,
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_PRODUCT_AI_MODEL ?? "gemini-2.5-flash",
    contents: buildProductSuggestionPrompt(input),
    config: {
      temperature: 0.2,
      maxOutputTokens: 1200,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: [
          "descriptionText",
          "descriptionRichText",
          "descriptionSeo",
          "tags",
          "attributes",
          "subcategoryIds",
        ],
        propertyOrdering: [
          "descriptionText",
          "descriptionRichText",
          "descriptionSeo",
          "tags",
          "attributes",
          "subcategoryIds",
        ],
        properties: {
          descriptionText: {
            type: Type.STRING,
            description:
              "Plain French readable description for fallback and validation.",
          },
          descriptionRichText: {
            type: Type.OBJECT,
            required: ["type", "content"],
            description:
              "Document TipTap/ProseMirror JSON valide pour la description produit.",
            properties: {
              type: {
                type: Type.STRING,
                enum: ["doc"],
              },
              content: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                },
              },
            },
          },
          descriptionSeo: {
            type: Type.STRING,
            description:
              "Meta description SEO en francais, claire, maximum 160 caracteres.",
          },
          tags: {
            type: Type.ARRAY,
            description: "Tags utiles sans doublons.",
            items: {
              type: Type.STRING,
            },
          },
          attributes: {
            type: Type.ARRAY,
            description:
              "Attributs clairement inferables, un seul attribut par kind.",
            items: {
              type: Type.OBJECT,
              required: ["kind", "value"],
              properties: {
                kind: {
                  type: Type.STRING,
                },
                value: {
                  type: Type.STRING,
                },
              },
            },
          },
          subcategoryIds: {
            type: Type.ARRAY,
            description:
              "IDs of the best matching subcategories chosen from the provided category tree.",
            items: {
              type: Type.INTEGER,
            },
          },
        },
      },
      systemInstruction,
    },
  });

  if (!response.text) {
    throw new SingleProductAiSuggestionError(
      "Gemini n'a retourne aucun texte.",
      502,
    );
  }

  return parseAiSuggestions(
    response.text,
    new Set(input.subcategoryOptions.map((option) => option.id)),
  );
}

async function generateAiSuggestions(input: SingleProductAiSuggestionRequest) {
  const provider = (process.env.PRODUCT_AI_PROVIDER ?? "anthropic")
    .trim()
    .toLocaleLowerCase("en-US");

  switch (provider) {
    case "gemini":
    case "google":
      return generateWithGemini(input);
    case "anthropic":
    case "claude":
      return generateWithAnthropic(input);
    default:
      throw new SingleProductAiSuggestionError(
        `Fournisseur IA non supporte: ${provider}.`,
        501,
      );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);

    if (!canCreateProducts(session) && !canManageProducts(session)) {
      throw new SingleProductAiSuggestionError("Acces refuse.", 403);
    }

    const input = parseRequestBody(await req.json());
    const suggestions = await generateAiSuggestions(input);

    return NextResponse.json({ ok: true, suggestions }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof SingleProductAiSuggestionError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("SINGLE_PRODUCT_AI_SUGGESTIONS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
