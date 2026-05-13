import { Prisma, type ProductAvailability, type StockUnit } from "@prisma/client";

export const CATALOG_PAGE_SIZE = 36;

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

type ProductCardRecord = Prisma.ProductGetPayload<{ select: typeof PRODUCT_CARD_SELECT }>;
type ProductFamilyRecord = Prisma.ProductFamilyGetPayload<{ select: typeof PRODUCT_FAMILY_SELECT }>;
type ProductDetailRecord = Prisma.ProductGetPayload<{ select: typeof PRODUCT_DETAIL_SELECT }>;
type ProductFamilyDetailRecord = Prisma.ProductFamilyGetPayload<{
  select: typeof PRODUCT_FAMILY_DETAIL_SELECT;
}>;

const MEDIA_SELECT = {
  id: true,
  kind: true,
  title: true,
  altText: true,
  mimeType: true,
  isActive: true,
  deletedAt: true,
} satisfies Prisma.MediaSelect;

const VISIBLE_ECOMMERCE_SUBCATEGORY_LINK_WHERE = {
  subcategory: {
    isActive: true,
    visibleEcommerce: true,
    category: {
      isActive: true,
    },
  },
} satisfies Prisma.ProductSubcategoryLinkWhereInput;

const VISIBLE_ECOMMERCE_FAMILY_MEMBER_WHERE = {
  product: {
    visibleEcommerce: true,
    subcategories: {
      some: VISIBLE_ECOMMERCE_SUBCATEGORY_LINK_WHERE,
    },
  },
} satisfies Prisma.ProductFamilyMemberWhereInput;

const PRODUCT_CARD_SELECT = {
  id: true,
  kind: true,
  sku: true,
  slug: true,
  name: true,
  displayName: true,
  shortDescription: true,
  richTextDescription: true,
  currentPriceTtcTnd: true,
  basePriceTtcTnd: true,
  priceVisibility: true,
  visibleEcommerce: true,
  stockAvailable: true,
  stockAvailability: true,
  stockUnit: true,
  isFeatured: true,
  isPromoted: true,
  isNew: true,
  updatedAt: true,
  brand: {
    select: {
      name: true,
      slug: true,
      description: true,
      logoMediaId: true,
      logoMedia: { select: MEDIA_SELECT },
    },
  },
  media: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      role: true,
      altText: true,
      name: true,
      media: { select: MEDIA_SELECT },
    },
  },
  subcategories: {
    where: VISIBLE_ECOMMERCE_SUBCATEGORY_LINK_WHERE,
    select: {
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
} satisfies Prisma.ProductSelect;

const PRODUCT_FAMILY_SELECT = {
  id: true,
  slug: true,
  name: true,
  subtitle: true,
  description: true,
  mainImageMediaId: true,
  mainImage: { select: MEDIA_SELECT },
  defaultProductId: true,
  updatedAt: true,
  members: {
    where: VISIBLE_ECOMMERCE_FAMILY_MEMBER_WHERE,
    orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
    select: {
      product: { select: PRODUCT_CARD_SELECT },
    },
  },
} satisfies Prisma.ProductFamilySelect;

const PRODUCT_DETAIL_SELECT = {
  ...PRODUCT_CARD_SELECT,
  titleSeo: true,
  descriptionSeo: true,
  guaranteeMonths: true,
  attributes: {
    orderBy: [{ groupSortOrder: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      label: true,
      value: true,
      unit: true,
      groupName: true,
      groupSortOrder: true,
      sortOrder: true,
      inputType: true,
    },
  },
} satisfies Prisma.ProductSelect;

const PRODUCT_FAMILY_DETAIL_SELECT = {
  ...PRODUCT_FAMILY_SELECT,
  descriptionSeo: true,
  members: {
    where: VISIBLE_ECOMMERCE_FAMILY_MEMBER_WHERE,
    orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
    select: {
      product: { select: PRODUCT_DETAIL_SELECT },
    },
  },
} satisfies Prisma.ProductFamilySelect;

export type CommerceMedia = {
  id: number;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT";
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  title: string | null;
  mimeType: string | null;
};

export type CommerceCategory = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  subcategories: {
    id: number;
    name: string;
    slug: string;
    productCount: number;
  }[];
};

export type CommerceBrand = {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
};

export type CommerceProductCard = {
  id: number;
  entityType: "PRODUCT" | "FAMILY";
  slug: string;
  href: string;
  sku: string | null;
  name: string;
  subtitle: string | null;
  summary: string | null;
  brand: CommerceBrand | null;
  category: { name: string; slug: string } | null;
  subcategory: { name: string; slug: string } | null;
  image: CommerceMedia | null;
  price: string | null;
  stock: {
    available: string;
    unit: StockUnit;
    availability: ProductAvailability;
    label: string;
    tone: "available" | "warning" | "unavailable";
  };
  badges: string[];
  updatedAt: string;
};

export type CommerceAttribute = {
  name: string;
  value: string;
  unit: string | null;
  groupName: string;
  groupSortOrder: number;
  sortOrder: number;
  specialType: "COLOR" | "FINISH" | null;
};

export type CommerceVariant = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  displayName: string;
  description: unknown;
  summary: string | null;
  price: string | null;
  stock: CommerceProductCard["stock"];
  images: CommerceMedia[];
  datasheet: CommerceMedia | null;
  certificate: CommerceMedia | null;
  attributes: CommerceAttribute[];
  addToCart: {
    id: number;
    sku: string;
    name: string;
    price: string | null;
    imageUrl: string | null;
  };
};

export type CommerceProductDetail = {
  id: number;
  entityType: "PRODUCT" | "FAMILY";
  slug: string;
  name: string;
  subtitle: string | null;
  description: unknown;
  descriptionSeo: string | null;
  brand: CommerceBrand | null;
  categoryTrail: Array<{ name: string; slug: string }>;
  coverImage: CommerceMedia | null;
  variants: CommerceVariant[];
  relatedProducts: CommerceProductCard[];
};

export type CommerceCatalogResult = {
  items: CommerceProductCard[];
  total: number;
  categories: CommerceCategory[];
  brands: CommerceBrand[];
  activeCategory: CommerceCategory | null;
};

export type CommerceHomeData = {
  categories: CommerceCategory[];
  heroProduct: CommerceProductCard | null;
  featuredProducts: CommerceProductCard[];
  latestProducts: CommerceProductCard[];
  brands: CommerceBrand[];
};

function mediaUrl(id: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${id.toString()}/file${query}`;
}

function isRenderableMedia(media: {
  id: bigint;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT";
  isActive: boolean;
  deletedAt: Date | null;
}) {
  return media.isActive && media.deletedAt == null;
}

function mapMedia(
  media: ProductCardRecord["media"][number]["media"] | ProductFamilyRecord["mainImage"],
  link?: { altText: string | null; name: string | null },
): CommerceMedia | null {
  if (!media || !isRenderableMedia(media)) {
    return null;
  }

  return {
    id: Number(media.id),
    kind: media.kind,
    url: mediaUrl(media.id, "original"),
    thumbnailUrl: media.kind === "IMAGE" ? mediaUrl(media.id, "thumbnail") : null,
    altText: link?.altText ?? media.altText,
    title: link?.name ?? media.title,
    mimeType: media.mimeType,
  };
}

function firstImage(product: Pick<ProductCardRecord, "media">) {
  for (const link of product.media) {
    if (link.role !== "GALLERY" || link.media.kind !== "IMAGE") {
      continue;
    }

    const media = mapMedia(link.media, link);
    if (media) {
      return media;
    }
  }

  return null;
}

function technicalMedia(product: Pick<ProductDetailRecord, "media">, role: "TECHNICAL" | "CERTIFICATE") {
  const link = product.media.find((entry) => entry.role === role);
  return link ? mapMedia(link.media, link) : null;
}

function gallery(product: Pick<ProductCardRecord, "media">) {
  return product.media
    .filter((link) => link.role === "GALLERY")
    .map((link) => mapMedia(link.media, link))
    .filter((media): media is CommerceMedia => media != null);
}

function decimalToString(value: Prisma.Decimal | null | undefined) {
  return value == null ? null : value.toString();
}

function productPrice(record: Pick<ProductCardRecord, "currentPriceTtcTnd" | "basePriceTtcTnd" | "priceVisibility">) {
  if (record.priceVisibility === "NEVER") {
    return null;
  }

  return decimalToString(record.currentPriceTtcTnd ?? record.basePriceTtcTnd);
}

function stockLabel(availability: ProductAvailability, available: Prisma.Decimal) {
  const amount = Number(available.toString());

  if (availability === "OUT_OF_STOCK" || amount <= 0) {
    return { label: "Rupture", tone: "unavailable" as const };
  }

  if (availability === "ON_ORDER") {
    return { label: "Sur commande", tone: "warning" as const };
  }

  if (availability === "DISCONTINUED") {
    return { label: "Arrêté", tone: "unavailable" as const };
  }

  return { label: "En stock", tone: "available" as const };
}

function mapBrand(brand: ProductCardRecord["brand"]): CommerceBrand | null {
  if (!brand) {
    return null;
  }

  return {
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logoUrl:
      brand.logoMedia && isRenderableMedia(brand.logoMedia)
        ? mediaUrl(brand.logoMedia.id, "thumbnail")
        : null,
  };
}

function richTextPlainText(value: Prisma.JsonValue | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return richTextPlainText(JSON.parse(value) as Prisma.JsonValue);
    } catch {
      return value.replace(/\s+/g, " ").trim() || null;
    }
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const node = value as { text?: unknown; content?: unknown };
  const text = [
    typeof node.text === "string" ? node.text : null,
    ...(Array.isArray(node.content) ? node.content.map((child) => richTextPlainText(child)) : []),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

function richTextJson(value: Prisma.JsonValue | null | undefined) {
  return value == null ? null : JSON.stringify(value);
}

function productSummary(record: Pick<ProductCardRecord, "shortDescription" | "richTextDescription">) {
  return record.shortDescription ?? richTextPlainText(record.richTextDescription);
}

function firstSubcategory(record: Pick<ProductCardRecord, "subcategories">) {
  const first = record.subcategories[0]?.subcategory;

  if (!first) {
    return { category: null, subcategory: null };
  }

  return {
    category: { name: first.category.name, slug: first.category.slug },
    subcategory: { name: first.name, slug: first.slug },
  };
}

function mapStock(record: Pick<ProductCardRecord, "stockAvailable" | "stockAvailability" | "stockUnit">) {
  const label = stockLabel(record.stockAvailability, record.stockAvailable);

  return {
    available: record.stockAvailable.toString(),
    unit: record.stockUnit,
    availability: record.stockAvailability,
    label: label.label,
    tone: label.tone,
  };
}

function productBadges(record: Pick<ProductCardRecord, "isNew" | "isPromoted" | "isFeatured">) {
  return [
    record.isNew ? "Nouveau" : null,
    record.isPromoted ? "Sélection" : null,
    record.isFeatured ? "Premium" : null,
  ].filter((badge): badge is string => badge != null);
}

function mapProductCard(record: ProductCardRecord): CommerceProductCard {
  const trail = firstSubcategory(record);

  return {
    id: Number(record.id),
    entityType: "PRODUCT",
    slug: record.slug,
    href: `/produits/${record.slug}`,
    sku: record.sku,
    name: record.displayName || record.name,
    subtitle: trail.subcategory?.name ?? null,
    summary: productSummary(record),
    brand: mapBrand(record.brand),
    category: trail.category,
    subcategory: trail.subcategory,
    image: firstImage(record),
    price: productPrice(record),
    stock: mapStock(record),
    badges: productBadges(record),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function visibleFamilyProducts(record: ProductFamilyRecord | ProductFamilyDetailRecord) {
  return record.members
    .map((member) => member.product)
    .filter((product) => product.visibleEcommerce);
}

function defaultFamilyProduct(record: ProductFamilyRecord | ProductFamilyDetailRecord) {
  const products = visibleFamilyProducts(record);
  const defaultProductId = record.defaultProductId == null ? null : Number(record.defaultProductId);

  return (
    products.find((product) => Number(product.id) === defaultProductId) ??
    products[0] ??
    null
  );
}

function mapFamilyCard(record: ProductFamilyRecord): CommerceProductCard | null {
  const defaultProduct = defaultFamilyProduct(record);
  if (!defaultProduct) {
    return null;
  }

  const trail = firstSubcategory(defaultProduct);
  const familyImage = mapMedia(record.mainImage);
  const productImage = firstImage(defaultProduct);

  return {
    id: Number(record.id),
    entityType: "FAMILY",
    slug: record.slug,
    href: `/produits/${record.slug}`,
    sku: defaultProduct.sku,
    name: record.name,
    subtitle: record.subtitle ?? trail.subcategory?.name ?? null,
    summary: richTextPlainText(record.description) ?? productSummary(defaultProduct),
    brand: mapBrand(defaultProduct.brand),
    category: trail.category,
    subcategory: trail.subcategory,
    image: familyImage ?? productImage,
    price: productPrice(defaultProduct),
    stock: mapStock(defaultProduct),
    badges: Array.from(new Set(["Gamme", ...productBadges(defaultProduct)])),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function categoryWhere(categorySlug?: string | null) {
  return {
    subcategories: {
      some: {
        subcategory: {
          isActive: true,
          visibleEcommerce: true,
          category: {
            isActive: true,
          },
          ...(categorySlug
            ? {
                OR: [
                  { slug: categorySlug },
                  { category: { slug: categorySlug, isActive: true } },
                ],
              }
            : {}),
        },
      },
    },
  } satisfies Prisma.ProductWhereInput;
}

function productSearchWhere(search?: string | null) {
  if (!search) {
    return undefined;
  }

  return {
    OR: [
      { sku: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
      { brand: { is: { name: { contains: search, mode: "insensitive" } } } },
      { attributes: { some: { value: { contains: search, mode: "insensitive" } } } },
    ],
  } satisfies Prisma.ProductWhereInput;
}

function productBaseWhere(input: {
  categorySlug?: string | null;
  brandSlug?: string | null;
  search?: string | null;
  standaloneOnly?: boolean;
}) {
  return {
    visibleEcommerce: true,
    kind: { in: ["STANDARD", "SINGLE", "VARIANT"] },
    ...(input.standaloneOnly
      ? {
          OR: [
            { kind: { in: ["STANDARD", "SINGLE"] } },
            { kind: "VARIANT", familyMembership: null },
          ],
        }
      : {}),
    ...(input.brandSlug ? { brand: { is: { slug: input.brandSlug } } } : {}),
    ...categoryWhere(input.categorySlug),
    ...productSearchWhere(input.search),
  } satisfies Prisma.ProductWhereInput;
}

function familyWhere(input: {
  categorySlug?: string | null;
  brandSlug?: string | null;
  search?: string | null;
}) {
  const productFilter = productBaseWhere({
    categorySlug: input.categorySlug,
    brandSlug: input.brandSlug,
    search: input.search,
  });

  return {
    members: {
      some: {
        product: productFilter,
      },
    },
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { subtitle: { contains: input.search, mode: "insensitive" as const } },
            { members: { some: { product: productSearchWhere(input.search) } } },
          ],
        }
      : {}),
  } satisfies Prisma.ProductFamilyWhereInput;
}

function sortCards(items: CommerceProductCard[], sort: string | null | undefined) {
  const next = [...items];

  if (sort === "name") {
    return next.sort((a, b) => a.name.localeCompare(b.name, "fr-TN"));
  }

  if (sort === "price-asc" || sort === "price-desc") {
    return next.sort((a, b) => {
      const left = a.price == null ? Number.POSITIVE_INFINITY : Number(a.price);
      const right = b.price == null ? Number.POSITIVE_INFINITY : Number(b.price);
      return sort === "price-asc" ? left - right : right - left;
    });
  }

  if (sort === "stock") {
    return next.sort((a, b) => Number(b.stock.available) - Number(a.stock.available));
  }

  return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getNavigationData() {
  const db = await getPrisma();
  const [categories, cartProductCount] = await Promise.all([
    getCommerceCategories(),
    db.product.count({ where: productBaseWhere({}) }),
  ]);

  return { categories, cartProductCount };
}

export async function getCommerceCategories(): Promise<CommerceCategory[]> {
  const db = await getPrisma();
  const categories = await db.productCategory.findMany({
    where: {
      isActive: true,
      subcategories: {
        some: {
          isActive: true,
          visibleEcommerce: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      subtitle: true,
      description: true,
      imageMedia: { select: MEDIA_SELECT },
      subcategories: {
        where: { isActive: true, visibleEcommerce: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          productLinks: {
            where: { product: { visibleEcommerce: true } },
            select: { productId: true },
          },
        },
      },
    },
  });

  return categories.map((category) => {
    const subcategories = category.subcategories.map((subcategory) => ({
      id: Number(subcategory.id),
      name: subcategory.name,
      slug: subcategory.slug,
      productCount: subcategory.productLinks.length,
    }));

    return {
      id: Number(category.id),
      name: category.name,
      slug: category.slug,
      subtitle: category.subtitle,
      description: category.description,
      imageUrl: category.imageMedia ? mediaUrl(category.imageMedia.id, "thumbnail") : null,
      productCount: subcategories.reduce((sum, subcategory) => sum + subcategory.productCount, 0),
      subcategories,
    };
  });
}

export async function getCommerceBrands(): Promise<CommerceBrand[]> {
  const db = await getPrisma();
  const brands = await db.organization.findMany({
    where: {
      isProductBrand: true,
      products: { some: productBaseWhere({}) },
    },
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      description: true,
      logoMedia: { select: MEDIA_SELECT },
    },
  });

  return brands.map((brand) => ({
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logoUrl:
      brand.logoMedia && isRenderableMedia(brand.logoMedia)
        ? mediaUrl(brand.logoMedia.id, "thumbnail")
        : null,
  }));
}

export async function listCommerceProducts(input: {
  category?: string | null;
  brand?: string | null;
  search?: string | null;
  sort?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<CommerceCatalogResult> {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? CATALOG_PAGE_SIZE;
  const db = await getPrisma();
  const [families, products, categories, brands] = await Promise.all([
    db.productFamily.findMany({
      where: familyWhere({
        categorySlug: input.category,
        brandSlug: input.brand,
        search: input.search,
      }),
      take: 120,
      select: PRODUCT_FAMILY_SELECT,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    }),
    db.product.findMany({
      where: productBaseWhere({
        categorySlug: input.category,
        brandSlug: input.brand,
        search: input.search,
        standaloneOnly: true,
      }),
      take: 160,
      select: PRODUCT_CARD_SELECT,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    }),
    getCommerceCategories(),
    getCommerceBrands(),
  ]);

  const cards = [
    ...families.map(mapFamilyCard).filter((card): card is CommerceProductCard => card != null),
    ...products.map(mapProductCard),
  ];
  const sorted = sortCards(cards, input.sort);
  const offset = (page - 1) * pageSize;
  const items = sorted.slice(offset, offset + pageSize);
  const activeCategory =
    categories.find((category) => category.slug === input.category) ??
    categories.find((category) =>
      category.subcategories.some((subcategory) => subcategory.slug === input.category),
    ) ??
    null;

  return {
    items,
    total: sorted.length,
    categories,
    brands,
    activeCategory,
  };
}

export async function getHomeData(): Promise<CommerceHomeData> {
  const [categories, brands, featured, latest] = await Promise.all([
    getCommerceCategories(),
    getCommerceBrands(),
    listCommerceProducts({ pageSize: 8, sort: "stock" }),
    listCommerceProducts({ pageSize: 8 }),
  ]);

  const promoted = featured.items.find((product) => product.image) ?? latest.items.find((product) => product.image);

  return {
    categories: categories.filter((category) => category.productCount > 0).slice(0, 8),
    heroProduct: promoted ?? latest.items[0] ?? null,
    featuredProducts: featured.items,
    latestProducts: latest.items,
    brands: brands.slice(0, 10),
  };
}

function mapAttribute(attribute: ProductDetailRecord["attributes"][number]): CommerceAttribute {
  const normalizedName = attribute.name.trim().toLowerCase();

  return {
    name: attribute.label || attribute.name,
    value: attribute.value,
    unit: attribute.unit,
    groupName: attribute.groupName || "Caractéristiques",
    groupSortOrder: attribute.groupSortOrder,
    sortOrder: attribute.sortOrder,
    specialType:
      normalizedName === "color" || attribute.inputType === "COLOR"
        ? "COLOR"
        : normalizedName === "finish" || attribute.inputType === "FINISH"
          ? "FINISH"
          : null,
  };
}

function mapVariant(record: ProductDetailRecord): CommerceVariant {
  const images = gallery(record).filter((media) => media.kind === "IMAGE");
  const price = productPrice(record);

  return {
    id: Number(record.id),
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    displayName: record.displayName || record.name,
    description: richTextJson(record.richTextDescription),
    summary: productSummary(record),
    price,
    stock: mapStock(record),
    images,
    datasheet: technicalMedia(record, "TECHNICAL"),
    certificate: technicalMedia(record, "CERTIFICATE"),
    attributes: record.attributes.map(mapAttribute),
    addToCart: {
      id: Number(record.id),
      sku: record.sku,
      name: record.displayName || record.name,
      price,
      imageUrl: images[0]?.thumbnailUrl ?? images[0]?.url ?? null,
    },
  };
}

function mapProductDetail(record: ProductDetailRecord): CommerceProductDetail {
  const variant = mapVariant(record);
  const trail = firstSubcategory(record);

  return {
    id: Number(record.id),
    entityType: "PRODUCT",
    slug: record.slug,
    name: record.displayName || record.name,
    subtitle: trail.subcategory?.name ?? null,
    description: variant.description,
    descriptionSeo: record.descriptionSeo,
    brand: mapBrand(record.brand),
    categoryTrail: [trail.category, trail.subcategory].filter(
      (entry): entry is { name: string; slug: string } => entry != null,
    ),
    coverImage: variant.images[0] ?? null,
    variants: [variant],
    relatedProducts: [],
  };
}

function mapFamilyDetail(record: ProductFamilyDetailRecord): CommerceProductDetail | null {
  const defaultProduct = defaultFamilyProduct(record);
  if (!defaultProduct) {
    return null;
  }

  const variants = record.members
    .map((member) => member.product)
    .filter((product) => product.visibleEcommerce)
    .map(mapVariant);
  const trail = firstSubcategory(defaultProduct);
  const familyImage = mapMedia(record.mainImage);

  return {
    id: Number(record.id),
    entityType: "FAMILY",
    slug: record.slug,
    name: record.name,
    subtitle: record.subtitle ?? trail.subcategory?.name ?? null,
    description: record.description ?? variants[0]?.description ?? null,
    descriptionSeo: record.descriptionSeo,
    brand: mapBrand(defaultProduct.brand),
    categoryTrail: [trail.category, trail.subcategory].filter(
      (entry): entry is { name: string; slug: string } => entry != null,
    ),
    coverImage: familyImage ?? variants[0]?.images[0] ?? null,
    variants,
    relatedProducts: [],
  };
}

export async function findCommerceProductBySlug(slug: string): Promise<CommerceProductDetail | null> {
  const db = await getPrisma();
  const [family, product] = await Promise.all([
    db.productFamily.findFirst({
      where: {
        slug,
        members: {
          some: VISIBLE_ECOMMERCE_FAMILY_MEMBER_WHERE,
        },
      },
      select: PRODUCT_FAMILY_DETAIL_SELECT,
    }),
    db.product.findFirst({
      where: {
        slug,
        ...productBaseWhere({}),
      },
      select: PRODUCT_DETAIL_SELECT,
    }),
  ]);

  const detail = family ? mapFamilyDetail(family) : product ? mapProductDetail(product) : null;
  if (!detail) {
    return null;
  }

  const related = await listCommerceProducts({
    category: detail.categoryTrail[0]?.slug,
    brand: detail.brand?.slug,
    pageSize: 5,
  });

  return {
    ...detail,
    relatedProducts: related.items.filter((item) => item.slug !== detail.slug).slice(0, 4),
  };
}

export async function getProductSlugs() {
  const db = await getPrisma();
  const [products, families] = await Promise.all([
    db.product.findMany({
      where: productBaseWhere({ standaloneOnly: true }),
      select: { slug: true },
      take: 100,
    }),
    db.productFamily.findMany({
      where: { members: { some: VISIBLE_ECOMMERCE_FAMILY_MEMBER_WHERE } },
      select: { slug: true },
      take: 100,
    }),
  ]);

  return [...products, ...families].map((entry) => entry.slug);
}
