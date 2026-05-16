import type { Metadata } from "next";
import { StorefrontHome } from "@/components/home/storefront-home";
import { getLandingHomeData } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutique en ligne COBAM GROUP",
  description:
    "Achetez et comparez les produits COBAM GROUP : matériaux, revêtements, sanitaires, peinture, étanchéité et finitions.",
};

export default async function HomePage() {
  const data = await getLandingHomeData();

  return <StorefrontHome data={data} />;
}
