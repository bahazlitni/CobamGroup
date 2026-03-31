import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";

const productColorSelect = {
  id: true,
  name: true,
  hexValue: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductColorSelect;

export async function listProductColors() {
  return prisma.productColor.findMany({
    orderBy: [{ name: "asc" }],
    select: productColorSelect,
  });
}

export async function listProductColorCandidates() {
  return prisma.productColor.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      hexValue: true,
    },
  });
}

export async function findProductColorById(colorId: number) {
  return prisma.productColor.findUnique({
    where: { id: BigInt(colorId) },
    select: productColorSelect,
  });
}

export async function createProductColor(input: {
  name: string;
  hexValue: string;
}) {
  return prisma.productColor.create({
    data: input,
    select: productColorSelect,
  });
}

export async function updateProductColor(
  colorId: number,
  input: {
    name: string;
    hexValue: string;
  },
) {
  return prisma.productColor.update({
    where: { id: BigInt(colorId) },
    data: input,
    select: productColorSelect,
  });
}

export async function deleteProductColor(colorId: number) {
  return prisma.productColor.delete({
    where: { id: BigInt(colorId) },
    select: productColorSelect,
  });
}
