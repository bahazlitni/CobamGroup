import type { Metadata } from "next";
import { getArticlePlainText } from "@/features/articles/document";
import type { PublicProductCategoryPageData } from "@/features/product-categories/public-types";
import type { PublicProductBreadcrumb } from "./public-breadcrumb";
import type {
  PublicProductInspector,
  PublicProductInspectorAttribute,
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
  PublicSimpleProductInspector,
} from "./types";
import {
  buildAbsoluteUrl,
  getSiteName,
  toAbsoluteUrl,
} from "@/lib/seo/site";

const DEFAULT_DESCRIPTION =
  "Explorez les produits COBAM GROUP pour les revetements, sanitaires, materiaux de construction et finitions en Tunisie.";

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
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function resolveSeoDescription(
  ...candidates: Array<string | null | undefined>
) {
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
  const absoluteImageUrl = toAbsoluteUrl(input.imageUrl);

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.path,
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      type: "website",
      locale: "fr_TN",
      siteName: getSiteName(),
      url: buildAbsoluteUrl(input.path),
      title: input.title,
      description: input.description,
      images: absoluteImageUrl ? [{ url: absoluteImageUrl }] : undefined,
    },
    twitter: {
      card: absoluteImageUrl ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      images: absoluteImageUrl ? [absoluteImageUrl] : undefined,
    },
  };
}

function resolveInspectorImage(
  media: PublicProductInspectorMedia | null | undefined,
) {
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

function buildOffer(input: {
  path: string;
  price: string | null;
  priceVisibility: boolean;
}) {
  if (!input.priceVisibility || !input.price) {
    return undefined;
  }

  return {
    "@type": "Offer",
    priceCurrency: "TND",
    price: input.price,
    url: buildAbsoluteUrl(input.path),
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
  const description = resolveSeoDescription(
    input.variant.description,
    input.name,
  );

  return {
    "@type": "Product",
    name: input.name,
    sku: input.variant.sku,
    url: buildAbsoluteUrl(
      `${input.path}?variant=${encodeURIComponent(input.variant.slug)}`,
    ),
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
    offers: buildOffer({
      path: `${input.path}?variant=${encodeURIComponent(input.variant.slug)}`,
      price: input.variant.basePriceAmount,
      priceVisibility: input.variant.priceVisibility,
    }),
  };
}

export function buildFamilyMetadata(family: PublicProductInspector): Metadata {
  return buildMetadataBase({
    title: `${family.name} | ${getSiteName()}`,
    description: resolveSeoDescription(
      family.descriptionSeo,
      family.description,
      family.variants[0]?.description,
      family.name,
    ),
    path: `/produits/familles/${family.slug}`,
    imageUrl: resolveInspectorImage(family.coverMedia),
  });
}

export function buildSimpleProductMetadata(
  product: PublicSimpleProductInspector,
) {
  return buildMetadataBase({
    title: `${product.name} | ${getSiteName()}`,
    description: resolveSeoDescription(
      product.descriptionSeo,
      product.description,
      product.name,
    ),
    path:
      product.kind === "PACK"
        ? `/produits/packs/${product.slug}`
        : `/produits/${product.slug}`,
    imageUrl: product.media.find((media) => media.kind === "IMAGE")?.url ?? null,
  });
}

export function buildCategoryMetadata(
  category: PublicProductCategoryPageData,
): Metadata {
  return buildMetadataBase({
    title: `${category.name} | Produits | ${getSiteName()}`,
    description: resolveSeoDescription(
      category.descriptionSEO,
      category.description,
      category.name,
    ),
    path: category.href,
    imageUrl: category.imageUrl ?? category.imageThumbnailUrl,
  });
}

export function buildAllProductsMetadata(search: string | null): Metadata {
  const title = search
    ? `Recherche produits : ${search} | ${getSiteName()}`
    : `Tous les produits | ${getSiteName()}`;

  const description = search
    ? resolveSeoDescription(
        `Resultats de recherche pour ${search} dans le catalogue COBAM GROUP.`,
      )
    : resolveSeoDescription(
        "Consultez l'ensemble du catalogue COBAM GROUP : produits simples, packs et familles de produits.",
      );

  return buildMetadataBase({
    title,
    description,
    path: "/produits",
    noIndex: Boolean(search),
  });
}

export function buildFamilyStructuredData(family: PublicProductInspector) {
  const path = `/produits/familles/${family.slug}`;
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
      family.variants.flatMap((variant) =>
        variant.attributes.map((attribute) => attribute.name),
      ),
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
) {
  const path =
    product.kind === "PACK"
      ? `/produits/packs/${product.slug}`
      : `/produits/${product.slug}`;
  const imageUrls = product.media
    .filter((media) => media.kind === "IMAGE")
    .map((media) => buildAbsoluteUrl(media.url));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    url: buildAbsoluteUrl(path),
    description: resolveSeoDescription(
      product.descriptionSeo,
      product.description,
      product.name,
    ),
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
      product.attributes.length > 0
        ? product.attributes.map(mapAttributeToProperty)
        : undefined,
    offers: buildOffer({
      path,
      price: product.basePriceAmount,
      priceVisibility: product.priceVisibility,
    }),
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
