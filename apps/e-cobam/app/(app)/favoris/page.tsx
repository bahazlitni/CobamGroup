import type { Metadata } from "next";
import { FavoritesPageClient } from "@/components/favorites/favorites-page-client";

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Retrouvez les produits e-cobam que vous avez ajoutés à vos favoris.",
};

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
