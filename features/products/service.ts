import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import { canAccessProducts, canCreateProducts, canManageProducts } from "./access";
import {
  buildDuplicateAttributeKindMessage,
  findDuplicateAttributeKind,
} from "./attribute-kinds";
import { assertProductDatasheetMedia } from "./datasheet";
import {
  formatProductAttributeKind,
} from "@/lib/static_tables/attributes";
import { formatProductBrandValue } from "@/lib/static_tables/brands";
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
  sku: true,
  slug: true,
  name: true,
  description: true,
  descriptionSeo: true,
  brand: true,
  basePriceAmount: true,
  vatRate: true,
  stock: true,
  stockUnit: true,
  visibility: true,
  priceVisibility: true,
  stockVisibility: true,
  lifecycle: true,
  commercialMode: true,
  tags: true,
  datasheetMedia: {
    select: STAFF_MEDIA_SELECT,
  },
  subcategoryLinks: {
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
  mediaLinks: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      media: {
        select: STAFF_MEDIA_SELECT,
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
      brand: true,
      basePriceAmount: true,
      stock: true,
      stockUnit: true,
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

function mapMedia(media: Prisma.MediaGetPayload<{ select: typeof STAFF_MEDIA_SELECT }>): ProductMediaDto {
  return {
    id: Number(media.id),
    kind: media.kind,
    title: media.title,
    originalFilename: media.originalFilename,
    mimeType: media.mimeType,
    altText: media.altText,
    widthPx: media.widthPx,
    heightPx: media.heightPx,
    durationSeconds: media.durationSeconds?.toString() ?? null,
    sizeBytes: media.sizeBytes?.toString() ?? null,
    url: buildMediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? buildMediaUrl(media.id, "thumbnail") : null,
  };
}

function mapVariant(record: StaffFamilyDetailRecord["members"][number]["product"]): ProductVariantInputDto {
  return {
    id: Number(record.id),
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    description: record.description,
    descriptionSeo: record.descriptionSeo,
    brand: formatProductBrandValue(record.brand),
    basePriceAmount: record.basePriceAmount?.toString() ?? null,
    vatRate: record.vatRate,
    stock: record.stock?.toString() ?? null,
    stockUnit: record.stockUnit,
    visibility: record.visibility ?? true,
    priceVisibility: record.priceVisibility ?? true,
    stockVisibility: record.stockVisibility ?? true,
    lifecycle: record.lifecycle ?? "DRAFT",
    commercialMode: record.commercialMode ?? "ON_REQUEST_ONLY",
    tags: record.tags,
    subcategoryIds: record.subcategoryLinks.map((link) => Number(link.subcategoryId)),
    datasheet: record.datasheetMedia ? mapMedia(record.datasheetMedia) : null,
    media: record.mediaLinks.map((link) => mapMedia(link.media)),
    attributes: record.attributes.map((attribute) => ({
      kind: formatProductAttributeKind(attribute.kind),
      value: attribute.value,
    })),
  };
}

function mapFamilyDetail(record: StaffFamilyDetailRecord): ProductFamilyDetailDto {
  const defaultProductId =
    record.defaultProductId == null ? null : Number(record.defaultProductId);
  const defaultVariantIndex = Math.max(
    0,
    record.members.findIndex(
      (member) => Number(member.product.id) === defaultProductId,
    ),
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
      record.mainImageMediaId == null
        ? null
        : buildMediaUrl(record.mainImageMediaId, "thumbnail"),
    variantCount: record.members.length,
    defaultVariantSku: record.defaultProduct?.sku ?? null,
    brand: formatProductBrandValue(record.defaultProduct?.brand ?? null),
    basePriceAmount: record.defaultProduct?.basePriceAmount?.toString() ?? null,
    stock: record.defaultProduct?.stock?.toString() ?? null,
    stockUnit: record.defaultProduct?.stockUnit ?? null,
    subcategories:
      record.defaultProduct?.subcategoryLinks.map(({ subcategory }) => ({
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
      OR: [
        { sku: { in: [...seenSkus] } },
        { slug: { in: [...seenSlugs] } },
      ],
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

  await tx.productMediaLink.deleteMany({
    where: {
      productId,
    },
  });

  if (variant.media.length > 0) {
    await tx.productMediaLink.createMany({
      data: variant.media.map((media, index) => ({
        productId,
        mediaId: BigInt(media.id),
        sortOrder: index,
      })),
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
        productId,
        kind: attribute.kind,
        value: attribute.value,
        sortOrder: index,
      })),
    });
  }
}

async function writeFamily(
  familyId: number | null,
  input: ProductFamilyUpsertInput,
) {
  for (const variant of input.variants) {
    const duplicateAttributeKind = findDuplicateAttributeKind(variant.attributes);

    if (duplicateAttributeKind) {
      throw new ProductServiceError(
        buildDuplicateAttributeKindMessage(
          duplicateAttributeKind,
          `La variante "${variant.name}"`,
        ),
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    try {
      for (const variant of input.variants) {
        await assertProductDatasheetMedia(tx, variant.datasheet?.id ?? null);
      }
    } catch (error: unknown) {
      throw new ProductServiceError(
        error instanceof Error ? error.message : "Fiche technique invalide.",
      );
    }

    const existingFamily = familyId == null
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
      const productData: Prisma.ProductUncheckedCreateInput = {
        sku: variant.sku,
        slug: variant.slug,
        kind: "VARIANT",
        name: variant.name,
        description: variant.description,
        descriptionSeo: variant.descriptionSeo,
        brand: variant.brand,
        basePriceAmount:
          variant.basePriceAmount == null
            ? null
            : new Prisma.Decimal(variant.basePriceAmount),
        vatRate: variant.vatRate,
        stock:
          variant.stock == null ? null : new Prisma.Decimal(variant.stock),
        stockUnit: variant.stockUnit,
        visibility: variant.visibility,
        priceVisibility: variant.priceVisibility,
        stockVisibility: variant.stockVisibility,
        lifecycle: variant.lifecycle,
        commercialMode: variant.commercialMode,
        tags: variant.tags,
        datasheetMediaId:
          variant.datasheet?.id == null ? null : BigInt(variant.datasheet.id),
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

  const subcategories = await prisma.productSubcategory.findMany({
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
  });

  return {
    productSubcategories: subcategories.map((subcategory) => ({
      id: Number(subcategory.id),
      categoryId: Number(subcategory.categoryId),
      categoryName: subcategory.category.name,
      categorySlug: subcategory.category.slug,
      name: subcategory.name,
      slug: subcategory.slug,
    })),
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

  const [items, total] = await Promise.all([
    prisma.productFamily.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: STAFF_FAMILY_LIST_SELECT,
    }),
    prisma.productFamily.count({ where }),
  ]);

  return {
    items: items.map(mapFamilyListItem),
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

export async function createProductService(
  session: StaffSession,
  input: ProductFamilyUpsertInput,
) {
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
