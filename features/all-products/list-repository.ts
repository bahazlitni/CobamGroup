import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type { AllProductListQuery } from "./types";

const allProductListSelect = Prisma.validator<Prisma.AllProductSelect>()({
  id: true,
  sourceType: true,
  sourceId: true,
  productFamilyId: true,
  productPackId: true,
  name: true,
  slug: true,
  sku: true,
  description: true,
  descriptionSeo: true,
  lifecycleStatus: true,
  visibility: true,
  commercialMode: true,
  priceVisibility: true,
  basePriceAmount: true,
  priceUnit: true,
  vatRate: true,
  brandIds: true,
  tags: true,
  subcategoryIds: true,
  coverMediaId: true,
  createdAt: true,
  updatedAt: true,
});

function buildAllProductWhere(query: AllProductListQuery): Prisma.AllProductWhereInput {
  const where: Prisma.AllProductWhereInput = {};

  if (query.sourceType) {
    where.sourceType = query.sourceType;
  }

  if (query.q?.trim()) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
      { sku: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { descriptionSeo: { contains: query.q, mode: "insensitive" } },
      { tags: { contains: query.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listAllProducts(query: AllProductListQuery) {
  return prisma.allProduct.findMany({
    where: buildAllProductWhere(query),
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
    select: allProductListSelect,
  });
}

export async function countAllProducts(query: AllProductListQuery) {
  return prisma.allProduct.count({
    where: buildAllProductWhere(query),
  });
}
