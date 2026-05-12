import { Prisma, type ProductLifecycle } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import { canAccessProducts, canCreateProducts, canManageProducts } from "@/features/products/access";
import type { ProductMediaDto } from "@/features/products/types";
import { formatProductBrandValue } from "@/lib/static_tables/brands";
import {
  productBrandLabel,
  productLifecycleFromVisibility,
  richTextDescriptionToString,
  stringToRichTextDescription,
  visibilityFromProductLifecycle,
} from "@/features/products/model-b-compat";
import type {
  ProductPackDetailDto,
  ProductPackFormOptionsDto,
  ProductPackListItemDto,
  ProductPackListResult,
  ProductPackUpsertInput,
} from "./types";

export class ProductPackServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const MEDIA_SELECT = {
  id: true,
  kind: true,
  title: true,
  originalFilename: true,
  mimeType: true,
  altText: true,
  widthPx: true,
  heightPx: true,
  durationSeconds: true,
  sizeBytes: true,
} satisfies Prisma.MediaSelect;

const PACK_COMPONENT_SELECT = {
  id: true,
  sku: true,
  slug: true,
  kind: true,
  name: true,
  brand: { select: { displayName: true, name: true } },
  visibleEcommerce: true,
  visibleVitrine: true,
} satisfies Prisma.ProductSelect;

const PACK_DETAIL_SELECT = {
  id: true,
  sku: true,
  slug: true,
  name: true,
  displayName: true,
  richTextDescription: true,
  descriptionSeo: true,
  visibleEcommerce: true,
  visibleVitrine: true,
  createdAt: true,
  updatedAt: true,
  subcategories: {
    select: {
      subcategoryId: true,
      subcategory: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  },
  media: {
    where: {
      role: "GALLERY",
    },
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      role: true,
      name: true,
      altText: true,
      media: {
        select: MEDIA_SELECT,
      },
    },
  },
  packLinesAsPack: {
    orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
    select: {
      quantity: true,
      productId: true,
      product: {
        select: PACK_COMPONENT_SELECT,
      },
    },
  },
} satisfies Prisma.ProductSelect;

type PackDetailRecord = Prisma.ProductGetPayload<{
  select: typeof PACK_DETAIL_SELECT;
}>;

function buildMediaUrl(mediaId: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function mapMedia(
  media: Prisma.MediaGetPayload<{ select: typeof MEDIA_SELECT }>,
  link?: {
    role: ProductMediaDto["role"];
    name: string | null;
    altText: string | null;
  },
): ProductMediaDto {
  return {
    id: Number(media.id),
    role: link?.role ?? "GALLERY",
    kind: media.kind,
    title: link?.name ?? media.title,
    originalFilename: media.originalFilename,
    mimeType: media.mimeType,
    altText: link?.altText ?? media.altText,
    widthPx: media.widthPx,
    heightPx: media.heightPx,
    durationSeconds: media.durationSeconds?.toString() ?? null,
    sizeBytes: media.sizeBytes?.toString() ?? null,
    url: buildMediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? buildMediaUrl(media.id, "thumbnail") : null,
  };
}

function derivePack(record: PackDetailRecord) {
  const brands = [
    ...new Set(
      record.packLinesAsPack.flatMap((line) => {
        const brand = formatProductBrandValue(productBrandLabel(line.product.brand));
        return brand ? [brand] : [];
      }),
    ),
  ];
  const lifecycle: ProductPackDetailDto["derived"]["lifecycle"] =
    productLifecycleFromVisibility(record);

  return {
    brands,
    lifecycle,
  };
}

function mapPackDetail(record: PackDetailRecord): ProductPackDetailDto {
  return {
    id: Number(record.id),
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    description: richTextDescriptionToString(record.richTextDescription),
    descriptionSeo: record.descriptionSeo,
    subcategoryIds: record.subcategories.map((link) => Number(link.subcategoryId)),
      media: record.media.map((link) => mapMedia(link.media, link)),
    lines: record.packLinesAsPack.map((line) => ({
      productId: Number(line.productId),
      quantity: line.quantity,
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    derived: derivePack(record),
  };
}

function mapPackListItem(record: PackDetailRecord): ProductPackListItemDto {
  const derived = derivePack(record);
  return {
    id: Number(record.id),
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    description: richTextDescriptionToString(record.richTextDescription),
    lineCount: record.packLinesAsPack.length,
    brands: derived.brands,
    lifecycle: derived.lifecycle,
    subcategories: record.subcategories.map(({ subcategory }) => ({
      id: Number(subcategory.id),
      categoryId: Number(subcategory.category.id),
      categoryName: subcategory.category.name,
      categorySlug: subcategory.category.slug,
      name: subcategory.name,
      slug: subcategory.slug,
    })),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function assertPackUniqueConstraints(input: ProductPackUpsertInput, excludePackId?: number) {
  const existing = await prisma.product.findFirst({
    where: {
      OR: [{ sku: input.sku }, { slug: input.slug }],
      ...(excludePackId != null
        ? {
            id: {
              not: BigInt(excludePackId),
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    throw new ProductPackServiceError("Un produit existe déjà avec ce SKU ou ce slug.");
  }
}

async function assertPackLinesValid(input: ProductPackUpsertInput) {
  if (input.lines.length === 0) {
    throw new ProductPackServiceError("Un pack doit contenir au moins un produit.");
  }

  const duplicates = new Set<number>();
  for (const line of input.lines) {
    if (duplicates.has(line.productId)) {
      throw new ProductPackServiceError("Un produit ne peut apparaître qu'une seule fois dans un pack.");
    }
    duplicates.add(line.productId);
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: input.lines.map((line) => BigInt(line.productId)),
      },
    },
    select: {
      id: true,
      kind: true,
    },
  });

  if (products.length !== input.lines.length || products.some((product) => product.kind === "PACK")) {
    throw new ProductPackServiceError("Les lignes d'un pack doivent référencer uniquement des produits simples ou des variantes.");
  }
}

async function writePack(packId: number | null, input: ProductPackUpsertInput) {
  await assertPackUniqueConstraints(input, packId ?? undefined);
  await assertPackLinesValid(input);

  return prisma.$transaction(async (tx) => {
    const pack =
      packId == null
        ? await tx.product.create({
            data: {
              sku: input.sku,
              slug: input.slug,
              kind: "PACK",
              name: input.name,
              displayName: input.name,
              richTextDescription: stringToRichTextDescription(input.description),
              descriptionSeo: input.descriptionSeo,
              ...visibilityFromProductLifecycle("ACTIVE"),
            },
            select: { id: true },
          })
        : await tx.product.update({
            where: { id: BigInt(packId) },
            data: {
              sku: input.sku,
              slug: input.slug,
              name: input.name,
              displayName: input.name,
              richTextDescription: stringToRichTextDescription(input.description),
              descriptionSeo: input.descriptionSeo,
            },
            select: { id: true },
          });

    await tx.productSubcategoryLink.deleteMany({
      where: { productId: pack.id },
    });

    if (input.subcategoryIds.length > 0) {
      await tx.productSubcategoryLink.createMany({
        data: input.subcategoryIds.map((subcategoryId) => ({
          productId: pack.id,
          subcategoryId: BigInt(subcategoryId),
        })),
      });
    }

    await tx.productMedia.deleteMany({
      where: {
        productId: pack.id,
        role: "GALLERY",
      },
    });

    if (input.media.length > 0) {
      await tx.productMedia.createMany({
        data: input.media.map((media, index) => ({
          productId: pack.id,
          mediaId: BigInt(media.id),
          role: "GALLERY",
          name: media.title,
          altText: media.altText,
          sortOrder: index,
        })),
      });
    }

    await tx.productPackLine.deleteMany({
      where: { packProductId: pack.id },
    });

    await tx.productPackLine.createMany({
      data: input.lines.map((line, index) => ({
        packProductId: pack.id,
        productId: BigInt(line.productId),
        quantity: line.quantity,
        sortOrder: index,
      })),
    });

    return tx.product.findUniqueOrThrow({
      where: { id: pack.id },
      select: PACK_DETAIL_SELECT,
    });
  });
}

export async function listProductPacksService(
  session: StaffSession,
  query: { page: number; pageSize: number; q: string | null },
): Promise<ProductPackListResult> {
  if (!canAccessProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const where: Prisma.ProductWhereInput = {
    kind: "PACK",
    ...(query.q
      ? {
          OR: [
            { sku: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
            { name: { contains: query.q, mode: "insensitive" } },
            { shortDescription: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total, productBrands] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: PACK_DETAIL_SELECT,
    }),
    prisma.product.count({ where }),
    prisma.organization.findMany({
      where: {
        isProductBrand: true,
      },
      orderBy: [{ displayName: "asc" }, { name: "asc" }],
      select: {
        displayName: true,
      },
    }),
  ]);

  return {
    items: items.map(mapPackListItem),
    productBrandOptions: productBrands.map((brand) => brand.displayName),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getProductPackFormOptionsService(
  session: StaffSession,
): Promise<ProductPackFormOptionsDto> {
  if (!canAccessProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const [subcategories, products] = await Promise.all([
    prisma.productSubcategory.findMany({
      where: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        categoryId: true,
        name: true,
        slug: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      where: {
        kind: {
          in: ["STANDARD", "SINGLE", "VARIANT"],
        },
      },
      orderBy: [{ name: "asc" }, { sku: "asc" }],
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        kind: true,
      },
    }),
  ]);

  return {
    productSubcategories: subcategories.map((subcategory) => ({
      id: Number(subcategory.id),
      categoryId: Number(subcategory.categoryId),
      categoryName: subcategory.category.name,
      categorySlug: subcategory.category.slug,
      name: subcategory.name,
      slug: subcategory.slug,
    })),
    availableProducts: products
      .filter(
        (product): product is typeof product & {
          kind: "STANDARD" | "SINGLE" | "VARIANT";
        } =>
          product.kind === "STANDARD" ||
          product.kind === "SINGLE" ||
          product.kind === "VARIANT",
      )
      .map((product) => ({
        id: Number(product.id),
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        kind: product.kind,
      })),
  };
}

export async function getProductPackByIdService(session: StaffSession, packId: number) {
  if (!canAccessProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const pack = await prisma.product.findFirst({
    where: {
      id: BigInt(packId),
      kind: "PACK",
    },
    select: PACK_DETAIL_SELECT,
  });

  if (!pack) {
    throw new ProductPackServiceError("Pack introuvable.", 404);
  }

  return mapPackDetail(pack);
}

export async function createProductPackService(
  session: StaffSession,
  input: ProductPackUpsertInput,
): Promise<ProductPackDetailDto> {
  if (!canCreateProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const pack = await writePack(null, input);
  return mapPackDetail(pack);
}

export async function updateProductPackService(
  session: StaffSession,
  packId: number,
  input: ProductPackUpsertInput,
): Promise<ProductPackDetailDto> {
  if (!canManageProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const pack = await writePack(packId, input);
  return mapPackDetail(pack);
}

export async function deleteProductPackService(session: StaffSession, packId: number) {
  if (!canManageProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  await prisma.product.delete({
    where: {
      id: BigInt(packId),
    },
  });
}

export type PackBulkUpdateInput = {
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  lifecycle?: ProductLifecycle | null;
};

export async function updateProductPacksBulkService(
  session: StaffSession,
  packIds: number[],
  input: PackBulkUpdateInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  if (packIds.length === 0) {
    throw new ProductPackServiceError("Aucun pack selectionné.", 400);
  }

  if ((input.sku || input.name) && packIds.length > 1) {
    throw new ProductPackServiceError(
      "SKU et nom ne peuvent être modifiés que pour un seul pack.",
      400,
    );
  }

  const data: Prisma.ProductUpdateManyMutationInput = {};

  if (input.sku != null) {
    data.sku = input.sku;
  }
  if (input.name != null) {
    data.name = input.name;
    data.displayName = input.name;
  }
  if (input.brand !== undefined) {
    throw new ProductPackServiceError(
      "La marque d'un pack est derivee de ses produits.",
      400,
    );
  }
  if (input.lifecycle !== undefined) {
    Object.assign(data, visibilityFromProductLifecycle(input.lifecycle));
  }

  if (Object.keys(data).length === 0) {
    throw new ProductPackServiceError("Aucune modification fournie.", 400);
  }

  await prisma.product.updateMany({
    where: {
      id: { in: packIds.map((id) => BigInt(id)) },
      kind: "PACK",
    },
    data,
  });
}

export async function deleteProductPacksBulkService(
  session: StaffSession,
  packIds: number[],
) {
  if (!canManageProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  if (packIds.length === 0) {
    throw new ProductPackServiceError("Aucun pack selectionné.", 400);
  }

  await prisma.product.deleteMany({
    where: {
      id: { in: packIds.map((id) => BigInt(id)) },
      kind: "PACK",
    },
  });
}
