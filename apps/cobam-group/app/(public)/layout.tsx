// @/app/(public)/layout.tsx

import { ReactNode } from "react";
import StructuredData from "@/components/seo/StructuredData";
import Footer from "@/layout/Footer";
import NavBar from "@/layout/NavBar";
import TopBar from "@/layout/TopBar";
import LenisProvider from "@/components/ui/custom/LenisProvider";
import { listPublicMegaMenuProductCategories } from "@/features/product-categories/public";
import { hasPublicActivePromotions } from "@/features/promotions/public";
import { NavbarVisibilityProvider } from "@/layout/navbar-visibility";
import { WhatsAppPopup } from "@/components/ui/custom/WhatsAppPopup";
import {
  buildOrganizationStructuredData,
  buildWebSiteStructuredData,
} from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [productCategories, hasPromotions] = await Promise.all([
    listPublicMegaMenuProductCategories(),
    hasPublicActivePromotions(),
  ]);

  return (
    <LenisProvider>
      <NavbarVisibilityProvider>
        <TopBar />
        <NavBar productCategories={productCategories} hasPromotions={hasPromotions} />
        <StructuredData
          data={[buildOrganizationStructuredData(), buildWebSiteStructuredData()]}
        />
        {children}
        <Footer productCategories={productCategories} />
        <WhatsAppPopup />
      </NavbarVisibilityProvider>
    </LenisProvider>
  );
}
