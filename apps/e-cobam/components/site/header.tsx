"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, UserRound, X } from "lucide-react";
import { CartBadge } from "@/components/cart/cart-badge";
import type { LandingCategory } from "@/lib/home-data";
import { cn } from "@/lib/cn";

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Accueil e-cobam">
      <span className="grid size-10 place-items-center rounded-full bg-ec-ink text-sm font-black text-white transition group-hover:bg-ec-blue">
        C
      </span>
      <span className="leading-none">
        <span className="block text-lg font-black tracking-[0.16em] text-ec-ink">COBAM</span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-ec-blue">
          e-commerce
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
        "group flex items-center gap-2 rounded-full border border-ec-line bg-white px-4 transition focus-within:border-ec-blue/50 focus-within:shadow-[0_0_0_4px_rgba(10,141,193,0.08)]",
        compact ? "h-11" : "h-12 w-[min(34rem,36vw)] min-w-[20rem]",
      )}
    >
      <Search className="size-4 shrink-0 text-ec-muted" />
      <input
        name="search"
        type="search"
        placeholder="Produit, marque, référence..."
        className="min-w-0 flex-1 bg-transparent text-sm text-ec-ink outline-none placeholder:text-ec-muted/70"
      />
    </form>
  );
}

export function SiteHeader({ categories }: { categories: LandingCategory[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ec-line/80 bg-[#fbf9f5]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[92rem] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden min-w-0 items-center gap-1 xl:flex">
          <Link
            href="/catalogue"
            className="rounded-full px-4 py-2 text-sm font-semibold text-ec-ink transition hover:bg-ec-stone hover:text-ec-blue"
          >
            Catalogue
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              className="max-w-[10.5rem] truncate rounded-full px-4 py-2 text-sm font-semibold text-ec-muted transition hover:bg-ec-stone hover:text-ec-ink"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <SearchForm />
          <Link
            href="/compte"
            className="grid size-10 place-items-center rounded-full border border-ec-line bg-white text-ec-ink transition hover:border-ec-blue/40 hover:text-ec-blue"
            aria-label="Compte client"
          >
            <UserRound className="size-5" />
          </Link>
          <Link href="/panier" aria-label="Panier">
            <CartBadge />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link href="/panier" aria-label="Panier">
            <CartBadge />
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-ec-line bg-white text-ec-ink"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-ec-ink/30 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside
            className="ml-auto flex h-full w-[min(420px,88vw)] flex-col bg-[#fbf9f5] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full border border-ec-line bg-white"
                aria-label="Fermer le menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-7">
              <SearchForm compact />
            </div>

            <nav className="mt-8 flex flex-col gap-2">
              <Link
                href="/catalogue"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-white px-4 py-4 text-base font-semibold text-ec-ink"
              >
                Tous les produits
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={category.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-4 text-base font-semibold text-ec-muted transition hover:bg-white hover:text-ec-ink"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
