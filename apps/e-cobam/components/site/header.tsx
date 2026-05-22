"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, UserRound } from "lucide-react";
import { CartBadge } from "@/components/cart/cart-badge";
import { FavoritesBadge } from "@/components/favorites/favorites-badge";
import { CustomerNotificationsMenu } from "@/components/site/customer-notifications-menu";
import type { LandingCategory } from "@/lib/home-data";
import { cn } from "@/lib/cn";

const primaryLinks = [
  { href: "/catalogue", label: "Tous les produits" },
  { href: "/catalogue?sélection=promotion", label: "Promotions" },
  { href: "/#best-sellers", label: "Meilleures ventes" },
  { href: "/#new-arrivals", label: "Nouveautés" },
  { href: "/favoris", label: "Mes favoris" },
  { href: "/suivi-commande", label: "Suivi commande" },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Accueil e-cobam">
      <span className="leading-none">
        <span className="text-ec-ink block text-lg font-black tracking-[0.16em]">ECOMMERCE</span>
      </span>
    </Link>
  );
}

function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action="/catalogue"
      className={cn(
        "group border-ec-line focus-within:border-ec-blue/50 flex items-center gap-2 rounded-2xl border bg-white p-1.5 shadow-[0_10px_28px_rgba(20,32,46,0.06)] transition focus-within:shadow-[0_0_0_4px_rgba(10,141,193,0.08)]",
        compact ? "h-11 w-full" : "h-12 w-full",
      )}
    >
      <Search className="text-ec-muted ml-2 size-4 shrink-0" aria-hidden="true" />
      <input
        name="search"
        type="search"
        placeholder="Produit, marque, référence..."
        className="text-ec-ink placeholder:text-ec-muted/70 min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
      <button
        type="submit"
        className={cn(
          "bg-ec-ink hover:bg-ec-blue focus-visible:outline-ec-blue inline-flex shrink-0 items-center justify-center rounded-xl text-sm font-black [color:#fff] text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
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
      <div className="border-ec-line absolute top-[calc(100%+0.65rem)] left-0 z-50 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white shadow-[0_22px_60px_rgba(20,32,46,0.16)]">
        <div className="border-ec-line border-b p-2">
          <Link
            href="/catalogue"
            className="bg-ec-ink hover:bg-ec-blue flex items-center justify-between rounded-xl px-4 py-3 text-sm font-black [color:#fff] text-white transition"
            onClick={onClose}
          >
            <span>Tous les produits</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/types-produits"
            className="text-ec-ink hover:bg-ec-paper mt-1 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition"
            onClick={onClose}
          >
            <span>Types de produits</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="commerce-thin-scrollbar max-h-[min(26rem,66vh)] overflow-y-auto p-2">
          <p className="text-ec-muted px-3 py-2 text-[11px] font-black tracking-[0.18em] uppercase">
            Catégories
          </p>
          <div className="grid gap-1">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                className="text-ec-ink hover:bg-ec-paper hover:text-ec-blue flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
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

export function SiteHeader({ categories }: { categories: LandingCategory[] }) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const navCategories = categories.filter((category) => category.subcategories.length > 0);

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
                className="text-ec-ink hover:bg-ec-paper hover:text-ec-blue inline-flex h-10 items-center rounded-full px-4 text-sm font-bold transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/connexion"
              aria-label="Se connecter"
              className="bg-ec-ink hover:bg-ec-blue inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 text-sm font-black [color:#fff] text-white shadow-[0_14px_30px_rgba(20,32,46,0.16)] transition sm:px-5"
            >
              <UserRound className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Se connecter</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-ec-paper/95">
        <div className="mx-auto flex h-[4.25rem] max-w-[92rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="relative shrink-0">
            <button
              type="button"
              className="border-ec-line text-ec-ink hover:border-ec-blue/40 hover:text-ec-blue relative z-50 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border bg-white px-3 text-sm font-black shadow-[0_10px_28px_rgba(20,32,46,0.06)] transition sm:px-4"
              aria-label="Ouvrir les rayons"
              aria-expanded={categoriesOpen}
              aria-haspopup="menu"
              onClick={() => setCategoriesOpen((current) => !current)}
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

          <div className="min-w-0 flex-1">
            <SearchForm compact />
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/favoris" aria-label="Mes favoris">
              <FavoritesBadge />
            </Link>
            <CustomerNotificationsMenu compact />
            <Link href="/panier" aria-label="Panier">
              <CartBadge />
            </Link>
          </div>

          <Link href="/favoris" className="sm:hidden" aria-label="Mes favoris">
            <FavoritesBadge />
          </Link>
          <Link href="/panier" className="sm:hidden" aria-label="Panier">
            <CartBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}
