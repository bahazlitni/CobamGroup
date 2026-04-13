import { Prisma, ProductCommercialMode, ProductLifecycle, ProductStockUnit } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import { canManageProducts } from "@/features/products/access";
import { ProductServiceError, deleteProductService } from "@/features/products/service";

export type FamilyBulkUpdateInput = {
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  basePriceAmount?: string | null;
  vatRate?: number | null;
  stock?: string | null;
  stockUnit?: ProductStockUnit | null;
  lifecycle?: ProductLifecycle | null;
  commercialMode?: ProductCommercialMode | null;
  visibility?: boolean | null;
  priceVisibility?: boolean | null;
  stockVisibility?: boolean | null;
};

export async function updateProductFamiliesBulkService(
  session: StaffSession,
  familyIds: number[],
  input: FamilyBulkUpdateInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductServiceError("AccÃ¨s refusÃ©.", 403);
  }

  if (familyIds.length === 0) {
    throw new ProductServiceError("Aucune famille selectionnee.", 400);
  }

  if ((input.sku || input.name) && familyIds.length > 1) {
    throw new ProductServiceError(
      "SKU et nom ne peuvent etre modifies que pour une seule famille.",
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
    data.stockUnit = input.stockUnit;
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
    throw new ProductServiceError("Aucune modification fournie.", 400);
  }

  const families = await prisma.productFamily.findMany({
    where: {
      id: { in: familyIds.map((id) => BigInt(id)) },
    },
    select: {
      id: true,
      defaultProductId: true,
    },
  });

  const defaultProductIds = families
    .map((family) => family.defaultProductId)
    .filter((id): id is bigint => id != null);

  if (defaultProductIds.length === 0) {
    return;
  }

  await prisma.product.updateMany({
    where: {
      id: { in: defaultProductIds },
    },
    data,
  });
}

export async function deleteProductFamiliesBulkService(
  session: StaffSession,
  familyIds: number[],
) {
  if (!canManageProducts(session)) {
    throw new ProductServiceError("AccÃ¨s refusÃ©.", 403);
  }

  if (familyIds.length === 0) {
    throw new ProductServiceError("Aucune famille selectionnee.", 400);
  }

  for (const familyId of familyIds) {
    await deleteProductService(session, familyId);
  }
}
