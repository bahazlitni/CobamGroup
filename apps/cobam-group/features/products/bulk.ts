import { Prisma, type ProductLifecycle } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import { canManageProducts } from "@/features/products/access";
import { ProductServiceError, deleteProductService } from "@/features/products/service";
import { visibilityFromProductLifecycle } from "@/features/products/model-b-compat";

export type FamilyBulkUpdateInput = {
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  lifecycle?: ProductLifecycle | null;
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
    throw new ProductServiceError("Aucune famille sélectionnée.", 400);
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
    data.displayName = input.name;
  }
  if (input.brand !== undefined) {
    throw new ProductServiceError(
      "La modification groupée de marque doit passer par la fiche produit.",
      400,
    );
  }
  if (input.lifecycle !== undefined) {
    Object.assign(data, visibilityFromProductLifecycle(input.lifecycle));
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
    throw new ProductServiceError("Aucune famille sélectionnée.", 400);
  }

  for (const familyId of familyIds) {
    await deleteProductService(session, familyId);
  }
}
