import type { Metadata } from "next";
import { buildAbsoluteUrl, getSiteName, toAbsoluteUrl } from "@/lib/seo/site";

export const DEFAULT_SITE_TITLE =
  "COBAM GROUP | Matériaux, carrelage, sanitaires et finitions en Tunisie";

export const DEFAULT_SITE_DESCRIPTION =
  "Depuis 1994, COBAM GROUP accompagne les projets de construction, rénovation et finition avec des matériaux, surfaces, sanitaires et solutions premium en Tunisie.";

export const DEFAULT_OPEN_GRAPH_IMAGE = "/images/hero-section/2.jpg";

type SeoMetadataInput = {
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  noIndex?: boolean;
  follow?: boolean;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
};

function normalizePageTitle(title: string) {
  const siteName = getSiteName();
  const escapedSiteName = siteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\s*[|\\-]\\s*${escapedSiteName}\\s*$`, "i");
  const normalized = title.replace(pattern, "").trim();

  return normalized || title;
}

export function truncateSeoText(value: string, maxLength = 160) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function buildSeoMetadata(input: SeoMetadataInput): Metadata {
  const siteName = getSiteName();
  const title = normalizePageTitle(input.title);
  const description = truncateSeoText(input.description);
  const absoluteImageUrl = toAbsoluteUrl(input.imageUrl ?? DEFAULT_OPEN_GRAPH_IMAGE);
  const shouldIndex = !input.noIndex;
  const shouldFollow = input.follow ?? true;
  const openGraphImage = absoluteImageUrl
    ? [
        {
          url: absoluteImageUrl,
          alt: input.imageAlt ?? title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: input.path,
    },
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: input.type ?? "website",
      locale: "fr_TN",
      siteName,
      url: buildAbsoluteUrl(input.path),
      title,
      description,
      images: openGraphImage,
      publishedTime: input.publishedTime ?? undefined,
      modifiedTime: input.modifiedTime ?? undefined,
      authors: input.authors,
    },
    twitter: {
      card: openGraphImage ? "summary_large_image" : "summary",
      title,
      description,
      images: absoluteImageUrl ? [absoluteImageUrl] : undefined,
    },
  };
}
