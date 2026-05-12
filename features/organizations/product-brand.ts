import type { Prisma } from "@prisma/client";
import { slugify } from "@/lib/slugify";

export async function resolveProductBrandOrganizationId(
  tx: Prisma.TransactionClient,
  brand: string | null | undefined,
) {
  const rawBrand = brand?.trim();

  if (!rawBrand) {
    return null;
  }

  const textCandidates = Array.from(
    new Set([rawBrand].filter((value): value is string => Boolean(value))),
  );
  const slugCandidates = Array.from(
    new Set(textCandidates.map((value) => slugify(value)).filter(Boolean)),
  );

  const organization = await tx.organization.findFirst({
    where: {
      isProductBrand: true,
      OR: [
        ...textCandidates.flatMap((value) => [
          { name: { equals: value, mode: "insensitive" as const } },
        ]),
        ...slugCandidates.map((slug) => ({ slug })),
      ],
    },
    select: {
      id: true,
    },
  });

  return organization?.id ?? null;
}
