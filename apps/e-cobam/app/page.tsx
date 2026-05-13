import type { Metadata } from "next";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { HeroSection } from "@/components/home/hero-section";
import { ProjectCtaSection } from "@/components/home/project-cta-section";
import { TrustSection } from "@/components/home/trust-section";
import { getLandingHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutique en ligne COBAM GROUP",
  description:
    "Explorez les produits COBAM GROUP pour matériaux, revêtements, sanitaires, peinture, étanchéité et finitions.",
};

export default async function HomePage() {
  const data = await getLandingHomeData();

  return (
    <main>
      <HeroSection
        heroProduct={data.heroProduct}
        productCount={data.diagnostics.productCount}
        categories={data.categories}
      />
      <CategoryShowcase categories={data.categories} />
      <FeaturedProductsSection products={data.products} />
      <TrustSection />
      <ProjectCtaSection />
    </main>
  );
}
