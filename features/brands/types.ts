export type { BrandShowcasePlacement } from "@prisma/client";
import type { BrandShowcasePlacement } from "@prisma/client";

export const BRAND_SHOWCASE_PLACEMENT_OPTIONS = [
  {
    value: "NONE",
    label: "Aucune diffusion",
    description: "La marque ne remonte sur aucun espace public pour le moment.",
  },
  {
    value: "REFERENCE",
    label: "Référence",
    description: "La marque pourra apparaître plus tard dans l'espace références.",
  },
  {
    value: "PARTNER",
    label: "Partenaire",
    description: "La marque pourra apparaître plus tard dans l'espace partenaires.",
  },
] satisfies Array<{
  value: BrandShowcasePlacement;
  label: string;
  description: string;
}>;

export function getBrandShowcasePlacementLabel(
  placement: BrandShowcasePlacement,
): string {
  return (
    BRAND_SHOWCASE_PLACEMENT_OPTIONS.find((option) => option.value === placement)
      ?.label ?? "Aucune diffusion"
  );
}

export const BRAND_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type BrandPageSize = (typeof BRAND_PAGE_SIZE_OPTIONS)[number];

export type BrandListQuery = {
  page: number;
  pageSize: BrandPageSize;
  q?: string;
};

export type BrandCreateInput = {
  name: string;
  slug: string;
  description: string | null;
  logoMediaId: number | null;
  showcasePlacement: BrandShowcasePlacement;
  isProductBrand: boolean;
};

export type BrandUpdateInput = BrandCreateInput;

export type BrandListItemDto = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoMediaId: number | null;
  showcasePlacement: BrandShowcasePlacement;
  isProductBrand: boolean;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BrandDetailDto = BrandListItemDto & {
  createdByUserId: string | null;
  updatedByUserId: string | null;
};

export type BrandListResult = {
  items: BrandListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
