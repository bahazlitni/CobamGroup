"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { Brand as PublicBrand } from "@/lib/static_tables/brands";
import { scrollToIdCenter } from "@/lib/utils";
import Link from "next/link";
import BrandImageBlock from "./BrandImageBlock";

export default function TimelineView({ brands }: { brands: PublicBrand[] }) {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [discovered, setDiscovered] = useState<number[]>([]);
  const pathname = usePathname();

  // Scroll-spy: determine active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // If you prefer the 2/3 logic, use * 2 / 3 instead of / 2
      const center = window.innerHeight / 2;

      let closestIdx = 0;
      let closestDist = Infinity;

      sectionRefs.current.forEach((section, idx) => {
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const dist = Math.abs(sectionCenter - center);

        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });

      setActiveIndex((prev) => (prev !== closestIdx ? closestIdx : prev));
      setDiscovered((prev) =>
        prev.includes(closestIdx) ? prev : [...prev, closestIdx]
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initial hash-based scroll: center the brand referenced in URL (#slug)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;

    const idx = brands.findIndex((b) => b.slug === hash);
    if (idx === -1) return;

    const timeout = setTimeout(() => {
      scrollToIdCenter(hash);
      setActiveIndex(idx);
      setDiscovered((prev) =>
        prev.includes(idx) ? prev : [...prev, idx]
      );
    }, 50);

    return () => clearTimeout(timeout);
  }, [brands, pathname]);

  return (
    <div className="relative">
      {/* Center line */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2">
        <div className="w-[2px] h-full bg-cobam-quill-grey/50" />
      </div>

      <div className="flex flex-col gap-12 sm:gap-16">
        {brands.map((brand, idx) => {
          const isActive = idx === activeIndex;
          const isEven = idx % 2 === 0;
          const isDiscovered = discovered.includes(idx);

          return (
            <motion.div
              key={brand.name}
              ref={(el) => {
                sectionRefs.current[idx] = el;
              }}
              initial={false}
              animate={
                isDiscovered
                  ? {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }
                  : {
                      opacity: 0,
                      y: 48,
                      filter: "blur(10px)",
                    }
              }
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Dot */}
              <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10">
                <div
                  className={`w-3 h-3 rounded-full border-[2px] transition-colors duration-300 ${
                    isActive
                      ? "bg-cobam-water-blue border-cobam-water-blue"
                      : "bg-white border-cobam-quill-grey/80"
                  }`}
                />
              </div>

              <div
                id={brand.slug}
                className={`flex flex-col items-center gap-6 sm:gap-10 lg:gap-16 ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Logo card */}
                <motion.div
                  animate={{
                    scale: isActive ? 1 : isDiscovered ? 0.965 : 0.94,
                    opacity: isDiscovered ? (isActive ? 1 : 0.72) : 0,
                    filter:
                      isActive || !isDiscovered
                        ? "grayscale(0%)"
                        : "grayscale(100%)",
                  }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-full lg:w-1/2"
                >
                  <BrandImageBlock brand={brand} />
                </motion.div>

                {/* Text */}
                <motion.div
                  animate={{
                    opacity: isDiscovered ? 1 : 0,
                    x: isDiscovered ? 0 : isEven ? -56 : 56,
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full lg:w-1/2"
                >
                  <div
                    className={`max-w-md ${
                      isEven
                        ? "lg:ml-auto text-left"
                        : "lg:mr-auto text-left lg:text-right"
                    }`}
                  >
                    <motion.p
                      initial={false}
                      animate={{
                        opacity: isDiscovered ? 1 : 0,
                        y: isDiscovered ? 0 : 12,
                      }}
                      transition={{ duration: 0.35, delay: 0.04 }}
                      className="text-xs font-bold tracking-[0.3em] uppercase text-cobam-carbon-grey mb-3"
                    >
                      Partenaire officiel
                    </motion.p>

                    <motion.h3
                      initial={false}
                      animate={{
                        opacity: isDiscovered ? 1 : 0,
                        y: isDiscovered ? 0 : 16,
                      }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="text-2xl sm:text-3xl font-bold text-cobam-dark-blue mb-3"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {brand.name}
                    </motion.h3>

                    <motion.p
                      initial={false}
                      animate={{
                        opacity: isDiscovered ? 1 : 0,
                        y: isDiscovered ? 0 : 18,
                      }}
                      transition={{ duration: 0.45, delay: 0.16 }}
                      className="text-sm sm:text-base text-cobam-carbon-grey mb-5"
                    >
                      {brand.description}
                    </motion.p>

                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isDiscovered ? 1 : 0,
                        y: isDiscovered ? 0 : 20,
                      }}
                      transition={{ duration: 0.45, delay: 0.22 }}
                      className={`flex items-center gap-3 ${
                        isEven
                          ? "justify-start"
                          : "justify-start lg:justify-end"
                      }`}
                    >
                      {/* CTA area intentionally left empty (same as original) */}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
