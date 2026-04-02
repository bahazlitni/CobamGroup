import { Prisma } from "@prisma/client";
import { parseOwnedTagString, serializeOwnedTagNames } from "@/features/tags/owned";
import type { ProductPriceUnit } from "@/features/products/types";
import { resolveVariantEffectiveValues } from "@/features/products/overrides";

type TransactionClient = Prisma.TransactionClient;

const FAMILY_VARIANT_SELECT = Prisma.validator<Prisma.ProductFamilySelect>()({
  id: true,
  brandId: true,
  name: true,
  slug: true,
  description: true,
  descriptionSeo: true,
  tags: true,
  priceUnit: true,
  vatRate: true,
  defaultVariantId: true,
  defaultVariant: {
    select: {
      id: true,
      lifecycleStatus: true,
      visibility: true,
      commercialMode: true,
      priceVisibility: true,
      basePriceAmount: true,
    },
  },
  subcategories: {
    select: {
      id: true,
    },
  },
  mediaLinks: {
    where: {
      role: "COVER",
    },
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      mediaId: true,
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
      mediaLinks: {
        where: {
          role: "GALLERY",
        },
        orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
        select: {
          mediaId: true,
        },
      },
    },
  },
});

const PRODUCT_PACK_SELECT = Prisma.validator<Prisma.ProductPackSelect>()({
  id: true,
  name: true,
  slug: true,
  sku: true,
  description: true,
  descriptionSeo: true,
  commercialMode: true,
  lifecycleStatusMode: true,
  manualLifecycleStatus: true,
  visibilityMode: true,
  manualVisibility: true,
  priceVisibilityMode: true,
  manualPriceVisibility: true,
  subcategories: {
    select: {
      id: true,
    },
  },
  mediaLinks: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      mediaId: true,
      role: true,
    },
  },
  lines: {
    orderBy: [{ sortOrder: "asc" }, { variantId: "asc" }],
    select: {
      quantity: true,
      variant: {
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
          mediaLinks: {
            where: {
              role: "GALLERY",
            },
            orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
            select: {
              mediaId: true,
            },
          },
          family: {
            select: {
              id: true,
              brandId: true,
              name: true,
              slug: true,
              description: true,
              descriptionSeo: true,
              tags: true,
              priceUnit: true,
              vatRate: true,
              defaultVariantId: true,
              defaultVariant: {
                select: {
                  id: true,
                  lifecycleStatus: true,
                  visibility: true,
                  commercialMode: true,
                  priceVisibility: true,
                  basePriceAmount: true,
                },
              },
              subcategories: {
                select: {
                  id: true,
                },
              },
              mediaLinks: {
                where: {
                  role: "COVER",
                },
                orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
                select: {
                  mediaId: true,
                },
              },
            },
          },
        },
      },
    },
  },
});

function sortBigInts(values: readonly bigint[]) {
  return [...values].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

function normalizeBigIntArray(values: readonly (bigint | null | undefined)[]) {
  return sortBigInts(
    [...new Set(values.filter((value): value is bigint => value != null).map((value) => value.toString()))].map(
      (value) => BigInt(value),
    ),
  );
}

function normalizeDecimal(value: string | null | undefined) {
  return value != null ? new Prisma.Decimal(value) : null;
}

function resolveProjectedVariant(
  family: {
    id: bigint;
    brandId: bigint | null;
    name: string;
    slug: string;
    description: string | null;
    descriptionSeo: string | null;
    tags: string;
    priceUnit: ProductPriceUnit;
    vatRate: number;
    defaultVariantId: bigint | null;
    defaultVariant: {
      id: bigint;
      lifecycleStatus: "DRAFT" | "ACTIVE" | "ARCHIVED" | null;
      visibility: "HIDDEN" | "PUBLIC" | null;
      commercialMode: "REFERENCE_ONLY" | "QUOTE_ONLY" | "SELLABLE" | null;
      priceVisibility: "HIDDEN" | "VISIBLE" | null;
      basePriceAmount: Prisma.Decimal | null;
    } | null;
    subcategories: Array<{
      id: bigint;
    }>;
    mediaLinks: Array<{
      mediaId: bigint;
    }>;
  },
  variant: {
    id: bigint;
    sku: string;
    slug: string | null;
    name: string | null;
    description: string | null;
    descriptionSeo: string | null;
    lifecycleStatus: "DRAFT" | "ACTIVE" | "ARCHIVED" | null;
    visibility: "HIDDEN" | "PUBLIC" | null;
    commercialMode: "REFERENCE_ONLY" | "QUOTE_ONLY" | "SELLABLE" | null;
    priceVisibility: "HIDDEN" | "VISIBLE" | null;
    basePriceAmount: Prisma.Decimal | null;
    mediaLinks: Array<{
      mediaId: bigint;
    }>;
  },
) {
  const defaultVariant =
    family.defaultVariant ??
    (family.defaultVariantId != null && family.defaultVariantId === variant.id ? variant : null) ??
    variant;
  const defaultValues = {
    lifecycleStatus: defaultVariant?.lifecycleStatus ?? "DRAFT",
    visibility: defaultVariant?.visibility ?? "HIDDEN",
    commercialMode: defaultVariant?.commercialMode ?? "REFERENCE_ONLY",
    priceVisibility: defaultVariant?.priceVisibility ?? "HIDDEN",
    basePriceAmount: defaultVariant?.basePriceAmount?.toString() ?? null,
  };
  const effective = resolveVariantEffectiveValues(defaultValues, {
    lifecycleStatus: variant.lifecycleStatus,
    visibility: variant.visibility,
    commercialMode: variant.commercialMode,
    priceVisibility: variant.priceVisibility,
    basePriceAmount: variant.basePriceAmount?.toString() ?? null,
  });

  return {
    sourceType: "VARIANT" as const,
    sourceId: variant.id,
    productFamilyId: family.id,
    productPackId: null,
    name: variant.name?.trim() || family.name,
    slug: variant.slug?.trim() || `${family.slug}-variant-${variant.id.toString()}`,
    sku: variant.sku,
    description: variant.description?.trim() || family.description?.trim() || null,
    descriptionSeo:
      variant.descriptionSeo?.trim() || family.descriptionSeo?.trim() || null,
    lifecycleStatus: effective.effectiveLifecycleStatus,
    visibility: effective.effectiveVisibility,
    commercialMode: effective.effectiveCommercialMode,
    priceVisibility: effective.effectivePriceVisibility,
    basePriceAmount: normalizeDecimal(effective.effectiveBasePriceAmount),
    priceUnit: family.priceUnit,
    vatRate: family.vatRate,
    brandIds: normalizeBigIntArray([family.brandId]),
    tags: serializeOwnedTagNames(parseOwnedTagString(family.tags)),
    subcategoryIds: normalizeBigIntArray(family.subcategories.map((subcategory) => subcategory.id)),
    coverMediaId:
      variant.mediaLinks[0]?.mediaId ??
      family.mediaLinks[0]?.mediaId ??
      null,
  };
}

function deriveAutomaticPackLifecycleStatus(
  lines: readonly {
    lifecycleStatus: "DRAFT" | "ACTIVE" | "ARCHIVED";
  }[],
) {
  return lines.every((line) => line.lifecycleStatus === "ACTIVE") ? "ACTIVE" : "DRAFT";
}

function deriveAutomaticPackVisibility(
  lines: readonly {
    visibility: "HIDDEN" | "PUBLIC";
  }[],
) {
  return lines.every((line) => line.visibility === "PUBLIC") ? "PUBLIC" : "HIDDEN";
}

function deriveAutomaticPackPriceVisibility(
  lines: readonly {
    priceVisibility: "HIDDEN" | "VISIBLE";
  }[],
) {
  return lines.every((line) => line.priceVisibility === "VISIBLE")
    ? "VISIBLE"
    : "HIDDEN";
}

function resolvePackModeValue<T extends string>(
  mode: "AUTO" | "MANUAL",
  manualValue: T | null,
  derivedValue: T,
) {
  if (mode === "MANUAL" && manualValue != null) {
    return manualValue;
  }

  return derivedValue;
}

function resolvePackLineProjection(
  line: Prisma.ProductPackGetPayload<{ select: typeof PRODUCT_PACK_SELECT }>["lines"][number],
) {
  const projectedVariant = resolveProjectedVariant(line.variant.family, line.variant);

  return {
    quantity: line.quantity,
    ...projectedVariant,
  };
}

function derivePackPriceMetrics(
  lines: readonly {
    quantity: number;
    basePriceAmount: Prisma.Decimal | null;
    vatRate: number;
  }[],
) {
  if (lines.length === 0) {
    return {
      basePriceAmount: new Prisma.Decimal(0),
      vatRate: 0,
    };
  }

  if (lines.some((line) => line.basePriceAmount == null)) {
    return {
      basePriceAmount: null,
      vatRate: 0,
    };
  }

  const totals = lines.map((line) => {
    const lineTotal = (line.basePriceAmount ?? new Prisma.Decimal(0)).mul(line.quantity);
    return {
      lineTotal,
      weightedVat: lineTotal.mul(line.vatRate),
    };
  });

  const totalPrice = totals.reduce(
    (sum, item) => sum.add(item.lineTotal),
    new Prisma.Decimal(0),
  );

  if (totalPrice.equals(0)) {
    return {
      basePriceAmount: totalPrice,
      vatRate: 0,
    };
  }

  const totalWeightedVat = totals.reduce(
    (sum, item) => sum.add(item.weightedVat),
    new Prisma.Decimal(0),
  );

  return {
    basePriceAmount: totalPrice,
    vatRate: totalWeightedVat.div(totalPrice).toNumber(),
  };
}

function derivePackCoverMediaId(
  pack: Prisma.ProductPackGetPayload<{ select: typeof PRODUCT_PACK_SELECT }>,
  lines: readonly ReturnType<typeof resolvePackLineProjection>[],
) {
  return (
    pack.mediaLinks.find((link) => link.role === "COVER")?.mediaId ??
    pack.mediaLinks.find((link) => link.role === "GALLERY")?.mediaId ??
    lines[0]?.coverMediaId ??
    null
  );
}

function resolveProjectedPack(
  pack: Prisma.ProductPackGetPayload<{ select: typeof PRODUCT_PACK_SELECT }>,
) {
  const lineProducts = pack.lines.map(resolvePackLineProjection);
  const priceMetrics = derivePackPriceMetrics(
    lineProducts.map((line) => ({
      quantity: line.quantity,
      basePriceAmount: line.basePriceAmount,
      vatRate: line.vatRate,
    })),
  );

  return {
    sourceType: "PACK" as const,
    sourceId: pack.id,
    productFamilyId: null,
    productPackId: pack.id,
    name: pack.name,
    slug: pack.slug,
    sku: pack.sku,
    description: pack.description?.trim() || null,
    descriptionSeo: pack.descriptionSeo?.trim() || null,
    lifecycleStatus: resolvePackModeValue(
      pack.lifecycleStatusMode,
      pack.manualLifecycleStatus,
      deriveAutomaticPackLifecycleStatus(lineProducts),
    ),
    visibility: resolvePackModeValue(
      pack.visibilityMode,
      pack.manualVisibility,
      deriveAutomaticPackVisibility(lineProducts),
    ),
    commercialMode: pack.commercialMode,
    priceVisibility: resolvePackModeValue(
      pack.priceVisibilityMode,
      pack.manualPriceVisibility,
      deriveAutomaticPackPriceVisibility(lineProducts),
    ),
    basePriceAmount: priceMetrics.basePriceAmount,
    priceUnit: "ITEM" as const,
    vatRate: priceMetrics.vatRate,
    brandIds: normalizeBigIntArray(lineProducts.flatMap((line) => line.brandIds)),
    tags: serializeOwnedTagNames(lineProducts.flatMap((line) => parseOwnedTagString(line.tags))),
    subcategoryIds: normalizeBigIntArray(pack.subcategories.map((subcategory) => subcategory.id)),
    coverMediaId: derivePackCoverMediaId(pack, lineProducts),
  };
}

export async function syncAllProductsForProductFamilyTx(
  tx: TransactionClient,
  familyId: bigint,
) {
  const family = await tx.productFamily.findUnique({
    where: { id: familyId },
    select: FAMILY_VARIANT_SELECT,
  });

  await tx.allProduct.deleteMany({
    where: {
      sourceType: "VARIANT",
      productFamilyId: familyId,
    },
  });

  if (!family || family.variants.length === 0) {
    return [];
  }

  const projectedVariants = family.variants.map((variant) =>
    resolveProjectedVariant(family, variant),
  );

  await tx.allProduct.createMany({
    data: projectedVariants,
  });

  return projectedVariants.map((variant) => variant.sourceId);
}

export async function syncAllProductsForPackTx(
  tx: TransactionClient,
  packId: bigint,
) {
  const pack = await tx.productPack.findUnique({
    where: { id: packId },
    select: PRODUCT_PACK_SELECT,
  });

  if (!pack) {
    await tx.allProduct.deleteMany({
      where: {
        sourceType: "PACK",
        sourceId: packId,
      },
    });
    return;
  }

  const projectedPack = resolveProjectedPack(pack);

  await tx.allProduct.upsert({
    where: {
      sourceType_sourceId: {
        sourceType: projectedPack.sourceType,
        sourceId: projectedPack.sourceId,
      },
    },
    update: {
      productFamilyId: projectedPack.productFamilyId,
      productPackId: projectedPack.productPackId,
      name: projectedPack.name,
      slug: projectedPack.slug,
      sku: projectedPack.sku,
      description: projectedPack.description,
      descriptionSeo: projectedPack.descriptionSeo,
      lifecycleStatus: projectedPack.lifecycleStatus,
      visibility: projectedPack.visibility,
      commercialMode: projectedPack.commercialMode,
      priceVisibility: projectedPack.priceVisibility,
      basePriceAmount: projectedPack.basePriceAmount,
      priceUnit: projectedPack.priceUnit,
      vatRate: projectedPack.vatRate,
      brandIds: projectedPack.brandIds,
      tags: projectedPack.tags,
      subcategoryIds: projectedPack.subcategoryIds,
      coverMediaId: projectedPack.coverMediaId,
    },
    create: projectedPack,
  });
}

export async function syncAllProductsForPackIdsTx(
  tx: TransactionClient,
  packIds: readonly bigint[],
) {
  for (const packId of normalizeBigIntArray(packIds)) {
    await syncAllProductsForPackTx(tx, packId);
  }
}

export async function findDependentPackIdsByProductFamilyTx(
  tx: TransactionClient,
  familyId: bigint,
) {
  const lines = await tx.productPackLine.findMany({
    where: {
      variant: {
        familyId,
      },
    },
    select: {
      packId: true,
    },
  });

  return normalizeBigIntArray(lines.map((line) => line.packId));
}

export async function deleteAllProductsForProductFamilyTx(
  tx: TransactionClient,
  familyId: bigint,
) {
  await tx.allProduct.deleteMany({
    where: {
      sourceType: "VARIANT",
      productFamilyId: familyId,
    },
  });
}

export async function deleteAllProductsForPackTx(
  tx: TransactionClient,
  packId: bigint,
) {
  await tx.allProduct.deleteMany({
    where: {
      sourceType: "PACK",
      sourceId: packId,
    },
  });
}

export async function rebuildAllProductsProjectionTx(tx: TransactionClient) {
  await tx.allProduct.deleteMany({});

  const familyIds = await tx.productFamily.findMany({
    select: { id: true },
    orderBy: [{ id: "asc" }],
  });

  for (const family of familyIds) {
    await syncAllProductsForProductFamilyTx(tx, family.id);
  }

  const packIds = await tx.productPack.findMany({
    select: { id: true },
    orderBy: [{ id: "asc" }],
  });

  for (const pack of packIds) {
    await syncAllProductsForPackTx(tx, pack.id);
  }
}
