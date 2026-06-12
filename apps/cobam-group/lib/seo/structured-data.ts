import {
  DEFAULT_OPEN_GRAPH_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
} from "@/lib/seo/metadata";
import { buildAbsoluteUrl, getSiteName } from "@/lib/seo/site";

const SOCIAL_PROFILE_URLS = [
  "https://www.facebook.com/cobamgrp",
  "https://www.instagram.com/cobamgroup/",
  "https://www.youtube.com/@cobamgroup",
  "https://www.linkedin.com/company/cobam-group/",
  "https://www.tiktok.com/@cobam.group",
  "https://www.pinterest.com/cobamgroup/",
];

export function buildOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": buildAbsoluteUrl("/#organization"),
    name: getSiteName(),
    url: buildAbsoluteUrl("/"),
    logo: buildAbsoluteUrl("/images/logos/cobam-group/logo-vector-square.svg"),
    image: buildAbsoluteUrl(DEFAULT_OPEN_GRAPH_IMAGE),
    description: DEFAULT_SITE_DESCRIPTION,
    foundingDate: "1994",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Houmt Souk",
      addressRegion: "Djerba",
      addressCountry: "TN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+21675731731",
        contactType: "customer service",
        areaServed: "TN",
        availableLanguage: ["fr", "ar"],
      },
    ],
    sameAs: SOCIAL_PROFILE_URLS,
  };
}

export function buildWebSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": buildAbsoluteUrl("/#website"),
    name: getSiteName(),
    url: buildAbsoluteUrl("/"),
    publisher: {
      "@id": buildAbsoluteUrl("/#organization"),
    },
    inLanguage: "fr-TN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: buildAbsoluteUrl("/produits?search={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildArticleStructuredData(input: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  authors: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.imageUrl ? [buildAbsoluteUrl(input.imageUrl)] : undefined,
    datePublished: input.publishedAt ?? input.updatedAt,
    dateModified: input.updatedAt,
    author:
      input.authors.length > 0
        ? input.authors.map((name) => ({
            "@type": "Person",
            name,
          }))
        : {
            "@type": "Organization",
            "@id": buildAbsoluteUrl("/#organization"),
            name: getSiteName(),
          },
    publisher: {
      "@type": "Organization",
      "@id": buildAbsoluteUrl("/#organization"),
      name: getSiteName(),
      logo: {
        "@type": "ImageObject",
        url: buildAbsoluteUrl("/images/logos/cobam-group/logo-vector-square.svg"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": buildAbsoluteUrl(input.path),
    },
  };
}

export function buildBreadcrumbListStructuredData(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  };
}

export function buildItemListStructuredData(input: {
  name: string;
  path: string;
  items: Array<{ name: string; path: string; imageUrl?: string | null }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: buildAbsoluteUrl(input.path),
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildAbsoluteUrl(item.path),
      name: item.name,
      image: item.imageUrl ? buildAbsoluteUrl(item.imageUrl) : undefined,
    })),
  };
}
