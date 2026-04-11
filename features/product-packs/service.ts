import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import { canAccessProducts, canCreateProducts, canManageProducts } from "@/features/products/access";
import type { ProductMediaDto } from "@/features/products/types";
import { formatProductBrandValue } from "@/lib/static_tables/brands";
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
  brand: true,
  basePriceAmount: true,
  priceVisibility: true,
  visibility: true,
  stockVisibility: true,
  lifecycle: true,
  commercialMode: true,
  vatRate: true,
  stock: true,
} satisfies Prisma.ProductSelect;

const PACK_DETAIL_SELECT = {
  id: true,
  sku: true,
  slug: true,
  name: true,
  description: true,
  descriptionSeo: true,
  lifecycle: true,
  createdAt: true,
  updatedAt: true,
  subcategoryLinks: {
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
  mediaLinks: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
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

function mapMedia(media: Prisma.MediaGetPayload<{ select: typeof MEDIA_SELECT }>): ProductMediaDto {
  return {
    id: Number(media.id),
    kind: media.kind,
    title: media.title,
    originalFilename: media.originalFilename,
    mimeType: media.mimeType,
    altText: media.altText,
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
        const brand = formatProductBrandValue(line.product.brand);
        return brand ? [brand] : [];
      }),
    ),
  ];
  const visible = record.packLinesAsPack.every((line) => line.product.visibility === true);
  const priceVisible = record.packLinesAsPack.every((line) => line.product.priceVisibility === true);
  const stockVisible = record.packLinesAsPack.every((line) => line.product.stockVisibility === true);
  const lifecycle: ProductPackDetailDto["derived"]["lifecycle"] =
    record.lifecycle ?? "DRAFT";

  let priceTotal = new Prisma.Decimal(0);
  let vatWeighted = new Prisma.Decimal(0);
  let missingPrice = false;
  let missingStock = false;
  let stockValue: Prisma.Decimal | null = null;
  let commercialMode = null as PackDetailRecord["packLinesAsPack"][number]["product"]["commercialMode"] | null;

  for (const line of record.packLinesAsPack) {
    const componentPrice = line.product.basePriceAmount;
    if (componentPrice == null) {
      missingPrice = true;
    } else {
      const lineTotal = componentPrice.mul(line.quantity);
      priceTotal = priceTotal.add(lineTotal);
      const vat = line.product.vatRate ?? 0;
      vatWeighted = vatWeighted.add(lineTotal.mul(vat));
    }

    if (line.product.stock != null) {
      const availableBundles = line.product.stock.div(line.quantity);
      stockValue = stockValue == null ? availableBundles : Prisma.Decimal.min(stockValue, availableBundles);
    } else {
      missingStock = true;
    }

    commercialMode =
      commercialMode == null
        ? line.product.commercialMode
        : commercialMode === "ON_REQUEST_ONLY" || line.product.commercialMode === "ON_REQUEST_ONLY"
          ? "ON_REQUEST_ONLY"
          : commercialMode === "ON_REQUEST_OR_ONLINE" || line.product.commercialMode === "ON_REQUEST_OR_ONLINE"
            ? "ON_REQUEST_OR_ONLINE"
            : "ONLINE_ONLY";
  }

  return {
    brands,
    basePriceAmount: missingPrice ? null : priceTotal.toString(),
    visibility: visible,
    priceVisibility: priceVisible,
    stockVisibility: stockVisible,
    lifecycle,
    commercialMode,
    vatRate: priceTotal.equals(0) ? 0 : Number(vatWeighted.div(priceTotal).toFixed(4)),
    stock: missingStock ? null : stockValue?.toString() ?? null,
  };
}

function mapPackDetail(record: PackDetailRecord): ProductPackDetailDto {
  return {
    id: Number(record.id),
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    description: record.description,
    descriptionSeo: record.descriptionSeo,
    subcategoryIds: record.subcategoryLinks.map((link) => Number(link.subcategoryId)),
    media: record.mediaLinks.map((link) => mapMedia(link.media)),
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
    description: record.description,
    lineCount: record.packLinesAsPack.length,
    brands: derived.brands,
    basePriceAmount: derived.basePriceAmount,
    stock: derived.stock,
    visibility: derived.visibility,
    lifecycle: derived.lifecycle,
    subcategories: record.subcategoryLinks.map(({ subcategory }) => ({
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
              description: input.description,
              descriptionSeo: input.descriptionSeo,
            },
            select: { id: true },
          })
        : await tx.product.update({
            where: { id: BigInt(packId) },
            data: {
              sku: input.sku,
              slug: input.slug,
              name: input.name,
              description: input.description,
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

    await tx.productMediaLink.deleteMany({
      where: { productId: pack.id },
    });

    if (input.media.length > 0) {
      await tx.productMediaLink.createMany({
        data: input.media.map((media, index) => ({
          productId: pack.id,
          mediaId: BigInt(media.id),
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
            { description: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: PACK_DETAIL_SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(mapPackListItem),
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
          in: ["SINGLE", "VARIANT"],
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
          kind: "SINGLE" | "VARIANT";
        } => product.kind === "SINGLE" || product.kind === "VARIANT",
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
) {
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
) {
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
