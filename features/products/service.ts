import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import { canAccessProducts, canCreateProducts, canManageProducts } from "./access";
import { buildDuplicateAttributeKindMessage, findDuplicateAttributeKind } from "./attribute-kinds";
import { buildProductAttributeCreateData, mapProductAttributeRecord } from "./attribute-records";
import { resolveProductBrandOrganizationId } from "@/features/organizations/product-brand";
import { formatProductBrandValue } from "@/lib/static_tables/brands";
import {
  productBrandLabel,
  productLifecycleFromVisibility,
  richTextDescriptionToString,
  stringToRichTextDescription,
} from "./model-b-compat";
import type {
  ProductFamilyDetailDto,
  ProductFamilyListItemDto,
  ProductFamilyListResult,
  ProductFamilyUpsertInput,
  ProductFormOptionsDto,
  ProductMediaDto,
  ProductVariantInputDto,
} from "./types";

export class ProductServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const STAFF_MEDIA_SELECT = {
  id: true,
  kind: true,
  title: true,
  originalFilename: true,
  mimeType: true,
  altText: true,
  widthPx: true,
  heightPx: true,
  durationSeconds: true,
  sizeBytes: true,
} satisfies Prisma.MediaSelect;

const STAFF_PRODUCT_SELECT = {
  id: true,
  productTypeId: true,
  sku: true,
  slug: true,
  name: true,
  displayName: true,
  richTextDescription: true,
  shortDescription: true,
  titleSeo: true,
  descriptionSeo: true,
  tags: true,
  guaranteeMonths: true,
  brand: { select: { name: true } },
  visibleEcommerce: true,
  visibleVitrine: true,
  isFeatured: true,
  isPromoted: true,
  isNew: true,
  stockAvailable: true,
  stockAlertThreshold: true,
  stockUnit: true,
  stockAvailability: true,
  stockVisibility: true,
  basePriceTtcTnd: true,
  currentPriceTtcTnd: true,
  vatRate: true,
  priceVisibility: true,
  subcategories: {
    select: {
      subcategoryId: true,
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
  media: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      role: true,
      name: true,
      altText: true,
      media: {
        select: STAFF_MEDIA_SELECT,
      },
    },
  },
  attributes: {
    orderBy: [{ groupSortOrder: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      attributeDefId: true,
      attributeGroupId: true,
      name: true,
      label: true,
      value: true,
      unit: true,
      inputType: true,
      isRequired: true,
      isFilterable: true,
      groupName: true,
      groupSortOrder: true,
      sortOrder: true,
    },
  },
  packLinesAsComponent: {
    select: {
      packProductId: true,
    },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

const STAFF_FAMILY_DETAIL_SELECT = {
  id: true,
  name: true,
  slug: true,
  subtitle: true,
  description: true,
  descriptionSeo: true,
  mainImageMediaId: true,
  defaultProductId: true,
  createdAt: true,
  updatedAt: true,
  members: {
    orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
    select: {
      sortOrder: true,
      product: {
        select: STAFF_PRODUCT_SELECT,
      },
    },
  },
} satisfies Prisma.ProductFamilySelect;

const STAFF_FAMILY_LIST_SELECT = {
  id: true,
  name: true,
  slug: true,
  subtitle: true,
  description: true,
  updatedAt: true,
  mainImageMediaId: true,
  defaultProduct: {
    select: {
      id: true,
      sku: true,
      brand: { select: { name: true } },
      visibleEcommerce: true,
      visibleVitrine: true,
      subcategories: {
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
    },
  },
  members: {
    select: {
      productId: true,
    },
  },
} satisfies Prisma.ProductFamilySelect;

type StaffFamilyDetailRecord = Prisma.ProductFamilyGetPayload<{
  select: typeof STAFF_FAMILY_DETAIL_SELECT;
}>;

type StaffFamilyListRecord = Prisma.ProductFamilyGetPayload<{
  select: typeof STAFF_FAMILY_LIST_SELECT;
}>;

function buildMediaUrl(mediaId: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function mapMedia(
  media: Prisma.MediaGetPayload<{ select: typeof STAFF_MEDIA_SELECT }>,
  link?: {
    role: ProductMediaDto["role"];
    name: string | null;
    altText: string | null;
  },
): ProductMediaDto {
  return {
    id: Number(media.id),
    role: link?.role ?? "GALLERY",
    kind: media.kind,
    title: link?.name ?? media.title,
    originalFilename: media.originalFilename,
    mimeType: media.mimeType,
    altText: link?.altText ?? media.altText,
    widthPx: media.widthPx,
    heightPx: media.heightPx,
    durationSeconds: media.durationSeconds?.toString() ?? null,
    sizeBytes: media.sizeBytes?.toString() ?? null,
    url: buildMediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? buildMediaUrl(media.id, "thumbnail") : null,
  };
}

function mapVariant(
  record: StaffFamilyDetailRecord["members"][number]["product"],
): ProductVariantInputDto {
  const galleryLinks = record.media.filter((link) => link.role === "GALLERY");
  const technicalLink = record.media.find((link) => link.role === "TECHNICAL") ?? null;

  return {
    id: Number(record.id),
    productTypeId: record.productTypeId == null ? null : Number(record.productTypeId),
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    displayName: record.displayName,
    description: richTextDescriptionToString(record.richTextDescription),
    shortDescription: record.shortDescription,
    titleSeo: record.titleSeo,
    descriptionSeo: record.descriptionSeo,
    guaranteeMonths: record.guaranteeMonths ?? 0,
    brand: formatProductBrandValue(productBrandLabel(record.brand)),
    lifecycle: productLifecycleFromVisibility(record),
    visibleEcommerce: record.visibleEcommerce,
    visibleVitrine: record.visibleVitrine,
    isFeatured: record.isFeatured,
    isPromoted: record.isPromoted,
    isNew: record.isNew,
    stockAvailable: record.stockAvailable.toString(),
    stockAlertThreshold: record.stockAlertThreshold.toString(),
    stockUnit: record.stockUnit,
    stockAvailability: record.stockAvailability,
    stockVisibility: record.stockVisibility,
    basePriceTtcTnd: record.basePriceTtcTnd?.toString() ?? null,
    currentPriceTtcTnd: record.currentPriceTtcTnd?.toString() ?? null,
    vatRate: record.vatRate.toString(),
    priceVisibility: record.priceVisibility,
    tags: record.tags,
    subcategoryIds: record.subcategories.map((link) => Number(link.subcategoryId)),
    datasheet: technicalLink ? mapMedia(technicalLink.media, technicalLink) : null,
    media: galleryLinks.map((link) => mapMedia(link.media, link)),
    attributes: record.attributes.map(mapProductAttributeRecord),
  };
}

function mapFamilyDetail(record: StaffFamilyDetailRecord): ProductFamilyDetailDto {
  const defaultProductId = record.defaultProductId == null ? null : Number(record.defaultProductId);
  const defaultVariantIndex = Math.max(
    0,
    record.members.findIndex((member) => Number(member.product.id) === defaultProductId),
  );

  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle,
    description: record.description,
    descriptionSeo: record.descriptionSeo,
    mainImageMediaId: record.mainImageMediaId == null ? null : Number(record.mainImageMediaId),
    defaultVariantIndex,
    variants: record.members.map((member) => mapVariant(member.product)),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapFamilyListItem(record: StaffFamilyListRecord): ProductFamilyListItemDto {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle,
    description: record.description,
    mainImageUrl:
      record.mainImageMediaId == null ? null : buildMediaUrl(record.mainImageMediaId, "thumbnail"),
    variantCount: record.members.length,
    defaultVariantSku: record.defaultProduct?.sku ?? null,
    brand: formatProductBrandValue(productBrandLabel(record.defaultProduct?.brand)),
    lifecycle: record.defaultProduct ? productLifecycleFromVisibility(record.defaultProduct) : null,
    subcategories:
      record.defaultProduct?.subcategories.map(({ subcategory }) => ({
        id: Number(subcategory.id),
        categoryId: Number(subcategory.category.id),
        categoryName: subcategory.category.name,
        categorySlug: subcategory.category.slug,
        name: subcategory.name,
        slug: subcategory.slug,
      })) ?? [],
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function assertFamilySlugAvailable(slug: string, excludeFamilyId?: number) {
  const existing = await prisma.productFamily.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing && Number(existing.id) !== (excludeFamilyId ?? -1)) {
    throw new ProductServiceError("Une famille avec ce slug existe déjà.");
  }
}

async function assertVariantUniqueConstraints(
  variants: ProductFamilyUpsertInput["variants"],
  excludeById: Map<number, { sku: string; slug: string }>,
) {
  const seenSkus = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const variant of variants) {
    if (seenSkus.has(variant.sku) || seenSlugs.has(variant.slug)) {
      throw new ProductServiceError("Les variantes doivent avoir des SKU et slugs uniques.");
    }

    seenSkus.add(variant.sku);
    seenSlugs.add(variant.slug);
  }

  const existing = await prisma.product.findMany({
    where: {
      OR: [{ sku: { in: [...seenSkus] } }, { slug: { in: [...seenSlugs] } }],
    },
    select: {
      id: true,
      sku: true,
      slug: true,
    },
  });

  for (const record of existing) {
    const allowed = excludeById.get(Number(record.id));
    if (allowed && allowed.sku === record.sku && allowed.slug === record.slug) {
      continue;
    }

    if (seenSkus.has(record.sku) || seenSlugs.has(record.slug)) {
      throw new ProductServiceError("Un produit existe déjà avec l'un des SKU ou slugs fournis.");
    }
  }
}

async function assertVariantsRemovable(productIds: number[]) {
  if (productIds.length === 0) {
    return;
  }

  const linked = await prisma.product.findFirst({
    where: {
      id: {
        in: productIds.map((id) => BigInt(id)),
      },
      packLinesAsComponent: {
        some: {},
      },
    },
    select: {
      name: true,
    },
  });

  if (linked) {
    throw new ProductServiceError(
      `Impossible de supprimer la variante "${linked.name}" car elle est utilisée dans un pack.`,
    );
  }
}

async function syncVariantRelations(
  tx: Prisma.TransactionClient,
  productId: bigint,
  variant: ProductVariantInputDto,
) {
  await tx.productSubcategoryLink.deleteMany({
    where: {
      productId,
    },
  });

  if (variant.subcategoryIds.length > 0) {
    await tx.productSubcategoryLink.createMany({
      data: variant.subcategoryIds.map((subcategoryId) => ({
        productId,
        subcategoryId: BigInt(subcategoryId),
      })),
    });
  }

  await tx.productMedia.deleteMany({
    where: {
      productId,
      role: {
        in: ["GALLERY", "TECHNICAL"],
      },
    },
  });

  const technicalMediaId = variant.datasheet?.id ?? null;
  const productMediaLinks = [
    ...variant.media
      .filter((media) => media.id !== technicalMediaId)
      .map((media, index) => ({
        productId,
        mediaId: BigInt(media.id),
        role: "GALLERY" as const,
        name: media.title,
        altText: media.altText,
        sortOrder: index,
      })),
    ...(variant.datasheet
      ? [
          {
            productId,
            mediaId: BigInt(variant.datasheet.id),
            role: "TECHNICAL" as const,
            name: variant.datasheet.title ?? "Fiche technique",
            altText: variant.datasheet.altText,
            sortOrder: 0,
          },
        ]
      : []),
  ];

  if (productMediaLinks.length > 0) {
    await tx.productMedia.createMany({
      data: productMediaLinks,
    });
  }

  await tx.productAttribute.deleteMany({
    where: {
      productId,
    },
  });

  if (variant.attributes.length > 0) {
    await tx.productAttribute.createMany({
      data: variant.attributes.map((attribute, index) => ({
        ...buildProductAttributeCreateData(productId, attribute, index),
      })),
    });
  }
}

async function writeFamily(familyId: number | null, input: ProductFamilyUpsertInput) {
  for (const variant of input.variants) {
    const duplicateAttributeKind = findDuplicateAttributeKind(variant.attributes);

    if (duplicateAttributeKind) {
      throw new ProductServiceError(
        buildDuplicateAttributeKindMessage(duplicateAttributeKind, `La variante "${variant.name}"`),
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    const existingFamily =
      familyId == null
        ? null
        : await tx.productFamily.findUnique({
            where: { id: BigInt(familyId) },
            select: {
              id: true,
              members: {
                select: {
                  productId: true,
                  product: {
                    select: {
                      id: true,
                      sku: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          });

    if (familyId != null && !existingFamily) {
      throw new ProductServiceError("Famille introuvable.", 404);
    }

    const existingById = new Map(
      (existingFamily?.members ?? []).map((member) => [
        Number(member.productId),
        {
          sku: member.product.sku,
          slug: member.product.slug,
        },
      ]),
    );

    await assertFamilySlugAvailable(input.slug, familyId ?? undefined);
    await assertVariantUniqueConstraints(input.variants, existingById);

    const family =
      familyId == null
        ? await tx.productFamily.create({
            data: {
              name: input.name,
              slug: input.slug,
              subtitle: input.subtitle,
              description: input.description,
              descriptionSeo: input.descriptionSeo,
              mainImageMediaId:
                input.mainImageMediaId == null ? null : BigInt(input.mainImageMediaId),
            },
            select: {
              id: true,
            },
          })
        : await tx.productFamily.update({
            where: { id: BigInt(familyId) },
            data: {
              name: input.name,
              slug: input.slug,
              subtitle: input.subtitle,
              description: input.description,
              descriptionSeo: input.descriptionSeo,
              mainImageMediaId:
                input.mainImageMediaId == null ? null : BigInt(input.mainImageMediaId),
            },
            select: {
              id: true,
            },
          });

    const keptProductIds = input.variants
      .map((variant) => variant.id)
      .filter((variantId): variantId is number => variantId != null);

    const removedProductIds = (existingFamily?.members ?? [])
      .map((member) => Number(member.productId))
      .filter((productId) => !keptProductIds.includes(productId));

    await assertVariantsRemovable(removedProductIds);

    if (removedProductIds.length > 0) {
      await tx.productFamilyMember.deleteMany({
        where: {
          familyId: family.id,
          productId: {
            in: removedProductIds.map((id) => BigInt(id)),
          },
        },
      });

      await tx.product.deleteMany({
        where: {
          id: {
            in: removedProductIds.map((id) => BigInt(id)),
          },
        },
      });
    }

    const createdOrUpdatedIds: bigint[] = [];

    for (const [index, variant] of input.variants.entries()) {
      const brandId = await resolveProductBrandOrganizationId(tx, variant.brand);
      const productData: Prisma.ProductUncheckedCreateInput = {
        sku: variant.sku,
        slug: variant.slug,
        kind: "VARIANT",
        productTypeId: variant.productTypeId == null ? null : BigInt(variant.productTypeId),
        name: variant.name,
        displayName: variant.displayName,
        richTextDescription: stringToRichTextDescription(variant.description),
        shortDescription: variant.shortDescription,
        titleSeo: variant.titleSeo,
        descriptionSeo: variant.descriptionSeo,
        tags: variant.tags,
        guaranteeMonths: variant.guaranteeMonths,
        brandId,
        visibleEcommerce: variant.visibleEcommerce,
        visibleVitrine: variant.visibleVitrine,
        isFeatured: variant.isFeatured,
        isPromoted: variant.isPromoted,
        isNew: variant.isNew,
        stockAvailable: variant.stockAvailable,
        stockAlertThreshold: variant.stockAlertThreshold,
        stockUnit: variant.stockUnit,
        stockAvailability: variant.stockAvailability,
        stockVisibility: variant.stockVisibility,
        basePriceTtcTnd: variant.basePriceTtcTnd,
        currentPriceTtcTnd: variant.currentPriceTtcTnd,
        vatRate: variant.vatRate,
        priceVisibility: variant.priceVisibility,
      };

      const product =
        variant.id == null
          ? await tx.product.create({
              data: productData,
              select: { id: true },
            })
          : await tx.product.update({
              where: { id: BigInt(variant.id) },
              data: productData,
              select: { id: true },
            });

      await syncVariantRelations(tx, product.id, variant);

      await tx.productFamilyMember.upsert({
        where: {
          productId: product.id,
        },
        update: {
          familyId: family.id,
          sortOrder: index,
        },
        create: {
          familyId: family.id,
          productId: product.id,
          sortOrder: index,
        },
      });

      createdOrUpdatedIds.push(product.id);
    }

    const defaultProductId =
      createdOrUpdatedIds[input.defaultVariantIndex] ?? createdOrUpdatedIds[0] ?? null;

    await tx.productFamily.update({
      where: { id: family.id },
      data: {
        defaultProductId,
      },
    });

    return tx.productFamily.findUniqueOrThrow({
      where: { id: family.id },
      select: STAFF_FAMILY_DETAIL_SELECT,
    });
  });
}

export async function getProductFormOptionsService(
  session: StaffSession,
): Promise<ProductFormOptionsDto> {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const [subcategories, productTypes, productBrands] = await Promise.all([
    prisma.productSubcategory.findMany({
      where: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.productType.findMany({
      orderBy: [
        { group: { sortOrder: "asc" } },
        { group: { name: "asc" } },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        groupId: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        presetTags: true,
        presetStockUnit: true,
        presetVatRate: true,
        presetGuaranteeMonths: true,
        subcategoryPresets: {
          select: {
            subcategoryId: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            sortOrder: true,
          },
        },
        attributes: {
          orderBy: [
            { attributeGroup: { sortOrder: "asc" } },
            { sortOrder: "asc" },
            { name: "asc" },
          ],
          select: {
            id: true,
            attributeGroupId: true,
            name: true,
            label: true,
            unit: true,
            inputType: true,
            isRequired: true,
            isFilterable: true,
            sortOrder: true,
            attributeGroup: {
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
    }),
    prisma.organization.findMany({
      where: {
        isProductBrand: true,
      },
      orderBy: [{ name: "asc" }],
      select: {
        name: true,
      },
    }),
  ]);

  const groupMap = new Map<string, ProductFormOptionsDto["productTypeGroups"][number]>();
  for (const productType of productTypes) {
    const groupKey = productType.group == null ? "ungrouped" : productType.group.id.toString();
    const group = groupMap.get(groupKey) ?? {
      id: productType.group == null ? null : Number(productType.group.id),
      name: productType.group?.name ?? "Autres modèles",
      slug: productType.group?.slug ?? "autres-modeles",
      sortOrder: productType.group?.sortOrder ?? 9999,
      productTypes: [],
    };

    group.productTypes.push({
      id: Number(productType.id),
      groupId: productType.groupId == null ? null : Number(productType.groupId),
      groupName: productType.group?.name ?? null,
      groupSlug: productType.group?.slug ?? null,
      name: productType.name,
      slug: productType.slug,
      description: productType.description,
      sortOrder: productType.sortOrder,
      presetTags: productType.presetTags,
      presetSubcategoryIds: productType.subcategoryPresets.map((preset) =>
        Number(preset.subcategoryId),
      ),
      presetStockUnit: productType.presetStockUnit,
      presetVatRate: productType.presetVatRate?.toString() ?? null,
      presetGuaranteeMonths: productType.presetGuaranteeMonths,
      attributes: productType.attributes.map((attribute) => ({
        id: Number(attribute.id),
        groupId: attribute.attributeGroupId == null ? null : Number(attribute.attributeGroupId),
        name: attribute.name,
        label: attribute.label || attribute.name,
        unit: attribute.unit,
        inputType: attribute.inputType,
        isRequired: attribute.isRequired,
        isFilterable: attribute.isFilterable,
        groupName: attribute.attributeGroup?.name ?? null,
        groupSortOrder: attribute.attributeGroup?.sortOrder ?? 0,
        sortOrder: attribute.sortOrder,
      })),
    });

    groupMap.set(groupKey, group);
  }

  return {
    productSubcategories: subcategories.map((subcategory) => ({
      id: Number(subcategory.id),
      categoryId: Number(subcategory.categoryId),
      categoryName: subcategory.category.name,
      categorySlug: subcategory.category.slug,
      name: subcategory.name,
      slug: subcategory.slug,
    })),
    productTypeGroups: [...groupMap.values()].sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, "fr-FR"),
    ),
    productBrandOptions: productBrands.map((brand) => brand.name),
  };
}

export async function listProductsService(
  session: StaffSession,
  query: { page: number; pageSize: number; q: string | null },
): Promise<ProductFamilyListResult> {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const where: Prisma.ProductFamilyWhereInput = query.q
    ? {
        OR: [
          { name: { contains: query.q, mode: "insensitive" } },
          { slug: { contains: query.q, mode: "insensitive" } },
          { subtitle: { contains: query.q, mode: "insensitive" } },
          { description: { contains: query.q, mode: "insensitive" } },
          {
            members: {
              some: {
                product: {
                  OR: [
                    { sku: { contains: query.q, mode: "insensitive" } },
                    { slug: { contains: query.q, mode: "insensitive" } },
                    { name: { contains: query.q, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
        ],
      }
    : {};

  const [items, total, productBrands] = await Promise.all([
    prisma.productFamily.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: STAFF_FAMILY_LIST_SELECT,
    }),
    prisma.productFamily.count({ where }),
    prisma.organization.findMany({
      where: {
        isProductBrand: true,
      },
      orderBy: [{ name: "asc" }],
      select: {
        name: true,
      },
    }),
  ]);

  return {
    items: items.map(mapFamilyListItem),
    productBrandOptions: productBrands.map((brand) => brand.name),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getProductByIdService(session: StaffSession, familyId: number) {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const family = await prisma.productFamily.findUnique({
    where: { id: BigInt(familyId) },
    select: STAFF_FAMILY_DETAIL_SELECT,
  });

  if (!family) {
    throw new ProductServiceError("Famille introuvable.", 404);
  }

  return mapFamilyDetail(family);
}

export async function createProductService(session: StaffSession, input: ProductFamilyUpsertInput) {
  if (!canCreateProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const family = await writeFamily(null, input);
  return mapFamilyDetail(family);
}

export async function updateProductService(
  session: StaffSession,
  familyId: number,
  input: ProductFamilyUpsertInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const family = await writeFamily(familyId, input);
  return mapFamilyDetail(family);
}

export async function deleteProductService(session: StaffSession, familyId: number) {
  if (!canManageProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const family = await prisma.productFamily.findUnique({
    where: { id: BigInt(familyId) },
    select: {
      id: true,
      members: {
        select: {
          productId: true,
        },
      },
    },
  });

  if (!family) {
    throw new ProductServiceError("Famille introuvable.", 404);
  }

  const productIds = family.members.map((member) => Number(member.productId));
  await assertVariantsRemovable(productIds);

  await prisma.$transaction(async (tx) => {
    await tx.productFamilyMember.deleteMany({
      where: {
        familyId: family.id,
      },
    });

    if (productIds.length > 0) {
      await tx.product.deleteMany({
        where: {
          id: {
            in: productIds.map((id) => BigInt(id)),
          },
        },
      });
    }

    await tx.productFamily.delete({
      where: {
        id: family.id,
      },
    });
  });
}
