import type { MetadataRoute } from "next";
import { buildAbsoluteUrl, getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/espace/", "/login/staff"],
      },
    ],
    sitemap: buildAbsoluteUrl("/sitemap.xml"),
    host: getSiteUrl().host,
  };
}
