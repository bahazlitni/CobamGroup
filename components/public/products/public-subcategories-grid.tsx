"use client";

import type { PublicProductSubcategoryCardData } from "@/features/product-categories/public-types";
import { withThemeAlpha } from "@/lib/theme-color";
import PublicSubcategoryCard from "./public-subcategory-card";
import { motion } from "framer-motion";

type PublicSubcategoriesGridProps = {
  subcategories: PublicProductSubcategoryCardData[];
  themeColor?: string | null;
};

export default function PublicSubcategoriesGrid({
  subcategories,
  themeColor,
}: PublicSubcategoriesGridProps) {
  if (subcategories.length === 0) {
    return (
      <div
        className="rounded-sm border border-dashed bg-white/80 px-6 py-14 text-center text-slate-500"
        style={{
          borderColor: withThemeAlpha(themeColor, 0.22),
          backgroundColor: withThemeAlpha(themeColor, 0.05),
        }}
      >
        Aucune sous-categorie publique n&apos;est disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {subcategories.map((subcategory, index) => (
        <motion.div
           key={subcategory.id}
           initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
           animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
           transition={{ duration: 0.9, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <PublicSubcategoryCard
            subcategory={subcategory}
            themeColor={themeColor}
          />
        </motion.div>
      ))}
    </div>
  );
}
