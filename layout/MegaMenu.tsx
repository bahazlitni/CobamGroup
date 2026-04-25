"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PublicMegaMenuProductCategory } from "@/features/product-categories/public-types";
import { cn } from "@/lib/utils";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";

interface MegaMenuProps {
  menuLabel: string;
  data: PublicMegaMenuProductCategory[];
}

const DEFAULT_THEME_COLOR = "#9CA3AF";

function normalizeThemeColor(color: string | null | undefined) {
  return color ?? DEFAULT_THEME_COLOR;
}

function hexToRgb(hex: string) {
  const normalizedHex = hex.replace("#", "");

  if (normalizedHex.length !== 6) {
    return null;
  }

  const parsed = Number.parseInt(normalizedHex, 16);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function withAlpha(hex: string | null | undefined, alpha: number) {
  const rgb = hexToRgb(normalizeThemeColor(hex));

  if (!rgb) {
    return `rgba(156, 163, 175, ${alpha})`;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export default function MegaMenu({ menuLabel, data }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredSubCategory, setHoveredSubCategory] =
    useState<PublicMegaMenuProductCategory | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const contentId = useId();

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimeout();

    if (!isOpen) {
      setActiveIndex(0);
      setHoveredSubCategory(null);
    }

    setIsOpen(true);
  };

  const scheduleCloseMenu = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setHoveredSubCategory(null);
    }, 120);
  };

  const closeMenu = () => {
    clearCloseTimeout();
    setIsOpen(false);
    setHoveredSubCategory(null);
  };

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  if (data.length === 0) {
    return null;
  }

  const getCategoryPath = (slug: string | null): string =>
    data.find((category) => category.slug === slug)?.href ?? "#";

  const rootCategories = data.filter((item) => item.parent === null);

  if (rootCategories.length === 0) {
    return null;
  }

  const getSubcategories = (parentSlug: string) =>
    data.filter((item) => item.parent === parentSlug);

  const activeCategory = rootCategories[activeIndex] || rootCategories[0];
  const previewItem = hoveredSubCategory || activeCategory;
  const previewThemeColor = normalizeThemeColor(previewItem.themeColor);
  const isPreviewingCategory = !hoveredSubCategory;

  return (
    <div
      className="static"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleCloseMenu}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onMouseEnter={openMenu}
        onFocus={openMenu}
        onClick={() => {
          if (isOpen) {
            closeMenu();
            return;
          }

          openMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
          }
        }}
        className="flex items-center gap-1 bg-transparent px-0 py-0 text-sm font-semibold text-cobam-dark-blue transition-colors outline-none hover:text-cobam-water-blue focus:text-cobam-water-blue"
      >
        <span className="font-semibold text-[13px] tracking-[0.18em] uppercase transition-colors whitespace-nowrap pointer-events-none">{menuLabel}</span>
        <ChevronDown
          size={13}
          className={`pointer-events-none transition-transform duration-200 ${isOpen ? "rotate-180 text-cobam-water-blue" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.99, pointerEvents: "none" }}
            animate={{ opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, y: 10, scale: 0.99, pointerEvents: "none" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            id={contentId}
            role="menu"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleCloseMenu}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closeMenu();
              }
            }}
            className="bg-red-500 absolute left-1/2 top-12 z-50 flex w-full -translate-x-1/2 justify-center"
          >
            <div className="relative w-full overflow-hidden rounded-b-3xl border border-t-0 border-cobam-quill-grey/40 bg-white shadow-[0_40px_80px_rgba(20,32,46,0.08)] xl:w-fit">
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden lg:hidden">
                {previewItem.imageUrl ? (
                  <Image
                    src={previewItem.imageUrl}
                    alt="Aperçu de catégorie"
                    fill
                    className="object-cover opacity-[0.08] grayscale transition-opacity duration-500"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${withAlpha(
                        previewThemeColor,
                        0.16,
                      )}, ${withAlpha(previewThemeColor, 0.04)})`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" />
              </div>

              <div className="relative z-10 flex flex-col gap-6 p-4 lg:flex-row lg:gap-8 lg:p-8">
                <div className="hidden w-[320px] shrink-0 flex-col lg:flex xl:w-[360px]">
                  <Link
                    href={getCategoryPath(previewItem.slug)}
                    onClick={closeMenu}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-500"
                    style={{
                      borderColor: withAlpha(previewThemeColor, 0.3),
                    }}
                  >
                    <div className="relative h-64 w-full shrink-0 overflow-hidden bg-gray-50/50">
                      {previewItem.imageUrl ? (
                        <>
                          <Image
                            src={previewItem.imageUrl}
                            alt={previewItem.title || "Image de catégorie"}
                            fill
                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 380px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                        </>
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${withAlpha(
                              previewThemeColor,
                              0.16,
                            )}, ${withAlpha(previewThemeColor, 0.04)})`,
                          }}
                        />
                      )}

                      <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-md">
                          {isPreviewingCategory ? "À la une" : "Sous-catégorie"}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex flex-grow flex-col p-8"
                      style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,1), ${withAlpha(
                          previewThemeColor,
                          0.08,
                        )})`,
                      }}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="text-2xl font-light text-[#14202e]" style={{ fontFamily: "var(--font-playfair), serif" }}>
                          {previewItem.title || "En savoir plus"}
                        </h3>
                        <ArrowUpRight
                          className="mt-1 h-5 w-5 shrink-0 -translate-x-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                          style={{ color: previewThemeColor }}
                        />
                      </div>

                      {previewItem.subtitle ? (
                        <span
                          className="mb-4 block text-[10px] font-bold uppercase tracking-[0.15em]"
                          style={{ color: previewThemeColor }}
                        >
                          {previewItem.subtitle}
                        </span>
                      ) : null}

                      {previewItem.descriptionSEO ? (
                        <p className="mt-1 text-sm font-light leading-relaxed text-[#5e5e5e]">
                          {previewItem.descriptionSEO}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm italic font-light leading-relaxed text-gray-400">
                          Découvrez notre sélection exclusive pour cette gamme.
                        </p>
                      )}

                    </div>
                  </Link>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between mb-2 gap-8 items-center">
                    <div className="h-[1px] bg-slate-200 w-full" />
                    <AnimatedUIButton href="/produits" icon="arrow-right" variant="ghost">
                      Tous nos produits
                    </AnimatedUIButton>
                  </div>

                  <div className="grid max-h-[90vh] grid-cols-1 overflow-x-hidden overflow-y-auto md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2">
                    {rootCategories.map((category, index) => {
                      const isCategoryActive = index === activeIndex;
                      const categoryThemeColor = normalizeThemeColor(category.themeColor);
                      const subcategories = getSubcategories(category.slug);

                      return (
                        <div
                          key={category.slug}
                          onMouseEnter={() => {
                            setActiveIndex(index);
                            setHoveredSubCategory(null);
                          }}
                          className={cn(
                            "flex w-56 flex-col rounded-[20px] border p-5 transition-all duration-500",
                            "lg:w-60 xl:w-[260px]", index === 0 ? "row-span-3" : ""
                          )}
                          style={
                            isCategoryActive
                              ? {
                                borderColor: withAlpha(categoryThemeColor, 0.24),
                                backgroundColor: withAlpha(categoryThemeColor, 0.04),
                              }
                              : {
                                borderColor: "transparent",
                              }
                          }
                        >
                          <Link
                            href={getCategoryPath(category.slug)}
                            onClick={closeMenu}
                            className="group/link mb-5 block outline-none"
                          >
                            <h4
                              className="text-sm font-semibold uppercase tracking-[0.1em] text-[#14202e] transition-colors"
                              style={isCategoryActive ? { color: categoryThemeColor } : undefined}
                            >
                              {category.title || "Catégorie"}
                            </h4>
                            {category.subtitle ? (
                              <span className="mt-1 block text-[11px] text-[#5e5e5e]">
                                {category.subtitle}
                              </span>
                            ) : null}
                          </Link>

                          <div className="flex flex-col gap-1">
                            {subcategories.map((subCategory) => {
                              const isSubActive =
                                hoveredSubCategory?.slug === subCategory.slug;

                              return (
                                <Link
                                  key={subCategory.slug}
                                  href={getCategoryPath(subCategory.slug)}
                                  onClick={closeMenu}
                                  onMouseEnter={() => setHoveredSubCategory(subCategory)}
                                  onMouseLeave={() => setHoveredSubCategory(null)}
                                  className={`group/item relative rounded-lg px-3 py-2.5 outline-none transition-all duration-300 ${isCategoryActive && !isSubActive
                                    ? "hover:bg-white/80"
                                    : "hover:bg-transparent"
                                    }`}
                                  style={
                                    isSubActive
                                      ? {
                                        backgroundColor: "white",
                                        boxShadow: `0 4px 12px ${withAlpha(categoryThemeColor, 0.1)}`,
                                      }
                                      : undefined
                                  }
                                >
                                  <div
                                    className="text-[13px] font-medium text-[#5e5e5e] transition-colors group-hover/item:text-[#14202e]"
                                    style={isSubActive ? { color: categoryThemeColor } : undefined}
                                  >
                                    {subCategory.title || "Sous-catégorie"}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
