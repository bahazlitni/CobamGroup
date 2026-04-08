"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { PublicMegaMenuProductCategory } from "@/features/product-categories/public-types";
import { cn } from "@/lib/utils";

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
  const activeCategorySubcategories = getSubcategories(activeCategory.slug);

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
        <span className="pointer-events-none">{menuLabel}</span>
        <ChevronDown
          size={13}
          className={`pointer-events-none transition-transform duration-200 ${
            isOpen ? "rotate-180 text-cobam-water-blue" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          id={contentId}
          role="menu"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleCloseMenu}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeMenu();
            }
          }}
          className="absolute left-1/2 top-10.5 z-50 flex w-full -translate-x-1/2 justify-center"
        >
          <div className="relative w-full overflow-hidden rounded-b-3xl border-b border-black/5 bg-white shadow-xl xl:w-fit">
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

            <div className="relative z-10 flex flex-col gap-6 p-4 lg:flex-row lg:gap-8 lg:p-6">
              <div className="hidden w-[320px] shrink-0 flex-col lg:flex xl:w-[360px]">
                <Link
                  href={getCategoryPath(previewItem.slug)}
                  onClick={closeMenu}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border bg-white transition-all duration-300"
                  style={{
                    borderColor: withAlpha(previewThemeColor, 0.2),
                  }}
                >
                  <div className="relative h-56 w-full shrink-0 overflow-hidden bg-gray-50/50">
                    {previewItem.imageUrl ? (
                      <>
                        <Image
                          src={previewItem.imageUrl}
                          alt={previewItem.title || "Image de catégorie"}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 380px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
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

                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-md">
                        {isPreviewingCategory ? "À la une" : "Sous-catégorie"}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex flex-grow flex-col p-6"
                    style={{
                      background: `linear-gradient(135deg, rgba(255,255,255,1), ${withAlpha(
                        previewThemeColor,
                        0.05,
                      )})`,
                    }}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold leading-tight text-cobam-dark-blue">
                        {previewItem.title || "En savoir plus"}
                      </h3>
                      <ArrowUpRight
                        className="mt-1 h-5 w-5 shrink-0 -translate-x-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                        style={{ color: previewThemeColor }}
                      />
                    </div>

                    {previewItem.subtitle ? (
                      <span
                        className="mb-3 block text-xs font-semibold uppercase tracking-wider"
                        style={{ color: previewThemeColor }}
                      >
                        {previewItem.subtitle}
                      </span>
                    ) : null}

                    {previewItem.descriptionSEO ? (
                      <p className="mt-1 text-sm leading-relaxed text-cobam-carbon-grey">
                        {previewItem.descriptionSEO}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm italic leading-relaxed text-gray-400">
                        Découvrez notre sélection exclusive pour cette gamme.
                      </p>
                    )}

                  </div>
                </Link>
              </div>

              <div className="flex-1">
                <div className="grid max-h-[600px] grid-cols-1 overflow-x-hidden overflow-y-auto md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
                            "flex w-56 flex-col rounded-2xl border p-4 transition-all duration-300",
                            "lg:w-60 xl:w-[260px]", index === 0 ? "row-span-3" : ""
                          )}
                        style={
                          isCategoryActive
                            ? {
                                borderColor: withAlpha(categoryThemeColor, 0.24),
                                backgroundColor: withAlpha(categoryThemeColor, 0.08),
                              }
                            : {
                                borderColor: "transparent",
                              }
                        }
                      >
                        <Link
                          href={getCategoryPath(category.slug)}
                          onClick={closeMenu}
                          className="group/link mb-4 block outline-none"
                        >
                          <h4
                            className="text-sm font-bold uppercase tracking-[0.1em] text-cobam-dark-blue transition-colors"
                            style={isCategoryActive ? { color: categoryThemeColor } : undefined}
                          >
                            {category.title || "Catégorie"}
                          </h4>
                          {category.subtitle ? (
                            <span className="mt-0.5 block text-xs text-cobam-carbon-grey/70">
                              {category.subtitle}
                            </span>
                          ) : null}
                        </Link>

                        <div className="flex flex-col">
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
                                className={`group/item relative rounded-xl px-3 py-2 outline-none transition-all duration-200 ${
                                  isCategoryActive && !isSubActive
                                    ? "hover:bg-white/60"
                                    : "hover:bg-transparent"
                                }`}
                                style={
                                  isSubActive
                                    ? {
                                        backgroundColor: withAlpha(categoryThemeColor, 0.12),
                                        boxShadow: `inset 0 0 0 1px ${withAlpha(categoryThemeColor, 0.24)}`,
                                      }
                                    : undefined
                                }
                              >
                                <div
                                  className="text-[13px] font-medium text-cobam-carbon-grey transition-colors group-hover/item:text-cobam-dark-blue"
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
        </div>
      ) : null}
    </div>
  );
}
