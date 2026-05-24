import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@fontsource/sora/300.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import "./globals.css";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { UndoToastProvider } from "@/components/undo/undo-toast-provider";
import { getCustomerSession } from "@/lib/customer-auth";
import { getSafeNavigationData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

const siteName = "e-cobam";
const siteDescription =
  "La boutique e-commerce COBAM GROUP pour matériaux, sanitaires, revêtements et finitions premium en Tunisie.";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: "e-cobam | Boutique COBAM GROUP",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_TN",
    siteName,
    title: "e-cobam | Boutique COBAM GROUP",
    description: siteDescription,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navigation, customerSession] = await Promise.all([
    getSafeNavigationData(),
    getCustomerSession(),
  ]);

  return (
    <html lang="fr">
      <body>
        <SiteHeader categories={navigation.categories} isSignedIn={customerSession !== null} />
        {children}
        <SiteFooter categories={navigation.categories} />
        <UndoToastProvider />
        <Toaster
          richColors
          closeButton
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "border-ec-line rounded-2xl bg-white text-ec-ink shadow-[0_18px_50px_rgba(20,32,46,0.14)]",
              title: "font-black",
              description: "text-ec-muted font-semibold",
            },
          }}
        />
      </body>
    </html>
  );
}
