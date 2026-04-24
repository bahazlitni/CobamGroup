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
import { buildAbsoluteUrl, getSiteName, getSiteUrl } from "@/lib/seo/site";
import { GoogleAnalytics } from "@next/third-parties/google"

const siteName = getSiteName();
const siteDescription =
  "Depuis 1994, COBAM GROUP accompagne les projets de construction, renovation et finition avec des Matériaux, surfaces, sanitaires et solutions premium en Tunisie.";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "COBAM GROUP | Matériaux, carrelage, sanitaires et finitions en Tunisie",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_TN",
    siteName,
    url: buildAbsoluteUrl("/"),
    title: "COBAM GROUP | Matériaux, carrelage, sanitaires et finitions en Tunisie",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "COBAM GROUP | Matériaux, carrelage, sanitaires et finitions en Tunisie",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head />
      <body
        className="antialiased bg-white text-cobam-dark-blue"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {children}
        <Toaster richColors closeButton />
        <GoogleAnalytics gaId="G-XXXXXX" />
      </body>
    </html>
  );
}
