import type { Metadata } from "next";
import "@fontsource/sora/300.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/source-serif-4/700.css";
import "react-phone-number-input/style.css";
import "./globals.css";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@next/third-parties/google";
import { buildAbsoluteUrl, getSiteName, getSiteUrl } from "@/lib/seo/site";
import {
  DEFAULT_OPEN_GRAPH_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
} from "@/lib/seo/metadata";

const siteName = getSiteName();
const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: DEFAULT_SITE_TITLE,
    template: `%s | ${siteName}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  applicationName: siteName,
  authors: [{ name: siteName, url: buildAbsoluteUrl("/") }],
  creator: siteName,
  publisher: siteName,
  category: "construction materials",
  alternates: {
    canonical: "/",
    languages: {
      "fr-TN": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_TN",
    siteName,
    url: buildAbsoluteUrl("/"),
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [
      {
        url: buildAbsoluteUrl(DEFAULT_OPEN_GRAPH_IMAGE),
        alt: "COBAM GROUP - matériaux, carrelage, sanitaires et finitions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [buildAbsoluteUrl(DEFAULT_OPEN_GRAPH_IMAGE)],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className="antialiased bg-white text-cobam-dark-blue"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {children}
        <Toaster richColors closeButton />
        {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
      </body>
    </html>
  );
}
