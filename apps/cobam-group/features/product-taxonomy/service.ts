import { ProductTypeAttributeInputType, StockUnit, type Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import {
  canAccessProductAttributes,
  canAccessProductColors,
  canAccessProductFinishes,
  canAccessProductTemplates,
  canManageProductAttributes,
  canManageProductColors,
  canManageProductFinishes,
  canManageProductTemplates,
} from "./access";
import type {
  ProductAttributeDefinitionDto,
  ProductAttributeDefinitionInput,
  ProductColorDto,
  ProductColorInput,
  ProductFinishDto,
  ProductFinishInput,
  ProductTaxonomyAttributeDto,
  ProductTaxonomyAttributeGroupDto,
  ProductTaxonomyAttributeGroupInput,
  ProductTaxonomyAttributeInput,
  ProductTaxonomyEntity,
  ProductTaxonomyGroupDto,
  ProductTaxonomyGroupInput,
  ProductTaxonomyTypeDto,
  ProductTaxonomyTypeInput,
  ProductTypesAdminDto,
} from "./types";
import type { ProductMediaDto } from "@/features/products/types";

export class ProductTaxonomyServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const STAFF_MEDIA_SELECT = {
  id: true,
  kind: true,
  title: true,
  originalFilename: true,
  mimeType: true,
  altText: true,
  widthPx: true,
  heightPx: true,
  durationSeconds: true,
  sizeBytes: true,
} satisfies Prisma.MediaSelect;

function buildMediaUrl(mediaId: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function mapMedia(
  media: Prisma.MediaGetPayload<{ select: typeof STAFF_MEDIA_SELECT }> | null,
): ProductMediaDto | null {
  if (!media) {
    return null;
  }

  return {
    id: Number(media.id),
    role: "GALLERY",
    kind: media.kind,
    title: media.title,
    originalFilename: media.originalFilename,
    mimeType: media.mimeType,
    altText: media.altText,
    widthPx: media.widthPx,
    heightPx: media.heightPx,
    durationSeconds: media.durationSeconds?.toString() ?? null,
    sizeBytes: media.sizeBytes?.toString() ?? null,
    url: buildMediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? buildMediaUrl(media.id, "thumbnail") : null,
  };
}

function assertAccess(allowed: boolean) {
  if (!allowed) {
    throw new ProductTaxonomyServiceError("Accès refusé.", 403);
  }
}

function assertCanReadProductTemplates(session: StaffSession) {
  assertAccess(canAccessProductTemplates(session));
}

function assertCanManageProductTemplates(session: StaffSession) {
  assertAccess(canManageProductTemplates(session));
}

function assertCanReadProductAttributes(session: StaffSession) {
  assertAccess(canAccessProductAttributes(session));
}

function assertCanManageProductAttributes(session: StaffSession) {
  assertAccess(canManageProductAttributes(session));
}

function assertCanReadProductColors(session: StaffSession) {
  assertAccess(canAccessProductColors(session));
}

function assertCanManageProductColors(session: StaffSession) {
  assertAccess(canManageProductColors(session));
}

function assertCanReadProductFinishes(session: StaffSession) {
  assertAccess(canAccessProductFinishes(session));
}

function assertCanManageProductFinishes(session: StaffSession) {
  assertAccess(canManageProductFinishes(session));
}

async function assertFinishImageMedia(mediaId: number | null) {
  if (mediaId == null) {
    return;
  }

  const media = await prisma.media.findFirst({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
    },
    select: {
      kind: true,
    },
  });

  if (!media || media.kind !== "IMAGE") {
    throw new ProductTaxonomyServiceError("L'image média de finition est invalide.");
  }
}

async function assertProductTypeMediaImage(mediaId: number | null) {
  if (mediaId == null) {
    return;
  }

  const media = await prisma.media.findFirst({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
    },
    select: {
      kind: true,
    },
  });

  if (!media || media.kind !== "IMAGE") {
    throw new ProductTaxonomyServiceError("L'image publique du modele produit est invalide.");
  }
}

function requiredString(value: unknown, fieldName: string) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new ProductTaxonomyServiceError(`${fieldName} est requis.`);
  }

  return text;
}

function optionalString(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function requiredLimitedString(value: unknown, fieldName: string, maxLength: number) {
  const text = requiredString(value, fieldName);

  if (text.length > maxLength) {
    throw new ProductTaxonomyServiceError(
      `${fieldName} doit contenir ${maxLength} caracteres ou moins.`,
    );
  }

  return text;
}

function optionalLimitedString(value: unknown, fieldName: string, maxLength: number) {
  const text = optionalString(value);

  if (text != null && text.length > maxLength) {
    throw new ProductTaxonomyServiceError(
      `${fieldName} doit contenir ${maxLength} caracteres ou moins.`,
    );
  }

  return text;
}

function integerValue(value: unknown, fieldName: string, fallback = 0) {
  if (value == null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new ProductTaxonomyServiceError(`${fieldName} est invalide.`);
  }
  return parsed;
}

function nullableNonNegativeIntegerValue(value: unknown, fieldName: string) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ProductTaxonomyServiceError(`${fieldName} est invalide.`);
  }
  return parsed;
}

function positiveIntegerValue(value: unknown, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductTaxonomyServiceError(`${fieldName} est invalide.`);
  }
  return parsed;
}

function nullablePositiveIntegerValue(value: unknown, fieldName: string) {
  if (value == null || value === "") {
    return null;
  }

  return positiveIntegerValue(value, fieldName);
}

function positiveIntegerArrayValue(value: unknown, fieldName: string) {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ProductTaxonomyServiceError(`${fieldName} est invalide.`);
  }

  const ids = value.map((entry) => positiveIntegerValue(entry, fieldName));
  return [...new Set(ids)];
}

function booleanValue(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value == null || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

function stringArrayValue(value: unknown) {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ProductTaxonomyServiceError("Les options sont invalides.");
  }

  const items = value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);

  return [...new Set(items)];
}

function decimalStringValue(value: unknown, fieldName: string) {
  if (value == null || value === "") {
    return null;
  }

  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ProductTaxonomyServiceError(`${fieldName} est invalide.`);
  }

  return normalized;
}

function stockUnitValue(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "string" && Object.values(StockUnit).includes(value as StockUnit)) {
    return value as StockUnit;
  }

  throw new ProductTaxonomyServiceError("L'Unité de stock est invalide.");
}

function inputTypeValue(value: unknown) {
  if (
    typeof value === "string" &&
    Object.values(ProductTypeAttributeInputType).includes(value as ProductTypeAttributeInputType)
  ) {
    return value as ProductTypeAttributeInputType;
  }

  return ProductTypeAttributeInputType.TEXT;
}

type SpecialTemplateAttributeType = Extract<ProductTypeAttributeInputType, "COLOR" | "FINISH">;

export function parseProductTaxonomyEntity(value: unknown): ProductTaxonomyEntity {
  if (
    value === "group" ||
    value === "productType" ||
    value === "attributeGroup" ||
    value === "attribute"
  ) {
    return value;
  }

  throw new ProductTaxonomyServiceError("Type de ressource invalide.");
}

export function parseProductTaxonomyId(value: unknown) {
  return positiveIntegerValue(value, "Identifiant");
}

export function parseProductTaxonomyOrder(value: unknown) {
  if (!Array.isArray(value)) {
    throw new ProductTaxonomyServiceError("L'ordre est invalide.");
  }

  const ids = value.map((entry) => positiveIntegerValue(entry, "L'ordre"));
  if (new Set(ids).size !== ids.length) {
    throw new ProductTaxonomyServiceError("L'ordre contient des doublons.");
  }

  return ids;
}

export function parseGroupInput(value: unknown): ProductTaxonomyGroupInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    name: requiredString(record.name, "Le nom"),
    slug: requiredString(record.slug, "Le slug"),
    sortOrder: integerValue(record.sortOrder, "L'ordre"),
  };
}

export function parseProductTypeInput(value: unknown): ProductTaxonomyTypeInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    groupId: nullablePositiveIntegerValue(record.groupId, "Le groupe"),
    name: requiredString(record.name, "Le nom"),
    displayName: requiredLimitedString(record.displayName ?? record.name, "Le nom affiche", 255),
    slug: requiredString(record.slug, "Le slug"),
    hint: optionalString(record.hint),
    description: optionalString(record.description),
    titleSeo: optionalLimitedString(record.titleSeo, "Le titre SEO", 60),
    descriptionSeo: optionalLimitedString(record.descriptionSeo, "La description SEO", 160),
    mediaImageId: nullablePositiveIntegerValue(record.mediaImageId, "L'image publique"),
    sortOrder: integerValue(record.sortOrder, "L'ordre"),
    hasColor: booleanValue(record.hasColor),
    hasFinish: booleanValue(record.hasFinish),
    presetTags: optionalString(record.presetTags) ?? "",
    presetSubcategoryIds: positiveIntegerArrayValue(
      record.presetSubcategoryIds,
      "Les sous-catégories",
    ),
    presetStockUnit: stockUnitValue(record.presetStockUnit),
    presetVatRate: decimalStringValue(record.presetVatRate, "La TVA"),
    presetGuaranteeMonths: nullableNonNegativeIntegerValue(
      record.presetGuaranteeMonths,
      "La garantie",
    ),
  };
}

export function parseAttributeGroupInput(value: unknown): ProductTaxonomyAttributeGroupInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    productTypeId: positiveIntegerValue(record.productTypeId, "Le modèle produit"),
    name: requiredString(record.name, "Le nom"),
    slug: requiredString(record.slug, "Le slug"),
    sortOrder: integerValue(record.sortOrder, "L'ordre"),
  };
}

export function parseAttributeInput(value: unknown): ProductTaxonomyAttributeInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    productTypeId: positiveIntegerValue(record.productTypeId, "Le modèle produit"),
    attributeGroupId: nullablePositiveIntegerValue(
      record.attributeGroupId,
      "Le groupe d'attributs",
    ),
    attributeDefinitionId: positiveIntegerValue(
      record.attributeDefinitionId ?? record.attributeDefId,
      "La definition d'attribut",
    ),
    label: optionalString(record.label) ?? "",
    isRequired: booleanValue(record.isRequired),
    isFilterable: booleanValue(record.isFilterable),
    sortOrder: integerValue(record.sortOrder, "L'ordre"),
  };
}

export function parseColorInput(value: unknown): ProductColorInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    key: requiredString(record.key, "La clé"),
    label: requiredString(record.label, "Le libellé"),
    value: requiredString(record.value, "La valeur"),
  };
}

export function parseFinishInput(value: unknown): ProductFinishInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    key: requiredString(record.key, "La clé"),
    label: requiredString(record.label, "Le libellé"),
    color: optionalString(record.color),
    imageMediaId: nullablePositiveIntegerValue(record.imageMediaId, "L'image média"),
  };
}

export function parseAttributeDefinitionInput(value: unknown): ProductAttributeDefinitionInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const inputType = inputTypeValue(record.inputType);
  const selectOptions = inputType === "SELECT" ? stringArrayValue(record.selectOptions) : [];

  return {
    key: requiredString(record.key, "La clé"),
    label: requiredString(record.label, "Le libellé"),
    unit: optionalString(record.unit),
    inputType,
    selectOptions,
  };
}

function mapGroup(record: {
  id: bigint;
  name: string;
  slug: string;
  sortOrder: number;
}): ProductTaxonomyGroupDto {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    sortOrder: record.sortOrder,
  };
}

function mapAttributeGroup(record: {
  id: bigint;
  productTypeId: bigint | null;
  name: string;
  slug: string;
  sortOrder: number;
}): ProductTaxonomyAttributeGroupDto {
  return {
    id: Number(record.id),
    productTypeId: record.productTypeId == null ? null : Number(record.productTypeId),
    name: record.name,
    slug: record.slug,
    sortOrder: record.sortOrder,
  };
}

function mapAttribute(record: {
  id: bigint;
  productTypeId: bigint;
  attributeGroupId: bigint | null;
  attributeDefinitionId: bigint;
  label: string;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  attributeGroup: { name: string } | null;
  attributeDefinition: {
    key: string;
    label: string;
    unit: string | null;
    inputType: ProductTypeAttributeInputType;
    selectOptions: string[];
  };
}): ProductTaxonomyAttributeDto {
  const definitionLabel = record.attributeDefinition.label;

  return {
    id: Number(record.id),
    productTypeId: Number(record.productTypeId),
    attributeGroupId: record.attributeGroupId == null ? null : Number(record.attributeGroupId),
    attributeGroupName: record.attributeGroup?.name ?? null,
    attributeDefinitionId: Number(record.attributeDefinitionId),
    definitionLabel,
    name: record.attributeDefinition.key,
    label: record.label || definitionLabel,
    labelOverride: record.label,
    unit: record.attributeDefinition.unit,
    inputType: record.attributeDefinition.inputType,
    selectOptions: record.attributeDefinition.selectOptions,
    isRequired: record.isRequired,
    isFilterable: record.isFilterable,
    sortOrder: record.sortOrder,
  };
}

function mapAttributeDefinition(record: {
  id: bigint;
  key: string;
  label: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  selectOptions: string[];
}): ProductAttributeDefinitionDto {
  return {
    id: Number(record.id),
    key: record.key,
    label: record.label,
    unit: record.unit,
    inputType: record.inputType,
    selectOptions: record.selectOptions,
  };
}

function mapProductType(record: {
  id: bigint;
  groupId: bigint | null;
  name: string;
  displayName: string;
  slug: string;
  hint: string | null;
  description: string | null;
  titleSeo: string | null;
  descriptionSeo: string | null;
  mediaImageId: bigint | null;
  mediaImage: Prisma.MediaGetPayload<{ select: typeof STAFF_MEDIA_SELECT }> | null;
  sortOrder: number;
  hasColor: boolean;
  hasFinish: boolean;
  presetTags: string;
  presetStockUnit: StockUnit | null;
  presetVatRate: { toString(): string } | null;
  presetGuaranteeMonths: number | null;
  group: { name: string } | null;
  subcategoryPresets: Array<{ subcategoryId: bigint }>;
  attributeGroups: Array<Parameters<typeof mapAttributeGroup>[0]>;
  attributes: Array<Parameters<typeof mapAttribute>[0]>;
}): ProductTaxonomyTypeDto {
  return {
    id: Number(record.id),
    groupId: record.groupId == null ? null : Number(record.groupId),
    groupName: record.group?.name ?? null,
    name: record.name,
    displayName: record.displayName,
    slug: record.slug,
    hint: record.hint,
    description: record.description,
    titleSeo: record.titleSeo,
    descriptionSeo: record.descriptionSeo,
    mediaImageId: record.mediaImageId == null ? null : Number(record.mediaImageId),
    mediaImage: mapMedia(record.mediaImage),
    sortOrder: record.sortOrder,
    hasColor: record.hasColor,
    hasFinish: record.hasFinish,
    presetTags: record.presetTags,
    presetSubcategoryIds: record.subcategoryPresets.map((preset) => Number(preset.subcategoryId)),
    presetStockUnit: record.presetStockUnit,
    presetVatRate: record.presetVatRate?.toString() ?? null,
    presetGuaranteeMonths: record.presetGuaranteeMonths,
    attributeGroups: record.attributeGroups.map(mapAttributeGroup),
    attributes: record.attributes.map(mapAttribute),
  };
}

function mapColor(record: {
  id: bigint;
  key: string;
  label: string;
  value: string;
}): ProductColorDto {
  return {
    id: Number(record.id),
    key: record.key,
    label: record.label,
    value: record.value,
  };
}

function mapFinish(record: {
  id: bigint;
  key: string;
  label: string;
  color: string | null;
  imageMediaId: bigint | null;
}): ProductFinishDto {
  return {
    id: Number(record.id),
    key: record.key,
    label: record.label,
    color: record.color,
    imageMediaId: record.imageMediaId == null ? null : Number(record.imageMediaId),
  };
}

const PROTECTED_ATTRIBUTE_DEFINITION_INPUT_TYPES = {
  color: ProductTypeAttributeInputType.COLOR,
  finish: ProductTypeAttributeInputType.FINISH,
} as const;

function normalizeAttributeDefinitionKey(value: string) {
  return value.trim().toLowerCase();
}

function getProtectedAttributeDefinitionInputType(key: string) {
  return PROTECTED_ATTRIBUTE_DEFINITION_INPUT_TYPES[
    normalizeAttributeDefinitionKey(key) as keyof typeof PROTECTED_ATTRIBUTE_DEFINITION_INPUT_TYPES
  ];
}

function isProtectedAttributeDefinitionKey(key: string) {
  return getProtectedAttributeDefinitionInputType(key) != null;
}

async function assertProtectedAttributeDefinitionRules(
  input: ProductAttributeDefinitionInput,
  id: number | null = null,
) {
  const protectedInputType = getProtectedAttributeDefinitionInputType(input.key);
  if (protectedInputType != null && input.inputType !== protectedInputType) {
    throw new ProductTaxonomyServiceError(
      "Les attributs Couleur et Finition doivent conserver leur type.",
    );
  }

  if (id == null) {
    return;
  }

  const existing = await prisma.productAttributeDefinition.findUnique({
    where: { id: BigInt(id) },
    select: { key: true },
  });

  if (!existing || !isProtectedAttributeDefinitionKey(existing.key)) {
    return;
  }

  const existingProtectedInputType = getProtectedAttributeDefinitionInputType(existing.key);
  if (
    normalizeAttributeDefinitionKey(input.key) !== normalizeAttributeDefinitionKey(existing.key) ||
    input.inputType !== existingProtectedInputType
  ) {
    throw new ProductTaxonomyServiceError(
      "Les attributs Couleur et Finition doivent conserver leur cle et leur type.",
    );
  }
}

export async function listProductTypesAdminService(
  session: StaffSession,
): Promise<ProductTypesAdminDto> {
  assertCanReadProductTemplates(session);

  const [groups, productTypes, attributeDefinitions, productSubcategories] = await Promise.all([
    prisma.productTypeGroup.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.productType.findMany({
      orderBy: [
        { group: { sortOrder: "asc" } },
        { group: { name: "asc" } },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      include: {
        group: {
          select: {
            name: true,
          },
        },
        mediaImage: {
          select: STAFF_MEDIA_SELECT,
        },
        subcategoryPresets: {
          select: {
            subcategoryId: true,
          },
        },
        attributeGroups: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
        attributes: {
          orderBy: [
            { attributeGroup: { sortOrder: "asc" } },
            { sortOrder: "asc" },
            { attributeDefinition: { label: "asc" } },
          ],
          include: {
            attributeGroup: {
              select: {
                name: true,
              },
            },
            attributeDefinition: true,
          },
        },
      },
    }),
    prisma.productAttributeDefinition.findMany({
      orderBy: [{ label: "asc" }, { key: "asc" }],
    }),
    prisma.productSubcategory.findMany({
      where: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        categoryId: true,
        name: true,
        slug: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  return {
    groups: groups.map(mapGroup),
    productTypes: productTypes.map(mapProductType),
    attributeDefinitions: attributeDefinitions.map(mapAttributeDefinition),
    productSubcategories: productSubcategories.map((subcategory) => ({
      id: Number(subcategory.id),
      categoryId: Number(subcategory.categoryId),
      categoryName: subcategory.category.name,
      categorySlug: subcategory.category.slug,
      name: subcategory.name,
      slug: subcategory.slug,
    })),
  };
}

export async function createTaxonomyGroupService(
  session: StaffSession,
  input: ProductTaxonomyGroupInput,
) {
  assertCanManageProductTemplates(session);

  return mapGroup(
    await prisma.productTypeGroup.create({
      data: input,
    }),
  );
}

export async function updateTaxonomyGroupService(
  session: StaffSession,
  id: number,
  input: ProductTaxonomyGroupInput,
) {
  assertCanManageProductTemplates(session);

  return mapGroup(
    await prisma.productTypeGroup.update({
      where: { id: BigInt(id) },
      data: input,
    }),
  );
}

export async function deleteTaxonomyGroupService(session: StaffSession, id: number) {
  assertCanManageProductTemplates(session);
  await prisma.productTypeGroup.delete({ where: { id: BigInt(id) } });
}

const productTypeInclude = {
  group: { select: { name: true } },
  mediaImage: { select: STAFF_MEDIA_SELECT },
  subcategoryPresets: { select: { subcategoryId: true } },
  attributeGroups: true,
  attributes: {
    include: {
      attributeGroup: { select: { name: true } },
      attributeDefinition: true,
    },
  },
} satisfies Prisma.ProductTypeInclude;

function getProductTypeData(input: ProductTaxonomyTypeInput) {
  return {
    groupId: input.groupId == null ? null : BigInt(input.groupId),
    name: input.name,
    displayName: input.displayName,
    slug: input.slug,
    hint: input.hint,
    description: input.description,
    titleSeo: input.titleSeo,
    descriptionSeo: input.descriptionSeo,
    mediaImageId: input.mediaImageId == null ? null : BigInt(input.mediaImageId),
    sortOrder: input.sortOrder ?? 0,
    hasColor: input.hasColor ?? false,
    hasFinish: input.hasFinish ?? false,
    presetTags: input.presetTags ?? "",
    presetStockUnit: input.presetStockUnit ?? null,
    presetVatRate: input.presetVatRate ?? null,
    presetGuaranteeMonths: input.presetGuaranteeMonths ?? null,
  };
}

async function syncProductTypeSubcategoryPresets(
  tx: Prisma.TransactionClient,
  productTypeId: bigint,
  subcategoryIds: number[] = [],
) {
  await tx.productTypeSubcategoryPreset.deleteMany({
    where: { productTypeId },
  });

  if (subcategoryIds.length === 0) {
    return;
  }

  await tx.productTypeSubcategoryPreset.createMany({
    data: subcategoryIds.map((subcategoryId) => ({
      productTypeId,
      subcategoryId: BigInt(subcategoryId),
    })),
    skipDuplicates: true,
  });
}

const SPECIAL_TEMPLATE_ATTRIBUTE_DEFINITIONS: Record<
  SpecialTemplateAttributeType,
  { key: string; label: string }
> = {
  [ProductTypeAttributeInputType.COLOR]: { key: "color", label: "Couleur" },
  [ProductTypeAttributeInputType.FINISH]: { key: "finish", label: "Finition" },
};

async function ensureSpecialAttributeDefinition(
  tx: Prisma.TransactionClient,
  inputType: SpecialTemplateAttributeType,
) {
  const definition = SPECIAL_TEMPLATE_ATTRIBUTE_DEFINITIONS[inputType];

  return tx.productAttributeDefinition.upsert({
    where: { key: definition.key },
    update: { inputType },
    create: {
      key: definition.key,
      label: definition.label,
      inputType,
    },
    select: { id: true },
  });
}

async function syncProductTypeSpecialAttributes(
  tx: Prisma.TransactionClient,
  productTypeId: bigint,
  input: Pick<ProductTaxonomyTypeInput, "hasColor" | "hasFinish">,
) {
  const desiredAttributes: Array<{
    inputType: SpecialTemplateAttributeType;
    enabled: boolean;
  }> = [
    {
      inputType: ProductTypeAttributeInputType.COLOR,
      enabled: input.hasColor ?? false,
    },
    {
      inputType: ProductTypeAttributeInputType.FINISH,
      enabled: input.hasFinish ?? false,
    },
  ];

  let maxSortOrder =
    (
      await tx.productTypeAttribute.aggregate({
        where: { productTypeId },
        _max: { sortOrder: true },
      })
    )._max.sortOrder ?? -1;

  for (const desiredAttribute of desiredAttributes) {
    const definition = await ensureSpecialAttributeDefinition(tx, desiredAttribute.inputType);

    if (!desiredAttribute.enabled) {
      await tx.productTypeAttribute.deleteMany({
        where: {
          productTypeId,
          attributeDefinitionId: definition.id,
        },
      });
      continue;
    }

    await tx.productTypeAttribute.upsert({
      where: {
        productTypeId_attributeDefinitionId: {
          productTypeId,
          attributeDefinitionId: definition.id,
        },
      },
      update: {},
      create: {
        productTypeId,
        attributeDefinitionId: definition.id,
        label: "",
        isRequired: false,
        isFilterable: true,
        sortOrder: ++maxSortOrder,
      },
    });
  }
}

export async function createTaxonomyProductTypeService(
  session: StaffSession,
  input: ProductTaxonomyTypeInput,
) {
  assertCanManageProductTemplates(session);
  await assertProductTypeMediaImage(input.mediaImageId);

  const productType = await prisma.$transaction(async (tx) => {
    const created = await tx.productType.create({
      data: getProductTypeData(input),
      select: { id: true },
    });

    await syncProductTypeSubcategoryPresets(tx, created.id, input.presetSubcategoryIds);
    await syncProductTypeSpecialAttributes(tx, created.id, input);

    return tx.productType.findUniqueOrThrow({
      where: { id: created.id },
      include: productTypeInclude,
    });
  });

  return mapProductType(productType);
}

export async function updateTaxonomyProductTypeService(
  session: StaffSession,
  id: number,
  input: ProductTaxonomyTypeInput,
) {
  assertCanManageProductTemplates(session);
  await assertProductTypeMediaImage(input.mediaImageId);

  const productType = await prisma.$transaction(async (tx) => {
    await tx.productType.update({
      where: { id: BigInt(id) },
      data: getProductTypeData(input),
    });

    await syncProductTypeSubcategoryPresets(tx, BigInt(id), input.presetSubcategoryIds);
    await syncProductTypeSpecialAttributes(tx, BigInt(id), input);

    return tx.productType.findUniqueOrThrow({
      where: { id: BigInt(id) },
      include: productTypeInclude,
    });
  });

  return mapProductType(productType);
}

export async function deleteTaxonomyProductTypeService(session: StaffSession, id: number) {
  assertCanManageProductTemplates(session);
  await prisma.productType.delete({ where: { id: BigInt(id) } });
}

export async function reorderTaxonomyGroupsService(
  session: StaffSession,
  orderedIds: number[],
): Promise<ProductTypesAdminDto> {
  assertCanManageProductTemplates(session);

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.productTypeGroup.update({
        where: { id: BigInt(id) },
        data: { sortOrder: index },
      }),
    ),
  );

  return listProductTypesAdminService(session);
}

export async function reorderTaxonomyProductTypesService(
  session: StaffSession,
  orderedIds: number[],
): Promise<ProductTypesAdminDto> {
  assertCanManageProductTemplates(session);

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.productType.update({
        where: { id: BigInt(id) },
        data: { sortOrder: index },
      }),
    ),
  );

  return listProductTypesAdminService(session);
}

export async function createTaxonomyAttributeGroupService(
  session: StaffSession,
  input: ProductTaxonomyAttributeGroupInput,
) {
  assertCanManageProductTemplates(session);

  return mapAttributeGroup(
    await prisma.productAttributeGroup.create({
      data: {
        ...input,
        productTypeId: BigInt(input.productTypeId),
      },
    }),
  );
}

export async function updateTaxonomyAttributeGroupService(
  session: StaffSession,
  id: number,
  input: ProductTaxonomyAttributeGroupInput,
) {
  assertCanManageProductTemplates(session);

  return mapAttributeGroup(
    await prisma.productAttributeGroup.update({
      where: { id: BigInt(id) },
      data: {
        ...input,
        productTypeId: BigInt(input.productTypeId),
      },
    }),
  );
}

export async function deleteTaxonomyAttributeGroupService(session: StaffSession, id: number) {
  assertCanManageProductTemplates(session);
  await prisma.productAttributeGroup.delete({ where: { id: BigInt(id) } });
}

function managedSpecialAttributeMessage(inputType: ProductTypeAttributeInputType) {
  return inputType === ProductTypeAttributeInputType.COLOR
    ? 'La couleur est geree par l\'option "A une couleur" du modele.'
    : 'La finition est geree par l\'option "A une finition" du modele.';
}

async function assertCanCreateTemplateAttribute(input: ProductTaxonomyAttributeInput) {
  const definition = await prisma.productAttributeDefinition.findUnique({
    where: { id: BigInt(input.attributeDefinitionId) },
    select: { inputType: true, key: true },
  });

  if (definition && isProtectedAttributeDefinitionKey(definition.key)) {
    throw new ProductTaxonomyServiceError(managedSpecialAttributeMessage(definition.inputType));
  }
}

async function assertCanUpdateTemplateAttribute(id: number, input: ProductTaxonomyAttributeInput) {
  const [existingAttribute, nextDefinition] = await Promise.all([
    prisma.productTypeAttribute.findUnique({
      where: { id: BigInt(id) },
      select: {
        attributeDefinitionId: true,
        attributeDefinition: {
          select: { inputType: true, key: true },
        },
      },
    }),
    prisma.productAttributeDefinition.findUnique({
      where: { id: BigInt(input.attributeDefinitionId) },
      select: { inputType: true, key: true },
    }),
  ]);

  if (!existingAttribute || !nextDefinition) {
    return;
  }

  const existingDefinition = existingAttribute.attributeDefinition;
  const nextDefinitionKey = nextDefinition.key;

  if (
    isProtectedAttributeDefinitionKey(existingDefinition.key) &&
    existingAttribute.attributeDefinitionId !== BigInt(input.attributeDefinitionId)
  ) {
    throw new ProductTaxonomyServiceError(
      managedSpecialAttributeMessage(existingDefinition.inputType),
    );
  }

  if (
    isProtectedAttributeDefinitionKey(nextDefinitionKey) &&
    existingAttribute.attributeDefinitionId !== BigInt(input.attributeDefinitionId)
  ) {
    throw new ProductTaxonomyServiceError(managedSpecialAttributeMessage(nextDefinition.inputType));
  }
}

async function assertCanDeleteTemplateAttribute(id: number) {
  const attribute = await prisma.productTypeAttribute.findUnique({
    where: { id: BigInt(id) },
    select: {
      attributeDefinition: {
        select: { inputType: true, key: true },
      },
      productType: {
        select: {
          hasColor: true,
          hasFinish: true,
        },
      },
    },
  });

  if (!attribute) {
    return;
  }

  const inputType = attribute.attributeDefinition.inputType;
  const key = normalizeAttributeDefinitionKey(attribute.attributeDefinition.key);
  if (
    (key === "color" && attribute.productType.hasColor) ||
    (key === "finish" && attribute.productType.hasFinish)
  ) {
    throw new ProductTaxonomyServiceError(managedSpecialAttributeMessage(inputType));
  }
}

export async function createTaxonomyAttributeService(
  session: StaffSession,
  input: ProductTaxonomyAttributeInput,
) {
  assertCanManageProductTemplates(session);
  await assertCanCreateTemplateAttribute(input);

  return mapAttribute(
    await prisma.productTypeAttribute.create({
      data: {
        productTypeId: BigInt(input.productTypeId),
        attributeGroupId: input.attributeGroupId == null ? null : BigInt(input.attributeGroupId),
        attributeDefinitionId: BigInt(input.attributeDefinitionId),
        label: input.label,
        isRequired: input.isRequired,
        isFilterable: input.isFilterable,
        sortOrder: input.sortOrder,
      },
      include: {
        attributeGroup: {
          select: {
            name: true,
          },
        },
        attributeDefinition: true,
      },
    }),
  );
}

export async function updateTaxonomyAttributeService(
  session: StaffSession,
  id: number,
  input: ProductTaxonomyAttributeInput,
) {
  assertCanManageProductTemplates(session);
  await assertCanUpdateTemplateAttribute(id, input);

  return mapAttribute(
    await prisma.productTypeAttribute.update({
      where: { id: BigInt(id) },
      data: {
        productTypeId: BigInt(input.productTypeId),
        attributeGroupId: input.attributeGroupId == null ? null : BigInt(input.attributeGroupId),
        attributeDefinitionId: BigInt(input.attributeDefinitionId),
        label: input.label,
        isRequired: input.isRequired,
        isFilterable: input.isFilterable,
        sortOrder: input.sortOrder,
      },
      include: {
        attributeGroup: {
          select: {
            name: true,
          },
        },
        attributeDefinition: true,
      },
    }),
  );
}

export async function deleteTaxonomyAttributeService(session: StaffSession, id: number) {
  assertCanManageProductTemplates(session);
  await assertCanDeleteTemplateAttribute(id);
  await prisma.productTypeAttribute.delete({ where: { id: BigInt(id) } });
}

export async function listProductAttributeDefinitionsService(session: StaffSession) {
  assertCanReadProductAttributes(session);

  return (
    await prisma.productAttributeDefinition.findMany({
      orderBy: [{ label: "asc" }, { key: "asc" }],
    })
  ).map(mapAttributeDefinition);
}

export async function createProductAttributeDefinitionService(
  session: StaffSession,
  input: ProductAttributeDefinitionInput,
) {
  assertCanManageProductAttributes(session);
  await assertProtectedAttributeDefinitionRules(input);

  return mapAttributeDefinition(
    await prisma.productAttributeDefinition.create({
      data: input,
    }),
  );
}

export async function updateProductAttributeDefinitionService(
  session: StaffSession,
  id: number,
  input: ProductAttributeDefinitionInput,
) {
  assertCanManageProductAttributes(session);
  await assertProtectedAttributeDefinitionRules(input, id);

  return mapAttributeDefinition(
    await prisma.productAttributeDefinition.update({
      where: { id: BigInt(id) },
      data: input,
    }),
  );
}

export async function deleteProductAttributeDefinitionService(session: StaffSession, id: number) {
  assertCanManageProductAttributes(session);
  const attributeDefinition = await prisma.productAttributeDefinition.findUnique({
    where: { id: BigInt(id) },
    select: { key: true },
  });

  if (attributeDefinition && isProtectedAttributeDefinitionKey(attributeDefinition.key)) {
    throw new ProductTaxonomyServiceError(
      "Les attributs Couleur et Finition ne peuvent pas etre supprimes.",
    );
  }

  await prisma.productAttributeDefinition.delete({ where: { id: BigInt(id) } });
}

export async function listProductColorsService(session: StaffSession) {
  assertCanReadProductColors(session);

  return (
    await prisma.productColor.findMany({
      orderBy: [{ label: "asc" }],
    })
  ).map(mapColor);
}

export async function createProductColorService(session: StaffSession, input: ProductColorInput) {
  assertCanManageProductColors(session);

  return mapColor(await prisma.productColor.create({ data: input }));
}

export async function updateProductColorService(
  session: StaffSession,
  id: number,
  input: ProductColorInput,
) {
  assertCanManageProductColors(session);

  return mapColor(
    await prisma.productColor.update({
      where: { id: BigInt(id) },
      data: input,
    }),
  );
}

export async function deleteProductColorService(session: StaffSession, id: number) {
  assertCanManageProductColors(session);
  await prisma.productColor.delete({ where: { id: BigInt(id) } });
}

export async function listProductFinishesService(session: StaffSession) {
  assertCanReadProductFinishes(session);

  return (
    await prisma.productFinish.findMany({
      orderBy: [{ label: "asc" }],
    })
  ).map(mapFinish);
}

export async function createProductFinishService(session: StaffSession, input: ProductFinishInput) {
  assertCanManageProductFinishes(session);
  await assertFinishImageMedia(input.imageMediaId);

  return mapFinish(
    await prisma.productFinish.create({
      data: {
        key: input.key,
        label: input.label,
        color: input.color,
        imageMediaId: input.imageMediaId == null ? null : BigInt(input.imageMediaId),
      },
    }),
  );
}

export async function updateProductFinishService(
  session: StaffSession,
  id: number,
  input: ProductFinishInput,
) {
  assertCanManageProductFinishes(session);
  await assertFinishImageMedia(input.imageMediaId);

  return mapFinish(
    await prisma.productFinish.update({
      where: { id: BigInt(id) },
      data: {
        key: input.key,
        label: input.label,
        color: input.color,
        imageMediaId: input.imageMediaId == null ? null : BigInt(input.imageMediaId),
      },
    }),
  );
}

export async function deleteProductFinishService(session: StaffSession, id: number) {
  assertCanManageProductFinishes(session);
  await prisma.productFinish.delete({ where: { id: BigInt(id) } });
}
