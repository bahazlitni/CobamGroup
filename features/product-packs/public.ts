import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import { makeMediaPublicMany } from "@/features/media/repository";
import { richTextDescriptionToString } from "@/features/products/model-b-compat";

export type PublicProductPackSummary = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
  href: string;
};

const PACK_SELECT = {
  id: true,
  slug: true,
  name: true,
  shortDescription: true,
  richTextDescription: true,
  visibleEcommerce: true,
  media: {
    where: {
      role: "GALLERY",
    },
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    take: 1,
    select: {
      media: {
        select: {
          id: true,
          isActive: true,
          deletedAt: true,
          kind: true,
        },
      },
    },
  },
  subcategories: {
    orderBy: {
      subcategoryId: "asc",
    },
    take: 1,
    select: {
      subcategory: {
        select: {
          slug: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

function buildPublicMediaUrl(
  mediaId: bigint | number,
  variant: "original" | "thumbnail" = "original",
) {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

export async function listPublicCollections(): Promise<PublicProductPackSummary[]> {
  const packs = await prisma.product.findMany({
    where: {
      kind: "PACK",
      visibleEcommerce: true,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: 6,
    select: PACK_SELECT,
  });

  const mediaIds = packs.flatMap((p) => 
    p.media.flatMap(l => (l.media.isActive && l.media.deletedAt == null) ? [Number(l.media.id)] : [])
  );

  await makeMediaPublicMany(mediaIds);

  return packs.map((p) => {
    const firstMedia = p.media[0]?.media;
    const hasImage = firstMedia && firstMedia.isActive && firstMedia.deletedAt == null && firstMedia.kind === "IMAGE";
    
    return {
      id: Number(p.id),
      slug: p.slug,
      name: p.name,
      description:
        p.shortDescription ?? richTextDescriptionToString(p.richTextDescription),
      imageUrl: hasImage ? buildPublicMediaUrl(firstMedia.id, "original") : null,
      imageThumbnailUrl: hasImage ? buildPublicMediaUrl(firstMedia.id, "thumbnail") : null,
      href: p.subcategories[0]
        ? `/produits/${p.subcategories[0].subcategory.category.slug}/${p.subcategories[0].subcategory.slug}/${p.slug}`
        : `/produits`,
    };
  });
}
