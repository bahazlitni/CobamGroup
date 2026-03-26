"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { PublicBrand } from "@/features/brands/public";
import { scrollToIdCenter } from "@/lib/utils";

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
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-cobam-quill-grey/50 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
            {/* Logo area */}
            <div className="relative z-10 px-5 pt-5">
              <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-cobam-quill-grey/40 bg-gradient-to-b from-white to-cobam-light-bg/70 px-6 py-7 transition-colors duration-300 group-hover:bg-white">
                {brand.imageUrl ? (
                  <Image
                    src={brand.imageUrl}
                    alt={brand.name}
                    width={240}
                    height={110}
                    className="max-h-[80px] w-auto object-contain grayscale-[0.6] contrast-110 transition-all duration-500 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="text-center text-sm font-semibold text-cobam-dark-blue">
                    {brand.name}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col px-5 pb-5 pt-4">
              <div className="mb-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-cobam-carbon-grey">
                  Partenaire officiel
                </p>

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
