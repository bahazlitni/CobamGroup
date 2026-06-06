import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { canAccessProducts, canManageProducts } from "@/features/products/access";
import { prisma } from "@/lib/server/db/prisma";
import type { ProductCertificateDto, ProductCertificateInput } from "./types";

export class ProductCertificatesServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const PRODUCT_CERTIFICATE_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageMediaId: true,
  createdAt: true,
  updatedAt: true,
  imageMedia: {
    select: {
      altText: true,
    },
  },
  associations: {
    select: {
      productId: true,
    },
  },
} satisfies Prisma.ProductCertificateSelect;

type ProductCertificateRecord = Prisma.ProductCertificateGetPayload<{
  select: typeof PRODUCT_CERTIFICATE_SELECT;
}>;

function buildMediaUrl(mediaId: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function assertAccess(allowed: boolean) {
  if (!allowed) {
    throw new ProductCertificatesServiceError("Acces refuse.", 403);
  }
}

function parseOptionalString(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function parseRequiredString(value: unknown, fieldName: string, maxLength = 255) {
  const text = parseOptionalString(value);

  if (!text) {
    throw new ProductCertificatesServiceError(`${fieldName} est requis.`);
  }

  if (text.length > maxLength) {
    throw new ProductCertificatesServiceError(
      `${fieldName} doit contenir ${maxLength} caracteres ou moins.`,
    );
  }

  return text;
}

function parseOptionalLimitedString(value: unknown, fieldName: string, maxLength: number) {
  const text = parseOptionalString(value);

  if (text && text.length > maxLength) {
    throw new ProductCertificatesServiceError(
      `${fieldName} doit contenir ${maxLength} caracteres ou moins.`,
    );
  }

  return text;
}

function parseRequiredPositiveInteger(value: unknown, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductCertificatesServiceError(`${fieldName} est invalide.`);
  }
  return parsed;
}

export function parseProductCertificateId(value: unknown) {
  return parseRequiredPositiveInteger(value, "L'identifiant");
}

export function parseProductCertificateInput(value: unknown): ProductCertificateInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    name: parseRequiredString(record.name, "Le nom"),
    slug: parseRequiredString(record.slug, "Le slug"),
    description: parseOptionalLimitedString(record.description, "La description", 4000),
    imageMediaId: parseRequiredPositiveInteger(record.imageMediaId, "L'image"),
  };
}

function mapProductCertificate(record: ProductCertificateRecord): ProductCertificateDto {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    description: record.description,
    imageMediaId: Number(record.imageMediaId),
    imageUrl: buildMediaUrl(record.imageMediaId, "original"),
    imageThumbnailUrl: buildMediaUrl(record.imageMediaId, "thumbnail"),
    imageAltText: record.imageMedia.altText,
    productCount: record.associations.length,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function assertCertificateImageMedia(mediaId: number) {
  const media = await prisma.media.findFirst({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
      isActive: true,
    },
    select: {
      kind: true,
    },
  });

  if (!media || media.kind !== "IMAGE") {
    throw new ProductCertificatesServiceError("L'image du certificat est invalide.");
  }
}

async function assertSlugAvailable(slug: string, excludeId?: number) {
  const existing = await prisma.productCertificate.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existing && Number(existing.id) !== (excludeId ?? -1)) {
    throw new ProductCertificatesServiceError("Un certificat avec ce slug existe deja.");
  }
}

export async function listProductCertificatesService(session: StaffSession) {
  assertAccess(canAccessProducts(session));

  const records = await prisma.productCertificate.findMany({
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: PRODUCT_CERTIFICATE_SELECT,
  });

  return records.map(mapProductCertificate);
}

export async function createProductCertificateService(
  session: StaffSession,
  input: ProductCertificateInput,
) {
  assertAccess(canManageProducts(session));
  await assertCertificateImageMedia(input.imageMediaId);
  await assertSlugAvailable(input.slug);

  const record = await prisma.productCertificate.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageMediaId: BigInt(input.imageMediaId),
    },
    select: PRODUCT_CERTIFICATE_SELECT,
  });

  return mapProductCertificate(record);
}

export async function updateProductCertificateService(
  session: StaffSession,
  id: number,
  input: ProductCertificateInput,
) {
  assertAccess(canManageProducts(session));
  await assertCertificateImageMedia(input.imageMediaId);
  await assertSlugAvailable(input.slug, id);

  const existing = await prisma.productCertificate.findUnique({
    where: {
      id: BigInt(id),
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new ProductCertificatesServiceError("Certificat introuvable.", 404);
  }

  const record = await prisma.productCertificate.update({
    where: {
      id: BigInt(id),
    },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageMediaId: BigInt(input.imageMediaId),
    },
    select: PRODUCT_CERTIFICATE_SELECT,
  });

  return mapProductCertificate(record);
}

export async function deleteProductCertificateService(session: StaffSession, id: number) {
  assertAccess(canManageProducts(session));

  const productCount = await prisma.productCertificateAssociation.count({
    where: {
      certificateId: BigInt(id),
    },
  });

  if (productCount > 0) {
    throw new ProductCertificatesServiceError(
      "Ce certificat est deja utilise par des produits. Retirez-le des produits avant suppression.",
    );
  }

  await prisma.productCertificate.delete({
    where: {
      id: BigInt(id),
    },
  });
}
