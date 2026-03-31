import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";

const productFinishSelect = {
  id: true,
  name: true,
  colorHex: true,
  mediaId: true,
  media: {
    select: {
      id: true,
      widthPx: true,
      heightPx: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductFinishSelect;

export async function listProductFinishes() {
  return prisma.productFinish.findMany({
    orderBy: [{ name: "asc" }],
    select: productFinishSelect,
  });
}

export async function listProductFinishCandidates() {
  return prisma.productFinish.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      colorHex: true,
      mediaId: true,
      media: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function findProductFinishById(finishId: number) {
  return prisma.productFinish.findUnique({
    where: { id: BigInt(finishId) },
    select: productFinishSelect,
  });
}

export async function createProductFinish(input: {
  name: string;
  colorHex: string;
  mediaId: number | null;
}) {
  return prisma.productFinish.create({
    data: {
      name: input.name,
      colorHex: input.colorHex,
      mediaId: input.mediaId != null ? BigInt(input.mediaId) : null,
    },
    select: productFinishSelect,
  });
}

export async function updateProductFinish(
  finishId: number,
  input: {
    name: string;
    colorHex: string;
    mediaId: number | null;
  },
) {
  return prisma.productFinish.update({
    where: { id: BigInt(finishId) },
    data: {
      name: input.name,
      colorHex: input.colorHex,
      mediaId: input.mediaId != null ? BigInt(input.mediaId) : null,
    },
    select: productFinishSelect,
  });
}

export async function deleteProductFinish(finishId: number) {
  return prisma.productFinish.delete({
    where: { id: BigInt(finishId) },
    select: productFinishSelect,
  });
}
