import { Prisma } from "@prisma/client";

type RawCategoryRow = {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  image_media_id: bigint | null;
  product_count: bigint;
};

type RawSubcategoryRow = {
  category_id: bigint;
  id: bigint;
  name: string;
  slug: string;
  product_count: bigint;
};

type RawBrandRow = {
  name: string;
  slug: string;
  description: string | null;
  logo_media_id: bigint | null;
  product_count: bigint;
};

type RawProductRow = {
  id: bigint;
  sku: string;
  slug: string;
  name: string;
  display_name: string | null;
  current_price_ttc_tnd: Prisma.Decimal | string | number | null;
  base_price_ttc_tnd: Prisma.Decimal | string | number | null;
  price_visibility: string;
  stock_available: Prisma.Decimal | string | number;
  stock_availability: string;
  stock_unit: string;
  is_featured: boolean;
  is_new: boolean;
  updated_at: Date;
  brand_name: string | null;
  brand_slug: string | null;
  category_name: string | null;
  category_slug: string | null;
  subcategory_name: string | null;
  subcategory_slug: string | null;
  media_id: bigint | null;
  media_title: string | null;
  media_alt_text: string | null;
};

export type LandingCategory = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  productCount: number | null;
  href: string;
  isFallback?: boolean;
  subcategories: {
    id: number;
    name: string;
    slug: string;
    productCount: number;
  }[];
};

export type LandingProduct = {
  id: number;
  sku: string;
  slug: string;
  href: string;
  name: string;
  summary: string | null;
  brandName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  subcategoryName: string | null;
  image: {
    url: string;
    thumbnailUrl: string;
    altText: string;
  } | null;
  price: string | null;
  stock: {
    available: string;
    unit: string;
    label: string;
    tone: "available" | "warning" | "unavailable";
  };
  badges: string[];
  updatedAt: string;
};

export type LandingBrand = {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  productCount: number;
  href: string;
};

export type LandingProductsState =
  | { status: "ready"; items: LandingProduct[] }
  | { status: "empty"; items: [] }
  | { status: "error"; items: []; message: string };

export type LandingHomeData = {
  categories: LandingCategory[];
  products: LandingProductsState;
  promotedProducts: LandingProductsState;
  latestProducts: LandingProductsState;
  brands: LandingBrand[];
  heroProduct: LandingProduct | null;
  diagnostics: {
    productCount: number | null;
    subcategoryVisibilityColumnsAvailable: boolean | null;
  };
};

const STATIC_CATEGORIES: LandingCategory[] = [
  {
    id: -1,
    name: "Revêtements de sols et murs",
    slug: "revetements-sols-murs",
    subtitle: "Carrelage, faïence, mosaïque et grandes dalles",
    description: null,
    imageUrl: null,
    productCount: null,
    href: "/catalogue?search=carrelage",
    isFallback: true,
    subcategories: [],
  },
  {
    id: -2,
    name: "Matériaux de construction",
    slug: "materiaux-construction",
    subtitle: "Ciments, briques, sables, graviers et fers",
    description: null,
    imageUrl: null,
    productCount: null,
    href: "/catalogue?search=ciment",
    isFallback: true,
    subcategories: [],
  },
  {
    id: -3,
    name: "Isolation et étanchéité",
    slug: "isolation-etancheite",
    subtitle: "Solutions techniques pour protéger le bâti",
    description: null,
    imageUrl: null,
    productCount: null,
    href: "/catalogue?search=étanchéité",
    isFallback: true,
    subcategories: [],
  },
  {
    id: -4,
    name: "Salle de bain et cuisine",
    slug: "salle-bain-cuisine",
    subtitle: "Sanitaires, robinetterie, éviers et douche",
    description: null,
    imageUrl: null,
    productCount: null,
    href: "/catalogue?search=mitigeur",
    isFallback: true,
    subcategories: [],
  },
  {
    id: -5,
    name: "Peintures et décoration",
    slug: "peintures-decoration",
    subtitle: "Peintures, enduits, couleurs et finitions",
    description: null,
    imageUrl: null,
    productCount: null,
    href: "/catalogue?search=peinture",
    isFallback: true,
    subcategories: [],
  },
  {
    id: -6,
    name: "Piscine",
    slug: "piscine",
    subtitle: "Margelles, mosaïques et finitions extérieures",
    description: null,
    imageUrl: null,
    productCount: null,
    href: "/catalogue?search=piscine",
    isFallback: true,
    subcategories: [],
  },
  {
    id: -7,
    name: "Portes et menuiserie",
    slug: "portes-menuiserie",
    subtitle: "Portes, châssis et solutions de fermeture",
    description: null,
    imageUrl: null,
    productCount: null,
    href: "/catalogue?search=porte",
    isFallback: true,
    subcategories: [],
  },
];

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

function mediaUrl(id: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${id.toString()}/file${query}`;
}

function toNumber(value: bigint | number | Prisma.Decimal | string | null | undefined) {
  if (value == null) {
    return null;
  }

  const parsed = Number(value.toString());
  return Number.isFinite(parsed) ? parsed : null;
}

function decimalToString(value: Prisma.Decimal | string | number | null | undefined) {
  if (value == null) {
    return null;
  }

  return value.toString();
}

function stockLabel(availability: string, stockAvailable: Prisma.Decimal | string | number) {
  const amount = toNumber(stockAvailable) ?? 0;

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

function productPrice(row: RawProductRow) {
  if (row.price_visibility === "NEVER") {
    return null;
  }

  return decimalToString(row.current_price_ttc_tnd ?? row.base_price_ttc_tnd);
}

function productBadges(row: RawProductRow) {
  return [
    row.is_new ? "Nouveau" : null,
    row.is_featured ? "Premium" : null,
  ].filter((badge): badge is string => badge != null);
}

function mapCategoryRow(row: RawCategoryRow): LandingCategory {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    subtitle: row.subtitle,
    description: row.description,
    imageUrl: row.image_media_id == null ? null : mediaUrl(row.image_media_id, "thumbnail"),
    productCount: Number(row.product_count),
    href: `/catalogue?categorie=${row.slug}`,
    subcategories: [],
  };
}

function mapSubcategoryRow(row: RawSubcategoryRow) {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    productCount: Number(row.product_count),
  };
}

function mapBrandRow(row: RawBrandRow): LandingBrand {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_media_id == null ? null : mediaUrl(row.logo_media_id, "thumbnail"),
    productCount: Number(row.product_count),
    href: `/catalogue?marque=${row.slug}`,
  };
}

function mapProductRow(row: RawProductRow): LandingProduct {
  const stock = stockLabel(row.stock_availability, row.stock_available);
  const productName = row.display_name?.trim() || row.name;
  const imageAlt = row.media_alt_text?.trim() || row.media_title?.trim() || productName;

  return {
    id: Number(row.id),
    sku: row.sku,
    slug: row.slug,
    href: `/produits/${row.slug}`,
    name: productName,
    summary: null,
    brandName: row.brand_name,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    subcategoryName: row.subcategory_name,
    image:
      row.media_id == null
        ? null
        : {
            url: mediaUrl(row.media_id, "original"),
            thumbnailUrl: mediaUrl(row.media_id, "thumbnail"),
            altText: imageAlt,
          },
    price: productPrice(row),
    stock: {
      available: row.stock_available.toString(),
      unit: row.stock_unit,
      label: stock.label,
      tone: stock.tone,
    },
    badges: productBadges(row),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function hasSubcategoryVisibilityColumns() {
  const db = await getPrisma();
  const columns = await db.$queryRaw<Array<{ column_name: string }>>(Prisma.sql`
    SELECT "column_name"
    FROM "information_schema"."columns"
    WHERE "table_schema" = 'public'
      AND "table_name" = 'product_subcategories'
      AND "column_name" IN ('visible_ecommerce', 'visible_vitrine')
  `);

  return columns.length === 2;
}

async function fetchLandingCategories(hasVisibilityColumns: boolean) {
  const db = await getPrisma();
  const subcategoryVisibilityFilter = hasVisibilityColumns
    ? Prisma.sql`AND "s"."visible_ecommerce" = true`
    : Prisma.empty;

  const rows = await db.$queryRaw<RawCategoryRow[]>(Prisma.sql`
    SELECT
      "c"."id",
      "c"."name",
      "c"."slug",
      "c"."subtitle",
      "c"."description",
      "c"."image_media_id",
      COUNT(DISTINCT "p"."id")::bigint AS "product_count"
    FROM "product_types" "c"
    JOIN "product_subcategories" "s"
      ON "s"."category_id" = "c"."id"
      AND "s"."is_active" = true
      ${subcategoryVisibilityFilter}
    LEFT JOIN "product_subcategory_links" "l"
      ON "l"."subcategory_id" = "s"."id"
    LEFT JOIN "products" "p"
      ON "p"."id" = "l"."product_id"
      AND "p"."visible_ecommerce" = true
      AND "p"."kind" IN ('STANDARD', 'SINGLE', 'VARIANT')
    WHERE "c"."is_active" = true
    GROUP BY
      "c"."id",
      "c"."name",
      "c"."slug",
      "c"."subtitle",
      "c"."description",
      "c"."image_media_id",
      "c"."sort_order"
    ORDER BY "c"."sort_order" ASC, "c"."name" ASC
    LIMIT 8
  `);

  const categories = rows.map(mapCategoryRow);
  const categoryIds = categories.map((category) => BigInt(category.id));

  if (categoryIds.length === 0) {
    return [];
  }

  const subcategoryRows = await db.$queryRaw<RawSubcategoryRow[]>(Prisma.sql`
    SELECT
      "s"."category_id",
      "s"."id",
      "s"."name",
      "s"."slug",
      COUNT(DISTINCT "p"."id")::bigint AS "product_count"
    FROM "product_subcategories" "s"
    LEFT JOIN "product_subcategory_links" "l"
      ON "l"."subcategory_id" = "s"."id"
    LEFT JOIN "products" "p"
      ON "p"."id" = "l"."product_id"
      AND "p"."visible_ecommerce" = true
      AND "p"."kind" IN ('STANDARD', 'SINGLE', 'VARIANT')
    WHERE "s"."category_id" IN (${Prisma.join(categoryIds)})
      AND "s"."is_active" = true
      ${subcategoryVisibilityFilter}
    GROUP BY "s"."category_id", "s"."id", "s"."name", "s"."slug", "s"."sort_order"
    ORDER BY "s"."sort_order" ASC, "s"."name" ASC
  `);
  const subcategoriesByCategory = new Map<number, LandingCategory["subcategories"]>();

  for (const row of subcategoryRows) {
    const categoryId = Number(row.category_id);
    const subcategories = subcategoriesByCategory.get(categoryId) ?? [];
    subcategories.push(mapSubcategoryRow(row));
    subcategoriesByCategory.set(categoryId, subcategories);
  }

  return categories
    .map((category) => ({
      ...category,
      subcategories: subcategoriesByCategory.get(category.id) ?? [],
    }))
    .filter((category) => category.subcategories.length > 0);
}

async function fetchLandingBrands(hasVisibilityColumns: boolean) {
  const db = await getPrisma();
  const subcategoryVisibilityFilter = hasVisibilityColumns
    ? Prisma.sql`AND "s"."visible_ecommerce" = true`
    : Prisma.empty;

  const rows = await db.$queryRaw<RawBrandRow[]>(Prisma.sql`
    SELECT
      "brand"."name",
      "brand"."slug",
      "brand"."description",
      "brand"."logo_media_id",
      COUNT(DISTINCT "p"."id")::bigint AS "product_count"
    FROM "organizations" "brand"
    JOIN "products" "p"
      ON "p"."brand_id" = "brand"."id"
      AND "p"."visible_ecommerce" = true
      AND "p"."kind" IN ('STANDARD', 'SINGLE', 'VARIANT')
    WHERE "brand"."is_product_brand" = true
      AND EXISTS (
        SELECT 1
        FROM "product_subcategory_links" "l"
        JOIN "product_subcategories" "s"
          ON "s"."id" = "l"."subcategory_id"
          AND "s"."is_active" = true
          ${subcategoryVisibilityFilter}
        JOIN "product_types" "c"
          ON "c"."id" = "s"."category_id"
          AND "c"."is_active" = true
        WHERE "l"."product_id" = "p"."id"
      )
    GROUP BY
      "brand"."id",
      "brand"."name",
      "brand"."slug",
      "brand"."description",
      "brand"."logo_media_id"
    ORDER BY COUNT(DISTINCT "p"."id") DESC, "brand"."name" ASC
    LIMIT 16
  `);

  return rows.map(mapBrandRow);
}

async function fetchLandingProducts(
  hasVisibilityColumns: boolean,
  options: { limit?: number; promotedOnly?: boolean; latestFirst?: boolean } = {},
) {
  const db = await getPrisma();
  const subcategoryVisibilityFilter = hasVisibilityColumns
    ? Prisma.sql`AND "s"."visible_ecommerce" = true`
    : Prisma.empty;
  const activePromotionFilter = Prisma.sql`
    EXISTS (
      SELECT 1
      FROM "commerce_promotions" "promotion"
      WHERE "promotion"."status" = 'ACTIVE'
        AND ("promotion"."starts_at" IS NULL OR "promotion"."starts_at" <= NOW())
        AND ("promotion"."ends_at" IS NULL OR "promotion"."ends_at" >= NOW())
        AND (
          EXISTS (
            SELECT 1
            FROM "commerce_promotion_products" "promotion_product"
            WHERE "promotion_product"."promotion_id" = "promotion"."id"
              AND "promotion_product"."product_id" = "p"."id"
          )
          OR (
            "p"."brand_id" IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM "commerce_promotion_brands" "promotion_brand"
              WHERE "promotion_brand"."promotion_id" = "promotion"."id"
                AND "promotion_brand"."brand_id" = "p"."brand_id"
            )
          )
          OR EXISTS (
            SELECT 1
            FROM "commerce_promotion_categories" "promotion_category"
            JOIN "product_subcategory_links" "promotion_link"
              ON "promotion_link"."product_id" = "p"."id"
            JOIN "product_subcategories" "promotion_subcategory"
              ON "promotion_subcategory"."id" = "promotion_link"."subcategory_id"
            WHERE "promotion_category"."promotion_id" = "promotion"."id"
              AND "promotion_category"."category_id" = "promotion_subcategory"."category_id"
          )
        )
    )
  `;
  const promotedFilter = options.promotedOnly
    ? Prisma.sql`AND ${activePromotionFilter}`
    : Prisma.empty;
  const orderBy = options.latestFirst
    ? Prisma.sql`
      ("image"."media_id" IS NOT NULL) DESC,
      "p"."is_new" DESC,
      "p"."updated_at" DESC,
      "p"."stock_available" DESC
    `
    : Prisma.sql`
      ("image"."media_id" IS NOT NULL) DESC,
      "p"."is_featured" DESC,
      "p"."is_new" DESC,
      "p"."stock_available" DESC,
      "p"."updated_at" DESC
    `;
  const limit = options.limit ?? 8;

  const rows = await db.$queryRaw<RawProductRow[]>(Prisma.sql`
    SELECT
      "p"."id",
      "p"."sku",
      "p"."slug",
      "p"."name",
      "p"."display_name",
      "p"."current_price_ttc_tnd",
      "p"."base_price_ttc_tnd",
      "p"."price_visibility"::text,
      "p"."stock_available",
      "p"."stock_availability"::text,
      "p"."stock_unit"::text,
      "p"."is_featured",
      "p"."is_new",
      "p"."updated_at",
      "brand"."name" AS "brand_name",
      "brand"."slug" AS "brand_slug",
      "trail"."category_name",
      "trail"."category_slug",
      "trail"."subcategory_name",
      "trail"."subcategory_slug",
      "image"."media_id",
      "image"."media_title",
      "image"."media_alt_text"
    FROM "products" "p"
    LEFT JOIN "organizations" "brand"
      ON "brand"."id" = "p"."brand_id"
    JOIN LATERAL (
      SELECT
        "c"."name" AS "category_name",
        "c"."slug" AS "category_slug",
        "s"."name" AS "subcategory_name",
        "s"."slug" AS "subcategory_slug"
      FROM "product_subcategory_links" "l"
      JOIN "product_subcategories" "s"
        ON "s"."id" = "l"."subcategory_id"
        AND "s"."is_active" = true
        ${subcategoryVisibilityFilter}
      JOIN "product_types" "c"
        ON "c"."id" = "s"."category_id"
        AND "c"."is_active" = true
      WHERE "l"."product_id" = "p"."id"
      ORDER BY "c"."sort_order" ASC, "s"."sort_order" ASC, "s"."name" ASC
      LIMIT 1
    ) "trail" ON true
    LEFT JOIN LATERAL (
      SELECT
        "m"."id" AS "media_id",
        COALESCE("pm"."name", "m"."title", "m"."original_filename") AS "media_title",
        COALESCE("pm"."alt_text", "m"."alt_text") AS "media_alt_text"
      FROM "product_media" "pm"
      JOIN "media" "m"
        ON "m"."id" = "pm"."media_id"
        AND "m"."kind" = 'IMAGE'
        AND "m"."is_active" = true
        AND "m"."deleted_at" IS NULL
      WHERE "pm"."product_id" = "p"."id"
        AND "pm"."role" = 'GALLERY'
      ORDER BY "pm"."sort_order" ASC, "pm"."media_id" ASC
      LIMIT 1
    ) "image" ON true
    WHERE "p"."visible_ecommerce" = true
      AND "p"."kind" IN ('STANDARD', 'SINGLE', 'VARIANT')
      ${promotedFilter}
    ORDER BY ${orderBy}
    LIMIT ${limit}
  `);

  return rows.map(mapProductRow);
}

async function fetchVisibleProductCount() {
  const db = await getPrisma();
  return db.product.count({
    where: {
      visibleEcommerce: true,
      kind: { in: ["STANDARD", "SINGLE", "VARIANT"] },
      subcategories: {
        some: {
          subcategory: {
            is: {
              isActive: true,
              visibleEcommerce: true,
              category: {
                is: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

function logLandingDataError(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[e-cobam] ${scope}`, error);
  }
}

export async function getSafeNavigationData() {
  try {
    const hasVisibilityColumns = await hasSubcategoryVisibilityColumns();
    const categories = await fetchLandingCategories(hasVisibilityColumns);

    return {
      categories: categories.length > 0 ? categories : STATIC_CATEGORIES,
      cartProductCount: null,
    };
  } catch (error) {
    logLandingDataError("navigation data failed", error);
    return {
      categories: STATIC_CATEGORIES,
      cartProductCount: null,
    };
  }
}

export async function getLandingHomeData(): Promise<LandingHomeData> {
  let hasVisibilityColumns: boolean | null = null;
  let productCount: number | null = null;

  try {
    hasVisibilityColumns = await hasSubcategoryVisibilityColumns();
  } catch (error) {
    logLandingDataError("subcategory visibility inspection failed", error);
  }

  const categoriesPromise =
    hasVisibilityColumns == null
      ? Promise.resolve(STATIC_CATEGORIES)
      : fetchLandingCategories(hasVisibilityColumns).catch((error) => {
          logLandingDataError("category query failed", error);
          return STATIC_CATEGORIES;
        });

  const productsPromise =
    hasVisibilityColumns == null
      ? Promise.resolve<LandingProductsState>({
          status: "error",
          items: [],
          message: "Impossible de charger les produits pour le moment.",
        })
      : fetchLandingProducts(hasVisibilityColumns)
          .then<LandingProductsState>((items) =>
            items.length > 0 ? { status: "ready", items } : { status: "empty", items: [] },
          )
          .catch((error) => {
            logLandingDataError("product query failed", error);
            return {
              status: "error",
              items: [],
              message: "Impossible de charger les produits pour le moment.",
            } satisfies LandingProductsState;
          });

  const promotedProductsPromise =
    hasVisibilityColumns == null
      ? Promise.resolve<LandingProductsState>({
          status: "error",
          items: [],
          message: "Impossible de charger les promotions pour le moment.",
        })
      : fetchLandingProducts(hasVisibilityColumns, { limit: 8, promotedOnly: true })
          .then<LandingProductsState>((items) =>
            items.length > 0 ? { status: "ready", items } : { status: "empty", items: [] },
          )
          .catch((error) => {
            logLandingDataError("promoted product query failed", error);
            return {
              status: "error",
              items: [],
              message: "Impossible de charger les promotions pour le moment.",
            } satisfies LandingProductsState;
          });

  const latestProductsPromise =
    hasVisibilityColumns == null
      ? Promise.resolve<LandingProductsState>({
          status: "error",
          items: [],
          message: "Impossible de charger les nouveautés pour le moment.",
        })
      : fetchLandingProducts(hasVisibilityColumns, { limit: 8, latestFirst: true })
          .then<LandingProductsState>((items) =>
            items.length > 0 ? { status: "ready", items } : { status: "empty", items: [] },
          )
          .catch((error) => {
            logLandingDataError("latest product query failed", error);
            return {
              status: "error",
              items: [],
              message: "Impossible de charger les nouveautés pour le moment.",
            } satisfies LandingProductsState;
          });

  const brandsPromise =
    hasVisibilityColumns == null
      ? Promise.resolve<LandingBrand[]>([])
      : fetchLandingBrands(hasVisibilityColumns).catch((error) => {
          logLandingDataError("brand query failed", error);
          return [];
        });

  const countPromise = fetchVisibleProductCount().catch((error) => {
    logLandingDataError("product count query failed", error);
    return null;
  });

  const [categories, products, promotedProducts, latestProducts, brands] = await Promise.all([
    categoriesPromise,
    productsPromise,
    promotedProductsPromise,
    latestProductsPromise,
    brandsPromise,
  ]);
  productCount = await countPromise;

  return {
    categories: categories.length > 0 ? categories : STATIC_CATEGORIES,
    products,
    promotedProducts,
    latestProducts,
    brands,
    heroProduct: products.status === "ready" ? products.items.find((product) => product.image) ?? products.items[0] : null,
    diagnostics: {
      productCount,
      subcategoryVisibilityColumnsAvailable: hasVisibilityColumns,
    },
  };
}
