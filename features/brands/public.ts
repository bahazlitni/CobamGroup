import { BrandShowcasePlacement, MediaVisibility } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type { PublicBrand } from "./types";

function buildPublicMediaThumbnailUrl(mediaId: bigint | number) {
  return `/api/media/${mediaId.toString()}/file?variant=thumbnail`;
}

function mapPublicBrand(brand: {
  id: bigint;
  name: string;
  slug: string;
  description: string | null;
  logoMediaId: bigint | null;
  logoMedia: {
    id: bigint;
    visibility: MediaVisibility;
    isActive: boolean;
    deletedAt: Date | null;
  } | null;
}): PublicBrand {
  const hasPublicLogo =
    brand.logoMedia != null &&
    brand.logoMedia.visibility === MediaVisibility.PUBLIC &&
    brand.logoMedia.isActive &&
    brand.logoMedia.deletedAt == null;
  const logoMediaId =
    hasPublicLogo && brand.logoMediaId != null
      ? Number(brand.logoMediaId)
      : null;
  const imageUrl =
    logoMediaId != null ? buildPublicMediaThumbnailUrl(logoMediaId) : null;

  return {
    id: Number(brand.id),
    name: brand.name,
    slug: brand.slug,
    description: brand.description?.trim() ?? "",
    logoMediaId,
    imageUrl,
  };
}

export async function listPublicBrandsByPlacement(
  placement: Exclude<BrandShowcasePlacement, "NONE">,
): Promise<PublicBrand[]> {
  const brands = await prisma.productBrand.findMany({
    where: {
      deletedAt: null,
      showcasePlacement: placement,
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoMediaId: true,
      logoMedia: {
        select: {
          id: true,
          visibility: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  return brands.map(mapPublicBrand);
}

export async function listPublicBrandShowcaseData() {
  const [partners, references] = await Promise.all([
    listPublicBrandsByPlacement(BrandShowcasePlacement.PARTNER),
    listPublicBrandsByPlacement(BrandShowcasePlacement.REFERENCE),
  ]);

  return {
    partners,
    references,
  };
}
