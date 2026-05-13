import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import {
  buildDuplicateAttributeKindMessage,
  findDuplicateAttributeKind,
} from "@/features/products/attribute-kinds";
import {
  buildProductAttributeCreateData,
  mapProductAttributeRecord,
} from "@/features/products/attribute-records";
import { resolveProductBrandOrganizationId } from "@/features/organizations/product-brand";
import {
  canAccessProducts,
  canCreateProducts,
  canManageProducts,
} from "@/features/products/access";
import { getProductFormOptionsService } from "@/features/products/service";
import type { ProductMediaDto } from "@/features/products/types";
import {
  productBrandLabel,
  productLifecycleFromVisibility,
  richTextDescriptionToEditorValue,
  stringToRichTextDescription,
} from "@/features/products/model-b-compat";
import { prisma } from "@/lib/server/db/prisma";
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
  createdAt: true,
  updatedAt: true,
  subcategories: {
    select: {
      subcategoryId: true,
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
      attributeDef: {
        select: {
          selectOptions: true,
        },
      },
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

function mapSingleProductDetail(record: SingleProductRecord): SingleProductDetailDto {
  const galleryLinks = record.media.filter((link) => link.role === "GALLERY");
  const technicalLink = record.media.find((link) => link.role === "TECHNICAL") ?? null;
  const certificateLink = record.media.find((link) => link.role === "CERTIFICATE") ?? null;

  return {
    id: Number(record.id),
    productTypeId: record.productTypeId == null ? null : Number(record.productTypeId),
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    displayName: record.displayName,
    description: richTextDescriptionToEditorValue(record.richTextDescription),
    shortDescription: record.shortDescription,
    titleSeo: record.titleSeo,
    descriptionSeo: record.descriptionSeo,
    guaranteeMonths: record.guaranteeMonths ?? 0,
    brand: productBrandLabel(record.brand),
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
    certificate: certificateLink ? mapMedia(certificateLink.media, certificateLink) : null,
    media: galleryLinks.map((link) => mapMedia(link.media, link)),
    attributes: record.attributes.map(mapProductAttributeRecord),
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
    throw new SingleProductsServiceError("Un produit existe déjà avec ce SKU ou ce slug.");
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

  await tx.productMedia.deleteMany({
    where: {
      productId,
      role: {
        in: ["GALLERY", "TECHNICAL", "CERTIFICATE"],
      },
    },
  });

  const technicalMediaId = input.datasheet?.id ?? null;
  const certificateMediaId = input.certificate?.id ?? null;
  const productMediaLinks = [
    ...input.media
      .filter((media) => media.id !== technicalMediaId && media.id !== certificateMediaId)
      .map((media, index) => ({
        productId,
        mediaId: BigInt(media.id),
        role: "GALLERY" as const,
        name: media.title,
        altText: media.altText,
        sortOrder: index,
      })),
    ...(input.datasheet
      ? [
          {
            productId,
            mediaId: BigInt(input.datasheet.id),
            role: "TECHNICAL" as const,
            name: input.datasheet.title ?? "Fiche technique",
            altText: input.datasheet.altText,
            sortOrder: 0,
          },
        ]
      : []),
    ...(input.certificate
      ? [
          {
            productId,
            mediaId: BigInt(input.certificate.id),
            role: "CERTIFICATE" as const,
            name: input.certificate.title ?? "Certificat",
            altText: input.certificate.altText,
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

  if (input.attributes.length > 0) {
    await tx.productAttribute.createMany({
      data: input.attributes.map((attribute, index) => ({
        ...buildProductAttributeCreateData(productId, attribute, index),
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
    const brandId = await resolveProductBrandOrganizationId(tx, input.brand);

    const product =
      productId == null
        ? await tx.product.create({
            data: {
              sku: input.sku,
              slug: input.slug,
              kind: "STANDARD",
              productTypeId: input.productTypeId == null ? null : BigInt(input.productTypeId),
              name: input.name,
              displayName: input.displayName,
              richTextDescription: stringToRichTextDescription(input.description),
              shortDescription: input.shortDescription,
              titleSeo: input.titleSeo,
              descriptionSeo: input.descriptionSeo,
              tags: input.tags,
              guaranteeMonths: input.guaranteeMonths,
              brandId,
              visibleEcommerce: input.visibleEcommerce,
              visibleVitrine: input.visibleVitrine,
              isFeatured: input.isFeatured,
              isPromoted: input.isPromoted,
              isNew: input.isNew,
              stockAvailable: input.stockAvailable,
              stockAlertThreshold: input.stockAlertThreshold,
              stockUnit: input.stockUnit,
              stockAvailability: input.stockAvailability,
              stockVisibility: input.stockVisibility,
              basePriceTtcTnd: input.basePriceTtcTnd,
              currentPriceTtcTnd: input.currentPriceTtcTnd,
              vatRate: input.vatRate,
              priceVisibility: input.priceVisibility,
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
              productTypeId: input.productTypeId == null ? null : BigInt(input.productTypeId),
              name: input.name,
              displayName: input.displayName,
              richTextDescription: stringToRichTextDescription(input.description),
              shortDescription: input.shortDescription,
              titleSeo: input.titleSeo,
              descriptionSeo: input.descriptionSeo,
              tags: input.tags,
              guaranteeMonths: input.guaranteeMonths,
              brandId,
              visibleEcommerce: input.visibleEcommerce,
              visibleVitrine: input.visibleVitrine,
              isFeatured: input.isFeatured,
              isPromoted: input.isPromoted,
              isNew: input.isNew,
              stockAvailable: input.stockAvailable,
              stockAlertThreshold: input.stockAlertThreshold,
              stockUnit: input.stockUnit,
              stockAvailability: input.stockAvailability,
              stockVisibility: input.stockVisibility,
              basePriceTtcTnd: input.basePriceTtcTnd,
              currentPriceTtcTnd: input.currentPriceTtcTnd,
              vatRate: input.vatRate,
              priceVisibility: input.priceVisibility,
            },
            select: {
              id: true,
            },
          });

    await syncSingleProductRelations(tx, product.id, input);

    return tx.product.findFirstOrThrow({
      where: {
        id: product.id,
        kind: { in: ["STANDARD", "SINGLE"] },
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

export async function getSingleProductByIdService(session: StaffSession, productId: number) {
  if (!canAccessProducts(session)) {
    throw new SingleProductsServiceError("Accès refusé.", 403);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: BigInt(productId),
      kind: { in: ["STANDARD", "SINGLE"] },
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

export async function deleteSingleProductService(session: StaffSession, productId: number) {
  if (!canManageProducts(session)) {
    throw new SingleProductsServiceError("Accès refusé.", 403);
  }

  await prisma.product.delete({
    where: {
      id: BigInt(productId),
    },
  });
}
