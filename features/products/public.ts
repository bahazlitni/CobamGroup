import { Prisma } from "@prisma/client";
import { getArticlePlainText } from "@/features/articles/document";
import { makeMediaPublicMany } from "@/features/media/repository";
import { prisma } from "@/lib/server/db/prisma";
import {
  formatProductAttributeKind,
  getProductAttributeUnit,
  normalizeProductAttributeKind,
  resolveProductAttribute,
} from "@/lib/static_tables/attributes";
import { formatProductBrandValue } from "@/lib/static_tables/brands";
import { COLORS } from "@/lib/static_tables/colors";
import {
  resolveFinish,
} from "@/lib/static_tables/finishes";
import type {
  PublicProductColorReference,
  PublicProductFinishReference,
  PublicProductInspector,
  PublicProductInspectorAttribute,
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
  PublicProductListResult,
  PublicProductSubcategoryLink,
  PublicProductSummary,
  PublicSimpleProductInspector,
} from "./types";

export type {
  PublicProductColorReference,
  PublicProductFinishReference,
  PublicProductInspector,
  PublicProductInspectorAttribute,
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
  PublicProductListResult,
  PublicProductSubcategoryLink,
  PublicProductSummary,
  PublicSimpleProductInspector,
} from "./types";

export const PUBLIC_PRODUCTS_PAGE_SIZE = 24;

const MEDIA_SELECT = {
  id: true,
  kind: true,
  title: true,
  altText: true,
  mimeType: true,
  isActive: true,
  deletedAt: true,
} satisfies Prisma.MediaSelect;

const PUBLIC_PRODUCT_SELECT = {
  id: true,
  sku: true,
  slug: true,
  kind: true,
  name: true,
  description: true,
  descriptionSeo: true,
  brandCode: true,
  basePriceAmount: true,
  vatRate: true,
  visibility: true,
  priceVisibility: true,
  stockVisibility: true,
  lifecycle: true,
  commercialMode: true,
  tags: true,
  subcategoryLinks: {
    select: {
      subcategory: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  },
  mediaLinks: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      media: {
        select: MEDIA_SELECT,
      },
    },
  },
  attributes: {
    orderBy: [{ sortOrder: "asc" }, { kind: "asc" }],
    select: {
      kind: true,
      value: true,
      sortOrder: true,
    },
  },
} satisfies Prisma.ProductSelect;

const PACK_COMPONENT_SELECT = {
  id: true,
  sku: true,
  slug: true,
  kind: true,
  name: true,
  description: true,
  descriptionSeo: true,
  brandCode: true,
  basePriceAmount: true,
  vatRate: true,
  visibility: true,
  priceVisibility: true,
  stockVisibility: true,
  lifecycle: true,
  commercialMode: true,
  tags: true,
} satisfies Prisma.ProductSelect;

const PUBLIC_PACK_SELECT = {
  ...PUBLIC_PRODUCT_SELECT,
  packLinesAsPack: {
    orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
    select: {
      quantity: true,
      product: {
        select: PACK_COMPONENT_SELECT,
      },
    },
  },
} satisfies Prisma.ProductSelect;

const PUBLIC_FAMILY_SELECT = {
  id: true,
  name: true,
  slug: true,
  subtitle: true,
  description: true,
  descriptionSeo: true,
  mainImageMediaId: true,
  defaultProductId: true,
  mainImage: {
    select: MEDIA_SELECT,
  },
  members: {
    orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
    select: {
      sortOrder: true,
      product: {
        select: PUBLIC_PRODUCT_SELECT,
      },
    },
  },
} satisfies Prisma.ProductFamilySelect;

type PublicFamilyRecord = Prisma.ProductFamilyGetPayload<{
  select: typeof PUBLIC_FAMILY_SELECT;
}>;

type PublicProductRecord = Prisma.ProductGetPayload<{
  select: typeof PUBLIC_PRODUCT_SELECT;
}>;

type PublicPackRecord = Prisma.ProductGetPayload<{
  select: typeof PUBLIC_PACK_SELECT;
}>;

function normalizeComparableValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildPublicMediaUrl(mediaId: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function isRenderableMedia(input: {
  id: bigint;
  isActive: boolean;
  deletedAt: Date | null;
}) {
  return input.isActive && input.deletedAt == null;
}

function mapMediaRecord(
  media: { id: bigint; kind: "IMAGE" | "VIDEO" | "DOCUMENT"; title: string | null; altText: string | null; mimeType: string | null; isActive: boolean; deletedAt: Date | null } | null,
): PublicProductInspectorMedia | null {
  if (!media || !isRenderableMedia(media)) {
    return null;
  }

  return {
    id: Number(media.id),
    kind: media.kind,
    url: buildPublicMediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? buildPublicMediaUrl(media.id, "thumbnail") : null,
    altText: media.altText,
    title: media.title,
    mimeType: media.mimeType,
  };
}

function collectMediaIdsForPublishing(record: PublicFamilyRecord) {
  const ids = new Set<number>();

  if (record.mainImage && isRenderableMedia(record.mainImage)) {
    ids.add(Number(record.mainImage.id));
  }

  for (const member of record.members) {
    for (const link of member.product.mediaLinks) {
      if (isRenderableMedia(link.media)) {
        ids.add(Number(link.media.id));
      }
    }
  }

  return [...ids];
}

function collectProductMediaIdsForPublishing(
  records: Array<Pick<PublicProductRecord, "mediaLinks">>,
) {
  const ids = new Set<number>();

  for (const record of records) {
    for (const link of record.mediaLinks) {
      if (isRenderableMedia(link.media)) {
        ids.add(Number(link.media.id));
      }
    }
  }

  return [...ids];
}

function isPublicProduct(product: PublicProductRecord) {
  return product.kind === "VARIANT" && product.lifecycle === "ACTIVE" && product.visibility === true;
}

function isPublicSingleProduct(product: PublicProductRecord) {
  return product.kind === "SINGLE" && product.lifecycle === "ACTIVE" && product.visibility === true;
}

function getBrandName(brandCode: string | null | undefined) {
  return formatProductBrandValue(brandCode);
}

function parseRichTextPreview(value: string | null | undefined) {
  const text = getArticlePlainText(value ?? "").trim();
  return text || null;
}

function formatDecimal(value: Prisma.Decimal | null | undefined) {
  return value == null ? null : value.toString();
}

function mapSubcategoryLinks(
  links: PublicProductRecord["subcategoryLinks"],
): PublicProductSubcategoryLink[] {
  return links.map((link) => ({
    id: Number(link.subcategory.id),
    name: link.subcategory.name,
    slug: link.subcategory.slug,
    categorySlug: link.subcategory.category.slug,
    categoryName: link.subcategory.category.name,
  }));
}

function getAttributePresentation(kind: string) {
  const canonicalKind = normalizeProductAttributeKind(kind);
  const resolvedAttribute = resolveProductAttribute(kind);

  return {
    attributeId: canonicalKind || kind,
    kind: canonicalKind || kind,
    name: formatProductAttributeKind(kind),
    unit: getProductAttributeUnit(kind),
    specialType:
      resolvedAttribute?.value === "FINISH"
        ? ("FINISH" as const)
        : resolvedAttribute?.value === "COLOR"
          ? ("COLOR" as const)
          : null,
  };
}

function formatAttributeValue(kind: string, value: string) {
  if (normalizeProductAttributeKind(kind) !== "FINISH") {
    return value;
  }

  return resolveFinish(value)?.label ?? value;
}

function mapVariantAttributes(product: PublicProductRecord): PublicProductInspectorAttribute[] {
  return product.attributes.map((attribute) => {
    const presentation = getAttributePresentation(attribute.kind);

    return {
      attributeId: presentation.attributeId,
      kind: presentation.kind,
      name: presentation.name,
      value: formatAttributeValue(attribute.kind, attribute.value),
      unit: presentation.unit,
      specialType: presentation.specialType,
    };
  });
}

function mapVariantMedia(product: PublicProductRecord) {
  return product.mediaLinks
    .map((link) => mapMediaRecord(link.media))
    .filter((media): media is PublicProductInspectorMedia => media != null);
}

function buildProductCoverMedia(product: Pick<PublicProductRecord, "mediaLinks">) {
  return mapVariantMedia(product as PublicProductRecord)[0] ?? null;
}

function derivePack(record: PublicPackRecord) {
  const brandNames = [
    ...new Set(
      record.packLinesAsPack.flatMap((line) => {
        const brandName = getBrandName(line.product.brandCode);
        return brandName ? [brandName] : [];
      }),
    ),
  ];
  const visibility =
    record.packLinesAsPack.length > 0 &&
    record.packLinesAsPack.every((line) => line.product.visibility === true);
  const priceVisibility =
    record.packLinesAsPack.length > 0 &&
    record.packLinesAsPack.every((line) => line.product.priceVisibility === true);
  const lifecycle =
    record.packLinesAsPack.length > 0 &&
    record.packLinesAsPack.every((line) => line.product.lifecycle === "ACTIVE")
      ? "ACTIVE"
      : "DRAFT";

  let priceTotal = new Prisma.Decimal(0);
  let vatWeighted = new Prisma.Decimal(0);
  let missingPrice = false;
  let commercialMode: PublicPackRecord["packLinesAsPack"][number]["product"]["commercialMode"] | null = null;
  const tagValues = new Set<string>();

  for (const line of record.packLinesAsPack) {
    const componentPrice = line.product.basePriceAmount;
    if (componentPrice == null) {
      missingPrice = true;
    } else {
      const lineTotal = componentPrice.mul(line.quantity);
      priceTotal = priceTotal.add(lineTotal);
      vatWeighted = vatWeighted.add(lineTotal.mul(line.product.vatRate ?? 0));
    }

    for (const tag of line.product.tags.split(/\s+/).filter(Boolean)) {
      tagValues.add(tag);
    }

    commercialMode =
      commercialMode == null
        ? line.product.commercialMode
        : commercialMode === "ON_REQUEST_ONLY" || line.product.commercialMode === "ON_REQUEST_ONLY"
          ? "ON_REQUEST_ONLY"
          : commercialMode === "ON_REQUEST_OR_ONLINE" || line.product.commercialMode === "ON_REQUEST_OR_ONLINE"
            ? "ON_REQUEST_OR_ONLINE"
            : "ONLINE_ONLY";
  }

  return {
    brandNames,
    visibility,
    priceVisibility,
    lifecycle,
    commercialMode,
    basePriceAmount: missingPrice ? null : priceTotal.toString(),
    vatRate: priceTotal.equals(0) ? 0 : Number(vatWeighted.div(priceTotal).toFixed(4)),
    tags: [...tagValues].sort((left, right) => left.localeCompare(right, "fr-FR")).join(" "),
    searchProducts: record.packLinesAsPack.map((line) => line.product),
  };
}

function pickDefaultPublicVariant(record: PublicFamilyRecord) {
  const publicVariants = record.members
    .map((member) => member.product)
    .filter(isPublicProduct);
  const defaultProductId =
    record.defaultProductId == null ? null : Number(record.defaultProductId);

  if (publicVariants.length === 0) {
    return {
      publicVariants,
      defaultVariant:
        publicVariants.find((variant) => Number(variant.id) === defaultProductId) ??
        publicVariants[0] ??
        null,
    };
  }

  return {
    publicVariants,
    defaultVariant:
      publicVariants.find((variant) => Number(variant.id) === defaultProductId) ??
      publicVariants[0],
  };
}

function buildFamilyCoverMedia(record: PublicFamilyRecord, defaultVariant: PublicProductRecord | null) {
  const familyMainImage = mapMediaRecord(record.mainImage);
  if (familyMainImage) {
    return familyMainImage;
  }

  return defaultVariant ? mapVariantMedia(defaultVariant)[0] ?? null : null;
}

function scoreFamilySearch(record: PublicFamilyRecord, variants: PublicProductRecord[], normalizedQuery: string) {
  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;
  const familyName = normalizeComparableValue(record.name);
  const familySlug = normalizeComparableValue(record.slug);
  const familySubtitle = normalizeComparableValue(record.subtitle);
  const familyDescription = normalizeComparableValue(parseRichTextPreview(record.description));

  if (familyName.startsWith(normalizedQuery)) score = Math.max(score, 700);
  if (familySlug.startsWith(normalizedQuery)) score = Math.max(score, 680);
  if (familySubtitle.startsWith(normalizedQuery)) score = Math.max(score, 650);
  if (familyDescription.includes(normalizedQuery)) score = Math.max(score, 300);

  for (const variant of variants) {
    if (normalizeComparableValue(variant.sku).startsWith(normalizedQuery)) score = Math.max(score, 1000);
    if (normalizeComparableValue(variant.name).startsWith(normalizedQuery)) score = Math.max(score, 980);
    if (normalizeComparableValue(variant.slug).startsWith(normalizedQuery)) score = Math.max(score, 960);
    if (normalizeComparableValue(parseRichTextPreview(variant.description)).includes(normalizedQuery)) {
      score = Math.max(score, 280);
    }
    if (normalizeComparableValue(getBrandName(variant.brandCode)).startsWith(normalizedQuery)) {
      score = Math.max(score, 500);
    }
    if (normalizeComparableValue(variant.tags).includes(normalizedQuery)) {
      score = Math.max(score, 350);
    }
  }

  return score;
}

function scoreConcreteProductSearch(
  product: Pick<
    PublicProductRecord,
    "sku" | "name" | "slug" | "description" | "descriptionSeo" | "tags"
  >,
  input: {
    normalizedQuery: string;
    brandName?: string | null;
    extraProducts?: Array<
      Pick<PublicProductRecord, "sku" | "name" | "slug" | "description" | "descriptionSeo">
    >;
    extraTags?: string | null;
  } = { normalizedQuery: "" },
) {
  const { normalizedQuery, brandName, extraProducts = [], extraTags } = input;

  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;
  const productSku = normalizeComparableValue(product.sku);
  const productName = normalizeComparableValue(product.name);
  const productSlug = normalizeComparableValue(product.slug);
  const productDescription = normalizeComparableValue(parseRichTextPreview(product.description));
  const productDescriptionSeo = normalizeComparableValue(parseRichTextPreview(product.descriptionSeo));
  const productTags = normalizeComparableValue([product.tags, extraTags].filter(Boolean).join(" "));

  if (productSku.startsWith(normalizedQuery)) score = Math.max(score, 1000);
  if (productName.startsWith(normalizedQuery)) score = Math.max(score, 980);
  if (productSlug.startsWith(normalizedQuery)) score = Math.max(score, 960);
  if (normalizeComparableValue(brandName).startsWith(normalizedQuery)) score = Math.max(score, 500);
  if (productTags.includes(normalizedQuery)) score = Math.max(score, 350);
  if (productDescription.includes(normalizedQuery) || productDescriptionSeo.includes(normalizedQuery)) {
    score = Math.max(score, 280);
  }

  for (const extraProduct of extraProducts) {
    if (normalizeComparableValue(extraProduct.sku).startsWith(normalizedQuery)) score = Math.max(score, 900);
    if (normalizeComparableValue(extraProduct.name).startsWith(normalizedQuery)) score = Math.max(score, 880);
    if (normalizeComparableValue(extraProduct.slug).startsWith(normalizedQuery)) score = Math.max(score, 860);
    if (
      normalizeComparableValue(parseRichTextPreview(extraProduct.description)).includes(normalizedQuery) ||
      normalizeComparableValue(parseRichTextPreview(extraProduct.descriptionSeo)).includes(normalizedQuery)
    ) {
      score = Math.max(score, 260);
    }
  }

  return score;
}

function mapFamilySummary(record: PublicFamilyRecord, defaultVariant: PublicProductRecord | null): PublicProductSummary {
  const coverMedia = buildFamilyCoverMedia(record, defaultVariant);

  return {
    id: Number(record.id),
    entityType: "FAMILY",
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle,
    description: parseRichTextPreview(record.description) ?? parseRichTextPreview(defaultVariant?.description ?? null),
    brandName: getBrandName(defaultVariant?.brandCode ?? null),
    imageUrl: coverMedia?.url ?? null,
    imageThumbnailUrl: coverMedia?.thumbnailUrl ?? null,
    imageAlt: coverMedia?.altText ?? record.name,
    price:
      defaultVariant?.priceVisibility && defaultVariant.basePriceAmount != null
        ? formatDecimal(defaultVariant.basePriceAmount)
        : null,
  };
}

function mapSingleProductSummary(record: PublicProductRecord): PublicProductSummary {
  const coverMedia = buildProductCoverMedia(record);

  return {
    id: Number(record.id),
    entityType: "SINGLE",
    name: record.name,
    slug: record.slug,
    subtitle: null,
    description: parseRichTextPreview(record.description),
    brandName: getBrandName(record.brandCode),
    imageUrl: coverMedia?.kind === "IMAGE" ? coverMedia.url : null,
    imageThumbnailUrl: coverMedia?.kind === "IMAGE" ? coverMedia.thumbnailUrl : null,
    imageAlt: coverMedia?.altText ?? record.name,
    price:
      record.priceVisibility && record.basePriceAmount != null
        ? formatDecimal(record.basePriceAmount)
        : null,
  };
}

function mapPackSummary(record: PublicPackRecord, derived: ReturnType<typeof derivePack>): PublicProductSummary {
  const coverMedia = buildProductCoverMedia(record);

  return {
    id: Number(record.id),
    entityType: "PACK",
    name: record.name,
    slug: record.slug,
    subtitle: null,
    description: parseRichTextPreview(record.description),
    brandName: derived.brandNames.length > 0 ? derived.brandNames.join(" · ") : null,
    imageUrl: coverMedia?.kind === "IMAGE" ? coverMedia.url : null,
    imageThumbnailUrl: coverMedia?.kind === "IMAGE" ? coverMedia.thumbnailUrl : null,
    imageAlt: coverMedia?.altText ?? record.name,
    price: derived.priceVisibility ? derived.basePriceAmount : null,
  };
}

function buildColorReferencesFromAttributes(
  attributeGroups: PublicProductInspectorAttribute[][],
): PublicProductColorReference[] {
  const seen = new Map<string, PublicProductColorReference>();

  for (const attributes of attributeGroups) {
    for (const attribute of attributes) {
      if (attribute.specialType !== "COLOR") {
        continue;
      }

      const key = normalizeComparableValue(attribute.value);
      if (seen.has(key)) {
        continue;
      }

      const color = COLORS.find(
        (entry) => normalizeComparableValue(entry.label) === key,
      );

      seen.set(key, {
        key,
        label: attribute.value,
        hexValue:
          color?.value ??
          (/^#[0-9a-f]{3,8}$/i.test(attribute.value) ? attribute.value : null),
      } as PublicProductColorReference);
    }
  }

  return [...seen.values()];
}

function buildFinishReferencesFromAttributes(
  attributeGroups: PublicProductInspectorAttribute[][],
): PublicProductFinishReference[] {
  const seen = new Map<string, PublicProductFinishReference>();

  for (const attributes of attributeGroups) {
    for (const attribute of attributes) {
      if (attribute.specialType !== "FINISH") {
        continue;
      }

      const key = normalizeComparableValue(attribute.value);
      if (seen.has(key)) {
        continue;
      }

      seen.set(key, {
        key,
        name: attribute.value,
        colorHex: null,
        mediaUrl: null,
        mediaThumbnailUrl: null,
      });
    }
  }

  return [...seen.values()];
}

function buildColorReferences(variants: PublicProductInspectorVariant[]) {
  return buildColorReferencesFromAttributes(variants.map((variant) => variant.attributes));
}

function buildFinishReferences(variants: PublicProductInspectorVariant[]) {
  return buildFinishReferencesFromAttributes(variants.map((variant) => variant.attributes));
}

function mapInspectorVariant(product: PublicProductRecord): PublicProductInspectorVariant {
  return {
    id: Number(product.id),
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    description: product.description,
    basePriceAmount:
      product.priceVisibility && product.basePriceAmount != null
        ? formatDecimal(product.basePriceAmount)
        : null,
    priceVisibility: product.priceVisibility ?? false,
    commercialMode: product.commercialMode,
    media: mapVariantMedia(product),
    attributes: mapVariantAttributes(product),
  };
}

function mapSimpleInspector(record: PublicProductRecord, input: {
  kind: "PACK" | "SINGLE";
  brandNames: string[];
  basePriceAmount: string | null;
  priceVisibility: boolean;
  commercialMode: PublicProductRecord["commercialMode"] | null;
}): PublicSimpleProductInspector {
  const media = mapVariantMedia(record);
  const attributes = mapVariantAttributes(record);

  return {
    id: Number(record.id),
    kind: input.kind,
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    description: record.description,
    descriptionSeo: record.descriptionSeo,
    brandNames: input.brandNames,
    media,
    basePriceAmount: input.priceVisibility ? input.basePriceAmount : null,
    priceVisibility: input.priceVisibility,
    commercialMode: input.commercialMode,
    subcategories: mapSubcategoryLinks(record.subcategoryLinks),
    attributes,
    colorReferences: buildColorReferencesFromAttributes([attributes]),
    finishReferences: buildFinishReferencesFromAttributes([attributes]),
  };
}

async function listCandidateFamilies(input: { categorySlug: string; subcategorySlug: string }) {
  const families = await prisma.productFamily.findMany({
    where: {
      members: {
        some: {
          product: {
            kind: "VARIANT",
            subcategoryLinks: {
              some: {
                subcategory: {
                  slug: input.subcategorySlug,
                  category: {
                    slug: input.categorySlug,
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    select: PUBLIC_FAMILY_SELECT,
  });

  await makeMediaPublicMany(
    families.flatMap(collectMediaIdsForPublishing),
  );

  return families;
}

async function listCandidateSingles(input: { categorySlug: string; subcategorySlug: string }) {
  const singles = await prisma.product.findMany({
    where: {
      kind: "SINGLE",
      lifecycle: "ACTIVE",
      visibility: true,
      subcategoryLinks: {
        some: {
          subcategory: {
            slug: input.subcategorySlug,
            category: {
              slug: input.categorySlug,
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    select: PUBLIC_PRODUCT_SELECT,
  });

  await makeMediaPublicMany(collectProductMediaIdsForPublishing(singles));

  return singles;
}

async function listCandidatePacks(input: { categorySlug: string; subcategorySlug: string }) {
  const packs = await prisma.product.findMany({
    where: {
      kind: "PACK",
      subcategoryLinks: {
        some: {
          subcategory: {
            slug: input.subcategorySlug,
            category: {
              slug: input.categorySlug,
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    select: PUBLIC_PACK_SELECT,
  });

  await makeMediaPublicMany(collectProductMediaIdsForPublishing(packs));

  return packs;
}

function buildFamilySubcategories(publicVariants: PublicProductRecord[]) {
  const subcategories = new Map<number, PublicProductSubcategoryLink>();

  for (const variant of publicVariants) {
    for (const link of variant.subcategoryLinks) {
      subcategories.set(Number(link.subcategory.id), {
        id: Number(link.subcategory.id),
        name: link.subcategory.name,
        slug: link.subcategory.slug,
        categorySlug: link.subcategory.category.slug,
        categoryName: link.subcategory.category.name,
      });
    }
  }

  return [...subcategories.values()];
}

export async function listPublicProductsBySubcategory(input: {
  categorySlug: string;
  subcategorySlug: string;
  page: number;
  pageSize?: number;
  q?: string | null;
}): Promise<PublicProductListResult> {
  const [families, singles, packs] = await Promise.all([
    listCandidateFamilies(input),
    listCandidateSingles(input),
    listCandidatePacks(input),
  ]);
  const normalizedQuery = normalizeComparableValue(input.q);

  const rankedFamilies = families
    .map((family): { score: number; summary: PublicProductSummary } | null => {
      const { publicVariants, defaultVariant } = pickDefaultPublicVariant(family);
      if (!defaultVariant) {
        return null;
      }

      const score = scoreFamilySearch(family, publicVariants, normalizedQuery);

      if (normalizedQuery && score === 0) {
        return null;
      }

      return {
        score,
        summary: mapFamilySummary(family, defaultVariant),
      };
    });

  const rankedSingles = singles
    .map((product): { score: number; summary: PublicProductSummary } | null => {
      const score = scoreConcreteProductSearch(product, {
        normalizedQuery,
        brandName: getBrandName(product.brandCode),
      });

      if (normalizedQuery && score === 0) {
        return null;
      }

      return {
        score,
        summary: mapSingleProductSummary(product),
      };
    });

  const rankedPacks = packs
    .map((pack): { score: number; summary: PublicProductSummary } | null => {
      const derived = derivePack(pack);

      if (!derived.visibility || derived.lifecycle !== "ACTIVE") {
        return null;
      }

      const score = scoreConcreteProductSearch(pack, {
        normalizedQuery,
        brandName: derived.brandNames.join(" "),
        extraProducts: derived.searchProducts,
        extraTags: derived.tags,
      });

      if (normalizedQuery && score === 0) {
        return null;
      }

      return {
        score,
        summary: mapPackSummary(pack, derived),
      };
    });

  const ranked = [...rankedFamilies, ...rankedSingles, ...rankedPacks]
    .filter((item): item is { score: number; summary: PublicProductSummary } => item != null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.summary.name.localeCompare(right.summary.name, "fr-FR"),
    );

  const pageSize = input.pageSize ?? PUBLIC_PRODUCTS_PAGE_SIZE;
  const start = (input.page - 1) * pageSize;
  const items = ranked.slice(start, start + pageSize).map((item) => item.summary);

  return {
    items,
    total: ranked.length,
    page: input.page,
    pageSize,
  };
}

export async function findPublicFamilyBySlug(
  familySlug: string,
): Promise<PublicProductInspector | null> {
  const record = await prisma.productFamily.findFirst({
    where: {
      slug: familySlug,
    },
    select: PUBLIC_FAMILY_SELECT,
  });

  if (!record) {
    return null;
  }

  await makeMediaPublicMany(collectMediaIdsForPublishing(record));

  const { publicVariants, defaultVariant } = pickDefaultPublicVariant(record);
  if (!defaultVariant) {
    return null;
  }

  const variants = publicVariants.map(mapInspectorVariant);
  const coverMedia = buildFamilyCoverMedia(record, defaultVariant);

  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle,
    description: record.description,
    descriptionSeo: record.descriptionSeo,
    brandName: getBrandName(defaultVariant.brandCode),
    coverMedia,
    defaultVariantId: Number(defaultVariant.id),
    variants,
    subcategories: buildFamilySubcategories(publicVariants),
    colorReferences: buildColorReferences(variants),
    finishReferences: buildFinishReferences(variants),
  };
}

export async function findPublicSingleProductBySlug(
  productSlug: string,
): Promise<PublicSimpleProductInspector | null> {
  const record = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      kind: "SINGLE",
      lifecycle: "ACTIVE",
      visibility: true,
    },
    select: PUBLIC_PRODUCT_SELECT,
  });

  if (!record || !isPublicSingleProduct(record)) {
    return null;
  }

  await makeMediaPublicMany(collectProductMediaIdsForPublishing([record]));

  const brandName = getBrandName(record.brandCode);

  return mapSimpleInspector(record, {
    kind: "SINGLE",
    brandNames: brandName ? [brandName] : [],
    basePriceAmount: formatDecimal(record.basePriceAmount),
    priceVisibility: record.priceVisibility ?? false,
    commercialMode: record.commercialMode,
  });
}

export async function findPublicPackBySlug(
  packSlug: string,
): Promise<PublicSimpleProductInspector | null> {
  const record = await prisma.product.findFirst({
    where: {
      slug: packSlug,
      kind: "PACK",
    },
    select: PUBLIC_PACK_SELECT,
  });

  if (!record) {
    return null;
  }

  const derived = derivePack(record);

  if (!derived.visibility || derived.lifecycle !== "ACTIVE") {
    return null;
  }

  await makeMediaPublicMany(collectProductMediaIdsForPublishing([record]));

  return mapSimpleInspector(record, {
    kind: "PACK",
    brandNames: derived.brandNames,
    basePriceAmount: derived.basePriceAmount,
    priceVisibility: derived.priceVisibility,
    commercialMode: derived.commercialMode,
  });
}
