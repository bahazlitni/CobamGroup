import { Prisma } from "@prisma/client";

export function buildStaffProductSearchWhere(q: string | null): Prisma.ProductWhereInput {
  if (!q) {
    return {};
  }

  return {
    OR: [
      { sku: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { displayName: { contains: q, mode: "insensitive" } },
      {
        familyMembership: {
          is: {
            family: {
              is: {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { slug: { contains: q, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      },
    ],
  };
}

export {
  getProductSearchPlainText,
  normalizeProductSearchText,
  normalizePublicSearchText,
  rankProductSearchRows,
  rankProductSearchRowsWithScores,
  rankPublicProductSearchRows,
  rankPublicProductSearchRowsWithScores,
} from "@cobam/shared/search/product-search";

export type {
  ProductSearchCandidate,
  ProductSearchRankOptions,
  PublicSearchCandidate,
} from "@cobam/shared/search/product-search";
