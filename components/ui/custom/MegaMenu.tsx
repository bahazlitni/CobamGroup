"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export interface Category {
  href: string;
  title: string;
  subtitle: string;
  descriptionSEO: string;
  imageUrl: string;
  imageUrlHD: string;
  slug: string;
  parent: string | null;
}

interface MegaMenuProps {
  menuLabel: string;
  data: Category[];
}

export default function MegaMenu({ menuLabel, data }: MegaMenuProps) {
  // --- NEW: Control the Radix NavigationMenu open state ---
  const [menuValue, setMenuValue] = useState("");
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredSubCategory, setHoveredSubCategory] = useState<Category | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setActiveIndex(0);
      setHoveredSubCategory(null);
    }
  };

  // --- HELPER: Close menu on link click ---
  const closeMenu = () => setMenuValue("");

  if (!data || data.length === 0) return null;

  const getCategoryPath = (slug: string | null): string => {
    if (!slug) return "#";
    
    const category = data.find((cat) => cat.slug === slug);
    if (!category) return "#";

    if (category.parent) {
      return `${getCategoryPath(category.parent)}/${category.slug}`;
    }
    
    return `/produits/${category.slug}`;
  };


  const rootCategories = data.filter((item) => item.parent === null);

  if (rootCategories.length === 0) return null;

  const activeCategory = rootCategories[activeIndex] || rootCategories[0];
  const previewItem = hoveredSubCategory || activeCategory;
  const isPreviewingCategory = !hoveredSubCategory;

  const getSubcategories = (parentSlug: string) => {
    return data.filter((item) => item.parent === parentSlug);
  };

  const activeCategorySubcategories = getSubcategories(activeCategory.slug);

  return (
    <NavigationMenu 
      // --- NEW: Bound the value to our state ---
      value={menuValue}
      onValueChange={(val) => {
        setMenuValue(val);
        handleOpenChange(!!val);
      }}
      className="z-50 hidden md:flex !static [&>div.absolute]:w-full [&>div.absolute]:left-0 [&>div.absolute]:top-1/2 [&>div.absolute]:flex [&>div.absolute]:justify-center [&>div.absolute>div]:!border-none [&>div.absolute>div]:!shadow-none [&>div.absolute>div]:!bg-transparent [&>div.absolute>div]:!ring-0" 
    >
      <NavigationMenuList className="!static">
        {/* --- NEW: Added unique value to the item so Radix knows which one is open --- */}
        <NavigationMenuItem value={menuLabel} className="!static">
          <NavigationMenuTrigger 
            className="bg-transparent px-0 py-0 font-semibold text-sm text-cobam-dark-blue hover:bg-transparent hover:text-cobam-water-blue focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-cobam-water-blue transition-colors outline-none"
            onMouseEnter={() => {
              setActiveIndex(0);
              setHoveredSubCategory(null);
            }}
          >
            <span className="flex items-center gap-1">
              {menuLabel}
            </span>
          </NavigationMenuTrigger>

          <NavigationMenuContent>
            <div className="relative w-max max-w-[95vw] 2xl:max-w-[1400px] overflow-hidden rounded-3xl border border-black/5 bg-white m-2 flex">
              
              <div className="absolute inset-0 z-0 lg:hidden pointer-events-none overflow-hidden">
                {previewItem.imageUrl ? (
                  <Image
                    src={previewItem.imageUrl}
                    alt="Background preview"
                    fill
                    className="object-cover opacity-[0.08] grayscale transition-opacity duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
                )}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 lg:gap-8">
                
                {/* --- LEFT COLUMN: PREVIEW BANNER --- */}
                <div className="hidden lg:flex w-[320px] xl:w-[360px] shrink-0 flex-col">
                  <Link
                    href={getCategoryPath(previewItem.slug)}
                    onClick={closeMenu} // --- NEW: Close on click ---
                    className="group relative flex flex-col h-full overflow-hidden rounded-[24px] border border-cobam-water-blue/15 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-cobam-water-blue/5 hover:border-cobam-water-blue/30"
                  >
                    <div className="relative h-56 w-full shrink-0 overflow-hidden bg-gray-50/50">
                      {previewItem.imageUrl ? (
                        <>
                          <Image
                            src={previewItem.imageUrl}
                            alt={previewItem.title || "Preview image"}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 380px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-cobam-water-blue/5 to-gray-100" />
                      )}
                      
                      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-md">
                           {isPreviewingCategory ? "À la une" : "Sous-catégorie"}
                         </span>
                      </div>
                    </div>

                    <div className="flex flex-col p-6 flex-grow bg-gradient-to-br from-white to-gray-50/30">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-xl font-bold leading-tight text-cobam-dark-blue">
                          {previewItem.title || "En savoir plus"}
                        </h3>
                        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-cobam-water-blue opacity-0 -translate-x-2 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
                      </div>

                      {previewItem.subtitle && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-cobam-water-blue mb-3 block">
                          {previewItem.subtitle}
                        </span>
                      )}

                      {previewItem.descriptionSEO ? (
                        <p className="text-sm leading-relaxed text-cobam-carbon-grey line-clamp-3 mt-1">
                          {previewItem.descriptionSEO}
                        </p>
                      ) : (
                        <p className="text-sm leading-relaxed text-gray-400 italic mt-1">
                          Découvrez notre sélection exclusive pour cette gamme.
                        </p>
                      )}

                      {isPreviewingCategory && activeCategorySubcategories.length > 0 && (
                        <div className="mt-auto pt-5">
                          <div className="flex flex-wrap gap-2">
                            {activeCategorySubcategories.slice(0, 5).map((sub, idx) => (
                              <div
                                key={`badge-${sub.slug}-${idx}`}
                                className="rounded-lg border border-cobam-water-blue/20 bg-cobam-water-blue/5 px-2.5 py-1.5 transition-colors group-hover:border-cobam-water-blue/40 group-hover:bg-cobam-water-blue/10"
                              >
                                <span className="text-[11px] font-semibold text-cobam-dark-blue leading-none">
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                            {activeCategorySubcategories.length > 5 && (
                              <div className="rounded-lg border border-transparent px-1 py-1.5 flex items-center">
                                <span className="text-[11px] font-semibold text-cobam-carbon-grey leading-none">
                                  +{activeCategorySubcategories.length - 5}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                {/* --- RIGHT COLUMN: GRID OF CATEGORIES --- */}
                <div className="flex-1">
                  <div className="grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {rootCategories.map((category, index) => {
                      const isCategoryActive = index === activeIndex;
                      const subcategories = getSubcategories(category.slug);

                      return (
                        <div
                          key={category.slug}
                          onMouseEnter={() => {
                            setActiveIndex(index);
                            setHoveredSubCategory(null);
                          }}
                          className={`flex flex-col w-56 lg:w-60 xl:w-[260px] rounded-2xl border p-4 transition-all duration-300 ${
                            isCategoryActive
                              ? "border-cobam-water-blue/20 bg-cobam-water-blue/5"
                              : "border-transparent hover:bg-gray-50/80"
                          }`}
                        >
                          <Link
                            href={getCategoryPath(category.slug)}
                            onClick={closeMenu} // --- NEW: Close on click ---
                            className="mb-4 block group/link outline-none"
                          >
                            <h4 className={`text-sm font-bold uppercase tracking-[0.1em] transition-colors ${
                              isCategoryActive ? "text-cobam-water-blue" : "text-cobam-dark-blue group-hover/link:text-cobam-water-blue"
                            }`}>
                              {category.title || "Catégorie"}
                            </h4>
                            {category.subtitle && (
                              <span className="text-xs text-cobam-carbon-grey/70 mt-0.5 block">
                                {category.subtitle}
                              </span>
                            )}
                          </Link>

                          <div className="flex flex-col gap-1">
                            {subcategories.map((subCat) => {
                              const isSubActive = hoveredSubCategory?.slug === subCat.slug;

                              return (
                                <Link
                                  key={subCat.slug}
                                  href={getCategoryPath(subCat.slug)}
                                  onClick={closeMenu} // --- NEW: Close on click ---
                                  onMouseEnter={() => setHoveredSubCategory(subCat)}
                                  onMouseLeave={() => setHoveredSubCategory(null)}
                                  className={`group/item relative rounded-xl px-3 py-2 transition-all duration-200 outline-none ${
                                    isSubActive 
                                      ? "bg-white ring-1 ring-black/5" 
                                      : isCategoryActive 
                                        ? "hover:bg-white/60" 
                                        : "hover:bg-transparent"
                                  }`}
                                >
                                  <div className={`text-[13px] font-medium transition-colors ${
                                    isSubActive ? "text-cobam-water-blue" : "text-cobam-carbon-grey group-hover/item:text-cobam-dark-blue"
                                  }`}>
                                    {subCat.title || "Sous-catégorie"}
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
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
