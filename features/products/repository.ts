import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type {
  ProductListQuery,
} from "./types";

type ResolvedProductInput = {
  brandId: number;
  productCategoryId: number;
  baseName: string;
  baseSlug: string;
  description: string | null;
  descriptionSeo: string | null;
  isActive: boolean;
  tagIds: number[];
};

function buildProductWhere(query: ProductListQuery): Prisma.ProductModelWhereInput {
  const where: Prisma.ProductModelWhereInput = {};

  if (query.q) {
    where.OR = [
      { baseName: { contains: query.q, mode: "insensitive" } },
      { baseSlug: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { brand: { name: { contains: query.q, mode: "insensitive" } } },
      { productType: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }

  if (query.brandId != null) {
    where.brandId = BigInt(query.brandId);
  }

  if (query.productCategoryId != null) {
    where.productTypeId = BigInt(query.productCategoryId);
  }

  return where;
}

const productModelListSelect = {
  id: true,
  baseName: true,
  baseSlug: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  brand: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  productType: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  _count: {
    select: {
      products: true,
      tagLinks: true,
    },
  },
} satisfies Prisma.ProductModelSelect;

const productModelDetailSelect = {
  ...productModelListSelect,
  descriptionSeo: true,
  tagLinks: {
    orderBy: {
      tag: {
        name: "asc",
      },
    },
    select: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.ProductModelSelect;

export async function listProducts(query: ProductListQuery) {
  return prisma.productModel.findMany({
    where: buildProductWhere(query),
    orderBy: [{ createdAt: "desc" }, { baseName: "asc" }],
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
    select: productModelListSelect,
  });
}

export async function countProducts(query: ProductListQuery) {
  return prisma.productModel.count({
    where: buildProductWhere(query),
  });
}

export async function findProductById(productId: number) {
  return prisma.productModel.findUnique({
    where: { id: BigInt(productId) },
    select: productModelDetailSelect,
  });
}

export async function findProductByBaseSlug(baseSlug: string) {
  return prisma.productModel.findUnique({
    where: { baseSlug },
    select: {
      id: true,
    },
  });
}

export async function findProductBySignature(
  brandId: number,
  productCategoryId: number,
  baseName: string,
) {
  return prisma.productModel.findFirst({
    where: {
      brandId: BigInt(brandId),
      productTypeId: BigInt(productCategoryId),
      baseName,
    },
    select: {
      id: true,
    },
  });
}

export async function findBrandOptionById(brandId: number) {
  return prisma.productBrand.findFirst({
    where: {
      id: BigInt(brandId),
      deletedAt: null,
    },
    select: {
      id: true,
      isProductBrand: true,
    },
  });
}

export async function findProductCategoryOptionById(productCategoryId: number) {
  return prisma.productCategory.findUnique({
    where: { id: BigInt(productCategoryId) },
    select: {
      id: true,
    },
  });
}

export async function createProduct(input: ResolvedProductInput) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.productModel.create({
      data: {
        brandId: BigInt(input.brandId),
        productTypeId: BigInt(input.productCategoryId),
        baseName: input.baseName,
        baseSlug: input.baseSlug,
        description: input.description,
        descriptionSeo: input.descriptionSeo,
        isActive: input.isActive,
      },
      select: {
        id: true,
      },
    });

    if (input.tagIds.length > 0) {
      await tx.productModelTagLink.createMany({
        data: input.tagIds.map((tagId) => ({
          modelId: created.id,
          tagId: BigInt(tagId),
        })),
        skipDuplicates: true,
      });
    }

    return tx.productModel.findUniqueOrThrow({
      where: { id: created.id },
      select: productModelDetailSelect,
    });
  });
}

export async function updateProduct(productId: number, input: ResolvedProductInput) {
  return prisma.$transaction(async (tx) => {
    const modelId = BigInt(productId);

    await tx.productModel.update({
      where: { id: modelId },
      data: {
        brandId: BigInt(input.brandId),
        productTypeId: BigInt(input.productCategoryId),
        baseName: input.baseName,
        baseSlug: input.baseSlug,
        description: input.description,
        descriptionSeo: input.descriptionSeo,
        isActive: input.isActive,
      },
    });

    await tx.productModelTagLink.deleteMany({
      where: { modelId },
    });

    if (input.tagIds.length > 0) {
      await tx.productModelTagLink.createMany({
        data: input.tagIds.map((tagId) => ({
          modelId,
          tagId: BigInt(tagId),
        })),
        skipDuplicates: true,
      });
    }

    return tx.productModel.findUniqueOrThrow({
      where: { id: modelId },
      select: productModelDetailSelect,
    });
  });
}

export async function deleteProduct(productId: number) {
  return prisma.productModel.delete({
    where: { id: BigInt(productId) },
    select: {
      id: true,
      baseName: true,
    },
  });
}

export async function listProductBrands() {
  return prisma.productBrand.findMany({
    where: {
      deletedAt: null,
      isProductBrand: true,
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function listProductCategoriesOptions() {
  return prisma.productCategory.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function createProductAuditLog(data: {
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
      entityType: "ProductModel",
      entityId: data.entityId,
      targetLabel: data.targetLabel,
      summary: data.summary,
      beforeSnapshotJson: data.beforeSnapshotJson as
        | Prisma.InputJsonValue
        | Prisma.NullableJsonNullValueInput
        | undefined,
      afterSnapshotJson: data.afterSnapshotJson as
        | Prisma.InputJsonValue
        | Prisma.NullableJsonNullValueInput
        | undefined,
    },
  });
}
