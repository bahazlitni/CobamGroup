import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type { ProductAttributeDataType } from "@/features/products/types";
import {
  normalizeProductAttributeMetadataName,
  normalizeProductAttributeMetadataUnit,
} from "./normalize";

type MetadataClient = Prisma.TransactionClient | typeof prisma;

export type ProductAttributeMetadataRecord = {
  id: bigint;
  name: string;
  dataType: ProductAttributeDataType;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductAttributeMetadataCandidate = {
  id: bigint;
  name: string;
  dataType: ProductAttributeDataType;
  unit: string;
};

export type ProductAttributeMetadataInputRecord = {
  name: string;
  dataType: ProductAttributeDataType;
  unit: string | null;
};

const productAttributeMetadataSelect = {
  id: true,
  name: true,
  dataType: true,
  unit: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductAttributeMetadataSelect;

const productAttributeMetadataCandidateSelect = {
  id: true,
  name: true,
  dataType: true,
  unit: true,
} satisfies Prisma.ProductAttributeMetadataSelect;

export async function listProductAttributeMetadata() {
  return prisma.productAttributeMetadata.findMany({
    orderBy: [{ name: "asc" }, { dataType: "asc" }, { unit: "asc" }],
    select: productAttributeMetadataSelect,
  });
}

export async function listProductAttributeMetadataCandidates() {
  return prisma.productAttributeMetadata.findMany({
    orderBy: [{ name: "asc" }, { dataType: "asc" }, { unit: "asc" }],
    select: productAttributeMetadataCandidateSelect,
  });
}

export async function findProductAttributeMetadataById(metadataId: number) {
  return prisma.productAttributeMetadata.findUnique({
    where: { id: BigInt(metadataId) },
    select: productAttributeMetadataSelect,
  });
}

export async function createProductAttributeMetadata(
  input: ProductAttributeMetadataInputRecord,
) {
  return prisma.productAttributeMetadata.create({
    data: {
      name: input.name,
      dataType: input.dataType,
      unit: input.unit ?? "",
    },
    select: productAttributeMetadataSelect,
  });
}

export async function updateProductAttributeMetadata(
  metadataId: number,
  input: ProductAttributeMetadataInputRecord,
) {
  return prisma.productAttributeMetadata.update({
    where: { id: BigInt(metadataId) },
    data: {
      name: input.name,
      dataType: input.dataType,
      unit: input.unit ?? "",
    },
    select: productAttributeMetadataSelect,
  });
}

export async function deleteProductAttributeMetadata(metadataId: number) {
  return prisma.productAttributeMetadata.delete({
    where: { id: BigInt(metadataId) },
    select: productAttributeMetadataSelect,
  });
}

export async function ensureProductAttributeMetadataEntries(
  tx: MetadataClient,
  items: readonly ProductAttributeMetadataInputRecord[],
) {
  const existingEntries = await tx.productAttributeMetadata.findMany({
    select: productAttributeMetadataCandidateSelect,
  });
  const existingKeys = new Set(
    existingEntries.map(
      (entry) =>
        `${normalizeProductAttributeMetadataName(entry.name)}::${entry.dataType}::${normalizeProductAttributeMetadataUnit(entry.unit)}`,
    ),
  );
  const uniqueEntries = new Map<string, ProductAttributeMetadataInputRecord>();

  for (const item of items) {
    const name = item.name.trim();

    if (!name) {
      continue;
    }

    const normalizedUnit = item.dataType === "NUMBER" ? item.unit?.trim() ?? "" : "";
    const key = `${name}::${item.dataType}::${normalizedUnit}`;

    if (!uniqueEntries.has(key)) {
      uniqueEntries.set(key, {
        name,
        dataType: item.dataType,
        unit: item.dataType === "NUMBER" ? normalizedUnit : "",
      });
    }
  }

  for (const entry of uniqueEntries.values()) {
    const normalizedKey = `${normalizeProductAttributeMetadataName(entry.name)}::${entry.dataType}::${normalizeProductAttributeMetadataUnit(entry.unit)}`;

    if (existingKeys.has(normalizedKey)) {
      continue;
    }

    await tx.productAttributeMetadata.create({
      data: {
        name: entry.name,
        dataType: entry.dataType,
        unit: entry.unit ?? "",
      },
    });
    existingKeys.add(normalizedKey);
  }
}
