import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import Footer from "@/layout/Footer";
import NavBar from "@/layout/NavBar";
import TopBar from "@/layout/TopBar";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "COBAM GROUP | Carrelage, Sanitaire, Robinetterie",
  description:
    "Depuis 1994, COBAM GROUP est votre partenaire de confiance pour les matériaux de construction, carrelage, sanitaires et robinetterie en Tunisie.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${montserrat.variable} ${playfair.variable} antialiased bg-white text-cobam-dark-blue`}
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        <TopBar />
        <NavBar />
        {children}
        <Toaster richColors closeButton />

        <Footer />
      </body>
    </html>
  );
}
