import { Prisma } from "@prisma/client";
import { getArticleFirstParagraphText } from "@/features/articles/document";
import { makeMediaPublicMany } from "@/features/media/repository";
import { listProductColorCandidates } from "@/features/product-colors/repository";
import { listProductFinishCandidates } from "@/features/product-finishes/repository";
import { prisma } from "@/lib/server/db/prisma";
import { formatStoredProductAttributeValue } from "./attribute-values";
import { resolveVariantEffectiveValues } from "./overrides";
import type {
  ProductCommercialMode,
  ProductLifecycleStatus,
  ProductPriceUnit,
  ProductPriceVisibility,
  ProductVisibility,
} from "./types";

export const PUBLIC_PRODUCTS_PAGE_SIZE = 6;

export type PublicProductSummary = {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  brandName: string;
  price: string | null;
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
  imageAlt: string | null;
};

export type PublicProductListQuery = {
  categorySlug: string;
  subcategorySlug: string;
  page: number;
  pageSize: number;
  q?: string | null;
};

export type PublicProductListResult = {
  items: PublicProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type PublicProductInspectorMedia = {
  id: number;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT";
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  title: string | null;
  mimeType: string | null;
  widthPx: number | null;
  heightPx: number | null;
};

export type PublicProductInspectorAttribute = {
  attributeId: number;
  key: string;
  slug: string;
  name: string;
  unit: string | null;
  value: string;
  specialType: "COLOR" | "FINISH" | null;
};

export type PublicProductInspectorVariant = {
  id: number;
  sku: string;
  slug: string | null;
  name: string;
  description: string;
  descriptionSeo: string;
  lifecycleStatus: ProductLifecycleStatus;
  visibility: ProductVisibility;
  commercialMode: ProductCommercialMode;
  priceVisibility: ProductPriceVisibility;
  basePriceAmount: string | null;
  sortOrder: number;
  media: PublicProductInspectorMedia[];
  attributes: PublicProductInspectorAttribute[];
};

export type PublicProductColorReference = {
  key: string;
  name: string;
  hexValue: string;
};

export type PublicProductFinishReference = {
  key: string;
  name: string;
  colorHex: string;
  mediaUrl: string | null;
  mediaThumbnailUrl: string | null;
};

export type PublicProductInspector = {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  descriptionSeo: string;
  brandName: string | null;
  priceUnit: ProductPriceUnit;
  vatRate: number;
  defaultVariantId: number | null;
  coverMedia: PublicProductInspectorMedia | null;
  variants: PublicProductInspectorVariant[];
  colorReferences: PublicProductColorReference[];
  finishReferences: PublicProductFinishReference[];
};

type PublicProductImageRelation = {
  id: bigint;
  altText: string | null;
  title: string | null;
  isActive: boolean;
  deletedAt: Date | null;
} | null;

type PublicProductRecord = {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  brand: {
    name: string;
  } | null;
  variants: Array<{
    sku: string;
    slug: string | null;
    name: string | null;
    description: string | null;
    descriptionSeo: string | null;
    lifecycleStatus: "DRAFT" | "ACTIVE" | "ARCHIVED" | null;
    visibility: "HIDDEN" | "PUBLIC" | null;
    priceVisibility: "HIDDEN" | "VISIBLE" | null;
    basePriceAmount: { toString(): string } | number | null;
  }>;
  tagLinks: Array<{
    tag: {
      name: string;
      slug: string;
    };
  }>;
  mediaLinks: Array<{
    mediaId: bigint;
    media: PublicProductImageRelation;
  }>;
};

type PublicInspectorMediaRecord = {
  id: bigint;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT";
  title: string | null;
  originalFilename: string | null;
  altText: string | null;
  mimeType: string | null;
  extension: string | null;
  widthPx: number | null;
  heightPx: number | null;
  sizeBytes: bigint | number | null;
};

type PublicProductDetailRecord = {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  priceUnit: ProductPriceUnit;
  vatRate: number;
  defaultVariantId: bigint | null;
  brand: {
    name: string;
  } | null;
  mediaLinks: Array<{
    mediaId: bigint;
    media: PublicInspectorMediaRecord;
  }>;
  variants: Array<{
    id: bigint;
    sku: string;
    slug: string | null;
    name: string | null;
    description: string | null;
    descriptionSeo: string | null;
    lifecycleStatus: ProductLifecycleStatus | null;
    visibility: ProductVisibility | null;
    commercialMode: ProductCommercialMode | null;
    priceVisibility: ProductPriceVisibility | null;
    basePriceAmount: { toString(): string } | number | null;
    sortOrder: number;
    mediaLinks: Array<{
      mediaId: bigint;
      media: PublicInspectorMediaRecord;
    }>;
    attributeValues: Array<{
      attributeId: bigint;
      valueText: string | null;
      valueNumber: { toString(): string } | number | null;
      valueBoolean: boolean | null;
      valueJson: unknown | null;
      attribute: {
        key: string;
        slug: string;
        name: string;
        dataType: "TEXT" | "NUMBER" | "BOOLEAN";
        unit: string | null;
        sortOrder: number;
      };
    }>;
  }>;
};

const publicProductSelect = {
  id: true,
  name: true,
  slug: true,
  subtitle: true,
  description: true,
  descriptionSeo: true,
  brand: {
    select: {
      name: true,
    },
  },
  variants: {
    where: {
      lifecycleStatus: "ACTIVE",
      visibility: "PUBLIC",
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      sku: true,
      slug: true,
      name: true,
      description: true,
      descriptionSeo: true,
      lifecycleStatus: true,
      visibility: true,
      priceVisibility: true,
      basePriceAmount: true,
    },
  },
  tagLinks: {
    select: {
      tag: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  mediaLinks: {
    where: {
      role: "COVER",
    },
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      mediaId: true,
      media: {
        select: {
          id: true,
          altText: true,
          title: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  },
} satisfies Prisma.ProductFamilySelect;

const publicInspectorMediaSelect = {
  id: true,
  kind: true,
  title: true,
  originalFilename: true,
  altText: true,
  mimeType: true,
  extension: true,
  widthPx: true,
  heightPx: true,
  sizeBytes: true,
} satisfies Prisma.MediaSelect;

const publicProductDetailSelect = {
  id: true,
  name: true,
  slug: true,
  subtitle: true,
  description: true,
  descriptionSeo: true,
  priceUnit: true,
  vatRate: true,
  defaultVariantId: true,
  brand: {
    select: {
      name: true,
    },
  },
  mediaLinks: {
    where: {
      role: "COVER",
      media: {
        isActive: true,
        deletedAt: null,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      mediaId: true,
      media: {
        select: publicInspectorMediaSelect,
      },
    },
  },
  variants: {
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      sku: true,
      slug: true,
      name: true,
      description: true,
      descriptionSeo: true,
      lifecycleStatus: true,
      visibility: true,
      commercialMode: true,
      priceVisibility: true,
      basePriceAmount: true,
      sortOrder: true,
      mediaLinks: {
        where: {
          media: {
            isActive: true,
            deletedAt: null,
          },
        },
        orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
        select: {
          mediaId: true,
          media: {
            select: publicInspectorMediaSelect,
          },
        },
      },
      attributeValues: {
        orderBy: [{ attribute: { sortOrder: "asc" } }, { attribute: { name: "asc" } }],
        select: {
          attributeId: true,
          valueText: true,
          valueNumber: true,
          valueBoolean: true,
          valueJson: true,
          attribute: {
            select: {
              key: true,
              slug: true,
              name: true,
              dataType: true,
              unit: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ProductFamilySelect;

function buildPublicMediaUrl(
  mediaId: bigint | number,
  variant: "original" | "thumbnail" = "original",
) {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function buildPublicProductsWhere(
  input: Pick<PublicProductListQuery, "categorySlug" | "subcategorySlug">,
): Prisma.ProductFamilyWhereInput {
  return {
    variants: {
      some: {
        lifecycleStatus: "ACTIVE",
        visibility: "PUBLIC",
      },
    },
    subcategories: {
      some: {
        isActive: true,
        slug: input.subcategorySlug,
        category: {
          isActive: true,
          slug: input.categorySlug,
        },
      },
    },
  };
}

function normalizeLookupKey(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fr-FR");
}

function getSpecialAttributeType(attribute: {
  name: string;
  slug: string;
  key: string;
}) {
  const candidates = [attribute.name, attribute.slug, attribute.key].map(normalizeLookupKey);

  if (
    candidates.some(
      (candidate) =>
        candidate === "couleur" ||
        candidate.startsWith("couleur ") ||
        candidate.startsWith("couleur-"),
    )
  ) {
    return "COLOR" as const;
  }

  if (
    candidates.some(
      (candidate) =>
        candidate === "finition" ||
        candidate.startsWith("finition ") ||
        candidate.startsWith("finition-"),
    )
  ) {
    return "FINISH" as const;
  }

  return null;
}

type ComparableSearchValue = {
  canonical: string;
  compact: string;
};

function normalizeComparableSearchValue(value: string | null | undefined): ComparableSearchValue {
  const canonical = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return {
    canonical,
    compact: canonical.replace(/\s+/g, ""),
  };
}

function hasStartsWithMatch(
  field: string | null | undefined,
  query: ComparableSearchValue,
) {
  if (!query.canonical || !query.compact) {
    return false;
  }

  const normalizedField = normalizeComparableSearchValue(field);

  return (
    normalizedField.canonical.startsWith(query.canonical) ||
    normalizedField.compact.startsWith(query.compact)
  );
}

function getIncludesMatchIndex(
  field: string | null | undefined,
  query: ComparableSearchValue,
) {
  if (!query.canonical || !query.compact) {
    return -1;
  }

  const normalizedField = normalizeComparableSearchValue(field);
  const canonicalIndex = normalizedField.canonical.indexOf(query.canonical);

  if (canonicalIndex >= 0) {
    return canonicalIndex;
  }

  return normalizedField.compact.indexOf(query.compact);
}

function getStartsWithScore(
  field: string | null | undefined,
  query: ComparableSearchValue,
  baseScore: number,
) {
  if (!hasStartsWithMatch(field, query)) {
    return 0;
  }

  const normalizedField = normalizeComparableSearchValue(field);
  const exactMatch =
    normalizedField.canonical === query.canonical ||
    normalizedField.compact === query.compact;
  const tightnessBonus = Math.max(
    0,
    240 - Math.max(0, normalizedField.compact.length - query.compact.length),
  );

  return baseScore + tightnessBonus + (exactMatch ? 600 : 0);
}

function getIncludesScore(
  field: string | null | undefined,
  query: ComparableSearchValue,
  baseScore: number,
) {
  const matchIndex = getIncludesMatchIndex(field, query);

  if (matchIndex < 0) {
    return 0;
  }

  return baseScore + Math.max(0, 120 - matchIndex);
}

function getPublicProductSearchScore(
  product: PublicProductRecord,
  query: ComparableSearchValue,
) {
  let bestScore = 0;

  for (const variant of product.variants) {
    bestScore = Math.max(
      bestScore,
      getStartsWithScore(variant.sku, query, 100000),
      getStartsWithScore(variant.name, query, 96000),
      getStartsWithScore(variant.slug, query, 92000),
      getIncludesScore(variant.description, query, 30000),
      getIncludesScore(variant.descriptionSeo, query, 30000),
    );
  }

  bestScore = Math.max(
    bestScore,
    getStartsWithScore(product.name, query, 84000),
    getStartsWithScore(product.slug, query, 80000),
    getStartsWithScore(product.subtitle, query, 76000),
    getStartsWithScore(product.brand?.name, query, 68000),
    getIncludesScore(product.description, query, 42000),
    getIncludesScore(product.descriptionSeo, query, 42000),
  );

  for (const tagLink of product.tagLinks) {
    bestScore = Math.max(
      bestScore,
      getIncludesScore(tagLink.tag.name, query, 60000),
      getIncludesScore(tagLink.tag.slug, query, 60000),
    );
  }

  return bestScore;
}

function sortPublicProductsBySearchScore(
  left: { product: PublicProductRecord; score: number },
  right: { product: PublicProductRecord; score: number },
) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  const leftName = left.product.name.localeCompare(right.product.name, "fr-FR", {
    sensitivity: "base",
  });

  if (leftName !== 0) {
    return leftName;
  }

  return Number(left.product.id - right.product.id);
}

function formatDecimalValue(value: { toString(): string } | number | null) {
  return value != null ? String(value) : null;
}

function mapPublicInspectorMedia(
  media: PublicInspectorMediaRecord,
): PublicProductInspectorMedia {
  return {
    id: Number(media.id),
    kind: media.kind,
    url: buildPublicMediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? buildPublicMediaUrl(media.id, "thumbnail") : null,
    altText: media.altText ?? media.title ?? media.originalFilename,
    title: media.title,
    mimeType: media.mimeType,
    widthPx: media.widthPx,
    heightPx: media.heightPx,
  };
}

function buildPublicDefaultVariantFallback(
  product: Pick<PublicProductDetailRecord, "defaultVariantId" | "variants">,
) {
  const defaultVariant =
    product.variants.find((variant) => variant.id === product.defaultVariantId) ??
    product.variants[0] ??
    null;

  return {
    id: defaultVariant?.id ?? null,
    lifecycleStatus: defaultVariant?.lifecycleStatus ?? "DRAFT",
    visibility: defaultVariant?.visibility ?? "HIDDEN",
    commercialMode: defaultVariant?.commercialMode ?? "REFERENCE_ONLY",
    priceVisibility: defaultVariant?.priceVisibility ?? "HIDDEN",
    basePriceAmount: formatDecimalValue(defaultVariant?.basePriceAmount ?? null),
  };
}

function mapPublicInspectorVariant(
  product: Pick<
    PublicProductDetailRecord,
    "defaultVariantId" | "variants" | "name" | "description" | "descriptionSeo"
  >,
  variant: PublicProductDetailRecord["variants"][number],
): PublicProductInspectorVariant {
  const defaultVariant = buildPublicDefaultVariantFallback(product);
  const effectiveValues = resolveVariantEffectiveValues(defaultVariant, {
    lifecycleStatus: variant.lifecycleStatus,
    visibility: variant.visibility,
    commercialMode: variant.commercialMode,
    priceVisibility: variant.priceVisibility,
    basePriceAmount: formatDecimalValue(variant.basePriceAmount),
  });

  return {
    id: Number(variant.id),
    sku: variant.sku,
    slug: variant.slug,
    name: variant.name?.trim() || product.name,
    description: variant.description?.trim() || product.description?.trim() || "",
    descriptionSeo:
      variant.descriptionSeo?.trim() || product.descriptionSeo?.trim() || "",
    lifecycleStatus: effectiveValues.effectiveLifecycleStatus,
    visibility: effectiveValues.effectiveVisibility,
    commercialMode: effectiveValues.effectiveCommercialMode,
    priceVisibility: effectiveValues.effectivePriceVisibility,
    basePriceAmount: effectiveValues.effectiveBasePriceAmount,
    sortOrder: variant.sortOrder,
    media: variant.mediaLinks.map((link) => mapPublicInspectorMedia(link.media)),
    attributes: variant.attributeValues
      .map((attributeValue) => {
        const value = formatStoredProductAttributeValue({
          dataType: attributeValue.attribute.dataType,
          valueText: attributeValue.valueText,
          valueNumber: attributeValue.valueNumber,
          valueBoolean: attributeValue.valueBoolean,
          valueJson: attributeValue.valueJson,
        });

        if (!value) {
          return null;
        }

        return {
          attributeId: Number(attributeValue.attributeId),
          key: attributeValue.attribute.key,
          slug: attributeValue.attribute.slug,
          name: attributeValue.attribute.name,
          unit: attributeValue.attribute.unit,
          value,
          specialType: getSpecialAttributeType(attributeValue.attribute),
        } satisfies PublicProductInspectorAttribute;
      })
      .filter(
        (attribute): attribute is PublicProductInspectorAttribute => attribute != null,
      ),
  };
}

function isPublicInspectorVariant(variant: PublicProductInspectorVariant) {
  return variant.lifecycleStatus === "ACTIVE" && variant.visibility === "PUBLIC";
}

function sortPublicInspectorVariants(
  defaultVariantId: number | null,
  variants: PublicProductInspectorVariant[],
) {
  return [...variants].sort((left, right) => {
    const leftIsDefault = defaultVariantId != null && left.id === defaultVariantId;
    const rightIsDefault = defaultVariantId != null && right.id === defaultVariantId;

    if (leftIsDefault !== rightIsDefault) {
      return leftIsDefault ? -1 : 1;
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.id - right.id;
  });
}

async function buildPublicSpecialReferences(variants: PublicProductInspectorVariant[]) {
  const colorKeys = new Set<string>();
  const finishKeys = new Set<string>();

  for (const variant of variants) {
    for (const attribute of variant.attributes) {
      const normalizedValue = normalizeLookupKey(attribute.value);

      if (!normalizedValue) {
        continue;
      }

      if (attribute.specialType === "COLOR") {
        colorKeys.add(normalizedValue);
      }

      if (attribute.specialType === "FINISH") {
        finishKeys.add(normalizedValue);
      }
    }
  }

  if (colorKeys.size === 0 && finishKeys.size === 0) {
    return {
      colorReferences: [] as PublicProductColorReference[],
      finishReferences: [] as PublicProductFinishReference[],
    };
  }

  const [colors, finishes] = await Promise.all([
    colorKeys.size > 0 ? listProductColorCandidates() : Promise.resolve([]),
    finishKeys.size > 0 ? listProductFinishCandidates() : Promise.resolve([]),
  ]);
  const finishMediaIds = finishes
    .filter((finish) => finish.mediaId != null && finishKeys.has(normalizeLookupKey(finish.name)))
    .map((finish) => Number(finish.mediaId));

  await makeMediaPublicMany(finishMediaIds);

  return {
    colorReferences: colors
      .filter((color) => colorKeys.has(normalizeLookupKey(color.name)))
      .map((color) => ({
        key: normalizeLookupKey(color.name),
        name: color.name,
        hexValue: color.hexValue,
      })),
    finishReferences: finishes
      .filter((finish) => finishKeys.has(normalizeLookupKey(finish.name)))
      .map((finish) => ({
        key: normalizeLookupKey(finish.name),
        name: finish.name,
        colorHex: finish.colorHex,
        mediaUrl:
          finish.mediaId != null ? buildPublicMediaUrl(Number(finish.mediaId), "original") : null,
        mediaThumbnailUrl:
          finish.mediaId != null
            ? buildPublicMediaUrl(Number(finish.mediaId), "thumbnail")
            : null,
      })),
  };
}

async function ensurePublicProductDetailMedia(record: PublicProductDetailRecord) {
  const mediaIds = [
    ...record.mediaLinks.map((link) => Number(link.mediaId)),
    ...record.variants.flatMap((variant) =>
      variant.mediaLinks.map((link) => Number(link.mediaId)),
    ),
  ];

  await makeMediaPublicMany(mediaIds);
}

async function ensurePublicProductImages(records: PublicProductRecord[]) {
  const mediaIds = records.flatMap((record) => {
    const coverMedia = record.mediaLinks[0];

    if (
      coverMedia?.mediaId == null ||
      coverMedia.media == null ||
      !coverMedia.media.isActive ||
      coverMedia.media.deletedAt != null
    ) {
      return [];
    }

    return [Number(coverMedia.mediaId)];
  });

  await makeMediaPublicMany(mediaIds);
}

function mapPublicProductSummary(product: PublicProductRecord): PublicProductSummary {
  const coverMedia = product.mediaLinks[0];
  const hasCover =
    coverMedia?.mediaId != null &&
    coverMedia.media != null &&
    coverMedia.media.isActive &&
    coverMedia.media.deletedAt == null;
  const descriptionPreview = getArticleFirstParagraphText(product.description);
  const visiblePriceVariant =
    product.variants.find(
      (variant) =>
        variant.lifecycleStatus === "ACTIVE" &&
        variant.visibility === "PUBLIC" &&
        variant.priceVisibility === "VISIBLE" &&
        variant.basePriceAmount != null,
    ) ?? null;

  return {
    id: Number(product.id),
    name: product.name,
    slug: product.slug,
    subtitle: product.subtitle?.trim() ?? "",
    description: descriptionPreview || "Découvrez cette famille produit COBAM GROUP.",
    brandName: product.brand?.name ?? "Sans marque",
    price: visiblePriceVariant?.basePriceAmount != null ? String(visiblePriceVariant.basePriceAmount) : null,
    imageUrl:
      hasCover && coverMedia?.mediaId != null
        ? buildPublicMediaUrl(coverMedia.mediaId, "original")
        : null,
    imageThumbnailUrl:
      hasCover && coverMedia?.mediaId != null
        ? buildPublicMediaUrl(coverMedia.mediaId, "thumbnail")
        : null,
    imageAlt: coverMedia?.media?.altText ?? coverMedia?.media?.title ?? product.name,
  };
}

export async function findPublicProductBySlugs(input: {
  categorySlug: string;
  subcategorySlug: string;
  productSlug: string;
}): Promise<PublicProductInspector | null> {
  const product = await prisma.productFamily.findFirst({
    where: {
      slug: input.productSlug,
      subcategories: {
        some: {
          isActive: true,
          slug: input.subcategorySlug,
          category: {
            isActive: true,
            slug: input.categorySlug,
          },
        },
      },
      variants: {
        some: {
          lifecycleStatus: "ACTIVE",
          visibility: "PUBLIC",
        },
      },
    },
    select: publicProductDetailSelect,
  });

  if (!product) {
    return null;
  }

  await ensurePublicProductDetailMedia(product);

  const defaultVariantId =
    product.defaultVariantId != null ? Number(product.defaultVariantId) : null;
  const publicVariants = sortPublicInspectorVariants(
    defaultVariantId,
    product.variants.map((variant) => mapPublicInspectorVariant(product, variant)).filter(isPublicInspectorVariant),
  );

  if (publicVariants.length === 0) {
    return null;
  }

  const coverMedia =
    product.mediaLinks[0] != null ? mapPublicInspectorMedia(product.mediaLinks[0].media) : null;
  const specialReferences = await buildPublicSpecialReferences(publicVariants);
  const resolvedDefaultVariantId =
    defaultVariantId != null && publicVariants.some((variant) => variant.id === defaultVariantId)
      ? defaultVariantId
      : publicVariants[0]?.id ?? null;

  return {
    id: Number(product.id),
    name: product.name,
    slug: product.slug,
    subtitle: product.subtitle?.trim() ?? "",
    description: product.description?.trim() ?? "",
    descriptionSeo: product.descriptionSeo?.trim() ?? product.description?.trim() ?? "",
    brandName: product.brand?.name ?? null,
    priceUnit: product.priceUnit,
    vatRate: product.vatRate,
    defaultVariantId: resolvedDefaultVariantId,
    coverMedia,
    variants: publicVariants,
    colorReferences: specialReferences.colorReferences,
    finishReferences: specialReferences.finishReferences,
  };
}

export async function listPublicProductsBySubcategory(
  input: PublicProductListQuery,
): Promise<PublicProductListResult> {
  const normalizedPage = Number.isInteger(input.page) && input.page > 0 ? input.page : 1;
  const normalizedPageSize =
    Number.isInteger(input.pageSize) && input.pageSize > 0
      ? Math.min(input.pageSize, 24)
      : PUBLIC_PRODUCTS_PAGE_SIZE;
  const where = buildPublicProductsWhere(input);
  const normalizedQuery = normalizeComparableSearchValue(input.q);
  const hasSearchQuery = normalizedQuery.compact.length > 0;

  if (hasSearchQuery) {
    const products = await prisma.productFamily.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: publicProductSelect,
    });
    const rankedProducts = products
      .map((product) => ({
        product,
        score: getPublicProductSearchScore(product, normalizedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort(sortPublicProductsBySearchScore);
    const paginatedProducts = rankedProducts
      .slice(
        (normalizedPage - 1) * normalizedPageSize,
        normalizedPage * normalizedPageSize,
      )
      .map((entry) => entry.product);

    await ensurePublicProductImages(paginatedProducts);

    return {
      items: paginatedProducts.map(mapPublicProductSummary),
      total: rankedProducts.length,
      page: normalizedPage,
      pageSize: normalizedPageSize,
    };
  }

  const [items, total] = await Promise.all([
    prisma.productFamily.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: (normalizedPage - 1) * normalizedPageSize,
      take: normalizedPageSize,
      select: publicProductSelect,
    }),
    prisma.productFamily.count({
      where,
    }),
  ]);

  await ensurePublicProductImages(items);

  return {
    items: items.map(mapPublicProductSummary),
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
  };
}
