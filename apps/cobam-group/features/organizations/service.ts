import type { StaffSession } from "@/features/auth/types";
import { canAccessProducts, canManageProducts } from "@/features/products/access";
import { prisma } from "@/lib/server/db/prisma";
import type { OrganizationDto, OrganizationInput } from "./types";

export class OrganizationServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function assertCanRead(session: StaffSession) {
  if (!canAccessProducts(session)) {
    throw new OrganizationServiceError("Acces refuse.", 403);
  }
}

function assertCanWrite(session: StaffSession) {
  if (!canManageProducts(session)) {
    throw new OrganizationServiceError("Acces refuse.", 403);
  }
}

function requiredString(value: unknown, fieldName: string) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new OrganizationServiceError(`${fieldName} est requis.`);
  }

  return text;
}

function optionalString(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function positiveIntegerValue(value: unknown, fieldName: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new OrganizationServiceError(`${fieldName} est invalide.`);
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

async function assertLogoMedia(mediaId: number | null) {
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
    throw new OrganizationServiceError("Le logo media est invalide.");
  }
}

function mapOrganization(record: {
  id: bigint;
  slug: string;
  name: string;
  description: string | null;
  logoMediaId: bigint | null;
  isProductBrand: boolean;
  isReference: boolean;
  isPartner: boolean;
  createdAt: Date;
  updatedAt: Date;
}): OrganizationDto {
  return {
    id: Number(record.id),
    slug: record.slug,
    name: record.name,
    description: record.description,
    logoMediaId: record.logoMediaId == null ? null : Number(record.logoMediaId),
    isProductBrand: record.isProductBrand,
    isReference: record.isReference,
    isPartner: record.isPartner,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function parseOrganizationId(value: unknown) {
  return positiveIntegerValue(value, "Identifiant");
}

export function parseOrganizationInput(value: unknown): OrganizationInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    slug: requiredString(record.slug, "Le slug"),
    name: requiredString(record.name, "Le nom"),
    description: optionalString(record.description),
    logoMediaId: nullablePositiveIntegerValue(record.logoMediaId, "Le logo media"),
    isProductBrand: booleanValue(record.isProductBrand),
    isReference: booleanValue(record.isReference),
    isPartner: booleanValue(record.isPartner),
  };
}

export async function listOrganizationsService(session: StaffSession) {
  assertCanRead(session);

  return (
    await prisma.organization.findMany({
      orderBy: [{ name: "asc" }],
    })
  ).map(mapOrganization);
}

export async function createOrganizationService(session: StaffSession, input: OrganizationInput) {
  assertCanWrite(session);
  await assertLogoMedia(input.logoMediaId);

  return mapOrganization(
    await prisma.organization.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        logoMediaId: input.logoMediaId == null ? null : BigInt(input.logoMediaId),
        isProductBrand: input.isProductBrand,
        isReference: input.isReference,
        isPartner: input.isPartner,
      },
    }),
  );
}

export async function updateOrganizationService(
  session: StaffSession,
  id: number,
  input: OrganizationInput,
) {
  assertCanWrite(session);
  await assertLogoMedia(input.logoMediaId);

  return mapOrganization(
    await prisma.organization.update({
      where: { id: BigInt(id) },
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        logoMediaId: input.logoMediaId == null ? null : BigInt(input.logoMediaId),
        isProductBrand: input.isProductBrand,
        isReference: input.isReference,
        isPartner: input.isPartner,
      },
    }),
  );
}

export async function deleteOrganizationService(session: StaffSession, id: number) {
  assertCanWrite(session);
  await prisma.organization.delete({ where: { id: BigInt(id) } });
}
