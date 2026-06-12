import { Prisma } from "@prisma/client";
import {
  extractArticleMediaIds,
  getArticlePlainText,
  replaceArticleImageSources,
} from "@/features/articles/document";
import { makeMediaPublicMany } from "@/features/media/repository";
import {
  resolvePublicPromotionScopeBySlug,
  type PublicPromotionScope,
} from "@/features/promotions/public";
import { prisma } from "@/lib/server/db/prisma";
import {
  formatProductAttributeKind,
  getProductAttributeUnit,
  normalizeProductAttributeKind,
} from "@/features/products/attribute-definitions";
import { rankPublicProductSearchRowsWithScores } from "./search";
import { productBrandLabel, richTextDescriptionToString } from "./model-b-compat";
import {
  RELATED_PRODUCTS_DEFAULT_LIMIT,
  RELATED_PRODUCTS_DEFAULT_THRESHOLD,
  rankRelatedProductProfiles,
  type RelatedProductAttributeProfile,
  type RelatedProductProfile,
} from "./related-engine";
import type {
  PublicProductColorReference,
  PublicProductBrand,
  PublicProductFinishReference,
  PublicProductCertificate,
  PublicProductInspector,
  PublicProductInspectorAttribute,
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
  PublicProductIndexCategory,
  PublicProductIndexItem,
  PublicProductIndexResult,
  PublicProductIndexSubcategory,
  PublicProductListResult,
  PublicRelatedProductItem,
  PublicProductSubcategoryLink,
  PublicProductSummary,
  PublicSimpleProductInspector,
} from "./types";

export type {
  PublicProductBrand,
  PublicProductColorReference,
  PublicProductFinishReference,
  PublicProductCertificate,
  PublicProductInspector,
  PublicProductInspectorAttribute,
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
  PublicProductIndexItem,
  PublicProductIndexResult,
  PublicProductListResult,
  PublicRelatedProductItem,
  PublicProductSubcategoryLink,
  PublicProductSummary,
  PublicSimpleProductInspector,
} from "./types";

export const PUBLIC_PRODUCTS_PAGE_SIZE = 24;
export const PUBLIC_PRODUCTS_INDEX_PAGE_SIZE = 36;

const MEDIA_SELECT = {
  id: true,
  kind: true,
  title: true,
  originalFilename: true,
  altText: true,
  mimeType: true,
  extension: true,
  sizeBytes: true,
  isActive: true,
  deletedAt: true,
} satisfies Prisma.MediaSelect;

const PUBLIC_PRODUCT_SELECT = {
  id: true,
  sku: true,
  slug: true,
  kind: true,
  name: true,
  displayName: true,
  titleSeo: true,
  lifecycle: true,
  richTextDescription: true,
  descriptionSeo: true,
  brand: { select: { name: true, description: true } },
  visibleEcommerce: true,
  visibleVitrine: true,
  subcategories: {
    where: {
      subcategory: {
        isActive: true,
        visibleVitrine: true,
        category: {
          isActive: true,
        },
      },
    },
    select: {
      subcategory: {
        select: {
          id: true,
          name: true,
          slug: true,
          sortOrder: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  },
  media: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      role: true,
      name: true,
      altText: true,
      sortOrder: true,
      media: {
        select: MEDIA_SELECT,
      },
    },
  },
  certificateAssociations: {
    orderBy: [{ certificate: { name: "asc" } }, { certificateId: "asc" }],
    select: {
      certificate: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageMediaId: true,
          imageMedia: {
            select: MEDIA_SELECT,
          },
        },
      },
    },
  },
  attributes: {
    orderBy: [{ groupSortOrder: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      label: true,
      value: true,
      unit: true,
      inputType: true,
      groupName: true,
      groupSortOrder: true,
      sortOrder: true,
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

type PublicIndexRow = {
  entity_type: "FAMILY" | "SINGLE" | "VARIANT";
  product_id: bigint | null;
  family_id: bigint | null;
  product_slug: string;
  product_sku: string | null;
  product_name: string | null;
  product_brand: string | null;
  product_tags: string | null;
  product_description: string | null;
  product_description_seo: string | null;
  attributes_text: string | null;
  family_name: string | null;
  family_slug: string | null;
  family_subtitle: string | null;
  family_description: string | null;
  family_description_seo: string | null;
  family_members_text: string | null;
  category_id: bigint;
  category_name: string;
  category_slug: string;
  category_subtitle: string | null;
  category_description: string | null;
  category_description_seo: string | null;
  category_theme_color: string | null;
  category_sort: number | null;
  category_is_promoted: boolean;
  subcategory_id: bigint;
  subcategory_name: string;
  subcategory_slug: string;
  subcategory_subtitle: string | null;
  subcategory_description: string | null;
  subcategory_description_seo: string | null;
  subcategory_sort: number | null;
};

type PublicRelatedIndexRow = PublicIndexRow & {
  product_display_name: string | null;
  product_type_id: bigint | null;
  product_type_name: string | null;
  product_type_slug: string | null;
  product_ids: bigint[] | null;
  attributes_json: unknown;
  family_attributes_json: unknown;
};

function normalizeComparableValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildPublicMediaUrl(
  mediaId: bigint | number,
  variant: "original" | "thumbnail" = "original",
) {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

type ProductColorReferenceLookup = Map<string, { key: string; label: string; value: string }>;

type ProductFinishReferenceLookup = Map<
  string,
  {
    key: string;
    label: string;
    color: string | null;
    imageMediaId: bigint | null;
  }
>;

function indexComparableLookup<T extends { key: string; label: string }>(records: T[]) {
  const lookup = new Map<string, T>();

  for (const record of records) {
    lookup.set(normalizeComparableValue(record.key), record);
    lookup.set(normalizeComparableValue(record.label), record);
  }

  return lookup;
}

async function loadProductColorReferenceLookup(): Promise<ProductColorReferenceLookup> {
  const records = await prisma.productColor.findMany({
    select: {
      key: true,
      label: true,
      value: true,
    },
    orderBy: [{ label: "asc" }],
  });

  return indexComparableLookup(records);
}

async function loadProductFinishReferenceLookup(): Promise<ProductFinishReferenceLookup> {
  const records = await prisma.productFinish.findMany({
    select: {
      key: true,
      label: true,
      color: true,
      imageMediaId: true,
    },
    orderBy: [{ label: "asc" }],
  });
  const imageMediaIds = records
    .map((record) => record.imageMediaId)
    .filter((mediaId): mediaId is bigint => mediaId != null)
    .map(Number);

  if (imageMediaIds.length > 0) {
    await makeMediaPublicMany(imageMediaIds);
  }

  return indexComparableLookup(records);
}

function isRenderableMedia(input: { id: bigint; isActive: boolean; deletedAt: Date | null }) {
  return input.isActive && input.deletedAt == null;
}

function mapMediaRecord(
  media: {
    id: bigint;
    kind: "IMAGE" | "VIDEO" | "DOCUMENT";
    title: string | null;
    originalFilename: string | null;
    altText: string | null;
    mimeType: string | null;
    extension: string | null;
    sizeBytes: bigint | null;
    isActive: boolean;
    deletedAt: Date | null;
  } | null,
  link?: {
    name: string | null;
    altText: string | null;
    sortOrder?: number;
  },
): PublicProductInspectorMedia | null {
  if (!media || !isRenderableMedia(media)) {
    return null;
  }

  return {
    id: Number(media.id),
    kind: media.kind,
    url: buildPublicMediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? buildPublicMediaUrl(media.id, "thumbnail") : null,
    altText: link?.altText ?? media.altText,
    title: link?.name ?? media.title,
    originalFilename: media.originalFilename,
    mimeType: media.mimeType,
    extension: media.extension,
    sizeBytes: media.sizeBytes?.toString() ?? null,
    sortOrder: link?.sortOrder ?? 0,
  };
}

function isPublicProduct(product: PublicProductRecord) {
  return (
    product.kind === "VARIANT" &&
    product.lifecycle !== "DISCONTINUED" &&
    product.visibleVitrine &&
    product.subcategories.length > 0
  );
}

function isPublicSingleProduct(product: PublicProductRecord) {
  return (
    (product.kind === "STANDARD" || product.kind === "SINGLE") &&
    product.lifecycle !== "DISCONTINUED" &&
    product.visibleVitrine &&
    product.subcategories.length > 0
  );
}

function getBrandName(brand: { name: string } | null | undefined) {
  return productBrandLabel(brand);
}

function mapProductBrand(
  brand: { name: string; description: string | null } | null | undefined,
): PublicProductBrand | null {
  const name = getBrandName(brand);
  return name ? { name, description: brand?.description ?? null } : null;
}

function getProductDescription(record: { richTextDescription: Prisma.JsonValue | null }) {
  return richTextDescriptionToString(record.richTextDescription);
}

function serializeProductRichDescription(value: Prisma.JsonValue | null) {
  if (!value) {
    return null;
  }

  const plainText = richTextDescriptionToString(value);
  if (!plainText) {
    return null;
  }

  return typeof value === "string" ? value : JSON.stringify(value);
}

function getProductRichDescription(record: { richTextDescription: Prisma.JsonValue | null }) {
  const serialized = serializeProductRichDescription(record.richTextDescription);

  return serialized
    ? replaceArticleImageSources(serialized, (mediaId) => buildPublicMediaUrl(mediaId, "original"))
    : null;
}

function parseRichTextPreview(value: string | null | undefined) {
  const text = getArticlePlainText(value ?? "").trim();
  return text || null;
}

function collectProductRichDescriptionMediaIds(record: {
  richTextDescription: Prisma.JsonValue | null;
}) {
  const serialized = serializeProductRichDescription(record.richTextDescription);
  return serialized ? extractArticleMediaIds(serialized) : [];
}

function collectMediaIdsForPublishing(record: PublicFamilyRecord) {
  const ids = new Set<number>();

  if (record.mainImage && isRenderableMedia(record.mainImage)) {
    ids.add(Number(record.mainImage.id));
  }

  for (const member of record.members) {
    collectProductRichDescriptionMediaIds(member.product).forEach((id) => ids.add(id));

    for (const link of member.product.media) {
      if (isRenderableMedia(link.media)) {
        ids.add(Number(link.media.id));
      }
    }

    for (const link of member.product.certificateAssociations) {
      if (isRenderableMedia(link.certificate.imageMedia)) {
        ids.add(Number(link.certificate.imageMedia.id));
      }
    }
  }

  return [...ids];
}

function collectProductMediaIdsForPublishing(
  records: Array<
    Pick<PublicProductRecord, "media" | "richTextDescription" | "certificateAssociations">
  >,
) {
  const ids = new Set<number>();

  for (const record of records) {
    collectProductRichDescriptionMediaIds(record).forEach((id) => ids.add(id));

    for (const link of record.media) {
      if (isRenderableMedia(link.media)) {
        ids.add(Number(link.media.id));
      }
    }

    for (const link of record.certificateAssociations) {
      if (isRenderableMedia(link.certificate.imageMedia)) {
        ids.add(Number(link.certificate.imageMedia.id));
      }
    }
  }

  return [...ids];
}

function mapSubcategoryLinks(
  links: PublicProductRecord["subcategories"],
): PublicProductSubcategoryLink[] {
  return [...links]
    .sort((left, right) => {
      if (left.subcategory.category.sortOrder !== right.subcategory.category.sortOrder) {
        return left.subcategory.category.sortOrder - right.subcategory.category.sortOrder;
      }

      if (left.subcategory.sortOrder !== right.subcategory.sortOrder) {
        return left.subcategory.sortOrder - right.subcategory.sortOrder;
      }

      return Number(left.subcategory.id) - Number(right.subcategory.id);
    })
    .map((link) => ({
      id: Number(link.subcategory.id),
      name: link.subcategory.name,
      slug: link.subcategory.slug,
      categorySlug: link.subcategory.category.slug,
      categoryName: link.subcategory.category.name,
    }));
}

function mapIndexCategory(record: {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  themeColor: string | null;
  sortOrder: number | null;
  isPromoted?: boolean | null;
}): PublicProductIndexCategory {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle ?? null,
    themeColor: record.themeColor ?? null,
    sortOrder: record.sortOrder ?? 0,
    isPromoted: Boolean(record.isPromoted),
  };
}

function mapIndexSubcategory(record: {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  sortOrder: number | null;
  category: { id: bigint; slug: string };
}): PublicProductIndexSubcategory {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle ?? null,
    description: record.description ?? null,
    sortOrder: record.sortOrder ?? 0,
    categoryId: Number(record.category.id),
    categorySlug: record.category.slug,
  };
}

function getAttributePresentation(attribute: PublicProductRecord["attributes"][number]) {
  const canonicalKind = normalizeProductAttributeKind(attribute.name);
  const normalizedName = attribute.name.trim().toLowerCase();

  return {
    attributeId: canonicalKind || attribute.name,
    kind: canonicalKind || attribute.name,
    name: attribute.label || formatProductAttributeKind(attribute.name) || attribute.name,
    unit: attribute.unit ?? getProductAttributeUnit(attribute.name),
    specialType:
      normalizedName === "finish" || attribute.inputType === "FINISH"
        ? ("FINISH" as const)
        : normalizedName === "color" || attribute.inputType === "COLOR"
          ? ("COLOR" as const)
          : null,
  };
}

function formatAttributeValue(attribute: PublicProductRecord["attributes"][number]) {
  return attribute.value;
}

function mapVariantAttributes(product: PublicProductRecord): PublicProductInspectorAttribute[] {
  return product.attributes.map((attribute) => {
    const presentation = getAttributePresentation(attribute);

    return {
      attributeId: presentation.attributeId,
      kind: presentation.kind,
      name: presentation.name,
      value: formatAttributeValue(attribute),
      inputType: attribute.inputType,
      unit: presentation.unit,
      groupName: attribute.groupName,
      groupSortOrder: attribute.groupSortOrder,
      sortOrder: attribute.sortOrder,
      specialType: presentation.specialType,
    };
  });
}

function mapVariantMedia(product: PublicProductRecord) {
  return product.media
    .filter((link) => link.role === "GALLERY")
    .map((link) => mapMediaRecord(link.media, link))
    .filter((media): media is PublicProductInspectorMedia => media != null);
}

function buildProductCoverMedia(product: Pick<PublicProductRecord, "media">) {
  return mapVariantMedia(product as PublicProductRecord)[0] ?? null;
}

function mapDocumentMedia(product: PublicProductRecord, role: "TECHNICAL" | "CERTIFICATE") {
  return product.media
    .filter((entry) => entry.role === role)
    .map((link) => mapMediaRecord(link.media, link))
    .filter((media): media is PublicProductInspectorMedia => media != null);
}

function mapProductCertificates(product: PublicProductRecord): PublicProductCertificate[] {
  return product.certificateAssociations
    .map((link, index) => {
      const certificate = link.certificate;
      const media = certificate.imageMedia;
      if (!isRenderableMedia(media) || media.kind !== "IMAGE") {
        return null;
      }

      const mappedCertificate: PublicProductCertificate = {
        id: Number(certificate.id),
        name: certificate.name,
        slug: certificate.slug,
        description: certificate.description,
        imageUrl: buildPublicMediaUrl(certificate.imageMediaId, "original"),
        imageThumbnailUrl: buildPublicMediaUrl(certificate.imageMediaId, "thumbnail"),
        imageAltText: media.altText ?? certificate.name,
        sortOrder: index,
      };

      return mappedCertificate;
    })
    .filter((certificate): certificate is PublicProductCertificate => certificate != null);
}

function pickDefaultPublicVariant(record: PublicFamilyRecord) {
  const publicVariants = record.members.map((member) => member.product).filter(isPublicProduct);
  const defaultProductId = record.defaultProductId == null ? null : Number(record.defaultProductId);

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

function buildFamilyCoverMedia(
  record: PublicFamilyRecord,
  defaultVariant: PublicProductRecord | null,
) {
  const familyMainImage = mapMediaRecord(record.mainImage);
  if (familyMainImage) {
    return familyMainImage;
  }

  return defaultVariant ? (mapVariantMedia(defaultVariant)[0] ?? null) : null;
}

function mapFamilySummary(
  record: PublicFamilyRecord,
  defaultVariant: PublicProductRecord | null,
): PublicProductSummary {
  const coverMedia = buildFamilyCoverMedia(record, defaultVariant);

  return {
    id: Number(record.id),
    entityType: "FAMILY",
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle,
    description:
      parseRichTextPreview(record.description) ??
      (defaultVariant ? getProductDescription(defaultVariant) : null),
    brandName: getBrandName(defaultVariant?.brand ?? null),
    imageUrl: coverMedia?.url ?? null,
    imageThumbnailUrl: coverMedia?.thumbnailUrl ?? null,
    imageAlt: coverMedia?.altText ?? record.name,
  };
}

function mapProductSummary(
  record: PublicProductRecord,
  entityType: "SINGLE" | "VARIANT",
): PublicProductSummary {
  const coverMedia = buildProductCoverMedia(record);

  return {
    id: Number(record.id),
    entityType,
    name: record.displayName,
    slug: record.slug,
    subtitle: null,
    description: getProductDescription(record),
    brandName: getBrandName(record.brand),
    imageUrl: coverMedia?.kind === "IMAGE" ? coverMedia.url : null,
    imageThumbnailUrl: coverMedia?.kind === "IMAGE" ? coverMedia.thumbnailUrl : null,
    imageAlt: coverMedia?.altText ?? record.displayName,
  };
}

function buildColorReferencesFromAttributes(
  attributeGroups: PublicProductInspectorAttribute[][],
  colorLookup: ProductColorReferenceLookup,
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

      const color = colorLookup.get(key);

      seen.set(key, {
        key: color?.key ?? key,
        label: color?.label ?? attribute.value,
        hexValue:
          color?.value ?? (/^#[0-9a-f]{3,8}$/i.test(attribute.value) ? attribute.value : null),
      } as PublicProductColorReference);
    }
  }

  return [...seen.values()];
}

function buildFinishReferencesFromAttributes(
  attributeGroups: PublicProductInspectorAttribute[][],
  finishLookup: ProductFinishReferenceLookup,
): PublicProductFinishReference[] {
  const seen = new Map<string, PublicProductFinishReference>();

  for (const attributes of attributeGroups) {
    for (const attribute of attributes) {
      if (attribute.specialType !== "FINISH") {
        continue;
      }

      const resolvedFinish = finishLookup.get(normalizeComparableValue(attribute.value));
      const key = normalizeComparableValue(resolvedFinish?.key ?? attribute.value);
      if (seen.has(key)) {
        continue;
      }

      seen.set(key, {
        key: resolvedFinish?.key ?? key,
        name: resolvedFinish?.label ?? attribute.value,
        colorHex: resolvedFinish?.color ?? null,
        imageUrl:
          resolvedFinish && resolvedFinish.imageMediaId
            ? buildPublicMediaUrl(resolvedFinish.imageMediaId, "thumbnail")
            : null,
      });
    }
  }

  return [...seen.values()];
}

function buildColorReferences(
  variants: PublicProductInspectorVariant[],
  colorLookup: ProductColorReferenceLookup,
) {
  return buildColorReferencesFromAttributes(
    variants.map((variant) => variant.attributes),
    colorLookup,
  );
}

function buildFinishReferences(
  variants: PublicProductInspectorVariant[],
  finishLookup: ProductFinishReferenceLookup,
) {
  return buildFinishReferencesFromAttributes(
    variants.map((variant) => variant.attributes),
    finishLookup,
  );
}

function mapInspectorVariant(product: PublicProductRecord): PublicProductInspectorVariant {
  return {
    id: Number(product.id),
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    displayName: product.displayName,
    description: getProductRichDescription(product),
    datasheets: mapDocumentMedia(product, "TECHNICAL"),
    certificates: mapDocumentMedia(product, "CERTIFICATE"),
    productCertificates: mapProductCertificates(product),
    media: mapVariantMedia(product),
    attributes: mapVariantAttributes(product),
  };
}

async function mapSimpleInspector(
  record: PublicProductRecord,
  input: {
    kind: "SINGLE" | "VARIANT";
    brand: PublicProductBrand | null;
    brandNames: string[];
  },
): Promise<PublicSimpleProductInspector> {
  const media = mapVariantMedia(record);
  const attributes = mapVariantAttributes(record);
  const [colorLookup, finishLookup] = await Promise.all([
    loadProductColorReferenceLookup(),
    loadProductFinishReferenceLookup(),
  ]);

  return {
    id: Number(record.id),
    kind: input.kind,
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    displayName: record.displayName,
    titleSeo: record.titleSeo,
    description: getProductRichDescription(record),
    descriptionSeo: record.descriptionSeo,
    brand: input.brand,
    brandNames: input.brandNames,
    media,
    datasheets: mapDocumentMedia(record, "TECHNICAL"),
    certificates: mapDocumentMedia(record, "CERTIFICATE"),
    productCertificates: mapProductCertificates(record),
    subcategories: mapSubcategoryLinks(record.subcategories),
    attributes,
    colorReferences: buildColorReferencesFromAttributes([attributes], colorLookup),
    finishReferences: buildFinishReferencesFromAttributes([attributes], finishLookup),
  };
}

function buildFamilySubcategories(publicVariants: PublicProductRecord[]) {
  const subcategories = new Map<
    number,
    PublicProductSubcategoryLink & {
      categorySortOrder: number;
      subcategorySortOrder: number;
    }
  >();

  for (const variant of publicVariants) {
    for (const link of variant.subcategories) {
      subcategories.set(Number(link.subcategory.id), {
        id: Number(link.subcategory.id),
        name: link.subcategory.name,
        slug: link.subcategory.slug,
        categorySlug: link.subcategory.category.slug,
        categoryName: link.subcategory.category.name,
        categorySortOrder: link.subcategory.category.sortOrder,
        subcategorySortOrder: link.subcategory.sortOrder,
      });
    }
  }

  return [...subcategories.values()]
    .sort((left, right) => {
      if (left.categorySortOrder !== right.categorySortOrder) {
        return left.categorySortOrder - right.categorySortOrder;
      }

      if (left.subcategorySortOrder !== right.subcategorySortOrder) {
        return left.subcategorySortOrder - right.subcategorySortOrder;
      }

      return left.id - right.id;
    })
    .map((link) => ({
      id: link.id,
      name: link.name,
      slug: link.slug,
      categorySlug: link.categorySlug,
      categoryName: link.categoryName,
    }));
}

export async function listPublicProductsBySubcategory(input: {
  categorySlug: string;
  subcategorySlug: string;
  page: number;
  pageSize?: number;
  q?: string | null;
}): Promise<PublicProductListResult> {
  const result = await listPublicProductsIndex({
    categorySlug: input.categorySlug,
    subcategorySlug: input.subcategorySlug,
    includeFamilies: true,
    page: input.page,
    pageSize: input.pageSize ?? PUBLIC_PRODUCTS_PAGE_SIZE,
    q: input.q,
  });

  return {
    items: result.items.map((item) => item.product),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

function sortIndexItems(items: PublicProductIndexItem[]) {
  return items.sort((left, right) => {
    if (left.category.sortOrder !== right.category.sortOrder) {
      return left.category.sortOrder - right.category.sortOrder;
    }
    if (left.category.name !== right.category.name) {
      return left.category.name.localeCompare(right.category.name, "fr-FR");
    }
    if (left.subcategory.sortOrder !== right.subcategory.sortOrder) {
      return left.subcategory.sortOrder - right.subcategory.sortOrder;
    }
    if (left.subcategory.name !== right.subcategory.name) {
      return left.subcategory.name.localeCompare(right.subcategory.name, "fr-FR");
    }
    return left.product.slug.localeCompare(right.product.slug, "fr-FR");
  });
}

type AdvancedSearchAst =
  | string
  | {
      type: "AND" | "OR" | "OR_GROUP";
      left: AdvancedSearchAst;
      right: AdvancedSearchAst;
    };

function buildAdvancedSearchAst(q: string): AdvancedSearchAst | null {
  const isAdvancedSearch = /^(?:brand|sku|name|date)(?::[123])?=/i.test(q);
  if (!isAdvancedSearch) return null;

  const tokens: string[] = [];
  let remainder = q;
  while (remainder.length > 0) {
    if (remainder.startsWith("||")) {
      tokens.push("||");
      remainder = remainder.slice(2);
    } else if (remainder.startsWith("|")) {
      tokens.push("|");
      remainder = remainder.slice(1);
    } else if (remainder.startsWith("&")) {
      tokens.push("&");
      remainder = remainder.slice(1);
    } else {
      const match = remainder.match(/^((?:brand|sku|name|date)(?::[123])?=[^&|]*)/i);
      if (match) {
        tokens.push(match[1]);
        remainder = remainder.slice(match[1].length);
      } else {
        return null; // invalid syntax
      }
    }
  }

  // Ast building
  const step1: AdvancedSearchAst[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "||") {
      const left = step1.pop();
      const right = tokens[++i];
      if (!left || !right) return null;
      step1.push({ type: "OR_GROUP", left, right });
    } else {
      step1.push(tokens[i]);
    }
  }

  const step2: AdvancedSearchAst[] = [];
  for (let i = 0; i < step1.length; i++) {
    if (step1[i] === "&") {
      const left = step2.pop();
      const right = step1[++i];
      if (!left || !right) return null;
      step2.push({ type: "AND", left, right });
    } else {
      step2.push(step1[i]);
    }
  }

  const step3: AdvancedSearchAst[] = [];
  for (let i = 0; i < step2.length; i++) {
    if (step2[i] === "|") {
      const left = step3.pop();
      const right = step2[++i];
      if (!left || !right) return null;
      step3.push({ type: "OR", left, right });
    } else {
      step3.push(step2[i]);
    }
  }

  if (step3.length !== 1) return null;
  return step3[0];
}

function buildSqlFromAst(node: AdvancedSearchAst): import("@prisma/client").Prisma.Sql {
  if (typeof node === "string") {
    const match = node.match(/^((?:brand|sku|name|date))(?::([123]))?=([^&|]*)$/i);
    if (!match) return Prisma.empty;
    const key = match[1].toLowerCase();
    const op = match[2] || "1";
    const val = match[3];

    let sqlPattern;
    if (op === "1") sqlPattern = `${val}%`;
    else if (op === "2") sqlPattern = val;
    else if (op === "3") sqlPattern = `%${val}%`;
    else return Prisma.empty;

    if (key === "brand") return Prisma.sql`COALESCE("p_brand"."name", '') ILIKE ${sqlPattern}`;
    if (key === "sku") return Prisma.sql`"p"."sku" ILIKE ${sqlPattern}`;
    if (key === "name") return Prisma.sql`"p"."name" ILIKE ${sqlPattern}`;
    return Prisma.empty;
  }

  const left = buildSqlFromAst(node.left);
  const right = buildSqlFromAst(node.right);

  if (node.type === "AND") return Prisma.sql`(${left} AND ${right})`;
  if (node.type === "OR" || node.type === "OR_GROUP") return Prisma.sql`(${left} OR ${right})`;

  return Prisma.empty;
}

function joinSqlWithOr(clauses: Prisma.Sql[]) {
  return clauses.reduce<Prisma.Sql | null>(
    (current, clause) => (current ? Prisma.sql`${current} OR ${clause}` : clause),
    null,
  );
}

function buildPromotionSqlCondition(scope: PublicPromotionScope | null) {
  if (!scope || scope.isGlobal) {
    return Prisma.empty;
  }

  const clauses: Prisma.Sql[] = [];

  if (scope.productIds.length > 0) {
    clauses.push(Prisma.sql`p.id IN (${Prisma.join(scope.productIds)})`);
  }

  if (scope.brandIds.length > 0) {
    clauses.push(Prisma.sql`p.brand_id IN (${Prisma.join(scope.brandIds)})`);
  }

  if (scope.categoryIds.length > 0) {
    clauses.push(Prisma.sql`c.id IN (${Prisma.join(scope.categoryIds)})`);
  }

  const joined = joinSqlWithOr(clauses);

  return joined ? Prisma.sql`AND (${joined})` : Prisma.empty;
}

const publicCategoryPromotionSql = Prisma.sql`
  EXISTS (
    SELECT 1
    FROM commerce_promotion_categories pc
    JOIN commerce_promotions cp ON cp.id = pc.promotion_id
    WHERE pc.category_id = c.id
      AND cp.status = 'ACTIVE'
      AND (cp.starts_at IS NULL OR cp.starts_at <= NOW())
      AND (cp.ends_at IS NULL OR cp.ends_at >= NOW())
      AND NOT EXISTS (
        SELECT 1
        FROM commerce_coupons cc
        JOIN commerce_coupon_customers ccc ON ccc.coupon_id = cc.id
        WHERE cc.promotion_id = cp.id
      )
  )
`;

export async function listPublicProductsIndex(input: {
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  includeFamilies?: boolean;
  page: number;
  pageSize?: number;
  q?: string | null;
  promoSlug?: string | null;
  searchLimit?: number | null;
}): Promise<PublicProductIndexResult> {
  const pageSize = input.pageSize ?? PUBLIC_PRODUCTS_INDEX_PAGE_SIZE;
  const offset = (input.page - 1) * pageSize;
  const advancedSearchAst = input.q ? buildAdvancedSearchAst(input.q) : null;
  const normalSearchQuery = input.q?.trim() && !advancedSearchAst ? input.q.trim() : null;
  const promotionScope = input.promoSlug
    ? await resolvePublicPromotionScopeBySlug(input.promoSlug)
    : null;

  if (input.promoSlug && !promotionScope) {
    return {
      items: [],
      total: 0,
      page: input.page,
      pageSize,
    };
  }

  const advancedSearchCondition = advancedSearchAst
    ? Prisma.sql`AND (${buildSqlFromAst(advancedSearchAst)})`
    : Prisma.empty;
  const promotionCondition = buildPromotionSqlCondition(promotionScope);

  const includeFamilies = input.includeFamilies ?? false;

  const familyQuery = includeFamilies
    ? Prisma.sql`
    SELECT DISTINCT ON (f.id)
      'FAMILY'::text AS entity_type,
      NULL::bigint AS product_id,
      f.id AS family_id,
      f.slug AS product_slug,
      p.sku AS product_sku,
      p.name AS product_name,
      p_brand.name AS product_brand,
      p.tags AS product_tags,
      p.rich_text_description::text AS product_description,
      p.description_seo AS product_description_seo,
      (
        SELECT COALESCE(string_agg(pa.name || ' ' || pa.value, ' '), '')
        FROM product_attributes pa
        WHERE pa.product_id = p.id
      ) AS attributes_text,
      f.name AS family_name,
      f.slug AS family_slug,
      f.subtitle AS family_subtitle,
      f.description AS family_description,
      f.description_seo AS family_description_seo,
      (
        SELECT COALESCE(string_agg(concat_ws(' ',
          fp.sku,
          fp.slug,
          fp.name,
          fp.tags,
          fp_brand.name,
          fp.rich_text_description::text,
          fp.description_seo,
          (
            SELECT COALESCE(string_agg(fpa.name || ' ' || fpa.value, ' '), '')
            FROM product_attributes fpa
            WHERE fpa.product_id = fp.id
          )
        ), ' '), '')
        FROM product_family_members fm2
        JOIN products fp ON fp.id = fm2.product_id
        LEFT JOIN organizations fp_brand ON fp_brand.id = fp.brand_id
        WHERE fm2.family_id = f.id
          AND fp.lifecycle <> 'DISCONTINUED'
      ) AS family_members_text,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      c.subtitle AS category_subtitle,
      c.description AS category_description,
      c.description_seo AS category_description_seo,
      c.theme_color AS category_theme_color,
      c.sort_order AS category_sort,
      ${publicCategoryPromotionSql} AS category_is_promoted,
      s.id AS subcategory_id,
      s.name AS subcategory_name,
      s.slug AS subcategory_slug,
      s.subtitle AS subcategory_subtitle,
      s.description AS subcategory_description,
      s.description_seo AS subcategory_description_seo,
      s.sort_order AS subcategory_sort
    FROM product_families f
    JOIN product_family_members m ON m.family_id = f.id
    JOIN products p ON p.id = m.product_id
    LEFT JOIN organizations p_brand ON p_brand.id = p.brand_id
    JOIN product_subcategory_links l ON l.product_id = p.id
    JOIN product_subcategories s ON s.id = l.subcategory_id AND s.is_active = true AND s.visible_vitrine = true
    JOIN product_types c ON c.id = s.category_id AND c.is_active = true
    WHERE p.kind = 'VARIANT'
      AND p.lifecycle <> 'DISCONTINUED'
      AND p.visible_vitrine = true
    ${advancedSearchCondition}
    ${promotionCondition}
    ${input.categorySlug ? Prisma.sql`AND "c".slug = ${input.categorySlug}` : Prisma.empty}
    ${input.subcategorySlug ? Prisma.sql`AND "s".slug = ${input.subcategorySlug}` : Prisma.empty}
    ORDER BY f.id, c.sort_order ASC, s.sort_order ASC, f.slug ASC
  `
    : Prisma.sql`
      SELECT
        NULL::text AS entity_type,
        NULL::bigint AS product_id,
        NULL::bigint AS family_id,
        NULL::text AS product_slug,
        NULL::text AS product_sku,
        NULL::text AS product_name,
        NULL::text AS product_brand,
        NULL::text AS product_tags,
        NULL::text AS product_description,
        NULL::text AS product_description_seo,
        NULL::text AS attributes_text,
        NULL::text AS family_name,
        NULL::text AS family_slug,
        NULL::text AS family_subtitle,
        NULL::text AS family_description,
        NULL::text AS family_description_seo,
        NULL::text AS family_members_text,
        NULL::bigint AS category_id,
        NULL::text AS category_name,
        NULL::text AS category_slug,
        NULL::text AS category_subtitle,
        NULL::text AS category_description,
        NULL::text AS category_description_seo,
        NULL::text AS category_theme_color,
        NULL::integer AS category_sort,
        FALSE::boolean AS category_is_promoted,
        NULL::bigint AS subcategory_id,
        NULL::text AS subcategory_name,
        NULL::text AS subcategory_slug,
        NULL::text AS subcategory_subtitle,
        NULL::text AS subcategory_description,
        NULL::text AS subcategory_description_seo,
        NULL::integer AS subcategory_sort
      WHERE FALSE
    `;

  const productQuery = Prisma.sql`
    SELECT DISTINCT ON (p.id)
      CASE
        WHEN p.kind IN ('STANDARD', 'SINGLE') THEN 'SINGLE'::text
        WHEN p.kind = 'VARIANT' THEN 'VARIANT'::text
      END AS entity_type,
      p.id AS product_id,
      NULL::bigint AS family_id,
      p.slug AS product_slug,
      p.sku AS product_sku,
      p.name AS product_name,
      p_brand.name AS product_brand,
      p.tags AS product_tags,
      p.rich_text_description::text AS product_description,
      p.description_seo AS product_description_seo,
      (
        SELECT COALESCE(string_agg(pa.name || ' ' || pa.value, ' '), '')
        FROM product_attributes pa
        WHERE pa.product_id = p.id
      ) AS attributes_text,
      NULL::text AS family_name,
      NULL::text AS family_slug,
      NULL::text AS family_subtitle,
      NULL::text AS family_description,
      NULL::text AS family_description_seo,
      NULL::text AS family_members_text,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      c.subtitle AS category_subtitle,
      c.description AS category_description,
      c.description_seo AS category_description_seo,
      c.theme_color AS category_theme_color,
      c.sort_order AS category_sort,
      ${publicCategoryPromotionSql} AS category_is_promoted,
      s.id AS subcategory_id,
      s.name AS subcategory_name,
      s.slug AS subcategory_slug,
      s.subtitle AS subcategory_subtitle,
      s.description AS subcategory_description,
      s.description_seo AS subcategory_description_seo,
      s.sort_order AS subcategory_sort
    FROM products p
    LEFT JOIN organizations p_brand ON p_brand.id = p.brand_id
    ${includeFamilies ? Prisma.sql`LEFT JOIN product_family_members fm ON fm.product_id = p.id` : Prisma.empty}
    JOIN product_subcategory_links l ON l.product_id = p.id
    JOIN product_subcategories s ON s.id = l.subcategory_id AND s.is_active = true AND s.visible_vitrine = true
    JOIN product_types c ON c.id = s.category_id AND c.is_active = true
    WHERE ${
      includeFamilies
        ? Prisma.sql`(p.kind IN ('STANDARD', 'SINGLE') OR (p.kind = 'VARIANT' AND fm.product_id IS NULL))`
        : Prisma.sql`p.kind IN ('STANDARD', 'SINGLE', 'VARIANT')`
    } AND p.lifecycle <> 'DISCONTINUED'
      AND p.visible_vitrine = true
    ${advancedSearchCondition}
    ${promotionCondition}
    ${input.categorySlug ? Prisma.sql`AND "c".slug = ${input.categorySlug}` : Prisma.empty}
    ${input.subcategorySlug ? Prisma.sql`AND "s".slug = ${input.subcategorySlug}` : Prisma.empty}
    ORDER BY p.id, c.sort_order ASC, s.sort_order ASC, p.slug ASC
  `;

  const candidateEntriesQuery = Prisma.sql`
    WITH candidate_entries AS (
      (${familyQuery})
      UNION ALL
      (${productQuery})
    )
    SELECT *
    FROM candidate_entries
    ORDER BY category_sort ASC NULLS LAST, subcategory_sort ASC NULLS LAST, product_slug ASC
  `;

  let rows: PublicIndexRow[];
  let relevanceScoreByRowKey = new Map<string, number>();
  let total: number;

  if (normalSearchQuery) {
    const candidates = await prisma.$queryRaw<PublicIndexRow[]>(candidateEntriesQuery);
    const rankedEntries = rankPublicProductSearchRowsWithScores(candidates, normalSearchQuery, {
      limit: input.searchLimit ? Math.max(input.searchLimit, offset + pageSize) : null,
    });

    total = rankedEntries.length;
    const pageEntries = rankedEntries.slice(offset, offset + pageSize);
    rows = pageEntries.map((entry) => entry.row);
    relevanceScoreByRowKey = new Map(
      pageEntries.map((entry) => [
        `${entry.row.entity_type}:${entry.row.family_id ?? entry.row.product_id}:${entry.row.category_id}:${entry.row.subcategory_id}`,
        entry.score,
      ]),
    );
  } else {
    rows = await prisma.$queryRaw<PublicIndexRow[]>(Prisma.sql`
      ${candidateEntriesQuery}
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    const totalResult = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      WITH candidate_entries AS (
        (${familyQuery})
        UNION ALL
        (${productQuery})
      )
      SELECT COUNT(*)::bigint AS count FROM candidate_entries
    `);

    total = Number(totalResult[0]?.count ?? 0);
  }

  if (rows.length === 0) {
    return {
      items: [],
      total,
      page: input.page,
      pageSize,
    };
  }

  const familyIds = rows.map((row) => row.family_id).filter((id): id is bigint => id != null);
  const productIds = rows.map((row) => row.product_id).filter((id): id is bigint => id != null);

  const [families, products] = await Promise.all([
    familyIds.length
      ? prisma.productFamily.findMany({
          where: {
            id: { in: familyIds },
          },
          select: PUBLIC_FAMILY_SELECT,
        })
      : Promise.resolve([]),
    productIds.length
      ? prisma.product.findMany({
          where: {
            id: { in: productIds },
            lifecycle: { not: "DISCONTINUED" },
          },
          select: PUBLIC_PRODUCT_SELECT,
        })
      : Promise.resolve([]),
  ]);

  await Promise.all([
    makeMediaPublicMany(families.flatMap(collectMediaIdsForPublishing)),
    makeMediaPublicMany(collectProductMediaIdsForPublishing(products)),
  ]);

  const familySummaryMap = new Map<number, PublicProductSummary>();
  for (const family of families) {
    const { defaultVariant } = pickDefaultPublicVariant(family);
    if (!defaultVariant) {
      continue;
    }
    familySummaryMap.set(Number(family.id), mapFamilySummary(family, defaultVariant));
  }

  const productSummaryMap = new Map<number, PublicProductSummary>();
  for (const product of products) {
    productSummaryMap.set(
      Number(product.id),
      mapProductSummary(product, product.kind === "VARIANT" ? "VARIANT" : "SINGLE"),
    );
  }

  const indexItems = rows
    .map((row): PublicProductIndexItem | null => {
      const category = mapIndexCategory({
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        subtitle: row.category_subtitle,
        themeColor: row.category_theme_color,
        sortOrder: row.category_sort,
        isPromoted: row.category_is_promoted,
      });
      const subcategory = mapIndexSubcategory({
        id: row.subcategory_id,
        name: row.subcategory_name,
        slug: row.subcategory_slug,
        subtitle: row.subcategory_subtitle,
        description: row.subcategory_description,
        sortOrder: row.subcategory_sort,
        category: {
          id: row.category_id,
          slug: row.category_slug,
        },
      });

      const summary =
        row.entity_type === "FAMILY"
          ? familySummaryMap.get(Number(row.family_id))
          : productSummaryMap.get(Number(row.product_id));

      if (!summary) {
        return null;
      }

      const relevanceScore = relevanceScoreByRowKey.get(
        `${row.entity_type}:${row.family_id ?? row.product_id}:${row.category_id}:${row.subcategory_id}`,
      );

      return {
        product: summary,
        category,
        subcategory,
        ...(relevanceScore == null ? {} : { relevanceScore }),
      };
    })
    .filter((item): item is PublicProductIndexItem => item != null);

  return {
    items: normalSearchQuery ? indexItems : sortIndexItems(indexItems),
    total,
    page: input.page,
    pageSize,
  };
}

function parseRelatedAttributes(value: unknown): RelatedProductAttributeProfile[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): RelatedProductAttributeProfile | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const key = typeof record.key === "string" ? record.key : "";
      const name = typeof record.name === "string" ? record.name : key;
      const rawValue = typeof record.value === "string" ? record.value : "";
      const unit = typeof record.unit === "string" ? record.unit : null;
      const groupName = typeof record.groupName === "string" ? record.groupName : null;

      if (!key || !name || !rawValue) {
        return null;
      }

      return {
        key,
        name,
        value: rawValue,
        unit,
        groupName,
      };
    })
    .filter((entry): entry is RelatedProductAttributeProfile => entry != null);
}

function mapInspectorAttributesForRelated(
  attributes: PublicProductInspectorAttribute[],
): RelatedProductAttributeProfile[] {
  return attributes.map((attribute) => ({
    key: attribute.attributeId || attribute.kind || attribute.name,
    name: attribute.name,
    value: attribute.value,
    unit: attribute.unit,
    groupName: attribute.groupName,
  }));
}

function normalizeBigintArray(value: unknown) {
  return Array.isArray(value) ? value.map((entry) => Number(entry)).filter(Number.isFinite) : [];
}

function splitTags(value: string | null | undefined) {
  return (value ?? "")
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildRelatedProfileFromInspector(
  product: PublicProductInspector | PublicSimpleProductInspector,
): RelatedProductProfile {
  if ("variants" in product) {
    const attributes = product.variants.flatMap((variant) =>
      mapInspectorAttributesForRelated(variant.attributes),
    );
    const productUseAttributes = attributes
      .filter((attribute) => normalizeComparableValue(attribute.key) === "product_use")
      .map((attribute) => attribute.value);

    return {
      key: `FAMILY:${product.id}`,
      entityType: "FAMILY",
      id: product.id,
      slug: product.slug,
      productIds: product.variants.map((variant) => variant.id),
      familyIds: [product.id],
      names: [
        product.name,
        product.subtitle,
        product.description,
        ...product.variants.flatMap((variant) => [variant.displayName, variant.name]),
      ].filter((value): value is string => Boolean(value)),
      skus: product.variants.map((variant) => variant.sku),
      brandNames: [product.brand?.name, product.brandName].filter((value): value is string =>
        Boolean(value),
      ),
      productTypeSlugs: [],
      productTypeNames: productUseAttributes,
      categorySlugs: product.subcategories.map((subcategory) => subcategory.categorySlug),
      categoryNames: product.subcategories.map((subcategory) => subcategory.categoryName),
      subcategorySlugs: product.subcategories.map((subcategory) => subcategory.slug),
      subcategoryNames: product.subcategories.map((subcategory) => subcategory.name),
      tags: [],
      descriptions: [
        product.description,
        product.descriptionSeo,
        ...product.variants.map((variant) => parseRichTextPreview(variant.description)),
      ].filter((value): value is string => Boolean(value)),
      attributes,
    };
  }

  const attributes = mapInspectorAttributesForRelated(product.attributes);
  const productUseAttributes = attributes
    .filter((attribute) => normalizeComparableValue(attribute.key) === "product_use")
    .map((attribute) => attribute.value);

  return {
    key: `${product.kind}:${product.id}`,
    entityType: product.kind,
    id: product.id,
    slug: product.slug,
    productIds: [product.id],
    familyIds: [],
    names: [product.displayName, product.name],
    skus: [product.sku],
    brandNames: [product.brand?.name, ...product.brandNames].filter((value): value is string =>
      Boolean(value),
    ),
    productTypeSlugs: [],
    productTypeNames: productUseAttributes,
    categorySlugs: product.subcategories.map((subcategory) => subcategory.categorySlug),
    categoryNames: product.subcategories.map((subcategory) => subcategory.categoryName),
    subcategorySlugs: product.subcategories.map((subcategory) => subcategory.slug),
    subcategoryNames: product.subcategories.map((subcategory) => subcategory.name),
    tags: [],
    descriptions: [parseRichTextPreview(product.description), product.descriptionSeo].filter(
      (value): value is string => Boolean(value),
    ),
    attributes,
  };
}

function buildRelatedProfileFromRow(row: PublicRelatedIndexRow): RelatedProductProfile {
  const entityType = row.entity_type;
  const id = Number(row.family_id ?? row.product_id ?? 0);

  return {
    key: `${entityType}:${id}`,
    entityType,
    id,
    slug: row.product_slug,
    productIds: normalizeBigintArray(row.product_ids),
    familyIds: row.family_id == null ? [] : [Number(row.family_id)],
    names: [
      row.product_display_name,
      row.product_name,
      row.family_name,
      row.family_subtitle,
      row.product_type_name,
      row.category_name,
      row.subcategory_name,
    ].filter((value): value is string => Boolean(value)),
    skus: [row.product_sku].filter((value): value is string => Boolean(value)),
    brandNames: [row.product_brand].filter((value): value is string => Boolean(value)),
    productTypeSlugs: [row.product_type_slug].filter((value): value is string => Boolean(value)),
    productTypeNames: [row.product_type_name].filter((value): value is string => Boolean(value)),
    categorySlugs: [row.category_slug],
    categoryNames: [row.category_name],
    subcategorySlugs: [row.subcategory_slug],
    subcategoryNames: [row.subcategory_name],
    tags: splitTags(row.product_tags),
    descriptions: [
      row.product_description,
      row.product_description_seo,
      row.family_description,
      row.family_description_seo,
      row.family_members_text,
    ].filter((value): value is string => Boolean(value)),
    attributes: [
      ...parseRelatedAttributes(row.attributes_json),
      ...parseRelatedAttributes(row.family_attributes_json),
    ],
  };
}

async function listPublicRelatedCandidateRows() {
  return await prisma.$queryRaw<PublicRelatedIndexRow[]>(Prisma.sql`
    WITH family_entries AS (
      SELECT DISTINCT ON (f.id, s.id)
        'FAMILY'::text AS entity_type,
        NULL::bigint AS product_id,
        f.id AS family_id,
        f.slug AS product_slug,
        p.sku AS product_sku,
        p.name AS product_name,
        p.display_name AS product_display_name,
        p_brand.name AS product_brand,
        p.tags AS product_tags,
        p.rich_text_description::text AS product_description,
        p.description_seo AS product_description_seo,
        (
          SELECT COALESCE(string_agg(concat_ws(' ', pa.name, pa.label, pa.value, pa.unit, pa.group_name), ' '), '')
          FROM product_attributes pa
          WHERE pa.product_id = p.id
        ) AS attributes_text,
        (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'key', pa.name,
            'name', COALESCE(NULLIF(pa.label, ''), pa.name),
            'value', pa.value,
            'unit', pa.unit,
            'groupName', pa.group_name
          ) ORDER BY pa.group_sort_order, pa.sort_order, pa.name), '[]'::jsonb)
          FROM product_attributes pa
          WHERE pa.product_id = p.id
        ) AS attributes_json,
        f.name AS family_name,
        f.slug AS family_slug,
        f.subtitle AS family_subtitle,
        f.description AS family_description,
        f.description_seo AS family_description_seo,
        (
          SELECT COALESCE(string_agg(concat_ws(' ',
            fp.sku,
            fp.slug,
            fp.name,
            fp.display_name,
            fp.tags,
            fp_brand.name,
            fp.rich_text_description::text,
            fp.description_seo,
            (
              SELECT COALESCE(string_agg(fpa.name || ' ' || fpa.value, ' '), '')
              FROM product_attributes fpa
              WHERE fpa.product_id = fp.id
            )
          ), ' '), '')
          FROM product_family_members fm2
          JOIN products fp ON fp.id = fm2.product_id
          LEFT JOIN organizations fp_brand ON fp_brand.id = fp.brand_id
          WHERE fm2.family_id = f.id
            AND fp.lifecycle <> 'DISCONTINUED'
            AND fp.visible_vitrine = true
        ) AS family_members_text,
        (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'key', fpa.name,
            'name', COALESCE(NULLIF(fpa.label, ''), fpa.name),
            'value', fpa.value,
            'unit', fpa.unit,
            'groupName', fpa.group_name
          ) ORDER BY fpa.group_sort_order, fpa.sort_order, fpa.name), '[]'::jsonb)
          FROM product_family_members fm3
          JOIN products fp ON fp.id = fm3.product_id
          JOIN product_attributes fpa ON fpa.product_id = fp.id
          WHERE fm3.family_id = f.id
            AND fp.lifecycle <> 'DISCONTINUED'
            AND fp.visible_vitrine = true
        ) AS family_attributes_json,
        (
          SELECT ARRAY_AGG(fp.id ORDER BY fm4.sort_order, fp.id)
          FROM product_family_members fm4
          JOIN products fp ON fp.id = fm4.product_id
          WHERE fm4.family_id = f.id
            AND fp.lifecycle <> 'DISCONTINUED'
            AND fp.visible_vitrine = true
        ) AS product_ids,
        pt.id AS product_type_id,
        pt.name AS product_type_name,
        pt.slug AS product_type_slug,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.subtitle AS category_subtitle,
        c.description AS category_description,
        c.description_seo AS category_description_seo,
        c.theme_color AS category_theme_color,
        c.sort_order AS category_sort,
        ${publicCategoryPromotionSql} AS category_is_promoted,
        s.id AS subcategory_id,
        s.name AS subcategory_name,
        s.slug AS subcategory_slug,
        s.subtitle AS subcategory_subtitle,
        s.description AS subcategory_description,
        s.description_seo AS subcategory_description_seo,
        s.sort_order AS subcategory_sort
      FROM product_families f
      JOIN product_family_members m ON m.family_id = f.id
      JOIN products p ON p.id = m.product_id
      LEFT JOIN organizations p_brand ON p_brand.id = p.brand_id
      JOIN product_type_templates pt ON pt.id = p.product_type_id
      JOIN product_subcategory_links l ON l.product_id = p.id
      JOIN product_subcategories s ON s.id = l.subcategory_id AND s.is_active = true AND s.visible_vitrine = true
      JOIN product_types c ON c.id = s.category_id AND c.is_active = true
      WHERE p.kind = 'VARIANT'
        AND p.lifecycle <> 'DISCONTINUED'
        AND p.visible_vitrine = true
      ORDER BY f.id, s.id, m.sort_order ASC, p.id ASC
    ),
    product_entries AS (
      SELECT DISTINCT ON (p.id, s.id)
        CASE
          WHEN p.kind IN ('STANDARD', 'SINGLE') THEN 'SINGLE'::text
          WHEN p.kind = 'VARIANT' THEN 'VARIANT'::text
        END AS entity_type,
        p.id AS product_id,
        NULL::bigint AS family_id,
        p.slug AS product_slug,
        p.sku AS product_sku,
        p.name AS product_name,
        p.display_name AS product_display_name,
        p_brand.name AS product_brand,
        p.tags AS product_tags,
        p.rich_text_description::text AS product_description,
        p.description_seo AS product_description_seo,
        (
          SELECT COALESCE(string_agg(concat_ws(' ', pa.name, pa.label, pa.value, pa.unit, pa.group_name), ' '), '')
          FROM product_attributes pa
          WHERE pa.product_id = p.id
        ) AS attributes_text,
        (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'key', pa.name,
            'name', COALESCE(NULLIF(pa.label, ''), pa.name),
            'value', pa.value,
            'unit', pa.unit,
            'groupName', pa.group_name
          ) ORDER BY pa.group_sort_order, pa.sort_order, pa.name), '[]'::jsonb)
          FROM product_attributes pa
          WHERE pa.product_id = p.id
        ) AS attributes_json,
        NULL::text AS family_name,
        NULL::text AS family_slug,
        NULL::text AS family_subtitle,
        NULL::text AS family_description,
        NULL::text AS family_description_seo,
        NULL::text AS family_members_text,
        '[]'::jsonb AS family_attributes_json,
        ARRAY[p.id]::bigint[] AS product_ids,
        pt.id AS product_type_id,
        pt.name AS product_type_name,
        pt.slug AS product_type_slug,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.subtitle AS category_subtitle,
        c.description AS category_description,
        c.description_seo AS category_description_seo,
        c.theme_color AS category_theme_color,
        c.sort_order AS category_sort,
        ${publicCategoryPromotionSql} AS category_is_promoted,
        s.id AS subcategory_id,
        s.name AS subcategory_name,
        s.slug AS subcategory_slug,
        s.subtitle AS subcategory_subtitle,
        s.description AS subcategory_description,
        s.description_seo AS subcategory_description_seo,
        s.sort_order AS subcategory_sort
      FROM products p
      LEFT JOIN organizations p_brand ON p_brand.id = p.brand_id
      LEFT JOIN product_family_members fm ON fm.product_id = p.id
      JOIN product_type_templates pt ON pt.id = p.product_type_id
      JOIN product_subcategory_links l ON l.product_id = p.id
      JOIN product_subcategories s ON s.id = l.subcategory_id AND s.is_active = true AND s.visible_vitrine = true
      JOIN product_types c ON c.id = s.category_id AND c.is_active = true
      WHERE (p.kind IN ('STANDARD', 'SINGLE') OR (p.kind = 'VARIANT' AND fm.product_id IS NULL))
        AND p.lifecycle <> 'DISCONTINUED'
        AND p.visible_vitrine = true
      ORDER BY p.id, s.id, p.slug ASC
    )
    SELECT *
    FROM family_entries
    UNION ALL
    SELECT *
    FROM product_entries
  `);
}

export async function findPublicRelatedProducts(
  product: PublicProductInspector | PublicSimpleProductInspector,
  options?: {
    threshold?: number;
    limit?: number;
  },
): Promise<PublicRelatedProductItem[]> {
  const rows = await listPublicRelatedCandidateRows();
  const targetProfile = buildRelatedProfileFromInspector(product);
  const candidates = rows.map((row) => ({
    row,
    profile: buildRelatedProfileFromRow(row),
  }));
  const matches = rankRelatedProductProfiles(targetProfile, candidates, {
    threshold: options?.threshold ?? RELATED_PRODUCTS_DEFAULT_THRESHOLD,
    limit: options?.limit ?? RELATED_PRODUCTS_DEFAULT_LIMIT,
  });

  if (matches.length === 0) {
    return [];
  }

  const matchedRows = matches.map((match) => match.item.row);
  const familyIds = matchedRows
    .map((row) => row.family_id)
    .filter((id): id is bigint => id != null);
  const productIds = matchedRows
    .map((row) => row.product_id)
    .filter((id): id is bigint => id != null);

  const [families, products] = await Promise.all([
    familyIds.length
      ? prisma.productFamily.findMany({
          where: {
            id: { in: familyIds },
          },
          select: PUBLIC_FAMILY_SELECT,
        })
      : Promise.resolve([]),
    productIds.length
      ? prisma.product.findMany({
          where: {
            id: { in: productIds },
            lifecycle: { not: "DISCONTINUED" },
          },
          select: PUBLIC_PRODUCT_SELECT,
        })
      : Promise.resolve([]),
  ]);

  await Promise.all([
    makeMediaPublicMany(families.flatMap(collectMediaIdsForPublishing)),
    makeMediaPublicMany(collectProductMediaIdsForPublishing(products)),
  ]);

  const familySummaryMap = new Map<number, PublicProductSummary>();
  for (const family of families) {
    const { defaultVariant } = pickDefaultPublicVariant(family);
    if (!defaultVariant) {
      continue;
    }
    familySummaryMap.set(Number(family.id), mapFamilySummary(family, defaultVariant));
  }

  const productSummaryMap = new Map<number, PublicProductSummary>();
  for (const productRecord of products) {
    productSummaryMap.set(
      Number(productRecord.id),
      mapProductSummary(productRecord, productRecord.kind === "VARIANT" ? "VARIANT" : "SINGLE"),
    );
  }

  return matches
    .map((match): PublicRelatedProductItem | null => {
      const row = match.item.row;
      const summary =
        row.entity_type === "FAMILY"
          ? familySummaryMap.get(Number(row.family_id))
          : productSummaryMap.get(Number(row.product_id));

      if (!summary) {
        return null;
      }

      return {
        product: summary,
        category: mapIndexCategory({
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          subtitle: row.category_subtitle,
          themeColor: row.category_theme_color,
          sortOrder: row.category_sort,
          isPromoted: row.category_is_promoted,
        }),
        subcategory: mapIndexSubcategory({
          id: row.subcategory_id,
          name: row.subcategory_name,
          slug: row.subcategory_slug,
          subtitle: row.subcategory_subtitle,
          description: row.subcategory_description,
          sortOrder: row.subcategory_sort,
          category: {
            id: row.category_id,
            slug: row.category_slug,
          },
        }),
        relationshipScore: match.score,
        relationshipReasons: match.reasons,
      };
    })
    .filter((item): item is PublicRelatedProductItem => item != null);
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
  const [colorLookup, finishLookup] = await Promise.all([
    loadProductColorReferenceLookup(),
    loadProductFinishReferenceLookup(),
  ]);

  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle,
    description: record.description,
    descriptionSeo: record.descriptionSeo,
    brand: mapProductBrand(defaultVariant.brand),
    brandName: getBrandName(defaultVariant.brand),
    coverMedia,
    defaultVariantId: Number(defaultVariant.id),
    variants,
    subcategories: buildFamilySubcategories(publicVariants),
    colorReferences: buildColorReferences(variants, colorLookup),
    finishReferences: buildFinishReferences(variants, finishLookup),
  };
}

export async function findPublicSingleProductBySlug(
  productSlug: string,
): Promise<PublicSimpleProductInspector | null> {
  const record = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      kind: { in: ["STANDARD", "SINGLE"] },
      lifecycle: { not: "DISCONTINUED" },
      visibleVitrine: true,
      subcategories: {
        some: {
          subcategory: {
            isActive: true,
            visibleVitrine: true,
            category: {
              isActive: true,
            },
          },
        },
      },
    },
    select: PUBLIC_PRODUCT_SELECT,
  });

  if (!record || !isPublicSingleProduct(record)) {
    return null;
  }

  await makeMediaPublicMany(collectProductMediaIdsForPublishing([record]));

  const brandName = getBrandName(record.brand);
  const brand = mapProductBrand(record.brand);

  return await mapSimpleInspector(record, {
    kind: "SINGLE",
    brand,
    brandNames: brandName ? [brandName] : [],
  });
}

export async function findPublicProductBySlug(
  productSlug: string,
): Promise<PublicSimpleProductInspector | null> {
  const record = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      kind: {
        in: ["STANDARD", "SINGLE", "VARIANT"],
      },
      lifecycle: { not: "DISCONTINUED" },
      visibleVitrine: true,
      subcategories: {
        some: {
          subcategory: {
            isActive: true,
            visibleVitrine: true,
            category: {
              isActive: true,
            },
          },
        },
      },
    },
    select: PUBLIC_PRODUCT_SELECT,
  });

  if (
    !record ||
    (record.kind !== "STANDARD" && record.kind !== "SINGLE" && record.kind !== "VARIANT")
  ) {
    return null;
  }

  await makeMediaPublicMany(collectProductMediaIdsForPublishing([record]));

  const brandName = getBrandName(record.brand);
  const brand = mapProductBrand(record.brand);

  return await mapSimpleInspector(record, {
    kind: record.kind === "VARIANT" ? "VARIANT" : "SINGLE",
    brand,
    brandNames: brandName ? [brandName] : [],
  });
}

export async function findProductLifecycleBySlug(productSlug: string) {
  const record = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { lifecycle: true },
  });

  return record?.lifecycle ?? null;
}
