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
      <span className="bg-ec-ink group-hover:bg-ec-blue grid size-10 place-items-center rounded-full text-sm font-black text-white transition">
        C
      </span>
      <span className="leading-none">
        <span className="text-ec-ink block text-lg font-black tracking-[0.16em]">COBAM</span>
        <span className="text-ec-blue block text-[11px] font-semibold tracking-[0.28em] uppercase">
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
        "group border-ec-line focus-within:border-ec-blue/50 flex items-center gap-2 rounded-full border bg-white px-4 transition focus-within:shadow-[0_0_0_4px_rgba(10,141,193,0.08)]",
        compact ? "h-11" : "h-12 w-full",
      )}
    >
      <Search className="text-ec-muted size-4 shrink-0" />
      <input
        name="search"
        type="search"
        placeholder="Produit, marque, référence..."
        className="text-ec-ink placeholder:text-ec-muted/70 min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
    </form>
  );
}

export function SiteHeader({ categories }: { categories: LandingCategory[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navCategories = categories.filter((category) => category.subcategories.length > 0);

  return (
    <header className="border-ec-line/80 sticky top-0 z-50 border-b bg-[#fbf9f5]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[92rem] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="ml-auto hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex">
          <div className="w-[min(44rem,52vw)]">
            <SearchForm />
          </div>
          <Link
            href="/compte"
            className="border-ec-line text-ec-ink hover:border-ec-blue/40 hover:text-ec-blue grid size-10 place-items-center rounded-full border bg-white transition"
            aria-label="Compte client"
          >
            <UserRound className="size-5" />
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
            className="border-ec-line text-ec-ink grid size-10 place-items-center rounded-full border bg-white"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <div className="border-ec-line/70 hidden border-t bg-white/72 lg:block">
        <nav
          className="mx-auto flex h-12 max-w-[92rem] items-center gap-2 px-4 sm:px-6 lg:px-8"
          aria-label="Categories e-commerce"
        >
          <Link
            href="/catalogue"
            className="bg-ec-ink hover:bg-ec-blue rounded-full px-4 py-2 text-sm font-black [color:#fff] text-white transition"
          >
            Catalogue
          </Link>
          <Link
            href="/types-produits"
            className="text-ec-ink hover:bg-ec-stone hover:text-ec-blue inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition"
          >
            Types de produits
          </Link>

          {navCategories.map((category) => (
            <div key={category.slug} className="group relative">
              <Link
                href={category.href}
                className="text-ec-ink hover:bg-ec-stone hover:text-ec-blue inline-flex h-10 max-w-[13rem] items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition"
                aria-haspopup="true"
              >
                <span className="truncate">{category.name}</span>
                <ChevronDown className="size-4 shrink-0 transition group-hover:rotate-180" />
              </Link>

              <div className="border-ec-line shadow-ec-ink/10 invisible absolute top-full left-0 z-50 w-80 translate-y-2 rounded-[1.25rem] border bg-white p-3 opacity-0 shadow-2xl transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <Link
                  href={category.href}
                  className="bg-ec-paper text-ec-ink hover:bg-ec-stone block rounded-2xl px-4 py-3 text-sm font-black transition"
                >
                  Tous les produits
                </Link>
                <div className="mt-2 grid gap-1">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.slug}
                      href={`/catalogue?categorie=${subcategory.slug}`}
                      className="text-ec-muted hover:bg-ec-paper hover:text-ec-ink flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                    >
                      <span>{subcategory.name}</span>
                      <span className="text-ec-muted/70 text-xs">{subcategory.productCount}</span>
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
          className="bg-ec-ink/30 fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="ml-auto flex h-full w-[min(420px,88vw)] flex-col bg-[#fbf9f5] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                className="border-ec-line grid size-10 place-items-center rounded-full border bg-white"
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
                className="text-ec-ink rounded-2xl bg-white px-4 py-4 text-base font-semibold"
              >
                Tous les produits
              </Link>
              <Link
                href="/types-produits"
                onClick={() => setMobileOpen(false)}
                className="text-ec-ink rounded-2xl bg-white px-4 py-4 text-base font-semibold"
              >
                Explorer par type
              </Link>
              {navCategories.map((category) => (
                <details key={category.slug} className="rounded-2xl bg-white/60 px-4 py-2">
                  <summary className="text-ec-ink flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-base font-semibold">
                    {category.name}
                    <ChevronDown className="size-4" />
                  </summary>
                  <div className="border-ec-line/70 border-t py-2">
                    <Link
                      href={category.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-ec-blue block rounded-xl px-3 py-2 text-sm font-black"
                    >
                      Tous les produits
                    </Link>
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/catalogue?categorie=${subcategory.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="text-ec-muted flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold"
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
