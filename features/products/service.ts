import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { findActiveMediaByIds, findImageMediaById } from "@/features/media/repository";
import {
  findProductPacksBySkus,
  findProductPacksBySlugs,
} from "@/features/product-packs/repository";
import { serializeOwnedTagNames } from "@/features/tags/owned";
import { resolveOrCreateTagsByNames } from "@/features/tags/repository";
import { parseRawProductAttributeValue } from "./attribute-values";
import { canAccessProducts, canCreateProducts, canManageProducts } from "./access";
import {
  countProducts,
  createProduct,
  createProductAuditLog,
  deleteProduct,
  findBrandOptionById,
  findProductById,
  findProductBySignature,
  findProductBySlug,
  findProductSubcategoryOptionsByIds,
  findProductVariantsBySkus,
  findProductVariantsBySlugs,
  listProductBrands,
  listProductSubcategoriesOptions,
  listProducts,
  updateProduct,
} from "./repository";
import {
  mapProductBrandOptionDto,
  mapProductSubcategoryOptionDto,
  mapProductToDetailDto,
  mapProductToListItemDto,
  toProductAuditSnapshot,
} from "./mappers";
import { slugifyProductName, slugifyProductReference } from "./slug";
import type {
  ProductCreateInput,
  ProductFormOptionsDto,
  ProductListQuery,
  ProductListResult,
  ProductUpdateInput,
  ProductVariantInput,
} from "./types";

export class ProductServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function writeProductAuditLogSafely(data: Parameters<typeof createProductAuditLog>[0]) {
  try {
    await createProductAuditLog(data);
  } catch (error) {
    console.error("PRODUCT_AUDIT_LOG_ERROR:", error);
  }
}

function buildFamilySlug(name: string) {
  const slug = slugifyProductName(name);

  if (!slug) {
    throw new ProductServiceError("Le nom de la famille ne permet pas de générer un slug.", 400);
  }

  return slug;
}

function buildVariantSlug(name: string) {
  const slug = slugifyProductReference(name);

  if (!slug) {
    throw new ProductServiceError("Le nom d'une variante ne permet pas de générer un slug.", 400);
  }

  return slug;
}

function normalizeVariantIds<
  T extends ProductVariantInput & {
    slug?: string | null;
  },
>(input: {
  variants: T[];
}) {
  return input.variants.map((variant) => ({
    ...variant,
    id: variant.id ?? null,
    mediaIds: Array.from(new Set(variant.mediaIds)),
    attributeValues: variant.attributeValues.map((attributeValue) => ({
      ...attributeValue,
      attributeId: attributeValue.attributeId ?? null,
      attributeTempKey: attributeValue.attributeTempKey ?? null,
    })),
  }));
}

function normalizeAttributeIds(input: Pick<ProductCreateInput, "attributes">) {
  return input.attributes.map((attribute) => ({
    ...attribute,
    id: attribute.id ?? null,
  }));
}

function assertProductHasAtLeastOneVariant(input: Pick<ProductCreateInput, "variants">) {
  if (input.variants.length === 0) {
    throw new ProductServiceError(
      "Une famille produit doit contenir au moins une variante par défaut.",
      400,
    );
  }
}

function materializeDefaultVariantFields(variant: ProductVariantInput): ProductVariantInput {
  return {
    ...variant,
    lifecycleStatus: variant.lifecycleStatus ?? "DRAFT",
    visibility: variant.visibility ?? "HIDDEN",
    commercialMode: variant.commercialMode ?? "REFERENCE_ONLY",
    priceVisibility: variant.priceVisibility ?? "HIDDEN",
  };
}

function materializeVariantDefaults(input: Pick<ProductCreateInput, "variants">) {
  assertProductHasAtLeastOneVariant(input);

  const [defaultVariantRaw, ...remainingVariants] = input.variants;
  const defaultVariant = materializeDefaultVariantFields(defaultVariantRaw);

  return [
    defaultVariant,
    ...remainingVariants.map((variant) => ({
      ...variant,
      lifecycleStatus: variant.lifecycleStatus ?? defaultVariant.lifecycleStatus,
      visibility: variant.visibility ?? defaultVariant.visibility,
      commercialMode: variant.commercialMode ?? defaultVariant.commercialMode,
      priceVisibility: variant.priceVisibility ?? defaultVariant.priceVisibility,
      basePriceAmount: variant.basePriceAmount ?? defaultVariant.basePriceAmount,
    })),
  ];
}

function withComputedVariantSlugs(variants: ProductVariantInput[]) {
  return variants.map((variant) => ({
    ...variant,
    slug: buildVariantSlug(variant.name),
  }));
}

function assertValidProductAttributes(
  input: Pick<ProductCreateInput, "attributes" | "variants">,
  options?: { allowedAttributeIds?: readonly number[] },
) {
  const seenAttributeNames = new Set<string>();
  const seenTempKeys = new Set<string>();
  const allowedAttributeIds = new Set(options?.allowedAttributeIds ?? []);
  const attributesById = new Map<number, ProductCreateInput["attributes"][number]>();
  const attributesByTempKey = new Map<string, ProductCreateInput["attributes"][number]>();

  for (const attribute of input.attributes) {
    const normalizedName = attribute.name.trim().toLocaleLowerCase("fr");
    if (seenAttributeNames.has(normalizedName)) {
      throw new ProductServiceError(
        "Deux attributs de famille ne peuvent pas partager le même nom.",
        400,
      );
    }

    if (seenTempKeys.has(attribute.tempKey)) {
      throw new ProductServiceError(
        "Deux attributs de famille utilisent la même clé temporaire.",
        400,
      );
    }

    if (attribute.id != null && !allowedAttributeIds.has(attribute.id)) {
      throw new ProductServiceError(
        "Un attribut transmis n'appartient pas à cette famille produit.",
        400,
      );
    }

    seenAttributeNames.add(normalizedName);
    seenTempKeys.add(attribute.tempKey);

    if (attribute.id != null) {
      attributesById.set(attribute.id, attribute);
    }
    attributesByTempKey.set(attribute.tempKey, attribute);
  }

  for (const variant of input.variants) {
    const seenVariantAttributes = new Set<string>();

    for (const attributeValue of variant.attributeValues) {
      const attribute =
        (attributeValue.attributeId != null
          ? attributesById.get(attributeValue.attributeId)
          : undefined) ??
        (attributeValue.attributeTempKey != null
          ? attributesByTempKey.get(attributeValue.attributeTempKey)
          : undefined);

      if (!attribute) {
        throw new ProductServiceError(
          "Une valeur de variante référence un attribut inexistant.",
          400,
        );
      }

      const attributeKey =
        attribute.id != null ? `id:${attribute.id}` : `temp:${attribute.tempKey}`;

      if (seenVariantAttributes.has(attributeKey)) {
        throw new ProductServiceError(
          "Une variante ne peut pas définir deux fois le même attribut.",
          400,
        );
      }

      seenVariantAttributes.add(attributeKey);

      try {
        parseRawProductAttributeValue(attribute.dataType, attributeValue.value);
      } catch (error: unknown) {
        throw new ProductServiceError(
          error instanceof Error
            ? error.message
            : "Une valeur d'attribut de variante est invalide.",
          400,
        );
      }
    }
  }
}

function assertValidDefaultVariant(variant: ProductVariantInput | undefined) {
  if (!variant) {
    throw new ProductServiceError(
      "Une famille produit doit contenir au moins une variante par défaut.",
      400,
    );
  }

  if (
    variant.lifecycleStatus == null ||
    variant.visibility == null ||
    variant.commercialMode == null ||
    variant.priceVisibility == null
  ) {
    throw new ProductServiceError(
      "La variante par défaut doit définir le cycle de vie, la visibilité, le mode commercial et la visibilité du prix.",
      400,
    );
  }
}

async function assertValidProductVariants(
  input: Pick<ProductCreateInput, "variants">,
  options?: { allowedVariantIds?: readonly number[] },
) {
  const seenSlugs = new Set<string>();
  const seenSkus = new Set<string>();

  for (const [index, variant] of input.variants.entries()) {
    const variantSlug = buildVariantSlug(variant.name);

    if (seenSlugs.has(variantSlug)) {
      throw new ProductServiceError(
        `Deux variantes génèrent le même slug (${variantSlug}).`,
        400,
      );
    }

    if (seenSkus.has(variant.sku)) {
      throw new ProductServiceError("Deux variantes ne peuvent pas partager le même SKU.", 400);
    }

    if (!variant.name.trim() || !variant.description.trim() || !variant.descriptionSeo.trim()) {
      throw new ProductServiceError(
        `La variante ${index + 1} doit définir un nom, une description et une description SEO.`,
        400,
      );
    }

    seenSlugs.add(variantSlug);
    seenSkus.add(variant.sku);
  }

  const allowedIds = new Set(options?.allowedVariantIds ?? []);

  for (const variant of input.variants) {
    if (variant.id != null && !allowedIds.has(variant.id)) {
      throw new ProductServiceError(
        "Une variante transmise n'appartient pas à cette famille produit.",
        400,
      );
    }
  }

  const [existingBySlug, existingBySku] = await Promise.all([
    findProductVariantsBySlugs(input.variants.map((variant) => buildVariantSlug(variant.name))),
    findProductVariantsBySkus(input.variants.map((variant) => variant.sku)),
  ]);
  const [existingPacksBySlug, existingPacksBySku] = await Promise.all([
    findProductPacksBySlugs(input.variants.map((variant) => buildVariantSlug(variant.name))),
    findProductPacksBySkus(input.variants.map((variant) => variant.sku)),
  ]);

  const allowedBigIntIds = new Set(
    input.variants
      .map((variant) => variant.id)
      .filter((variantId): variantId is number => variantId != null)
      .map((variantId) => BigInt(variantId)),
  );

  for (const existingVariant of existingBySlug) {
    if (!allowedBigIntIds.has(existingVariant.id)) {
      throw new ProductServiceError(
        `Le slug de variante "${existingVariant.slug}" est déjà utilisé.`,
        400,
      );
    }
  }

  for (const existingVariant of existingBySku) {
    if (!allowedBigIntIds.has(existingVariant.id)) {
      throw new ProductServiceError(`Le SKU "${existingVariant.sku}" est déjà utilisé.`, 400);
    }
  }

  for (const existingPack of existingPacksBySlug) {
    throw new ProductServiceError(
      `Le slug de variante "${existingPack.slug}" est déjà utilisé par un pack.`,
      400,
    );
  }

  for (const existingPack of existingPacksBySku) {
    throw new ProductServiceError(
      `Le SKU "${existingPack.sku}" est déjà utilisé par un pack.`,
      400,
    );
  }
}

async function assertUniqueProductInput(
  input: Pick<ProductCreateInput, "brandId" | "name">,
  options?: { excludeProductId?: number },
) {
  const familySlug = buildFamilySlug(input.name);
  const [sameSlug, sameSignature] = await Promise.all([
    findProductBySlug(familySlug),
    input.brandId != null
      ? findProductBySignature(input.brandId, input.name)
      : Promise.resolve(null),
  ]);

  if (sameSlug && Number(sameSlug.id) !== (options?.excludeProductId ?? -1)) {
    throw new ProductServiceError("Une famille produit avec ce slug existe déjà.", 400);
  }

  if (sameSignature && Number(sameSignature.id) !== (options?.excludeProductId ?? -1)) {
    throw new ProductServiceError("Un produit avec cette marque et ce nom existe déjà.", 400);
  }

  const conflictingPackBySlug = await findProductPacksBySlugs([familySlug]);

  if (conflictingPackBySlug.length > 0) {
    throw new ProductServiceError("Une famille produit avec ce slug existe déjà sous forme de pack.", 400);
  }
}

async function assertValidProductRelations(
  input: ProductCreateInput,
  options?: { currentBrandId?: number | null },
) {
  const [brand, productSubcategories] = await Promise.all([
    input.brandId != null ? findBrandOptionById(input.brandId) : Promise.resolve(null),
    findProductSubcategoryOptionsByIds(input.productSubcategoryIds),
  ]);

  if (input.brandId != null && !brand) {
    throw new ProductServiceError("Marque introuvable.", 400);
  }

  if (
    input.brandId != null &&
    brand != null &&
    !brand.isProductBrand &&
    input.brandId !== (options?.currentBrandId ?? -1)
  ) {
    throw new ProductServiceError("Cette marque ne peut pas être utilisée pour les produits.", 400);
  }

  if (productSubcategories.length !== new Set(input.productSubcategoryIds).size) {
    throw new ProductServiceError("Au moins une sous-catégorie produit est introuvable.", 400);
  }
}


async function assertValidProductMedia(
  input: Pick<ProductCreateInput, "mainImageMediaId" | "variants">,
) {
  if (input.mainImageMediaId != null) {
    const mainImage = await findImageMediaById(input.mainImageMediaId);

    if (!mainImage) {
      throw new ProductServiceError(
        "L'image principale sélectionnée est introuvable ou invalide.",
        400,
      );
    }
  }

  const variantMediaIds = input.variants.flatMap((variant) => variant.mediaIds);
  if (variantMediaIds.length === 0) {
    return;
  }

  const media = await findActiveMediaByIds(variantMediaIds);

  if (media.length !== new Set(variantMediaIds).size) {
    throw new ProductServiceError("Au moins un média de variante est introuvable ou inactif.", 400);
  }
}

function isGlobalProductProjectionConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function isVariantReferencedByPack(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}

export async function listProductsService(
  session: StaffSession,
  query: ProductListQuery,
): Promise<ProductListResult> {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const [items, total] = await Promise.all([listProducts(query), countProducts(query)]);

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
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const [brands, productSubcategories] = await Promise.all([
    listProductBrands(),
    listProductSubcategoriesOptions(),
  ]);

  return {
    brands: brands.map(mapProductBrandOptionDto),
    productSubcategories: productSubcategories.map(mapProductSubcategoryOptionDto),
  };
}

export async function getProductByIdService(session: StaffSession, productId: number) {
  if (!canAccessProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const product = await findProductById(productId);
  if (!product) {
    throw new ProductServiceError("Produit introuvable.", 404);
  }

  return mapProductToDetailDto(product);
}

export async function createProductService(session: StaffSession, input: ProductCreateInput) {
  if (!canCreateProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const materializedVariants = materializeVariantDefaults({ variants: input.variants });
  assertValidDefaultVariant(materializedVariants[0]);
  await assertUniqueProductInput(input);
  await assertValidProductRelations(input);
  await assertValidProductMedia({ ...input, variants: materializedVariants });
  assertValidProductAttributes({ ...input, variants: materializedVariants });
  await assertValidProductVariants({ variants: materializedVariants });

  await resolveOrCreateTagsByNames(input.tagNames);
  const attributes = normalizeAttributeIds(input);
  const variants = normalizeVariantIds({
    variants: withComputedVariantSlugs(materializedVariants),
  });

  let product;

  try {
    product = await createProduct({
      ...input,
      slug: buildFamilySlug(input.name),
      tags: serializeOwnedTagNames(input.tagNames),
      attributes,
      variants,
    });
  } catch (error) {
    if (isGlobalProductProjectionConflict(error)) {
      throw new ProductServiceError(
        "Le slug ou le SKU d'une variante entre en conflit avec un autre produit.",
        400,
      );
    }

    throw error;
  }

  await writeProductAuditLogSafely({
    actorUserId: session.id,
    actionType: "CREATE",
    entityId: String(product.id),
    targetLabel: product.name,
    summary: "Création d'une nouvelle famille produit",
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
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const before = await findProductById(productId);
  if (!before) {
    throw new ProductServiceError("Produit introuvable.", 404);
  }

  const materializedVariants = materializeVariantDefaults({ variants: input.variants });
  assertValidDefaultVariant(materializedVariants[0]);
  await assertUniqueProductInput(input, { excludeProductId: productId });
  await assertValidProductRelations(input, {
    currentBrandId: before.brand != null ? Number(before.brand.id) : null,
  });
  await assertValidProductMedia({ ...input, variants: materializedVariants });
  assertValidProductAttributes(
    { ...input, variants: materializedVariants },
    {
      allowedAttributeIds: before.attributeValues.map((attributeLink) =>
        Number(attributeLink.attribute.id),
      ),
    },
  );
  await assertValidProductVariants(
    { variants: materializedVariants },
    {
      allowedVariantIds: before.variants.map((variant) => Number(variant.id)),
    },
  );

  await resolveOrCreateTagsByNames(input.tagNames);
  const attributes = normalizeAttributeIds(input);
  const variants = normalizeVariantIds({
    variants: withComputedVariantSlugs(materializedVariants),
  });

  let product;

  try {
    product = await updateProduct(productId, {
      ...input,
      slug: buildFamilySlug(input.name),
      tags: serializeOwnedTagNames(input.tagNames),
      attributes,
      variants,
    });
  } catch (error) {
    if (isGlobalProductProjectionConflict(error)) {
      throw new ProductServiceError(
        "Le slug ou le SKU d'une variante entre en conflit avec un autre produit.",
        400,
      );
    }

    if (isVariantReferencedByPack(error)) {
      throw new ProductServiceError(
        "Impossible de modifier cette famille car une ou plusieurs variantes sont utilisees dans un pack.",
        400,
      );
    }

    throw error;
  }

  await writeProductAuditLogSafely({
    actorUserId: session.id,
    actionType: "UPDATE",
    entityId: String(product.id),
    targetLabel: product.name,
    summary: "Mise à jour d'une famille produit",
    beforeSnapshotJson: toProductAuditSnapshot(before),
    afterSnapshotJson: toProductAuditSnapshot(product),
  });

  return mapProductToDetailDto(product);
}

export async function deleteProductService(session: StaffSession, productId: number) {
  if (!canManageProducts(session)) {
    throw new ProductServiceError("Accès refusé.", 403);
  }

  const before = await findProductById(productId);
  if (!before) {
    throw new ProductServiceError("Produit introuvable.", 404);
  }

  let deleted;

  try {
    deleted = await deleteProduct(productId);
  } catch (error) {
    if (isVariantReferencedByPack(error)) {
      throw new ProductServiceError(
        "Impossible de supprimer cette famille car une ou plusieurs variantes sont utilisees dans un pack.",
        400,
      );
    }

    throw error;
  }

  await writeProductAuditLogSafely({
    actorUserId: session.id,
    actionType: "DELETE",
    entityId: String(deleted.id),
    targetLabel: deleted.name,
    summary: "Suppression d'une famille produit",
    beforeSnapshotJson: toProductAuditSnapshot(before),
  });
}

