"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import type { PublicMegaMenuProductCategory } from "@/features/product-categories/public-types";
import MegaMenu from "@/layout/MegaMenu";
import NavbarSearch from "@/layout/NavbarSearch";
import { useNavbarVisibility } from "@/layout/navbar-visibility";
import { cn } from "@/lib/utils";

const brandsLinks = [
  { label: "Nos Partenaires", href: "/partenaires" },
  { label: "Nos Références", href: "/references" },
];

const mainLinks = [
  {
    label: "À PROPOS",
    href: "/a-propos",
    hasMega: false,
    children: undefined,
  },
  { label: "PRODUITS", href: "#", hasMega: true, children: undefined },
  { label: "MARQUES", href: "#", hasMega: false, children: brandsLinks },
  {
    label: "ACTUALITÉS",
    href: "/actualites",
    hasMega: false,
    children: undefined,
  },
  { label: "CONTACT", href: "/contact", hasMega: false, children: undefined },
];

export default function NavBar({
  productCategories,
}: {
  productCategories: PublicMegaMenuProductCategory[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [produitsOpen, setProduitsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isNavbarHidden } = useNavbarVisibility();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const homeSurface = isHomePage;
  const desktopLinkClassName = cn(
    "font-semibold text-[13px] uppercase tracking-[0.18em] transition-colors whitespace-nowrap",
    homeSurface
      ? "text-white/78 hover:text-white"
      : "text-cobam-dark-blue hover:text-cobam-water-blue",
  );
  const iconButtonClassName = cn(
    "p-2 transition-colors",
    homeSurface ? "text-white/76 hover:text-white" : "text-cobam-carbon-grey hover:text-cobam-water-blue",
  );
  const mobileMenuClassName = cn(
    "lg:hidden transition-colors",
    homeSurface ? "text-white/84 hover:text-white" : "text-cobam-dark-blue hover:text-cobam-water-blue",
  );

  const closeSheet = () => {
    setSheetOpen(false);
    setProduitsOpen(false);
    setMobileBrandsOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "left-0 z-50 w-full border-b transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isHomePage
            ? cn(
                "fixed top-0",
                isScrolled
                  ? "border-white/10 bg-[#07111d]/82 shadow-[0_22px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                  : "border-transparent bg-transparent",
              )
            : "sticky top-0 border-cobam-quill-grey/60 bg-white",
          isNavbarHidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1460px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="z-[100] shrink-0">
            <Image
              src={
                homeSurface
                  ? "/images/logos/cobam-group/logo-vector-white.svg"
                  : "/images/logos/cobam-group/logo-vector.svg"
              }
              alt="COBAM GROUP"
              width={843}
              height={289}
              className="hidden h-10 w-auto object-contain lg:block"
              priority
            />
            <Image
              src={
                homeSurface
                  ? "/images/logos/cobam-group/logo-vector-emblem-white.svg"
                  : "/images/logos/cobam-group/logo-vector-emblem.svg"
              }
              alt="COBAM GROUP"
              width={48}
              height={48}
              className="h-7 w-auto object-contain lg:hidden"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {mainLinks.map((link) => {
              if (link.hasMega) {
                return (
                  <MegaMenu
                    key={link.label}
                    data={productCategories}
                    menuLabel={link.label}
                    triggerClassName={
                      homeSurface ? "text-white/78 hover:text-white focus:text-white" : undefined
                    }
                  />
                );
              }

              if (link.children) {
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setBrandsOpen(true)}
                    onMouseLeave={() => setBrandsOpen(false)}
                  >
                    <button className={cn("flex items-center gap-1", desktopLinkClassName)}>
                      {link.label}
                      <ChevronDown
                        size={13}
                        className={cn(
                          "transition-transform duration-200",
                          brandsOpen ? "rotate-180 text-cobam-water-blue" : "",
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {brandsOpen ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-cobam-quill-grey/30 bg-white py-3 shadow-[0_20px_40px_rgba(20,32,46,0.08)]"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="block px-5 py-3 text-sm text-[#5e5e5e] transition-all hover:bg-cobam-light-bg hover:font-medium hover:text-[#14202e]"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link key={link.label} href={link.href} className={desktopLinkClassName}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className={iconButtonClassName}
              aria-label="Rechercher"
            >
              <Search size={18} />
            </button>

            <Sheet
              open={sheetOpen}
              onOpenChange={(value) => {
                setSheetOpen(value);
                if (!value) {
                  setProduitsOpen(false);
                  setMobileBrandsOpen(false);
                }
              }}
            >
              <SheetTrigger asChild>
                <button className={mobileMenuClassName} aria-label="Menu">
                  <Menu size={20} />
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[85vw] max-w-sm overflow-hidden border-l border-gray-100 bg-white p-0"
              >
                <VisuallyHidden>
                  <SheetTitle>Menu de navigation</SheetTitle>
                </VisuallyHidden>

                <div className="relative h-full w-full overflow-hidden">
                  <div
                    className="absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out"
                    style={{
                      transform: produitsOpen ? "translateX(-100%)" : "translateX(0)",
                    }}
                  >
                    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
                      {mainLinks.map((link) => {
                        if (link.children) {
                          return (
                            <div key={link.label}>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setMobileBrandsOpen(!mobileBrandsOpen);
                                }}
                                className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-cobam-dark-blue transition-all hover:bg-cobam-light-bg hover:text-cobam-water-blue"
                              >
                                <span>{link.label}</span>
                                <ChevronDown
                                  size={15}
                                  className={cn(
                                    "text-cobam-carbon-grey transition-transform duration-300",
                                    mobileBrandsOpen ? "rotate-180 text-cobam-water-blue" : "",
                                  )}
                                />
                              </button>
                              <div
                                className={cn(
                                  "overflow-hidden transition-all duration-300 ease-in-out",
                                  mobileBrandsOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0",
                                )}
                              >
                                <div className="ml-4 flex flex-col gap-1 border-l-2 border-cobam-water-blue/20 py-1 pl-4">
                                  {link.children.map((child) => (
                                    <Link
                                      key={child.label}
                                      href={child.href}
                                      onClick={closeSheet}
                                      className="block rounded-lg px-3 py-2.5 text-sm text-cobam-carbon-grey transition-all hover:bg-cobam-light-bg hover:text-cobam-water-blue"
                                    >
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (link.hasMega) {
                          return (
                            <button
                              key={link.label}
                              onClick={(event) => {
                                event.stopPropagation();
                                setProduitsOpen(true);
                              }}
                              className="flex w-full items-center justify-between rounded-xl border border-cobam-water-blue/20 bg-cobam-water-blue/5 px-4 py-3.5 text-sm font-semibold text-cobam-water-blue transition-all hover:bg-cobam-water-blue/10"
                            >
                              {link.label}
                              <ChevronRight size={14} />
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={closeSheet}
                            className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-cobam-dark-blue transition-all hover:bg-cobam-light-bg hover:text-cobam-water-blue"
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  <div
                    className="absolute inset-0 flex flex-col bg-white transition-transform duration-300 ease-in-out"
                    style={{
                      transform: produitsOpen ? "translateX(0)" : "translateX(100%)",
                    }}
                  >
                    <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-cobam-light-bg px-4 py-4">
                      <button
                        onClick={() => setProduitsOpen(false)}
                        className="rounded-lg p-1.5 text-cobam-dark-blue transition-colors hover:bg-white hover:text-cobam-water-blue"
                        aria-label="Retour au menu principal"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-base font-bold text-cobam-dark-blue">Produits</span>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
                      <AnimatedUIButton
                        variant="ghost"
                        icon="arrow-right"
                        className="flex p-3 text-sm font-bold"
                        href="/produits"
                        onClick={closeSheet}
                      >
                        Tous nos produits
                      </AnimatedUIButton>

                      {productCategories
                        .filter((section) => section.parent === null)
                        .map((section) => {
                          const subcategories = productCategories.filter(
                            (subcategory) => subcategory.parent === section.slug,
                          );

                          return (
                            <div key={section.slug}>
                              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-cobam-water-blue">
                                {section.title}
                              </p>
                              <div className="flex flex-col gap-0.5">
                                {subcategories.map((subcategory) => (
                                  <Link
                                    key={subcategory.slug}
                                    href={subcategory.href || "#"}
                                    onClick={closeSheet}
                                    className="block rounded-lg px-3 py-2.5 text-sm text-cobam-dark-blue transition-all hover:bg-cobam-light-bg hover:text-cobam-water-blue"
                                  >
                                    {subcategory.title}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <NavbarSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
