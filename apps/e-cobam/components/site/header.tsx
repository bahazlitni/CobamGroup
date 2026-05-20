"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, UserRound, X } from "lucide-react";
import { CartBadge } from "@/components/cart/cart-badge";
import { CustomerNotificationsMenu } from "@/components/site/customer-notifications-menu";
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
        compact ? "h-11 w-full" : "h-12 w-full",
      )}
    >
      <Search className="size-4 shrink-0 text-ec-muted" aria-hidden="true" />
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
  const navCategories = categories.filter((category) => category.subcategories.length > 0);

  return (
    <header className="sticky top-0 z-50 border-b border-ec-line/80 bg-white/95 shadow-[0_10px_34px_rgba(20,32,46,0.055)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.75rem] max-w-[92rem] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="ml-auto hidden min-w-0 flex-1 items-center justify-end md:flex">
          <div className="w-[min(42rem,48vw)]">
            <SearchForm />
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/connexion"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ec-ink px-5 text-sm font-black text-white [color:#fff] shadow-[0_16px_34px_rgba(20,32,46,0.16)] transition hover:bg-ec-blue"
          >
            <UserRound className="size-4" aria-hidden="true" />
            Se connecter
          </Link>
          <CustomerNotificationsMenu />
          <Link href="/panier" aria-label="Panier">
            <CartBadge />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <CustomerNotificationsMenu compact />
          <Link href="/panier" aria-label="Panier">
            <CartBadge />
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-ec-line bg-white text-ec-ink"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="hidden border-t border-ec-line/70 bg-white lg:block">
        <nav
          className="mx-auto flex min-h-14 max-w-[92rem] flex-wrap items-center gap-2 px-4 py-2 sm:px-6 lg:px-8"
          aria-label="Categories e-commerce"
        >
          <Link
            href="/catalogue"
            className="shrink-0 rounded-full bg-ec-ink px-4 py-2 text-sm font-black text-white [color:#fff] transition hover:bg-ec-blue"
          >
            Tous les produits
          </Link>
          <Link
            href="/types-produits"
            className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold text-ec-ink transition hover:bg-ec-stone hover:text-ec-blue"
          >
            Types de produits
          </Link>

          {navCategories.map((category) => (
            <div key={category.slug} className="group relative shrink-0">
              <Link
                href={category.href}
                className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-semibold text-ec-ink transition hover:bg-ec-stone hover:text-ec-blue"
                aria-haspopup="true"
              >
                <span>{category.name}</span>
                <ChevronDown className="size-4 shrink-0 transition group-hover:rotate-180" />
              </Link>

              <div className="invisible absolute left-0 top-full z-50 w-80 translate-y-2 rounded-2xl border border-ec-line bg-white p-3 opacity-0 shadow-2xl shadow-ec-ink/10 transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <Link
                  href={category.href}
                  className="block rounded-xl bg-ec-paper px-4 py-3 text-sm font-black text-ec-ink transition hover:bg-ec-stone"
                >
                  Tous les produits
                </Link>
                <div className="mt-2 grid gap-1">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.slug}
                      href={`/catalogue?categorie=${subcategory.slug}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-ec-muted transition hover:bg-ec-paper hover:text-ec-ink"
                    >
                      <span>{subcategory.name}</span>
                      <span className="text-xs text-ec-muted/70">{subcategory.productCount}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-ec-ink/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="ml-auto flex h-full w-[min(420px,88vw)] flex-col bg-ec-paper p-5 shadow-2xl"
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
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-7">
              <SearchForm compact />
            </div>

            <nav className="mt-8 flex flex-col gap-2 overflow-y-auto pb-8">
              <Link
                href="/connexion"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-ec-ink px-4 py-4 text-base font-black text-white [color:#fff]"
              >
                Se connecter
              </Link>
              <Link
                href="/catalogue"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-white px-4 py-4 text-base font-semibold text-ec-ink"
              >
                Tous les produits
              </Link>
              <Link
                href="/types-produits"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-white px-4 py-4 text-base font-semibold text-ec-ink"
              >
                Explorer par type
              </Link>
              {navCategories.map((category) => (
                <details key={category.slug} className="rounded-2xl bg-white/60 px-4 py-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-base font-semibold text-ec-ink">
                    {category.name}
                    <ChevronDown className="size-4" aria-hidden="true" />
                  </summary>
                  <div className="border-t border-ec-line/70 py-2">
                    <Link
                      href={category.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-black text-ec-blue"
                    >
                      Tous les produits
                    </Link>
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/catalogue?categorie=${subcategory.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-ec-muted"
                      >
                        <span>{subcategory.name}</span>
                        <span className="text-xs">{subcategory.productCount}</span>
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
