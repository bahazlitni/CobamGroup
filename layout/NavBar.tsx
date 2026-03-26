"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, Menu, ChevronDown, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import MegaMenu from "@/components/ui/custom/MegaMenu";
import { categoriesData } from "@/data/categories";
import { usePathname } from "next/navigation";


const societyLinks = [
  { label: "Notre Histoire", href: "/notre-histoire" },
  { label: "Vision & Mission", href: "#" },
  { label: "Notre Équipe", href: "#" },
];

const brandsLinks = [
  { label: "Nos Partenaires", href: "/partenaires" },
  { label: "Nos Clients", href: "/clients" },
];

const mainLinks = [
  { label: "SOCIÉTÉ",     href: "#",        hasMega: false, children: societyLinks },
  { label: "PRODUITS",    href: "#",        hasMega: true,  children: undefined },
  { label: "MARQUES",     href: "#",        hasMega: false, children: brandsLinks }, // <-- Added dropdown
  { label: "PROMOTIONS",  href: "#",        hasMega: false, children: undefined },
  { label: "ACTUALITÉS",  href: "/actualites",        hasMega: false, children: undefined },
  { label: "CONTACT",     href: "#contact", hasMega: false, children: undefined },
];

export default function NavBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [societyOpen, setSocietyOpen] = useState(false);
  const [mobileSocietyOpen, setMobileSocietyOpen] = useState(false);
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [produitsOpen, setProduitsOpen] = useState(false);



  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [searchOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeSheet = () => {
    setSheetOpen(false);
    setProduitsOpen(false);
    setMobileSocietyOpen(false);
    setMobileBrandsOpen(false);
  };

  const path = usePathname()
  if(path.startsWith('/espace/staff')) return null;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">

          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <Image
              src="/images/logos/cobam-group/logo-vector.svg"
              alt="COBAM GROUP"
              width={843}
              height={289}
              className="hidden xl:block object-contain h-12 w-auto"
              priority
            />
            <Image
              src="/images/logos/cobam-group/logo-vector-emblem.svg"
              alt="COBAM GROUP"
              width={48}
              height={48}
              className="xl:hidden object-contain h-10 w-auto"
              priority
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-5 ">
            {mainLinks.map((link) => {
              if (link.hasMega) return <MegaMenu data={categoriesData} menuLabel={link.label} key={link.label} />;

              if (link.children) {
                const isSociete = link.label === "SOCIÉTÉ";
                const isMarques = link.label === "MARQUES";
                const isOpen = isSociete ? societyOpen : isMarques ? mobileBrandsOpen : false;
                const setOpen = isSociete ? setSocietyOpen : isMarques ? setMobileBrandsOpen : () => {};

                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                  >
                    <button className="flex items-center gap-1 text-cobam-dark-blue hover:text-cobam-water-blue font-semibold text-sm transition-colors">
                      {link.label}
                      <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="absolute top-full left-0 bg-white shadow-xl border border-gray-100 rounded-lg py-2 w-56 z-50">
                        {link.children.map((child) => (
                          <a
                            key={child.label}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-cobam-dark-blue hover:bg-cobam-light-bg hover:text-cobam-water-blue transition-colors"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-cobam-dark-blue hover:text-cobam-water-blue font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`transition-colors ${
                  searchOpen
                    ? "text-cobam-water-blue"
                    : "text-cobam-carbon-grey hover:text-cobam-water-blue"
                }`}
                aria-label="Rechercher"
              >
                <Search size={18} />
              </button>

              {/* Dropdown search box */}
              <div
                className={`absolute right-0 top-full mt-3 transition-all duration-200 ease-in-out origin-top-right z-50 ${
                  searchOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-3 flex items-center gap-2 w-[300px] sm:w-[420px]">
                  <Search size={16} className="text-cobam-carbon-grey flex-shrink-0 ml-1" />
                  <input
                    ref={inputRef}
                    type="search"
                    placeholder="Rechercher un produit, une marque..."
                    className="flex-1 bg-transparent text-sm text-cobam-dark-blue placeholder:text-cobam-carbon-grey focus:outline-none"
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-cobam-carbon-grey hover:text-cobam-dark-blue transition-colors p-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              className="hidden md:inline-flex xl:hidden bg-cobam-water-blue hover:bg-cobam-water-blue/80 text-white font-semibold text-xs px-4"
              asChild
            >
              <a href="#devis">Devis</a>
            </Button>

            {/* Mobile Menu */}
            {/* (mobile code unchanged except adding MARQUES dropdown similar to SOCIÉTÉ if needed) */}
{/* Mobile Menu */}
            <Sheet open={sheetOpen} onOpenChange={(v) => { setSheetOpen(v); if (!v) { setProduitsOpen(false); setMobileSocietyOpen(false); } }}>
              <SheetTrigger asChild>
                <button className="xl:hidden text-cobam-dark-blue hover:text-cobam-water-blue transition-colors" aria-label="Menu">
                  <Menu size={22} />
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="bg-white w-[85vw] max-w-sm p-0 overflow-hidden border-l border-gray-100"
              >
                <VisuallyHidden>
                  <SheetTitle>Menu de navigation</SheetTitle>
                </VisuallyHidden>

                <div className="relative w-full h-full overflow-hidden">

                  {/* ── MAIN PANEL ── */}
                  <div
                    className="absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out"
                    style={{ transform: produitsOpen ? "translateX(-100%)" : "translateX(0)" }}
                  >
                    <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
                      {mainLinks.map((link) => {
                        if (link.children) {
                          return (
                            <div key={link.label}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setMobileSocietyOpen(!mobileSocietyOpen); }}
                                className="w-full flex items-center justify-between text-cobam-dark-blue hover:text-cobam-water-blue hover:bg-cobam-light-bg font-semibold text-sm py-3.5 px-4 rounded-xl transition-all"
                              >
                                <span>{link.label}</span>
                                <ChevronDown
                                  size={15}
                                  className={`transition-transform duration-300 text-cobam-carbon-grey ${mobileSocietyOpen ? "rotate-180 text-cobam-water-blue" : ""}`}
                                />
                              </button>
                              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileSocietyOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="ml-4 border-l-2 border-cobam-water-blue/20 pl-4 py-1 flex flex-col gap-1">
                                  {link.children.map((child) => (
                                    <a key={child.label} href={child.href} onClick={closeSheet}
                                      className="text-cobam-carbon-grey hover:text-cobam-water-blue text-sm py-2.5 px-3 rounded-lg hover:bg-cobam-light-bg transition-all block"
                                    >
                                      {child.label}
                                    </a>
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
                              onClick={(e) => { e.stopPropagation(); setProduitsOpen(true); }}
                              className="flex items-center justify-between font-semibold text-sm py-3.5 px-4 rounded-xl transition-all bg-cobam-water-blue/5 text-cobam-water-blue hover:bg-cobam-water-blue/10 border border-cobam-water-blue/20 w-full"
                            >
                              {link.label}
                              <ChevronRight size={14} />
                            </button>
                          );
                        }

                        return (
                          <a key={link.label} href={link.href} onClick={closeSheet}
                            className="flex items-center justify-between font-semibold text-sm py-3.5 px-4 rounded-xl transition-all text-cobam-dark-blue hover:text-cobam-water-blue hover:bg-cobam-light-bg"
                          >
                            {link.label}
                          </a>
                        );
                      })}
                    </nav>

                    <div className="px-4 py-5 border-t border-gray-100 bg-cobam-light-bg flex flex-col gap-3">
                      <Button className="w-full bg-cobam-water-blue hover:bg-cobam-water-blue/80 text-white font-bold py-5" asChild>
                        <a href="#devis" onClick={closeSheet}>Demande de Devis</a>
                      </Button>
                      <Button variant="outline" className="w-full border-cobam-dark-blue/20 text-cobam-dark-blue hover:bg-cobam-dark-blue hover:text-white font-semibold py-5" asChild>
                        <a href="#contact" onClick={closeSheet}>Nous Contacter</a>
                      </Button>
                    </div>
                  </div>

                  {/* ── PRODUITS PANEL ── */}
                  <div
                    className="absolute inset-0 flex flex-col bg-white transition-transform duration-300 ease-in-out"
                    style={{ transform: produitsOpen ? "translateX(0)" : "translateX(100%)" }}
                  >
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 bg-cobam-light-bg flex-shrink-0">
                      <button
                        onClick={() => setProduitsOpen(false)}
                        className="text-cobam-dark-blue hover:text-cobam-water-blue transition-colors p-1.5 rounded-lg hover:bg-white"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-bold text-cobam-dark-blue text-base">Produits</span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
                      {/* 1. Only map over root categories (parent === null) */}
                      {categoriesData
                        .filter((section) => section.parent === null)
                        .map((section) => {
                          // 2. Find the subcategories for this specific parent
                          const subcategories = categoriesData.filter(
                            (sub) => sub.parent === section.slug
                          );

                          return (
                            <div key={section.slug}>
                              <p className="text-cobam-water-blue text-xs font-bold uppercase tracking-widest px-2 mb-2">
                                {section.title}
                              </p>
                              <div className="flex flex-col gap-0.5">
                                {/* 3. Map over the filtered subcategories */}
                                {subcategories.map((subcategory) => (
                                  <a
                                    key={subcategory.slug}
                                    href={subcategory.href || "#"}
                                    onClick={closeSheet}
                                    className="text-cobam-dark-blue hover:text-cobam-water-blue hover:bg-cobam-light-bg text-sm py-2.5 px-3 rounded-lg transition-all block"
                                  >
                                    {subcategory.title}
                                  </a>
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
      </div>
    </header>
  );
}