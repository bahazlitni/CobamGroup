import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type { AnnuaireListQuery, AnnuairePersonInput } from "./types";

function buildWhere(query: AnnuaireListQuery): Prisma.AnnuairePersonWhereInput {
  const q = query.q.trim();
  if (!q) return {};

  return {
    OR: [
      { lastName: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { jobTitle: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { site: { contains: q, mode: "insensitive" } },
      { extension: { contains: q, mode: "insensitive" } },
      { whatsapp: { contains: q, mode: "insensitive" } },
    ],
  };
}

function toData(input: AnnuairePersonInput) {
  return {
    ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
    ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
    ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.site !== undefined ? { site: input.site } : {}),
    ...(input.extension !== undefined ? { extension: input.extension } : {}),
    ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
  };
}

export async function listAnnuairePeople(query: AnnuaireListQuery) {
  const where = buildWhere(query);
  const [items, total] = await Promise.all([
    prisma.annuairePerson.findMany({
      where,
      orderBy: [
        { sortOrder: "asc" },
        { lastName: "asc" },
        { firstName: "asc" },
        { id: "asc" },
      ],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.annuairePerson.count({ where }),
  ]);

  return { items, total };
}

export async function listPublicAnnuairePeople() {
  return prisma.annuairePerson.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { lastName: "asc" },
      { firstName: "asc" },
      { id: "asc" },
    ],
  });
}

export async function createAnnuairePerson(input: AnnuairePersonInput) {
  const maxSortOrder = await prisma.annuairePerson.aggregate({
    _max: { sortOrder: true },
  });

  return prisma.annuairePerson.create({
    data: {
      lastName: input.lastName ?? "",
      firstName: input.firstName ?? "",
      jobTitle: input.jobTitle ?? "",
      email: input.email ?? "",
      site: input.site ?? "",
      extension: input.extension ?? "",
      whatsapp: input.whatsapp ?? "",
      sortOrder: input.sortOrder ?? (maxSortOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function updateAnnuairePerson(
  personId: number,
  input: AnnuairePersonInput,
) {
  return prisma.annuairePerson.update({
    where: { id: BigInt(personId) },
    data: toData(input),
  });
}

export async function deleteAnnuairePerson(personId: number) {
  await prisma.annuairePerson.delete({
    where: { id: BigInt(personId) },
  });
}
