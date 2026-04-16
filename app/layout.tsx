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
import { getSiteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "COBAM GROUP | Carrelage, Sanitaire, Robinetterie",
  description:
    "Depuis 1994, COBAM GROUP est votre partenaire de confiance pour les materiaux de construction, carrelage, sanitaires et robinetterie en Tunisie.",
  applicationName: "COBAM GROUP",
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
      </body>
    </html>
  );
}
