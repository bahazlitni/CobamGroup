import type { Metadata } from "next";
import { getArticlePlainText } from "@/features/articles/document";
import type { PublicProductCategoryPageData } from "@/features/product-categories/public-types";
import { buildSeoMetadata, truncateSeoText } from "@/lib/seo/metadata";
import type { PublicProductBreadcrumb } from "./public-breadcrumb";
import type {
  PublicProductInspector,
  PublicProductInspectorAttribute,
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
  PublicSimpleProductInspector,
} from "./types";
import { buildAbsoluteUrl } from "@/lib/seo/site";

const DEFAULT_DESCRIPTION =
  "Explorez les produits COBAM GROUP pour les revêtements, sanitaires, matériaux de construction et finitions en Tunisie.";

type BreadcrumbJsonLdItem = {
  name: string;
  path: string;
};

function toPlainText(value: string | null | undefined) {
  return getArticlePlainText(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength = 160) {
  return truncateSeoText(value, maxLength);
}

export function resolveSeoDescription(...candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    const text = toPlainText(candidate);
    if (text) {
      return truncateText(text);
    }
  }

  return DEFAULT_DESCRIPTION;
}

function buildMetadataBase(input: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
  noIndex?: boolean;
}): Metadata {
  return buildSeoMetadata(input);
}

function resolveInspectorImage(media: PublicProductInspectorMedia | null | undefined) {
  if (!media || media.kind !== "IMAGE") {
    return null;
  }

  return media.url;
}

function buildBreadcrumbItems(input: {
  breadcrumb?: PublicProductBreadcrumb | null;
  currentLabel: string;
}) {
  const items: BreadcrumbJsonLdItem[] = [
    { name: "Accueil", path: "/" },
    { name: "Produits", path: "/produits" },
  ];

  if (input.breadcrumb?.categorySlug) {
    items.push({
      name: input.breadcrumb.categoryName,
      path: `/produits/${input.breadcrumb.categorySlug}`,
    });
  }

  if (input.breadcrumb?.subcategorySlug && input.breadcrumb?.categorySlug) {
    items.push({
      name: input.breadcrumb.subcategoryName,
      path: `/produits/${input.breadcrumb.categorySlug}/${input.breadcrumb.subcategorySlug}`,
    });
  }

  items.push({
    name: input.currentLabel,
    path: "",
  });

  return items;
}

export function resolveSimpleProductCanonicalPath(
  product: PublicSimpleProductInspector,
  fallbackPath?: string,
) {
  const primarySubcategory = product.subcategories[0];

  if (!primarySubcategory) {
    return fallbackPath ?? `/produits/${product.slug}`;
  }

  return `/produits/${primarySubcategory.categorySlug}/${primarySubcategory.slug}/${product.slug}`;
}

export function resolveVariantFamilyCanonicalPath(
  product: PublicSimpleProductInspector,
  familySlug: string,
  fallbackPath?: string,
) {
  const primarySubcategory = product.subcategories[0];

  if (!primarySubcategory) {
    return fallbackPath ?? `/produits/familles/${familySlug}`;
  }

  return `/produits/${primarySubcategory.categorySlug}/${primarySubcategory.slug}/famille/${familySlug}`;
}

export function resolveFamilyCanonicalPath(family: PublicProductInspector, fallbackPath?: string) {
  const primarySubcategory = family.subcategories[0];

  if (!primarySubcategory) {
    return fallbackPath ?? `/produits/familles/${family.slug}`;
  }

  return `/produits/${primarySubcategory.categorySlug}/${primarySubcategory.slug}/famille/${family.slug}`;
}

export function buildBreadcrumbStructuredData(input: {
  breadcrumb?: PublicProductBreadcrumb | null;
  currentLabel: string;
  currentPath: string;
}) {
  const items = buildBreadcrumbItems({
    breadcrumb: input.breadcrumb,
    currentLabel: input.currentLabel,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path || input.currentPath),
    })),
  };
}

function mapAttributeToProperty(attribute: PublicProductInspectorAttribute) {
  return {
    "@type": "PropertyValue",
    name: attribute.name,
    value: attribute.value,
    unitText: attribute.unit ?? undefined,
  };
}

function buildVariantSchema(input: {
  variant: PublicProductInspectorVariant;
  path: string;
  name: string;
  brandName?: string | null;
}) {
  const imageUrls = input.variant.media
    .filter((media) => media.kind === "IMAGE")
    .map((media) => buildAbsoluteUrl(media.url));
  const description = resolveSeoDescription(input.variant.description, input.name);

  return {
    "@type": "Product",
    name: input.name,
    sku: input.variant.sku,
    url: buildAbsoluteUrl(`${input.path}?variant=${encodeURIComponent(input.variant.slug)}`),
    description,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    brand: input.brandName
      ? {
          "@type": "Brand",
          name: input.brandName,
        }
      : undefined,
    additionalProperty:
      input.variant.attributes.length > 0
        ? input.variant.attributes.map(mapAttributeToProperty)
        : undefined,
  };
}

export function buildFamilyMetadata(
  family: PublicProductInspector,
  options?: { path?: string },
): Metadata {
  const path = options?.path ?? resolveFamilyCanonicalPath(family);

  return buildMetadataBase({
    title: family.titleSeo.trim() || family.name,
    description: resolveSeoDescription(
      family.descriptionSeo,
      family.description,
      family.variants[0]?.description,
      family.name,
    ),
    path,
    imageUrl: resolveInspectorImage(family.coverMedia),
  });
}

export function buildSimpleProductMetadata(
  product: PublicSimpleProductInspector,
  options?: { path?: string; noIndex?: boolean },
) {
  const path = options?.path ?? resolveSimpleProductCanonicalPath(product);

  return buildMetadataBase({
    title: product.titleSeo?.trim() || product.displayName || product.name,
    description: resolveSeoDescription(product.descriptionSeo, product.description, product.name),
    path,
    noIndex: options?.noIndex,
    imageUrl: product.media.find((media) => media.kind === "IMAGE")?.url ?? null,
  });
}

export function buildCategoryMetadata(category: PublicProductCategoryPageData): Metadata {
  return buildMetadataBase({
    title: `${category.name} | Produits`,
    description: resolveSeoDescription(
      category.descriptionSEO,
      category.description,
      category.name,
    ),
    path: category.href,
    imageUrl: category.imageUrl ?? category.imageThumbnailUrl,
  });
}

type AllProductsMetadataInput =
  | string
  | {
      search: string | null;
      promoSlug?: string | null;
      promotion?: { slug: string; displayName: string } | null;
    };

export function buildAllProductsMetadata(input: AllProductsMetadataInput): Metadata {
  const search = typeof input === "string" ? input : input.search;
  const promoSlug = typeof input === "string" ? null : input.promoSlug?.trim() || null;
  const promotion = typeof input === "string" ? null : (input.promotion ?? null);
  const title = search
    ? `Recherche produits : ${search}`
    : promotion
      ? `Produits en promotion : ${promotion.displayName}`
      : "Tous les produits";

  const description = search
    ? resolveSeoDescription(`Résultats de recherche pour ${search} dans le catalogue COBAM GROUP.`)
    : promotion
      ? resolveSeoDescription(
          `Produits concernés par la promotion ${promotion.displayName} dans le catalogue COBAM GROUP.`,
        )
      : resolveSeoDescription(
          "Consultez l'ensemble du catalogue COBAM GROUP : produits simples et familles de produits.",
        );
  const isFilteredView = Boolean(search || promoSlug || promotion);

  return buildMetadataBase({
    title,
    description,
    path: promoSlug && !search ? `/produits?promo=${encodeURIComponent(promoSlug)}` : "/produits",
    noIndex: isFilteredView,
  });
}

export function buildFamilyStructuredData(
  family: PublicProductInspector,
  options?: { path?: string },
) {
  const path = options?.path ?? resolveFamilyCanonicalPath(family);
  const description = resolveSeoDescription(
    family.descriptionSeo,
    family.description,
    family.variants[0]?.description,
    family.name,
  );
  const imageUrl = resolveInspectorImage(family.coverMedia);
  const variants = family.variants.map((variant) =>
    buildVariantSchema({
      variant,
      path,
      name: variant.name,
      brandName: family.brandName,
    }),
  );
  const varyingAttributes = [
    ...new Set(
      family.variants.flatMap((variant) => variant.attributes.map((attribute) => attribute.name)),
    ),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: family.name,
    description,
    url: buildAbsoluteUrl(path),
    image: imageUrl ? [buildAbsoluteUrl(imageUrl)] : undefined,
    brand: family.brandName
      ? {
          "@type": "Brand",
          name: family.brandName,
        }
      : undefined,
    productGroupID: family.slug,
    variesBy: varyingAttributes.length > 0 ? varyingAttributes : undefined,
    hasVariant: variants,
  };
}

export function buildSimpleProductStructuredData(
  product: PublicSimpleProductInspector,
  options?: { path?: string },
) {
  const path = options?.path ?? resolveSimpleProductCanonicalPath(product);
  const imageUrls = product.media
    .filter((media) => media.kind === "IMAGE")
    .map((media) => buildAbsoluteUrl(media.url));

  // The main vitrine does not display price or stock, so it must not emit
  // Offer JSON-LD here. The e-commerce app owns Offer markup when visible.
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    url: buildAbsoluteUrl(path),
    description: resolveSeoDescription(product.descriptionSeo, product.description, product.name),
    image: imageUrls.length > 0 ? imageUrls : undefined,
    brand:
      product.brandNames.length > 0
        ? {
            "@type": "Brand",
            name: product.brandNames.join(", "),
          }
        : undefined,
    category:
      product.subcategories.length > 0
        ? product.subcategories.map((subcategory) => subcategory.name).join(", ")
        : undefined,
    additionalProperty:
      product.attributes.length > 0 ? product.attributes.map(mapAttributeToProperty) : undefined,
  };
}

export function buildCollectionPageStructuredData(input: {
  name: string;
  path: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    url: buildAbsoluteUrl(input.path),
    description: input.description,
  };
}
