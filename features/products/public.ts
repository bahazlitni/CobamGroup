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
  resolveFinishURL,
} from "@/lib/static_tables/finishes";
import { rankPublicProductSearchRows } from "./search";
import type {
  PublicProductColorReference,
  PublicProductFinishReference,
  PublicProductInspector,
  PublicProductInspectorAttribute,
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
  PublicProductIndexCategory,
  PublicProductIndexItem,
  PublicProductIndexResult,
  PublicProductIndexSubcategory,
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
  PublicProductIndexItem,
  PublicProductIndexResult,
  PublicProductListResult,
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
  brand: true,
  basePriceAmount: true,
  vatRate: true,
  visibility: true,
  priceVisibility: true,
  stockVisibility: true,
  stock: true,
  stockUnit: true,
  lifecycle: true,
  commercialMode: true,
  tags: true,
  datasheetMedia: {
    select: MEDIA_SELECT,
  },
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
  brand: true,
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

type PublicIndexRow = {
  entity_type: "FAMILY" | "SINGLE" | "PACK" | "VARIANT";
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
  pack_components_text: string | null;
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
  subcategory_id: bigint;
  subcategory_name: string;
  subcategory_slug: string;
  subcategory_subtitle: string | null;
  subcategory_description: string | null;
  subcategory_description_seo: string | null;
  subcategory_sort: number | null;
};

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
    if (member.product.datasheetMedia && isRenderableMedia(member.product.datasheetMedia)) {
      ids.add(Number(member.product.datasheetMedia.id));
    }

    for (const link of member.product.mediaLinks) {
      if (isRenderableMedia(link.media)) {
        ids.add(Number(link.media.id));
      }
    }
  }

  return [...ids];
}

function collectProductMediaIdsForPublishing(
  records: Array<Pick<PublicProductRecord, "mediaLinks" | "datasheetMedia">>,
) {
  const ids = new Set<number>();

  for (const record of records) {
    if (record.datasheetMedia && isRenderableMedia(record.datasheetMedia)) {
      ids.add(Number(record.datasheetMedia.id));
    }

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

function getBrandName(brand: string | null | undefined) {
  return formatProductBrandValue(brand);
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

function mapIndexCategory(record: {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  themeColor: string | null;
  sortOrder: number | null;
}): PublicProductIndexCategory {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle ?? null,
    themeColor: record.themeColor ?? null,
    sortOrder: record.sortOrder ?? 0,
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

function getAttributePresentation(kind: string) {
  const canonicalKind = normalizeProductAttributeKind(kind);
  const resolvedAttribute = resolveProductAttribute(kind);

  return {
    attributeId: canonicalKind || kind,
    kind: canonicalKind || kind,
    name: formatProductAttributeKind(kind),
    unit: getProductAttributeUnit(kind),
    specialType:
      resolvedAttribute?.key === "FINISH"
        ? ("FINISH" as const)
        : resolvedAttribute?.key === "COLOR"
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
        const brandName = getBrandName(line.product.brand);
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


function mapFamilySummary(record: PublicFamilyRecord, defaultVariant: PublicProductRecord | null): PublicProductSummary {
  const coverMedia = buildFamilyCoverMedia(record, defaultVariant);

  return {
    id: Number(record.id),
    entityType: "FAMILY",
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle,
    description: parseRichTextPreview(record.description) ?? parseRichTextPreview(defaultVariant?.description ?? null),
    brandName: getBrandName(defaultVariant?.brand ?? null),
    imageUrl: coverMedia?.url ?? null,
    imageThumbnailUrl: coverMedia?.thumbnailUrl ?? null,
    imageAlt: coverMedia?.altText ?? record.name,
    price:
      defaultVariant?.priceVisibility && defaultVariant.basePriceAmount != null
        ? formatDecimal(defaultVariant.basePriceAmount)
        : null,
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
    name: record.name,
    slug: record.slug,
    subtitle: null,
    description: parseRichTextPreview(record.description),
    brandName: getBrandName(record.brand),
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
        (entry) => normalizeComparableValue(entry.key) === key,
      );

      seen.set(key, {
        key: color?.key ?? key,
        label: color?.label ?? attribute.value,
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

      const resolvedFinish = resolveFinish(attribute.value);
      const key = normalizeComparableValue(resolvedFinish?.key ?? attribute.value);
      if (seen.has(key)) {
        continue;
      }

      seen.set(key, {
        key: resolvedFinish?.key ?? key,
        name: resolvedFinish?.label ?? attribute.value,
        colorHex: resolvedFinish?.color ?? null,
        imageUrl: resolvedFinish ? resolveFinishURL(resolvedFinish) : null,
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
    stock: formatDecimal(product.stock),
    stockUnit: product.stockUnit,
    stockVisibility: product.stockVisibility ?? false,
    datasheet: mapMediaRecord(product.datasheetMedia),
    media: mapVariantMedia(product),
    attributes: mapVariantAttributes(product),
  };
}

function mapSimpleInspector(record: PublicProductRecord, input: {
  kind: "PACK" | "SINGLE" | "VARIANT";
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
    datasheet: input.kind === "PACK" ? null : mapMediaRecord(record.datasheetMedia),
    basePriceAmount: input.priceVisibility ? input.basePriceAmount : null,
    priceVisibility: input.priceVisibility,
    stock: formatDecimal(record.stock),
    stockUnit: record.stockUnit,
    stockVisibility: record.stockVisibility ?? false,
    commercialMode: input.commercialMode,
    subcategories: mapSubcategoryLinks(record.subcategoryLinks),
    attributes,
    colorReferences: buildColorReferencesFromAttributes([attributes]),
    finishReferences: buildFinishReferencesFromAttributes([attributes]),
  };
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



function buildAdvancedSearchAst(q: string) {
  const isAdvancedSearch = /^(?:brand|sku|name|date)(?::[123])?=/i.test(q);
  if (!isAdvancedSearch) return null;

  const tokens: string[] = [];
  let remainder = q;
  while (remainder.length > 0) {
    if (remainder.startsWith('||')) {
      tokens.push('||');
      remainder = remainder.slice(2);
    } else if (remainder.startsWith('|')) {
      tokens.push('|');
      remainder = remainder.slice(1);
    } else if (remainder.startsWith('&')) {
      tokens.push('&');
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
  const step1: any[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '||') {
      const left = step1.pop();
      const right = tokens[++i];
      if (!left || !right) return null;
      step1.push({ type: 'OR_GROUP', left, right });
    } else {
      step1.push(tokens[i]);
    }
  }

  const step2: any[] = [];
  for (let i = 0; i < step1.length; i++) {
    if (step1[i] === '&') {
      const left = step2.pop();
      const right = step1[++i];
      if (!left || !right) return null;
      step2.push({ type: 'AND', left, right });
    } else {
      step2.push(step1[i]);
    }
  }

  const step3: any[] = [];
  for (let i = 0; i < step2.length; i++) {
    if (step2[i] === '|') {
      const left = step3.pop();
      const right = step2[++i];
      if (!left || !right) return null;
      step3.push({ type: 'OR', left, right });
    } else {
      step3.push(step2[i]);
    }
  }

  if (step3.length !== 1) return null;
  return step3[0];
}

function buildSqlFromAst(node: any): import("@prisma/client").Prisma.Sql {
  if (typeof node === 'string') {
    const match = node.match(/^((?:brand|sku|name|date))(?::([123]))?=([^&|]*)$/i);
    if (!match) return Prisma.empty;
    const key = match[1].toLowerCase();
    const op = match[2] || '1';
    const val = match[3];

    let sqlPattern;
    if (op === '1') sqlPattern = `${val}%`;
    else if (op === '2') sqlPattern = val;
    else if (op === '3') sqlPattern = `%${val}%`;
    else return Prisma.empty;

    if (key === 'brand') return Prisma.sql`"p"."brand" ILIKE ${sqlPattern}`;
    if (key === 'sku') return Prisma.sql`"p"."sku" ILIKE ${sqlPattern}`;
    if (key === 'name') return Prisma.sql`"p"."name" ILIKE ${sqlPattern}`;
    return Prisma.empty;
  }

  const left = buildSqlFromAst(node.left);
  const right = buildSqlFromAst(node.right);

  if (node.type === 'AND') return Prisma.sql`(${left} AND ${right})`;
  if (node.type === 'OR' || node.type === 'OR_GROUP') return Prisma.sql`(${left} OR ${right})`;

  return Prisma.empty;
}

export async function listPublicProductsIndex(input: {
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  includeFamilies?: boolean;
  page: number;
  pageSize?: number;
  q?: string | null;
}): Promise<PublicProductIndexResult> {
  const pageSize = input.pageSize ?? PUBLIC_PRODUCTS_INDEX_PAGE_SIZE;
  const offset = (input.page - 1) * pageSize;
  const advancedSearchAst = input.q ? buildAdvancedSearchAst(input.q) : null;
  const normalSearchQuery = input.q?.trim() && !advancedSearchAst ? input.q.trim() : null;

  const advancedSearchCondition = advancedSearchAst
    ? Prisma.sql`AND (${buildSqlFromAst(advancedSearchAst)})`
    : Prisma.empty;

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
      p.brand AS product_brand,
      p.tags AS product_tags,
      p.description AS product_description,
      p.description_seo AS product_description_seo,
      (
        SELECT COALESCE(string_agg(pa.kind || ' ' || pa.value, ' '), '')
        FROM product_attributes pa
        WHERE pa.product_id = p.id
      ) AS attributes_text,
      NULL::text AS pack_components_text,
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
          fp.brand,
          fp.tags,
          fp.description,
          fp.description_seo,
          (
            SELECT COALESCE(string_agg(fpa.kind || ' ' || fpa.value, ' '), '')
            FROM product_attributes fpa
            WHERE fpa.product_id = fp.id
          )
        ), ' '), '')
        FROM product_family_members fm2
        JOIN products fp ON fp.id = fm2.product_id
        WHERE fm2.family_id = f.id
      ) AS family_members_text,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      c.subtitle AS category_subtitle,
      c.description AS category_description,
      c.description_seo AS category_description_seo,
      c.theme_color AS category_theme_color,
      c.sort_order AS category_sort,
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
    JOIN product_subcategory_links l ON l.product_id = p.id
    JOIN product_subcategories s ON s.id = l.subcategory_id AND s.is_active = true
    JOIN product_types c ON c.id = s.category_id AND c.is_active = true
    WHERE p.kind = 'VARIANT' AND p.lifecycle = 'ACTIVE' AND p.visibility IS TRUE
    ${advancedSearchCondition}
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
        NULL::text AS pack_components_text,
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
        WHEN p.kind = 'SINGLE' THEN 'SINGLE'::text
        WHEN p.kind = 'VARIANT' THEN 'VARIANT'::text
        ELSE 'PACK'::text
      END AS entity_type,
      p.id AS product_id,
      NULL::bigint AS family_id,
      p.slug AS product_slug,
      p.sku AS product_sku,
      p.name AS product_name,
      p.brand AS product_brand,
      p.tags AS product_tags,
      p.description AS product_description,
      p.description_seo AS product_description_seo,
      (
        SELECT COALESCE(string_agg(pa.kind || ' ' || pa.value, ' '), '')
        FROM product_attributes pa
        WHERE pa.product_id = p.id
      ) AS attributes_text,
      (
        SELECT COALESCE(string_agg(concat_ws(' ',
          cp.sku,
          cp.slug,
          cp.name,
          cp.brand,
          cp.tags,
          cp.description,
          cp.description_seo,
          (
            SELECT COALESCE(string_agg(cpa.kind || ' ' || cpa.value, ' '), '')
            FROM product_attributes cpa
            WHERE cpa.product_id = cp.id
          )
        ), ' '), '')
        FROM product_pack_lines ppl
        JOIN products cp ON cp.id = ppl.product_id
        WHERE ppl.pack_product_id = p.id
      ) AS pack_components_text,
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
      s.id AS subcategory_id,
      s.name AS subcategory_name,
      s.slug AS subcategory_slug,
      s.subtitle AS subcategory_subtitle,
      s.description AS subcategory_description,
      s.description_seo AS subcategory_description_seo,
      s.sort_order AS subcategory_sort
    FROM products p
    ${includeFamilies ? Prisma.sql`LEFT JOIN product_family_members fm ON fm.product_id = p.id` : Prisma.empty}
    JOIN product_subcategory_links l ON l.product_id = p.id
    JOIN product_subcategories s ON s.id = l.subcategory_id AND s.is_active = true
    JOIN product_types c ON c.id = s.category_id AND c.is_active = true
    WHERE ${
      includeFamilies
        ? Prisma.sql`(p.kind IN ('SINGLE', 'PACK') OR (p.kind = 'VARIANT' AND fm.product_id IS NULL))`
        : Prisma.sql`p.kind IN ('SINGLE', 'PACK', 'VARIANT')`
    } AND p.lifecycle = 'ACTIVE' AND p.visibility IS TRUE
    AND (
      p.kind <> 'PACK'
      OR (
        EXISTS (
          SELECT 1
          FROM product_pack_lines public_ppl
          WHERE public_ppl.pack_product_id = p.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM product_pack_lines public_ppl
          JOIN products public_component ON public_component.id = public_ppl.product_id
          WHERE public_ppl.pack_product_id = p.id
            AND (
              public_component.visibility IS DISTINCT FROM TRUE
              OR public_component.lifecycle IS DISTINCT FROM 'ACTIVE'
            )
        )
      )
    )
    ${advancedSearchCondition}
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
  let total: number;

  if (normalSearchQuery) {
    const candidates = await prisma.$queryRaw<PublicIndexRow[]>(candidateEntriesQuery);
    const rankedRows = rankPublicProductSearchRows(candidates, normalSearchQuery);

    total = rankedRows.length;
    rows = rankedRows.slice(offset, offset + pageSize);
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

  const familyIds = rows
    .map((row) => row.family_id)
    .filter((id): id is bigint => id != null);
  const productIds = rows
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
          },
          select: PUBLIC_PACK_SELECT,
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
    if (product.kind === "PACK") {
      const derived = derivePack(product);
      if (!derived.visibility || derived.lifecycle !== "ACTIVE") {
        continue;
      }
      productSummaryMap.set(Number(product.id), mapPackSummary(product, derived));
    } else {
      productSummaryMap.set(
        Number(product.id),
        mapProductSummary(product, product.kind === "VARIANT" ? "VARIANT" : "SINGLE"),
      );
    }
  }

  const indexItems: PublicProductIndexItem[] = rows
    .map((row) => {
      const category = mapIndexCategory({
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        subtitle: row.category_subtitle,
        themeColor: row.category_theme_color,
        sortOrder: row.category_sort,
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

      return {
        product: summary,
        category,
        subcategory,
      } satisfies PublicProductIndexItem;
    })
    .filter((item): item is PublicProductIndexItem => item != null);

  return {
    items: normalSearchQuery ? indexItems : sortIndexItems(indexItems),
    total,
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
    brandName: getBrandName(defaultVariant.brand),
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

  const brandName = getBrandName(record.brand);

  return mapSimpleInspector(record, {
    kind: "SINGLE",
    brandNames: brandName ? [brandName] : [],
    basePriceAmount: formatDecimal(record.basePriceAmount),
    priceVisibility: record.priceVisibility ?? false,
    commercialMode: record.commercialMode,
  });
}

export async function findPublicProductBySlug(
  productSlug: string,
): Promise<PublicSimpleProductInspector | null> {
  const record = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      kind: {
        in: ["SINGLE", "VARIANT"],
      },
      lifecycle: "ACTIVE",
      visibility: true,
    },
    select: PUBLIC_PRODUCT_SELECT,
  });

  if (!record || (record.kind !== "SINGLE" && record.kind !== "VARIANT")) {
    return null;
  }

  await makeMediaPublicMany(collectProductMediaIdsForPublishing([record]));

  const brandName = getBrandName(record.brand);

  return mapSimpleInspector(record, {
    kind: record.kind,
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

export async function findPublicProductOrPackBySlug(
  productSlug: string,
): Promise<PublicSimpleProductInspector | null> {
  const product = await findPublicProductBySlug(productSlug);
  if (product) {
    return product;
  }

  return findPublicPackBySlug(productSlug);
}
