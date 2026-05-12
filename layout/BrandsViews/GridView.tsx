"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { scrollToIdCenter } from "@/lib/utils";
import GridViewBrandImageBlock from "./GridViewBrandImageBlock";
import type { PublicBrandViewItem } from "./types";

export default function GridView({ brands }: { brands: PublicBrandViewItem[] }) {
  // On mount, if there is a hash (#slug), center that card
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;

    const exists = brands.some((b) => b.slug === hash);
    if (!exists) return;

    const timeout = setTimeout(() => {
      scrollToIdCenter(hash);
    }, 50);

    return () => clearTimeout(timeout);
  }, [brands]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {brands.map((brand, index) => (
        <motion.div
          key={brand.name}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          className="group block h-full"
          id={brand.slug}
        >
          <div className="border-cobam-quill-grey/50 relative flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
            {/* Logo area */}
            <GridViewBrandImageBlock brand={brand} />

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col px-5 pt-4 pb-5">
              <div className="mb-3">
                <h3
                  className="text-cobam-dark-blue text-[1.4rem] leading-tight font-bold"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {brand.name}
                </h3>
              </div>

              <p className="text-cobam-carbon-grey mb-5 text-sm leading-6">{brand.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
