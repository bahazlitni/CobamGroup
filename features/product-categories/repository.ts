import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type {
  ProductCategoryCreateInput,
  ProductCategoryListQuery,
  ProductCategoryUpdateInput,
} from "./types";

function buildProductCategoryWhere(
  query: ProductCategoryListQuery,
): Prisma.ProductCategoryWhereInput {
  const where: Prisma.ProductCategoryWhereInput = {};

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
      { subtitle: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
    ];
  }

  return where;
}

const productCategorySelect = {
  id: true,
  name: true,
  subtitle: true,
  slug: true,
  description: true,
  descriptionSeo: true,
  imageMediaId: true,
  sortOrder: true,
  isActive: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  _count: {
    select: {
      children: true,
      productModels: true,
    },
  },
} satisfies Prisma.ProductCategorySelect;

export async function listProductCategories(query: ProductCategoryListQuery) {
  return prisma.productCategory.findMany({
    where: buildProductCategoryWhere(query),
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { createdAt: "desc" }],
    skip: query.tree ? undefined : (query.page - 1) * query.pageSize,
    take: query.tree ? undefined : query.pageSize,
    select: productCategorySelect,
  });
}

export async function countProductCategories(query: ProductCategoryListQuery) {
  return prisma.productCategory.count({
    where: buildProductCategoryWhere(query),
  });
}

export async function findProductCategoryById(categoryId: number) {
  return prisma.productCategory.findUnique({
    where: { id: BigInt(categoryId) },
    select: productCategorySelect,
  });
}

export async function findProductCategoryBySlug(slug: string) {
  return prisma.productCategory.findUnique({
    where: { slug },
    select: {
      id: true,
    },
  });
}

export async function createProductCategory(
  input: ProductCategoryCreateInput,
) {
  return prisma.productCategory.create({
    data: {
      name: input.name,
      subtitle: input.subtitle,
      slug: input.slug,
      description: input.description,
      descriptionSeo: input.descriptionSeo,
      imageMediaId:
        input.imageMediaId != null ? BigInt(input.imageMediaId) : null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      parentId: input.parentId != null ? BigInt(input.parentId) : null,
    },
    select: productCategorySelect,
  });
}

export async function updateProductCategory(
  categoryId: number,
  input: ProductCategoryUpdateInput,
) {
  return prisma.productCategory.update({
    where: { id: BigInt(categoryId) },
    data: {
      name: input.name,
      subtitle: input.subtitle,
      slug: input.slug,
      description: input.description,
      descriptionSeo: input.descriptionSeo,
      imageMediaId:
        input.imageMediaId != null ? BigInt(input.imageMediaId) : null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      parentId: input.parentId != null ? BigInt(input.parentId) : null,
    },
    select: productCategorySelect,
  });
}

export async function deleteProductCategory(categoryId: number) {
  return prisma.productCategory.delete({
    where: { id: BigInt(categoryId) },
  });
}

export async function countProductModelsForCategory(categoryId: number) {
  return prisma.productModel.count({
    where: {
      productTypeId: BigInt(categoryId),
    },
  });
}

export async function listProductCategoryParentOptions() {
  return prisma.productCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  });
}

function toAuditJson(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createProductCategoryAuditLog(data: {
  actorUserId: string;
  actionType: "CREATE" | "UPDATE" | "DELETE";
  entityId: string;
  targetLabel: string;
  summary: string;
  beforeSnapshotJson?: unknown;
  afterSnapshotJson?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: data.actorUserId,
      actionType: data.actionType,
      entityType: "ProductCategory",
      entityId: data.entityId,
      targetLabel: data.targetLabel,
      summary: data.summary,
      beforeSnapshotJson: toAuditJson(data.beforeSnapshotJson),
      afterSnapshotJson: toAuditJson(data.afterSnapshotJson),
    },
  });
}
