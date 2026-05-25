"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, UserRound } from "lucide-react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FavoritesMenu } from "@/components/favorites/favorites-menu";
import { CustomerNotificationsMenu } from "@/components/site/customer-notifications-menu";
import type { LandingCategory } from "@/lib/home-data";
import { cn } from "@/lib/cn";

const primaryLinks = [
  { href: "/catalogue", label: "Tous les produits" },
  { href: "/catalogue?sélection=promotion", label: "Promotions" },
  { href: "/#best-sellers", label: "Meilleures ventes" },
  { href: "/#new-arrivals", label: "Nouveautés" },
  { href: "/suivi-commande", label: "Suivi commande" },
];

type HeaderPanel = "favorites" | "notifications" | "cart" | null;

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Accueil e-cobam">
      <span className="leading-none">
        <span className="text-ec-ink block font-serif text-2xl font-semibold tracking-[0.14em]">E-Cobam</span>
        <span className="text-ec-muted mt-0.5 hidden font-sans text-[0.62rem] font-black tracking-[0.28em] uppercase sm:block">
          Boutique
        </span>
      </span>
    </Link>
  );
}

function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action="/catalogue"
      className={cn(
        "group border-ec-line focus-within:border-ec-blue/50 flex items-center gap-2 border bg-white p-1.5 transition focus-within:shadow-[0_0_0_4px_rgba(10,141,193,0.08)]",
        compact ? "h-11 w-full" : "h-12 w-full",
      )}
    >
      <Search className="text-ec-muted ml-2 size-4 shrink-0" aria-hidden="true" />
      <input
        name="search"
        type="search"
        placeholder="Produit, marque, référence..."
        className="text-ec-ink placeholder:text-ec-muted/70 min-w-0 flex-1 bg-transparent font-sans text-sm outline-none"
      />
      <button
        type="submit"
        className={cn(
          "bg-ec-ink hover:bg-ec-blue focus-visible:outline-ec-blue inline-flex shrink-0 items-center justify-center font-sans text-sm font-black [color:#fff] text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          compact ? "size-8" : "h-9 px-4",
        )}
      >
        <Search className={cn("size-4", compact ? "" : "sm:hidden")} aria-hidden="true" />
        <span className={compact ? "sr-only" : "hidden sm:inline"}>Rechercher</span>
      </button>
    </form>
  );
}

function CategoryDropdown({
  categories,
  isOpen,
  onClose,
}: {
  categories: LandingCategory[];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        aria-label="Fermer les rayons"
        onClick={onClose}
      />
      <div className="border-ec-line absolute top-[calc(100%+0.65rem)] left-0 z-50 w-[min(23rem,calc(100vw-2rem))] overflow-hidden border bg-white shadow-[0_22px_60px_rgba(20,32,46,0.16)]">
        <div className="border-ec-line border-b p-2">
          <Link
            href="/catalogue"
            className="bg-ec-ink hover:bg-ec-blue flex items-center justify-between px-4 py-3 font-sans text-sm font-black [color:#fff] text-white transition"
            onClick={onClose}
          >
            <span>Tous les produits</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/types-produits"
            className="text-ec-ink hover:bg-ec-paper mt-1 flex items-center justify-between px-4 py-3 font-sans text-sm font-bold transition"
            onClick={onClose}
          >
            <span>Types de produits</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="commerce-thin-scrollbar max-h-[min(26rem,66vh)] overflow-y-auto p-2">
          <p className="text-ec-muted px-3 py-2 font-sans text-[11px] font-black tracking-[0.18em] uppercase">
            Catégories
          </p>
          <div className="grid gap-1">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                className="text-ec-ink hover:bg-ec-paper hover:text-ec-blue flex items-center justify-between gap-3 px-3 py-2.5 font-sans text-sm font-semibold transition"
                onClick={onClose}
              >
                <span className="min-w-0 truncate">{category.name}</span>
                {category.productCount ? (
                  <span className="text-ec-muted shrink-0 text-xs font-bold">
                    {category.productCount}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function SiteHeader({
  categories,
  isSignedIn = false,
}: {
  categories: LandingCategory[];
  isSignedIn?: boolean;
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<HeaderPanel>(null);
  const pathname = usePathname();
  const navCategories = categories.filter((category) => category.subcategories.length > 0);
  const favoritesActive = pathname?.startsWith("/favoris") ?? false;
  const cartActive = pathname?.startsWith("/panier") ?? false;
  const notificationsActive = pathname?.startsWith("/compte/notifications") ?? false;

  function handlePanelChange(panel: Exclude<HeaderPanel, null>, nextOpen: boolean) {
    setOpenPanel(nextOpen ? panel : null);

    if (nextOpen) {
      setCategoriesOpen(false);
    }
  }

  function toggleCategories() {
    setCategoriesOpen((current) => {
      const nextOpen = !current;

      if (nextOpen) {
        setOpenPanel(null);
      }

      return nextOpen;
    });
  }

  return (
    <header className="border-ec-line/80 sticky top-0 z-50 border-b bg-white/95 shadow-[0_10px_34px_rgba(20,32,46,0.055)] backdrop-blur-xl">
      <div className="border-ec-line/70 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-[92rem] items-center gap-5 px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
            aria-label="Navigation principale"
          >
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ec-ink hover:border-ec-blue hover:text-ec-blue inline-flex h-10 items-center border-b border-transparent px-2 font-sans text-sm font-bold transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={isSignedIn ? "/compte" : "/connexion"}
              aria-label={isSignedIn ? "Mon compte" : "Se connecter"}
              className="bg-ec-ink hover:bg-ec-blue inline-flex h-10 items-center justify-center gap-2 px-3 font-sans text-sm font-black [color:#fff] text-white transition sm:px-5"
            >
              <UserRound className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{isSignedIn ? "Mon compte" : "Se connecter"}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-ec-paper/95">
        <div className="mx-auto flex h-[4.25rem] max-w-[92rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="relative shrink-0">
            <button
              type="button"
              className="border-ec-line text-ec-ink hover:border-ec-blue/40 hover:text-ec-blue relative z-50 inline-flex h-11 items-center justify-center gap-2 border bg-white px-3 font-sans text-sm font-black transition sm:px-4"
              aria-label="Ouvrir les rayons"
              aria-expanded={categoriesOpen}
              aria-haspopup="menu"
              onClick={toggleCategories}
            >
              <Menu className="size-5" aria-hidden="true" />
              <span className="hidden sm:inline">Catégories</span>
              <ChevronDown
                className={cn(
                  "hidden size-4 transition sm:block",
                  categoriesOpen ? "rotate-180" : "",
                )}
                aria-hidden="true"
              />
            </button>

            <CategoryDropdown
              categories={navCategories}
              isOpen={categoriesOpen}
              onClose={() => setCategoriesOpen(false)}
            />
          </div>

          <div className="min-w-0 flex-1 lg:max-w-[42rem] xl:max-w-[48rem]">
            <SearchForm compact />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <FavoritesMenu
              active={favoritesActive}
              open={openPanel === "favorites"}
              onOpenChange={(nextOpen) => handlePanelChange("favorites", nextOpen)}
            />
            <CustomerNotificationsMenu
              compact
              active={notificationsActive}
              open={openPanel === "notifications"}
              onOpenChange={(nextOpen) => handlePanelChange("notifications", nextOpen)}
            />
            <CartDrawer
              active={cartActive}
              open={openPanel === "cart"}
              onOpenChange={(nextOpen) => handlePanelChange("cart", nextOpen)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
