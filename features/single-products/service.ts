import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import {
  buildDuplicateAttributeKindMessage,
  findDuplicateAttributeKind,
} from "@/features/products/attribute-kinds";
import { assertProductDatasheetMedia } from "@/features/products/datasheet";
import { canAccessProducts, canCreateProducts, canManageProducts } from "@/features/products/access";
import { getProductFormOptionsService } from "@/features/products/service";
import type { ProductMediaDto } from "@/features/products/types";
import { prisma } from "@/lib/server/db/prisma";
import { formatProductAttributeKind } from "@/lib/static_tables/attributes";
import { formatProductBrandValue } from "@/lib/static_tables/brands";
import type {
  SingleProductDetailDto,
  SingleProductFormOptionsDto,
  SingleProductUpsertInput,
} from "./types";

export class SingleProductsServiceError extends Error {
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

const SINGLE_PRODUCT_SELECT = {
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
  createdAt: true,
  updatedAt: true,
  datasheetMedia: {
    select: STAFF_MEDIA_SELECT,
  },
  subcategoryLinks: {
    select: {
      subcategoryId: true,
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
    },
  },
} satisfies Prisma.ProductSelect;

type SingleProductRecord = Prisma.ProductGetPayload<{
  select: typeof SINGLE_PRODUCT_SELECT;
}>;

function buildMediaUrl(mediaId: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function mapMedia(
  media: Prisma.MediaGetPayload<{ select: typeof STAFF_MEDIA_SELECT }>,
): ProductMediaDto {
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

function mapSingleProductDetail(record: SingleProductRecord): SingleProductDetailDto {
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
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function assertSingleProductUniqueConstraints(
  input: SingleProductUpsertInput,
  excludeProductId?: number,
) {
  const existing = await prisma.product.findFirst({
    where: {
      OR: [{ sku: input.sku }, { slug: input.slug }],
      ...(excludeProductId != null
        ? {
            id: {
              not: BigInt(excludeProductId),
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    throw new SingleProductsServiceError(
      "Un produit existe déjà avec ce SKU ou ce slug.",
    );
  }
}

async function assertSingleProductRemovable(productId: number) {
  const linked = await prisma.product.findFirst({
    where: {
      id: BigInt(productId),
      packLinesAsComponent: {
        some: {},
      },
    },
    select: {
      name: true,
    },
  });

  if (linked) {
    throw new SingleProductsServiceError(
      `Impossible de supprimer le produit "${linked.name}" car il est utilisé dans un pack.`,
    );
  }
}

async function syncSingleProductRelations(
  tx: Prisma.TransactionClient,
  productId: bigint,
  input: SingleProductUpsertInput,
) {
  await tx.productSubcategoryLink.deleteMany({
    where: {
      productId,
    },
  });

  if (input.subcategoryIds.length > 0) {
    await tx.productSubcategoryLink.createMany({
      data: input.subcategoryIds.map((subcategoryId) => ({
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

  if (input.media.length > 0) {
    await tx.productMediaLink.createMany({
      data: input.media.map((media, index) => ({
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

  if (input.attributes.length > 0) {
    await tx.productAttribute.createMany({
      data: input.attributes.map((attribute, index) => ({
        productId,
        kind: attribute.kind,
        value: attribute.value,
        sortOrder: index,
      })),
    });
  }
}

async function writeSingleProduct(productId: number | null, input: SingleProductUpsertInput) {
  await assertSingleProductUniqueConstraints(input, productId ?? undefined);

  const duplicateAttributeKind = findDuplicateAttributeKind(input.attributes);
  if (duplicateAttributeKind) {
    throw new SingleProductsServiceError(
      buildDuplicateAttributeKindMessage(duplicateAttributeKind, "Un produit"),
    );
  }

  return prisma.$transaction(async (tx) => {
    try {
      await assertProductDatasheetMedia(tx, input.datasheet?.id ?? null);
    } catch (error: unknown) {
      throw new SingleProductsServiceError(
        error instanceof Error ? error.message : "Fiche technique invalide.",
      );
    }

    const product =
      productId == null
        ? await tx.product.create({
            data: {
              sku: input.sku,
              slug: input.slug,
              kind: "SINGLE",
              name: input.name,
              description: input.description,
              descriptionSeo: input.descriptionSeo,
              brand: input.brand,
              basePriceAmount:
                input.basePriceAmount == null
                  ? null
                  : new Prisma.Decimal(input.basePriceAmount),
              vatRate: input.vatRate,
              stock: input.stock == null ? null : new Prisma.Decimal(input.stock),
              stockUnit: input.stockUnit,
              visibility: input.visibility,
              priceVisibility: input.priceVisibility,
              stockVisibility: input.stockVisibility,
              lifecycle: input.lifecycle,
              commercialMode: input.commercialMode,
              tags: input.tags,
              datasheetMediaId:
                input.datasheet?.id == null ? null : BigInt(input.datasheet.id),
            },
            select: {
              id: true,
            },
          })
        : await tx.product.update({
            where: {
              id: BigInt(productId),
            },
            data: {
              sku: input.sku,
              slug: input.slug,
              name: input.name,
              description: input.description,
              descriptionSeo: input.descriptionSeo,
              brand: input.brand,
              basePriceAmount:
                input.basePriceAmount == null
                  ? null
                  : new Prisma.Decimal(input.basePriceAmount),
              vatRate: input.vatRate,
              stock: input.stock == null ? null : new Prisma.Decimal(input.stock),
              stockUnit: input.stockUnit,
              visibility: input.visibility,
              priceVisibility: input.priceVisibility,
              stockVisibility: input.stockVisibility,
              lifecycle: input.lifecycle,
              commercialMode: input.commercialMode,
              tags: input.tags,
              datasheetMediaId:
                input.datasheet?.id == null ? null : BigInt(input.datasheet.id),
            },
            select: {
              id: true,
            },
          });

    await syncSingleProductRelations(tx, product.id, input);

    return tx.product.findFirstOrThrow({
      where: {
        id: product.id,
        kind: "SINGLE",
      },
      select: SINGLE_PRODUCT_SELECT,
    });
  });
}

export async function getSingleProductFormOptionsService(
  session: StaffSession,
): Promise<SingleProductFormOptionsDto> {
  return getProductFormOptionsService(session);
}

export async function getSingleProductByIdService(
  session: StaffSession,
  productId: number,
) {
  if (!canAccessProducts(session)) {
    throw new SingleProductsServiceError("Accès refusé.", 403);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: BigInt(productId),
      kind: "SINGLE",
    },
    select: SINGLE_PRODUCT_SELECT,
  });

  if (!product) {
    throw new SingleProductsServiceError("Produit simple introuvable.", 404);
  }

  return mapSingleProductDetail(product);
}

export async function createSingleProductService(
  session: StaffSession,
  input: SingleProductUpsertInput,
) {
  if (!canCreateProducts(session)) {
    throw new SingleProductsServiceError("Accès refusé.", 403);
  }

  const product = await writeSingleProduct(null, input);
  return mapSingleProductDetail(product);
}

export async function updateSingleProductService(
  session: StaffSession,
  productId: number,
  input: SingleProductUpsertInput,
) {
  if (!canManageProducts(session)) {
    throw new SingleProductsServiceError("Accès refusé.", 403);
  }

  const product = await writeSingleProduct(productId, input);
  return mapSingleProductDetail(product);
}

export async function deleteSingleProductService(
  session: StaffSession,
  productId: number,
) {
  if (!canManageProducts(session)) {
    throw new SingleProductsServiceError("Accès refusé.", 403);
  }

  await assertSingleProductRemovable(productId);

  await prisma.product.delete({
    where: {
      id: BigInt(productId),
    },
  });
}
