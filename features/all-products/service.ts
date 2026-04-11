import { Prisma, ProductLifecycle } from "@prisma/client";
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
  stock: true,
  stockUnit: true,
  datasheetMediaId: true,
  visibility: true,
  lifecycle: true,
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
    visibility: derivedVisibility,
    lifecycle: derivedLifecycle,
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
  query: { page: number; pageSize: number; q: string | null },
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
