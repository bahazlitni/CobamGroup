import type { StaffSession } from "@/features/auth/types";
import { resolveOrCreateTagsByNames } from "@/features/tags/repository";
import { canAccessProducts, canCreateProducts, canManageProducts } from "./access";
import {
  countProducts,
  createProduct,
  createProductAuditLog,
  deleteProduct,
  findBrandOptionById,
  findProductByBaseSlug,
  findProductById,
  findProductBySignature,
  findProductCategoryOptionById,
  listProductBrands,
  listProductCategoriesOptions,
  listProducts,
  updateProduct,
} from "./repository";
import {
  mapProductBrandOptionDto,
  mapProductCategoryOptionDto,
  mapProductToDetailDto,
  mapProductToListItemDto,
  toProductAuditSnapshot,
} from "./mappers";
import type {
  ProductCreateInput,
  ProductFormOptionsDto,
  ProductListQuery,
  ProductListResult,
  ProductUpdateInput,
} from "./types";

export class ProductServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function assertUniqueProductInput(
  input: Pick<ProductCreateInput, "baseSlug" | "brandId" | "productCategoryId" | "baseName">,
  options?: { excludeProductId?: number },
) {
  const [sameSlug, sameSignature] = await Promise.all([
    findProductByBaseSlug(input.baseSlug),
    findProductBySignature(
      input.brandId,
      input.productCategoryId,
      input.baseName,
    ),
  ]);

  if (sameSlug && Number(sameSlug.id) !== (options?.excludeProductId ?? -1)) {
    throw new ProductServiceError("Un produit avec ce slug existe deja.", 400);
  }

  if (
    sameSignature &&
    Number(sameSignature.id) !== (options?.excludeProductId ?? -1)
  ) {
    throw new ProductServiceError(
      "Un produit avec cette marque, categorie et ce nom existe deja.",
      400,
    );
  }
}

async function assertValidProductRelations(
  input: ProductCreateInput,
  options?: { currentBrandId?: number },
) {
  const [brand, productCategory] = await Promise.all([
    findBrandOptionById(input.brandId),
    findProductCategoryOptionById(input.productCategoryId),
  ]);

  if (!brand) {
    throw new ProductServiceError("Marque introuvable.", 400);
  }

  if (
    !brand.isProductBrand &&
    input.brandId !== (options?.currentBrandId ?? -1)
  ) {
    throw new ProductServiceError(
      "Cette marque ne peut pas etre utilisee pour les produits.",
      400,
    );
  }

  if (!productCategory) {
    throw new ProductServiceError("Categorie de produit introuvable.", 400);
  }
}

export async function listProductsService(
  session: StaffSession,
  query: ProductListQuery,
): Promise<ProductListResult> {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Acces refuse.", 403);
  }

  const [items, total] = await Promise.all([
    listProducts(query),
    countProducts(query),
  ]);

  return {
    items: items.map(mapProductToListItemDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getProductFormOptionsService(
  session: StaffSession,
): Promise<ProductFormOptionsDto> {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Acces refuse.", 403);
  }

  const [brands, productCategories] = await Promise.all([
    listProductBrands(),
    listProductCategoriesOptions(),
  ]);

  return {
    brands: brands.map(mapProductBrandOptionDto),
    productCategories: productCategories.map(mapProductCategoryOptionDto),
  };
}

export async function getProductByIdService(
  session: StaffSession,
  productId: number,
) {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Acces refuse.", 403);
  }

  const product = await findProductById(productId);
  if (!product) {
    throw new ProductServiceError("Produit introuvable.", 404);
  }

  return mapProductToDetailDto(product);
}

export async function createProductService(
  session: StaffSession,
  input: ProductCreateInput,
) {
  if (!canCreateProducts(session)) {
    throw new ProductServiceError("Acces refuse.", 403);
  }

  await assertUniqueProductInput(input);
  await assertValidProductRelations(input);
  const resolvedTags = await resolveOrCreateTagsByNames(input.tagNames);

  const product = await createProduct({
    ...input,
    tagIds: resolvedTags.map((tag) => Number(tag.id)),
  });

  await createProductAuditLog({
    actorUserId: session.id,
    actionType: "CREATE",
    entityId: String(product.id),
    targetLabel: product.baseName,
    summary: "Creation d'un nouveau produit catalogue",
    afterSnapshotJson: toProductAuditSnapshot(product),
  });

  return mapProductToDetailDto(product);
}

export async function updateProductService(
  session: StaffSession,
  productId: number,
  input: ProductUpdateInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductServiceError("Acces refuse.", 403);
  }

  const before = await findProductById(productId);
  if (!before) {
    throw new ProductServiceError("Produit introuvable.", 404);
  }

  await assertUniqueProductInput(input, { excludeProductId: productId });
  await assertValidProductRelations(input, {
    currentBrandId: Number(before.brand.id),
  });
  const resolvedTags = await resolveOrCreateTagsByNames(input.tagNames);

  const product = await updateProduct(productId, {
    ...input,
    tagIds: resolvedTags.map((tag) => Number(tag.id)),
  });

  await createProductAuditLog({
    actorUserId: session.id,
    actionType: "UPDATE",
    entityId: String(product.id),
    targetLabel: product.baseName,
    summary: "Mise a jour d'un produit catalogue",
    beforeSnapshotJson: toProductAuditSnapshot(before),
    afterSnapshotJson: toProductAuditSnapshot(product),
  });

  return mapProductToDetailDto(product);
}

export async function deleteProductService(
  session: StaffSession,
  productId: number,
) {
  if (!canManageProducts(session)) {
    throw new ProductServiceError("Acces refuse.", 403);
  }

  const before = await findProductById(productId);
  if (!before) {
    throw new ProductServiceError("Produit introuvable.", 404);
  }

  if (before._count.products > 0) {
    throw new ProductServiceError(
      "Impossible de supprimer un produit qui possede deja des variantes.",
      400,
    );
  }

  const deleted = await deleteProduct(productId);

  await createProductAuditLog({
    actorUserId: session.id,
    actionType: "DELETE",
    entityId: String(deleted.id),
    targetLabel: deleted.baseName,
    summary: "Suppression d'un produit catalogue",
    beforeSnapshotJson: toProductAuditSnapshot(before),
  });
}

