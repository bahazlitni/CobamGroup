import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import { canAccessProducts, canCreateProducts, canManageProducts } from "./access";
import {
  buildDuplicateAttributeKindMessage,
  findDuplicateAttributeKind,
  pruneColorAttributesOverwrittenByFinish,
} from "./attribute-kinds";
import { buildProductAttributeCreateData, mapProductAttributeRecord } from "./attribute-records";
import { resolveProductBrandOrganizationId } from "@/features/organizations/product-brand";
import {
  buildProductDeleteBlockedMessage,
  countProductDeleteBlockers,
  hasProductDeleteBlockers,
} from "@/features/products/delete-constraints";
import {
  productBrandLabel,
  productLifecycleFromVisibility,
  richTextDescriptionToEditorValue,
  stringToRichTextDescription,
} from "./model-b-compat";
import { buildStaffProductSearchWhere } from "./search";
import type {
  ProductFamilyDetailDto,
  ProductFamilyDissolveResultDto,
  ProductFamilyGroupingCandidateDto,
  ProductFamilyGroupingCandidatesResult,
  ProductFamilyGroupingInput,
  ProductFamilyListItemDto,
  ProductFamilyListResult,
  ProductFamilyUpsertInput,
  ProductCertificateOptionDto,
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

function requireProductTypeId(productTypeId: number | null | undefined) {
  if (productTypeId == null) {
    throw new ProductServiceError("Un modèle de produit est requis.");
  }
  return BigInt(productTypeId);
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
  titleSeo: true,
  descriptionSeo: true,
  tags: true,
  guaranteeMonths: true,
  brand: { select: { name: true } },
  visibleEcommerce: true,
  visibleVitrine: true,
  lifecycle: true,
  isFeatured: true,
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
      sortOrder: true,
      media: {
        select: STAFF_MEDIA_SELECT,
      },
    },
  },
  certificateAssociations: {
    orderBy: [{ certificate: { name: "asc" } }, { certificateId: "asc" }],
    select: {
      certificateId: true,
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

const STAFF_FAMILY_DETAIL_SELECT = {
  id: true,
  name: true,
  slug: true,
  titleSeo: true,
  description: true,
  descriptionSeo: true,
  mainImageMediaId: true,
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
  description: true,
  updatedAt: true,
  mainImageMediaId: true,
  members: {
    orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
    select: {
      productId: true,
      product: {
        select: {
          sku: true,
          brand: { select: { name: true } },
          visibleEcommerce: true,
          visibleVitrine: true,
          lifecycle: true,
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
    },
  },
} satisfies Prisma.ProductFamilySelect;

const STAFF_GROUPING_CANDIDATE_SELECT = {
  id: true,
  kind: true,
  sku: true,
  slug: true,
  name: true,
  displayName: true,
  brand: { select: { name: true } },
  visibleEcommerce: true,
  visibleVitrine: true,
  lifecycle: true,
  updatedAt: true,
  media: {
    where: {
      role: "GALLERY",
    },
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      mediaId: true,
      media: {
        select: {
          kind: true,
        },
      },
    },
  },
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
} satisfies Prisma.ProductSelect;

type StaffFamilyDetailRecord = Prisma.ProductFamilyGetPayload<{
  select: typeof STAFF_FAMILY_DETAIL_SELECT;
}>;

type StaffFamilyListRecord = Prisma.ProductFamilyGetPayload<{
  select: typeof STAFF_FAMILY_LIST_SELECT;
}>;

type StaffGroupingCandidateRecord = Prisma.ProductGetPayload<{
  select: typeof STAFF_GROUPING_CANDIDATE_SELECT;
}>;

type FamilySubcategoryTrail = {
  categorySlug: string;
  subcategorySlug: string;
  categorySortOrder: number;
  subcategorySortOrder: number;
};

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
    sortOrder: number;
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
    sortOrder: link?.sortOrder ?? 0,
    widthPx: media.widthPx,
    heightPx: media.heightPx,
    durationSeconds: media.durationSeconds?.toString() ?? null,
    sizeBytes: media.sizeBytes?.toString() ?? null,
    url: buildMediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? buildMediaUrl(media.id, "thumbnail") : null,
  };
}

function mapProductCertificateOption(record: {
  id: bigint;
  name: string;
  slug: string;
  description: string | null;
  imageMediaId: bigint;
  imageMedia: {
    altText: string | null;
  };
}): ProductCertificateOptionDto {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    description: record.description,
    imageMediaId: Number(record.imageMediaId),
    imageUrl: buildMediaUrl(record.imageMediaId, "original"),
    imageThumbnailUrl: buildMediaUrl(record.imageMediaId, "thumbnail"),
    imageAltText: record.imageMedia.altText,
  };
}

function mapVariant(
  record: StaffFamilyDetailRecord["members"][number]["product"],
): ProductVariantInputDto {
  const galleryLinks = record.media.filter((link) => link.role === "GALLERY");
  const technicalLinks = record.media.filter((link) => link.role === "TECHNICAL");
  const certificateLinks = record.media.filter((link) => link.role === "CERTIFICATE");

  return {
    id: Number(record.id),
    productTypeId: Number(record.productTypeId),
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    displayName: record.displayName,
    description: richTextDescriptionToEditorValue(record.richTextDescription),
    titleSeo: record.titleSeo,
    descriptionSeo: record.descriptionSeo,
    guaranteeMonths: record.guaranteeMonths ?? 0,
    brand: productBrandLabel(record.brand),
    lifecycle: productLifecycleFromVisibility(record),
    visibleEcommerce: record.visibleEcommerce,
    visibleVitrine: record.visibleVitrine,
    isFeatured: record.isFeatured,
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
    datasheets: technicalLinks.map((link) => mapMedia(link.media, link)),
    certificates: certificateLinks.map((link) => mapMedia(link.media, link)),
    certificateIds: record.certificateAssociations.map((link) => Number(link.certificateId)),
    media: galleryLinks.map((link) => mapMedia(link.media, link)),
    attributes: record.attributes.map(mapProductAttributeRecord),
  };
}

function mapFamilyDetail(record: StaffFamilyDetailRecord): ProductFamilyDetailDto {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    titleSeo: record.titleSeo,
    description: record.description,
    descriptionSeo: record.descriptionSeo,
    mainImageMediaId: record.mainImageMediaId == null ? null : Number(record.mainImageMediaId),
    variants: record.members.map((member) => mapVariant(member.product)),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapFamilyListItem(record: StaffFamilyListRecord): ProductFamilyListItemDto {
  const defaultProduct = record.members[0]?.product ?? null;

  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    description: record.description,
    mainImageUrl:
      record.mainImageMediaId == null ? null : buildMediaUrl(record.mainImageMediaId, "thumbnail"),
    variantCount: record.members.length,
    defaultVariantSku: defaultProduct?.sku ?? null,
    brand: productBrandLabel(defaultProduct?.brand),
    lifecycle: defaultProduct ? productLifecycleFromVisibility(defaultProduct) : null,
    subcategories:
      defaultProduct?.subcategories.map(({ subcategory }) => ({
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

function mapGroupingCandidate(
  record: StaffGroupingCandidateRecord,
): ProductFamilyGroupingCandidateDto {
  const firstImage = record.media.find((link) => link.media.kind === "IMAGE");

  return {
    id: Number(record.id),
    kind: record.kind,
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    displayName: record.displayName,
    brand: productBrandLabel(record.brand),
    lifecycle: productLifecycleFromVisibility(record),
    hasImage: record.media.some((link) => link.media.kind === "IMAGE"),
    imageThumbnailUrl: firstImage ? buildMediaUrl(firstImage.mediaId, "thumbnail") : null,
    subcategories: record.subcategories
      .map(({ subcategory }) => ({
        id: Number(subcategory.id),
        categoryId: Number(subcategory.category.id),
        categoryName: subcategory.category.name,
        categorySlug: subcategory.category.slug,
        name: subcategory.name,
        slug: subcategory.slug,
      }))
      .sort((left, right) => {
        const categoryCompare = left.categoryName.localeCompare(right.categoryName, "fr", {
          sensitivity: "base",
        });
        if (categoryCompare !== 0) {
          return categoryCompare;
        }

        return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
      }),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function compareFamilySubcategoryTrails(
  left: FamilySubcategoryTrail,
  right: FamilySubcategoryTrail,
) {
  return (
    left.categorySortOrder - right.categorySortOrder ||
    left.subcategorySortOrder - right.subcategorySortOrder ||
    left.categorySlug.localeCompare(right.categorySlug, "fr", { sensitivity: "base" }) ||
    left.subcategorySlug.localeCompare(right.subcategorySlug, "fr", { sensitivity: "base" })
  );
}

function pickPrimaryTrail(
  subcategories: Array<{
    subcategory: {
      slug: string;
      sortOrder: number;
      category: {
        slug: string;
        sortOrder: number;
      };
    };
  }>,
): FamilySubcategoryTrail | null {
  return (
    subcategories
      .map((link) => ({
        categorySlug: link.subcategory.category.slug,
        subcategorySlug: link.subcategory.slug,
        categorySortOrder: link.subcategory.category.sortOrder,
        subcategorySortOrder: link.subcategory.sortOrder,
      }))
      .sort(compareFamilySubcategoryTrails)[0] ?? null
  );
}

function buildDissolvedFamilySourcePath(familySlug: string, trail: FamilySubcategoryTrail | null) {
  if (!trail) {
    return `/produits/familles/${familySlug}`;
  }

  return `/produits/${trail.categorySlug}/${trail.subcategorySlug}/famille/${familySlug}`;
}

function buildDissolvedFamilyTargetPath(productSlug: string, trail: FamilySubcategoryTrail | null) {
  if (!trail) {
    return `/produits/${productSlug}`;
  }

  return `/produits/${trail.categorySlug}/${trail.subcategorySlug}/${productSlug}`;
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

  await tx.productCertificateAssociation.deleteMany({
    where: {
      productId,
    },
  });

  if (variant.certificateIds.length > 0) {
    await tx.productCertificateAssociation.createMany({
      data: variant.certificateIds.map((certificateId) => ({
        productId,
        certificateId: BigInt(certificateId),
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

  const documentMediaIds = new Set([
    ...variant.datasheets.map((media) => media.id),
    ...variant.certificates.map((media) => media.id),
  ]);
  const productMediaLinks = [
    ...variant.media
      .filter((media) => !documentMediaIds.has(media.id))
      .map((media, index) => ({
        productId,
        mediaId: BigInt(media.id),
        role: "GALLERY" as const,
        name: media.title,
        altText: media.altText,
        sortOrder: index,
      })),
    ...variant.datasheets.map((media, index) => ({
      productId,
      mediaId: BigInt(media.id),
      role: "TECHNICAL" as const,
      name: media.title,
      altText: media.altText,
      sortOrder: index,
    })),
    ...variant.certificates.map((media, index) => ({
      productId,
      mediaId: BigInt(media.id),
      role: "CERTIFICATE" as const,
      name: media.title,
      altText: media.altText,
      sortOrder: index,
    })),
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

  const attributes = pruneColorAttributesOverwrittenByFinish(variant.attributes);

  if (attributes.length > 0) {
    await tx.productAttribute.createMany({
      data: attributes.map((attribute, index) => ({
        ...buildProductAttributeCreateData(productId, attribute, index),
      })),
    });
  }
}

async function writeFamily(familyId: number | null, input: ProductFamilyUpsertInput) {
  for (const variant of input.variants) {
    const duplicateAttributeKind = findDuplicateAttributeKind(
      pruneColorAttributesOverwrittenByFinish(variant.attributes),
    );

    if (duplicateAttributeKind) {
      throw new ProductServiceError(
        buildDuplicateAttributeKindMessage(duplicateAttributeKind, `La variante "${variant.name}"`),
      );
    }
  }

  const existingFamily =
    familyId == null
      ? null
      : await prisma.productFamily.findUnique({
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

  return prisma.$transaction(
    async (tx) => {
      const family =
        familyId == null
          ? await tx.productFamily.create({
              data: {
                name: input.name,
                slug: input.slug,
                titleSeo: input.titleSeo,
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
                titleSeo: input.titleSeo,
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

      for (const [index, variant] of input.variants.entries()) {
        const brandId = await resolveProductBrandOrganizationId(tx, variant.brand);
        const productData: Prisma.ProductUncheckedCreateInput = {
          sku: variant.sku,
          slug: variant.slug,
          kind: "VARIANT",
          lifecycle: variant.lifecycle,
          productTypeId: requireProductTypeId(variant.productTypeId),
          name: variant.name,
          displayName: variant.displayName,
          richTextDescription: stringToRichTextDescription(variant.description),
          titleSeo: variant.titleSeo,
          descriptionSeo: variant.descriptionSeo,
          tags: variant.tags,
          guaranteeMonths: variant.guaranteeMonths,
          brandId,
          visibleEcommerce: variant.visibleEcommerce,
          visibleVitrine: variant.visibleVitrine,
          isFeatured: variant.isFeatured,
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
      }

      return tx.productFamily.findUniqueOrThrow({
        where: { id: family.id },
        select: STAFF_FAMILY_DETAIL_SELECT,
      });
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    },
  );
}

export async function getProductFormOptionsService(
  session: StaffSession,
): Promise<ProductFormOptionsDto> {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const [subcategories, productTypes, productBrands, certificates] = await Promise.all([
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
        displayName: true,
        slug: true,
        hint: true,
        description: true,
        sortOrder: true,
        hasColor: true,
        hasFinish: true,
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
            { attributeDefinition: { label: "asc" } },
          ],
          select: {
            id: true,
            attributeGroupId: true,
            attributeDefinitionId: true,
            isRequired: true,
            isFilterable: true,
            sortOrder: true,
            attributeDefinition: {
              select: {
                key: true,
                label: true,
                unit: true,
                inputType: true,
                selectOptions: true,
              },
            },
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
    prisma.productCertificate.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageMediaId: true,
        imageMedia: {
          select: {
            altText: true,
          },
        },
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
      displayName: productType.displayName,
      slug: productType.slug,
      hint: productType.hint,
      description: productType.description,
      sortOrder: productType.sortOrder,
      hasColor: productType.hasColor,
      hasFinish: productType.hasFinish,
      presetTags: productType.presetTags,
      presetSubcategoryIds: productType.subcategoryPresets.map((preset) =>
        Number(preset.subcategoryId),
      ),
      presetStockUnit: productType.presetStockUnit,
      presetVatRate: productType.presetVatRate?.toString() ?? null,
      presetGuaranteeMonths: productType.presetGuaranteeMonths,
      attributes: productType.attributes.map((attribute) => ({
        id: Number(attribute.id),
        attributeDefinitionId: Number(attribute.attributeDefinitionId),
        groupId: attribute.attributeGroupId == null ? null : Number(attribute.attributeGroupId),
        name: attribute.attributeDefinition.key,
        label: attribute.attributeDefinition.label,
        unit: attribute.attributeDefinition.unit,
        inputType: attribute.attributeDefinition.inputType,
        selectOptions: attribute.attributeDefinition.selectOptions,
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
    certificates: certificates.map(mapProductCertificateOption),
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

export async function listProductFamilyGroupingCandidatesService(
  session: StaffSession,
  query: {
    page: number;
    pageSize: number;
    q: string | null;
    excludeVariants?: boolean;
    ungroupedOnly?: boolean;
    excludedProductIds?: number[];
  },
): Promise<ProductFamilyGroupingCandidatesResult> {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const where: Prisma.ProductWhereInput = {
    ...buildStaffProductSearchWhere(query.q),
    ...(query.excludeVariants === false ? {} : { kind: { in: ["STANDARD", "SINGLE"] } }),
    ...(query.ungroupedOnly === false ? {} : { familyMembership: { is: null } }),
    ...(query.excludedProductIds && query.excludedProductIds.length > 0
      ? { id: { notIn: query.excludedProductIds.map((productId) => BigInt(productId)) } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: STAFF_GROUPING_CANDIDATE_SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(mapGroupingCandidate),
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

export async function groupExistingProductsIntoFamilyService(
  session: StaffSession,
  input: ProductFamilyGroupingInput,
): Promise<ProductFamilyDetailDto> {
  if (!canCreateProducts(session) || !canManageProducts(session)) {
    throw new ProductServiceError("Acces refuse.", 403);
  }

  await assertFamilySlugAvailable(input.slug);

  const selectedProductIds = input.productIds.map((productId) => BigInt(productId));

  const family = await prisma.$transaction(
    async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: selectedProductIds,
          },
        },
        select: {
          id: true,
          kind: true,
          sku: true,
          familyMembership: {
            select: {
              familyId: true,
            },
          },
        },
      });
      const productsById = new Map(products.map((product) => [product.id.toString(), product]));

      for (const productId of selectedProductIds) {
        const product = productsById.get(productId.toString());

        if (!product) {
          throw new ProductServiceError("Un des produits selectionnes est introuvable.", 404);
        }

        if (product.kind !== "STANDARD" && product.kind !== "SINGLE") {
          throw new ProductServiceError(
            `Le produit "${product.sku}" ne peut pas etre groupe car il n'est pas simple.`,
            409,
          );
        }

        if (product.familyMembership) {
          throw new ProductServiceError(
            `Le produit "${product.sku}" appartient deja a une famille.`,
            409,
          );
        }
      }

      const createdFamily = await tx.productFamily.create({
        data: {
          name: input.name,
          slug: input.slug,
          titleSeo: input.titleSeo,
          description: input.description,
          descriptionSeo: input.descriptionSeo,
          mainImageMediaId: input.mainImageMediaId == null ? null : BigInt(input.mainImageMediaId),
        },
        select: {
          id: true,
        },
      });

      await tx.product.updateMany({
        where: {
          id: {
            in: selectedProductIds,
          },
        },
        data: {
          kind: "VARIANT",
        },
      });

      await tx.productFamilyMember.createMany({
        data: selectedProductIds.map((productId, index) => ({
          familyId: createdFamily.id,
          productId,
          sortOrder: index,
        })),
      });

      return tx.productFamily.findUniqueOrThrow({
        where: {
          id: createdFamily.id,
        },
        select: STAFF_FAMILY_DETAIL_SELECT,
      });
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    },
  );

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

export async function dissolveProductFamilyService(
  session: StaffSession,
  familyId: number,
): Promise<ProductFamilyDissolveResultDto> {
  if (!canManageProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  return prisma.$transaction(
    async (tx) => {
      const family = await tx.productFamily.findUnique({
        where: { id: BigInt(familyId) },
        select: {
          id: true,
          slug: true,
          members: {
            orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
            select: {
              productId: true,
              product: {
                select: {
                  id: true,
                  slug: true,
                  subcategories: {
                    select: {
                      subcategory: {
                        select: {
                          slug: true,
                          sortOrder: true,
                          category: {
                            select: {
                              slug: true,
                              sortOrder: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!family) {
        throw new ProductServiceError("Famille introuvable.", 404);
      }

      if (family.members.length === 0) {
        throw new ProductServiceError(
          "Impossible de dissoudre une famille sans variante.",
          409,
        );
      }

      const defaultMember = family.members[0];
      const memberProductIds = family.members.map((member) => member.productId);
      const trail = pickPrimaryTrail(defaultMember.product.subcategories);
      const sourcePath = buildDissolvedFamilySourcePath(family.slug, trail);
      const targetProductPath = buildDissolvedFamilyTargetPath(defaultMember.product.slug, trail);

      await tx.productFamilyRedirect.upsert({
        where: {
          sourcePath,
        },
        update: {
          familyId: family.id,
          familySlug: family.slug,
          sourceCategorySlug: trail?.categorySlug ?? null,
          sourceSubcategorySlug: trail?.subcategorySlug ?? null,
          sourcePath,
          defaultVariantId: defaultMember.productId,
        },
        create: {
          familyId: family.id,
          familySlug: family.slug,
          sourceCategorySlug: trail?.categorySlug ?? null,
          sourceSubcategorySlug: trail?.subcategorySlug ?? null,
          sourcePath,
          defaultVariantId: defaultMember.productId,
        },
      });

      await tx.product.updateMany({
        where: {
          id: {
            in: memberProductIds,
          },
        },
        data: {
          kind: "SINGLE",
        },
      });

      await tx.productFamilyMember.deleteMany({
        where: {
          familyId: family.id,
        },
      });

      await tx.productFamily.delete({
        where: {
          id: family.id,
        },
      });

      return {
        familyId: Number(family.id),
        familySlug: family.slug,
        defaultVariantId: Number(defaultMember.productId),
        defaultVariantSlug: defaultMember.product.slug,
        redirectPath: sourcePath,
        targetProductPath,
        convertedProductIds: memberProductIds.map((productId) => Number(productId)),
      };
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    },
  );
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

  const productIds = family.members.map((member) => member.productId);

  await prisma.$transaction(async (tx) => {
    const blockers = await countProductDeleteBlockers(tx, productIds);

    if (hasProductDeleteBlockers(blockers)) {
      throw new ProductServiceError(buildProductDeleteBlockedMessage(blockers), 409);
    }

    await tx.productFamilyMember.deleteMany({
      where: {
        familyId: family.id,
      },
    });

    if (productIds.length > 0) {
      await tx.product.deleteMany({
        where: {
          id: {
            in: productIds,
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
