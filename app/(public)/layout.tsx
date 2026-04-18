// @/app/(public)/layout.tsx

import { ReactNode } from "react";
import Footer from "@/layout/Footer";
import NavBar from "@/layout/NavBar";
import TopBar from "@/layout/TopBar";
import LenisProvider from "@/components/ui/custom/LenisProvider";
import { listPublicMegaMenuProductCategories } from "@/features/product-categories/public";
import { NavbarVisibilityProvider } from "@/layout/navbar-visibility";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const productCategories = await listPublicMegaMenuProductCategories();

  return (
    <LenisProvider>
      <NavbarVisibilityProvider>
        <TopBar />
        <NavBar productCategories={productCategories} />
        {children}
        <Footer />
      </NavbarVisibilityProvider>
    </LenisProvider>
  );
}
