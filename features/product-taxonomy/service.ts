import { ProductTypeAttributeInputType } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { canAccessProducts, canManageProducts } from "@/features/products/access";
import { prisma } from "@/lib/server/db/prisma";
import type {
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

export class ProductTaxonomyServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function assertCanRead(session: StaffSession) {
  if (!canAccessProducts(session)) {
    throw new ProductTaxonomyServiceError("Accès refusé.", 403);
  }
}

function assertCanWrite(session: StaffSession) {
  if (!canManageProducts(session)) {
    throw new ProductTaxonomyServiceError("Accès refusé.", 403);
  }
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

function booleanValue(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value == null || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

function inputTypeValue(value: unknown) {
  if (
    typeof value === "string" &&
    Object.values(ProductTypeAttributeInputType).includes(
      value as ProductTypeAttributeInputType,
    )
  ) {
    return value as ProductTypeAttributeInputType;
  }

  return ProductTypeAttributeInputType.TEXT;
}

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

export function parseGroupInput(value: unknown): ProductTaxonomyGroupInput {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    name: requiredString(record.name, "Le nom"),
    slug: requiredString(record.slug, "Le slug"),
    sortOrder: integerValue(record.sortOrder, "L'ordre"),
    isActive: booleanValue(record.isActive, true),
  };
}

export function parseProductTypeInput(value: unknown): ProductTaxonomyTypeInput {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    groupId: nullablePositiveIntegerValue(record.groupId, "Le groupe"),
    name: requiredString(record.name, "Le nom"),
    slug: requiredString(record.slug, "Le slug"),
    description: optionalString(record.description),
    sortOrder: integerValue(record.sortOrder, "L'ordre"),
    isActive: booleanValue(record.isActive, true),
  };
}

export function parseAttributeGroupInput(
  value: unknown,
): ProductTaxonomyAttributeGroupInput {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    productTypeId: positiveIntegerValue(record.productTypeId, "Le type produit"),
    name: requiredString(record.name, "Le nom"),
    slug: requiredString(record.slug, "Le slug"),
    sortOrder: integerValue(record.sortOrder, "L'ordre"),
  };
}

export function parseAttributeInput(value: unknown): ProductTaxonomyAttributeInput {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    productTypeId: positiveIntegerValue(record.productTypeId, "Le type produit"),
    attributeGroupId: nullablePositiveIntegerValue(
      record.attributeGroupId,
      "Le groupe d'attributs",
    ),
    name: requiredString(record.name, "Le nom technique"),
    label: requiredString(record.label, "Le libellé"),
    unit: optionalString(record.unit),
    inputType: inputTypeValue(record.inputType),
    isRequired: booleanValue(record.isRequired),
    isFilterable: booleanValue(record.isFilterable),
    sortOrder: integerValue(record.sortOrder, "L'ordre"),
  };
}

export function parseColorInput(value: unknown): ProductColorInput {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    key: requiredString(record.key, "La clé"),
    label: requiredString(record.label, "Le libellé"),
    value: requiredString(record.value, "La valeur"),
  };
}

export function parseFinishInput(value: unknown): ProductFinishInput {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    key: requiredString(record.key, "La clé"),
    label: requiredString(record.label, "Le libellé"),
    color: optionalString(record.color),
    imageMediaId: nullablePositiveIntegerValue(
      record.imageMediaId,
      "L'image média",
    ),
  };
}

function mapGroup(record: {
  id: bigint;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}): ProductTaxonomyGroupDto {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    sortOrder: record.sortOrder,
    isActive: record.isActive,
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
    productTypeId:
      record.productTypeId == null ? null : Number(record.productTypeId),
    name: record.name,
    slug: record.slug,
    sortOrder: record.sortOrder,
  };
}

function mapAttribute(record: {
  id: bigint;
  productTypeId: bigint;
  attributeGroupId: bigint | null;
  name: string;
  label: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  attributeGroup: { name: string } | null;
}): ProductTaxonomyAttributeDto {
  return {
    id: Number(record.id),
    productTypeId: Number(record.productTypeId),
    attributeGroupId:
      record.attributeGroupId == null ? null : Number(record.attributeGroupId),
    attributeGroupName: record.attributeGroup?.name ?? null,
    name: record.name,
    label: record.label,
    unit: record.unit,
    inputType: record.inputType,
    isRequired: record.isRequired,
    isFilterable: record.isFilterable,
    sortOrder: record.sortOrder,
  };
}

function mapProductType(record: {
  id: bigint;
  groupId: bigint | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  group: { name: string } | null;
  attributeGroups: Array<Parameters<typeof mapAttributeGroup>[0]>;
  attributes: Array<Parameters<typeof mapAttribute>[0]>;
}): ProductTaxonomyTypeDto {
  return {
    id: Number(record.id),
    groupId: record.groupId == null ? null : Number(record.groupId),
    groupName: record.group?.name ?? null,
    name: record.name,
    slug: record.slug,
    description: record.description,
    sortOrder: record.sortOrder,
    isActive: record.isActive,
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

export async function listProductTypesAdminService(
  session: StaffSession,
): Promise<ProductTypesAdminDto> {
  assertCanRead(session);

  const [groups, productTypes] = await Promise.all([
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
        attributeGroups: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
        attributes: {
          orderBy: [
            { attributeGroup: { sortOrder: "asc" } },
            { sortOrder: "asc" },
            { name: "asc" },
          ],
          include: {
            attributeGroup: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    groups: groups.map(mapGroup),
    productTypes: productTypes.map(mapProductType),
  };
}

export async function createTaxonomyGroupService(
  session: StaffSession,
  input: ProductTaxonomyGroupInput,
) {
  assertCanWrite(session);

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
  assertCanWrite(session);

  return mapGroup(
    await prisma.productTypeGroup.update({
      where: { id: BigInt(id) },
      data: input,
    }),
  );
}

export async function deleteTaxonomyGroupService(session: StaffSession, id: number) {
  assertCanWrite(session);
  await prisma.productTypeGroup.delete({ where: { id: BigInt(id) } });
}

export async function createTaxonomyProductTypeService(
  session: StaffSession,
  input: ProductTaxonomyTypeInput,
) {
  assertCanWrite(session);

  return mapProductType(
    await prisma.productType.create({
      data: {
        ...input,
        groupId: input.groupId == null ? null : BigInt(input.groupId),
      },
      include: {
        group: { select: { name: true } },
        attributeGroups: true,
        attributes: { include: { attributeGroup: { select: { name: true } } } },
      },
    }),
  );
}

export async function updateTaxonomyProductTypeService(
  session: StaffSession,
  id: number,
  input: ProductTaxonomyTypeInput,
) {
  assertCanWrite(session);

  return mapProductType(
    await prisma.productType.update({
      where: { id: BigInt(id) },
      data: {
        ...input,
        groupId: input.groupId == null ? null : BigInt(input.groupId),
      },
      include: {
        group: { select: { name: true } },
        attributeGroups: true,
        attributes: { include: { attributeGroup: { select: { name: true } } } },
      },
    }),
  );
}

export async function deleteTaxonomyProductTypeService(
  session: StaffSession,
  id: number,
) {
  assertCanWrite(session);
  await prisma.productType.delete({ where: { id: BigInt(id) } });
}

export async function createTaxonomyAttributeGroupService(
  session: StaffSession,
  input: ProductTaxonomyAttributeGroupInput,
) {
  assertCanWrite(session);

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
  assertCanWrite(session);

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

export async function deleteTaxonomyAttributeGroupService(
  session: StaffSession,
  id: number,
) {
  assertCanWrite(session);
  await prisma.productAttributeGroup.delete({ where: { id: BigInt(id) } });
}

export async function createTaxonomyAttributeService(
  session: StaffSession,
  input: ProductTaxonomyAttributeInput,
) {
  assertCanWrite(session);

  return mapAttribute(
    await prisma.productTypeAttribute.create({
      data: {
        ...input,
        productTypeId: BigInt(input.productTypeId),
        attributeGroupId:
          input.attributeGroupId == null ? null : BigInt(input.attributeGroupId),
      },
      include: {
        attributeGroup: {
          select: {
            name: true,
          },
        },
      },
    }),
  );
}

export async function updateTaxonomyAttributeService(
  session: StaffSession,
  id: number,
  input: ProductTaxonomyAttributeInput,
) {
  assertCanWrite(session);

  return mapAttribute(
    await prisma.productTypeAttribute.update({
      where: { id: BigInt(id) },
      data: {
        ...input,
        productTypeId: BigInt(input.productTypeId),
        attributeGroupId:
          input.attributeGroupId == null ? null : BigInt(input.attributeGroupId),
      },
      include: {
        attributeGroup: {
          select: {
            name: true,
          },
        },
      },
    }),
  );
}

export async function deleteTaxonomyAttributeService(
  session: StaffSession,
  id: number,
) {
  assertCanWrite(session);
  await prisma.productTypeAttribute.delete({ where: { id: BigInt(id) } });
}

export async function listProductColorsService(session: StaffSession) {
  assertCanRead(session);

  return (
    await prisma.productColor.findMany({
      orderBy: [{ label: "asc" }],
    })
  ).map(mapColor);
}

export async function createProductColorService(
  session: StaffSession,
  input: ProductColorInput,
) {
  assertCanWrite(session);

  return mapColor(await prisma.productColor.create({ data: input }));
}

export async function updateProductColorService(
  session: StaffSession,
  id: number,
  input: ProductColorInput,
) {
  assertCanWrite(session);

  return mapColor(
    await prisma.productColor.update({
      where: { id: BigInt(id) },
      data: input,
    }),
  );
}

export async function deleteProductColorService(session: StaffSession, id: number) {
  assertCanWrite(session);
  await prisma.productColor.delete({ where: { id: BigInt(id) } });
}

export async function listProductFinishesService(session: StaffSession) {
  assertCanRead(session);

  return (
    await prisma.productFinish.findMany({
      orderBy: [{ label: "asc" }],
    })
  ).map(mapFinish);
}

export async function createProductFinishService(
  session: StaffSession,
  input: ProductFinishInput,
) {
  assertCanWrite(session);
  await assertFinishImageMedia(input.imageMediaId);

  return mapFinish(
    await prisma.productFinish.create({
      data: {
        key: input.key,
        label: input.label,
        color: input.color,
        imageMediaId:
          input.imageMediaId == null ? null : BigInt(input.imageMediaId),
      },
    }),
  );
}

export async function updateProductFinishService(
  session: StaffSession,
  id: number,
  input: ProductFinishInput,
) {
  assertCanWrite(session);
  await assertFinishImageMedia(input.imageMediaId);

  return mapFinish(
    await prisma.productFinish.update({
      where: { id: BigInt(id) },
      data: {
        key: input.key,
        label: input.label,
        color: input.color,
        imageMediaId:
          input.imageMediaId == null ? null : BigInt(input.imageMediaId),
      },
    }),
  );
}

export async function deleteProductFinishService(session: StaffSession, id: number) {
  assertCanWrite(session);
  await prisma.productFinish.delete({ where: { id: BigInt(id) } });
}
