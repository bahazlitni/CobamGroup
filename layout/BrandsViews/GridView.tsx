"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Brand as PublicBrand } from "@/lib/static_tables/brands";
import { scrollToIdCenter } from "@/lib/utils";
import GridViewBrandImageBlock from "./GridViewBrandImageBlock";

export default function GridView({ brands }: { brands: PublicBrand[] }) {
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
          <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-cobam-quill-grey/50 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
            {/* Logo area */}
            <GridViewBrandImageBlock brand={brand} />

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col px-5 pb-5 pt-4">
              <div className="mb-3">
                <h3
                  className="text-[1.4rem] font-bold leading-tight text-cobam-dark-blue"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {brand.name}
                </h3>
              </div>

              <p className="mb-5 text-sm leading-6 text-cobam-carbon-grey">
                {brand.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
