import {
  Prisma,
  ProductCommercialMode,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { canAccessProducts, canToggleProductLifecycle } from "@/features/products/access";
import { prisma } from "@/lib/server/db/prisma";
import { formatProductBrandValue } from "@/lib/static_tables/brands";
import type { AllProductsListItemDto, AllProductsListResult } from "./types";

export class AllProductsServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const ALL_PRODUCTS_LIST_SELECT = {
  id: true,
  kind: true,
  sku: true,
  slug: true,
  name: true,
  description: true,
  brand: true,
  basePriceAmount: true,
  vatRate: true,
  stock: true,
  stockUnit: true,
  datasheetMediaId: true,
  visibility: true,
  priceVisibility: true,
  stockVisibility: true,
  lifecycle: true,
  commercialMode: true,
  updatedAt: true,
  mediaLinks: {
    select: {
      media: {
        select: {
          kind: true,
        },
      },
    },
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
              slug: true,
            },
          },
        },
      },
    },
  },
  familyMembership: {
    select: {
      family: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  packLinesAsPack: {
    select: {
      quantity: true,
      product: {
        select: {
          brand: true,
          basePriceAmount: true,
          stock: true,
          priceVisibility: true,
          stockVisibility: true,
          lifecycle: true,
          visibility: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

type AllProductsListRecord = Prisma.ProductGetPayload<{
  select: typeof ALL_PRODUCTS_LIST_SELECT;
}>;

function formatAllProductBrand(record: AllProductsListRecord) {
  if (record.kind !== "PACK") {
    return formatProductBrandValue(record.brand);
  }

  const brandLabels = [
    ...new Set(
      record.packLinesAsPack.flatMap((line) => {
        const label = formatProductBrandValue(line.product.brand);
        return label ? [label] : [];
      }),
    ),
  ];

  return brandLabels.length > 0 ? brandLabels.join(", ") : null;
}

function mapAllProductsListItem(record: AllProductsListRecord): AllProductsListItemDto {
  const derivedLifecycle = record.lifecycle ?? "DRAFT";
  const derivedVisibility =
    record.kind === "PACK"
      ? record.packLinesAsPack.length > 0 &&
        record.packLinesAsPack.every((line) => line.product.visibility === true)
      : record.visibility;
  const derivedPriceVisibility =
    record.kind === "PACK"
      ? record.packLinesAsPack.length > 0 &&
        record.packLinesAsPack.every((line) => line.product.priceVisibility === true)
      : record.priceVisibility;
  const derivedStockVisibility =
    record.kind === "PACK"
      ? record.packLinesAsPack.length > 0 &&
        record.packLinesAsPack.every((line) => line.product.stockVisibility === true)
      : record.stockVisibility;
  const derivedPrice =
    record.kind === "PACK"
      ? (() => {
          if (record.packLinesAsPack.some((line) => line.product.basePriceAmount == null)) {
            return null;
          }

          return record.packLinesAsPack
            .reduce(
              (total, line) =>
                total.add((line.product.basePriceAmount ?? new Prisma.Decimal(0)).mul(line.quantity)),
              new Prisma.Decimal(0),
            )
            .toString();
        })()
      : record.basePriceAmount?.toString() ?? null;
  const derivedStock =
    record.kind === "PACK"
      ? (() => {
          let stockValue: Prisma.Decimal | null = null;

          for (const line of record.packLinesAsPack) {
            if (line.product.stock == null) {
              return null;
            }

            const availableBundles = line.product.stock.div(line.quantity);
            stockValue =
              stockValue == null
                ? availableBundles
                : Prisma.Decimal.min(stockValue, availableBundles);
          }

          return stockValue?.toString() ?? null;
        })()
      : record.stock?.toString() ?? null;

  return {
    id: Number(record.id),
    kind: record.kind,
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    description: record.description,
    brand: formatAllProductBrand(record),
    basePriceAmount: derivedPrice,
    vatRate: record.vatRate ?? null,
    stock: derivedStock,
    stockUnit: record.kind === "PACK" ? "ITEM" : record.stockUnit,
    hasImage: record.mediaLinks.some((link) => link.media.kind === "IMAGE"),
    hasDatasheet: record.kind === "PACK" ? false : record.datasheetMediaId != null,
    subcategories: record.subcategoryLinks.map(({ subcategory }) => ({
      id: Number(subcategory.id),
      name: subcategory.name,
      slug: subcategory.slug,
      categorySlug: subcategory.category.slug,
    })),
    visibility: derivedVisibility ?? null,
    priceVisibility: derivedPriceVisibility ?? null,
    stockVisibility: derivedStockVisibility ?? null,
    lifecycle: derivedLifecycle,
    commercialMode: record.commercialMode ?? null,
    updatedAt: record.updatedAt.toISOString(),
    family: record.familyMembership?.family
      ? {
          id: Number(record.familyMembership.family.id),
          name: record.familyMembership.family.name,
          slug: record.familyMembership.family.slug,
        }
      : null,
  };
}

export async function listAllProductsService(
  session: StaffSession,
  query: { page: number; pageSize: number; q: string | null; kind?: string | null },
): Promise<AllProductsListResult> {
  if (!canAccessProducts(session)) {
    throw new AllProductsServiceError("Accès refusé.", 403);
  }

  const where: Prisma.ProductWhereInput = query.q
    ? {
        OR: [
          { sku: { contains: query.q, mode: "insensitive" } },
          { slug: { contains: query.q, mode: "insensitive" } },
          { name: { contains: query.q, mode: "insensitive" } },
          { description: { contains: query.q, mode: "insensitive" } },
          {
            familyMembership: {
              is: {
                family: {
                  is: {
                    OR: [
                      { name: { contains: query.q, mode: "insensitive" } },
                      { slug: { contains: query.q, mode: "insensitive" } },
                    ],
                  },
                },
              },
            },
          },
        ],
      }
    : {};

  if (query.kind) {
    where.kind = query.kind as Prisma.ProductWhereInput["kind"];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: ALL_PRODUCTS_LIST_SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(mapAllProductsListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function updateAllProductLifecycleService(
  session: StaffSession,
  productId: number,
  lifecycle: ProductLifecycle,
) {
  if (!canToggleProductLifecycle(session, lifecycle)) {
    throw new AllProductsServiceError("Accès refusé.", 403);
  }

  const existing = await prisma.product.findUnique({
    where: { id: BigInt(productId) },
    select: { id: true },
  });

  if (!existing) {
    throw new AllProductsServiceError("Produit introuvable.", 404);
  }

  const updated = await prisma.product.update({
    where: { id: BigInt(productId) },
    data: { lifecycle },
    select: ALL_PRODUCTS_LIST_SELECT,
  });

  return mapAllProductsListItem(updated);
}

export type BulkProductUpdateInput = {
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  basePriceAmount?: string | null;
  vatRate?: number | null;
  stock?: string | null;
  stockUnit?: string | null;
  lifecycle?: ProductLifecycle | null;
  commercialMode?: ProductCommercialMode | null;
  visibility?: boolean | null;
  priceVisibility?: boolean | null;
  stockVisibility?: boolean | null;
};

export async function updateAllProductsBulkService(
  session: StaffSession,
  productIds: number[],
  input: BulkProductUpdateInput,
) {
  if (!canAccessProducts(session)) {
    throw new AllProductsServiceError("Acces refuse.", 403);
  }

  if (productIds.length === 0) {
    throw new AllProductsServiceError("Aucun produit selectionne.", 400);
  }

  if ((input.sku || input.name) && productIds.length > 1) {
    throw new AllProductsServiceError(
      "SKU et nom ne peuvent etre modifies que pour un seul produit.",
      400,
    );
  }

  const data: Prisma.ProductUpdateManyMutationInput = {};

  if (input.sku != null) {
    data.sku = input.sku;
  }
  if (input.name != null) {
    data.name = input.name;
  }
  if (input.brand !== undefined) {
    data.brand = input.brand;
  }
  if (input.basePriceAmount !== undefined) {
    data.basePriceAmount =
      input.basePriceAmount == null ? null : new Prisma.Decimal(input.basePriceAmount);
  }
  if (input.vatRate !== undefined) {
    data.vatRate = input.vatRate;
  }
  if (input.stock !== undefined) {
    data.stock = input.stock == null ? null : new Prisma.Decimal(input.stock);
  }
  if (input.stockUnit !== undefined) {
    data.stockUnit = input.stockUnit as ProductStockUnit | null;
  }
  if (input.lifecycle !== undefined) {
    data.lifecycle = input.lifecycle;
  }
  if (input.commercialMode !== undefined) {
    data.commercialMode = input.commercialMode;
  }
  if (input.visibility !== undefined) {
    data.visibility = input.visibility;
  }
  if (input.priceVisibility !== undefined) {
    data.priceVisibility = input.priceVisibility;
  }
  if (input.stockVisibility !== undefined) {
    data.stockVisibility = input.stockVisibility;
  }

  if (Object.keys(data).length === 0) {
    throw new AllProductsServiceError("Aucune modification fournie.", 400);
  }

  await prisma.product.updateMany({
    where: {
      id: { in: productIds.map((id) => BigInt(id)) },
    },
    data,
  });
}

export async function deleteAllProductsBulkService(
  session: StaffSession,
  productIds: number[],
) {
  if (!canAccessProducts(session)) {
    throw new AllProductsServiceError("Acces refuse.", 403);
  }

  if (productIds.length === 0) {
    throw new AllProductsServiceError("Aucun produit selectionne.", 400);
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds.map((id) => BigInt(id)) },
    },
    select: {
      id: true,
      packLinesAsComponent: {
        select: { packProductId: true },
        take: 1,
      },
    },
  });

  if (products.some((product) => product.packLinesAsComponent.length > 0)) {
    throw new AllProductsServiceError(
      "Certains produits sont utilises dans des packs.",
      400,
    );
  }

  await prisma.product.deleteMany({
    where: {
      id: { in: productIds.map((id) => BigInt(id)) },
    },
  });
}
