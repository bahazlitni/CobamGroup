import type { Metadata } from "next";
import Link from "next/link";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { ButtonLink } from "@/components/ui/button";
import { listCommerceProducts } from "@/lib/commerce";
import { formatCompactNumber, normalizeSearchParam } from "@/lib/format";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type CatalogSearchParams = {
  search?: string | string[];
  categorie?: string | string[];
  marque?: string | string[];
  tri?: string | string[];
  page?: string | string[];
};

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Explorez le catalogue e-commerce COBAM GROUP.",
};

function activeClass(active: boolean) {
  return cn(
    "block rounded-2xl px-4 py-3 text-sm font-semibold transition",
    active
      ? "bg-ec-ink text-white"
      : "text-ec-muted hover:bg-white hover:text-ec-ink",
  );
}

function resolvePage(value: string | string[] | undefined) {
  const raw = normalizeSearchParam(value);
  const page = raw ? Number(raw) : 1;

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;
  const search = normalizeSearchParam(params.search);
  const category = normalizeSearchParam(params.categorie);
  const brand = normalizeSearchParam(params.marque);
  const sort = normalizeSearchParam(params.tri) ?? "latest";
  const page = resolvePage(params.page);
  const result = await listCommerceProducts({
    category,
    brand,
    search,
    sort,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(result.total / 36));

  return (
    <main className="commerce-container py-8 sm:py-10 lg:py-14">
      <section className="rounded-[2rem] bg-ec-ink p-6 text-white sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ec-blue">
          Catalogue
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_440px] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              Trouver rapidement la bonne référence.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Filtrez par rayon, marque ou recherche libre. Les fiches utilisent les produits,
              médias, marques et attributs de la base partagée COBAM.
            </p>
          </div>
          <form action="/catalogue" className="rounded-full bg-white p-2 shadow-2xl shadow-black/10">
            {category ? <input type="hidden" name="categorie" value={category} /> : null}
            {brand ? <input type="hidden" name="marque" value={brand} /> : null}
            <div className="flex items-center gap-2">
              <Search className="ml-4 size-5 text-ec-muted" />
              <input
                name="search"
                defaultValue={search ?? ""}
                placeholder="Nom, SKU, couleur, finition..."
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ec-ink outline-none placeholder:text-ec-muted/70"
              />
              <button className="rounded-full bg-ec-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-ec-ink">
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[1.5rem] border border-ec-line bg-white p-4">
            <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.18em] text-ec-muted">
              <Filter className="size-4" />
              Rayons
            </div>
            <Link href="/catalogue" className={activeClass(!category)}>
              Tous les rayons
            </Link>
            {result.categories.map((item) => (
              <Link
                key={item.slug}
                href={`/catalogue?categorie=${item.slug}${search ? `&search=${encodeURIComponent(search)}` : ""}${brand ? `&marque=${brand}` : ""}`}
                className={activeClass(category === item.slug)}
              >
                <span>{item.name}</span>
                <span className="float-right text-xs opacity-60">
                  {formatCompactNumber(item.productCount)}
                </span>
              </Link>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-ec-line bg-white p-4">
            <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.18em] text-ec-muted">
              <SlidersHorizontal className="size-4" />
              Marques
            </div>
            <Link
              href={`/catalogue${category ? `?categorie=${category}` : ""}`}
              className={activeClass(!brand)}
            >
              Toutes les marques
            </Link>
            {result.brands.slice(0, 14).map((item) => (
              <Link
                key={item.slug}
                href={`/catalogue?marque=${item.slug}${category ? `&categorie=${category}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className={activeClass(brand === item.slug)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-col gap-4 rounded-[1.5rem] border border-ec-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ec-ink">
                {formatCompactNumber(result.total)} résultat{result.total > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-sm text-ec-muted">
                {result.activeCategory?.name ?? "Tous les produits"}
                {search ? ` · recherche "${search}"` : ""}
              </p>
            </div>
            <form action="/catalogue" className="flex items-center gap-2">
              {search ? <input type="hidden" name="search" value={search} /> : null}
              {category ? <input type="hidden" name="categorie" value={category} /> : null}
              {brand ? <input type="hidden" name="marque" value={brand} /> : null}
              <label className="text-sm text-ec-muted" htmlFor="tri">
                Trier
              </label>
              <select
                id="tri"
                name="tri"
                defaultValue={sort}
                className="h-11 rounded-full border border-ec-line bg-white px-4 text-sm font-semibold text-ec-ink outline-none focus:border-ec-blue"
              >
                <option value="latest">Plus récents</option>
                <option value="name">Nom</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="stock">Stock</option>
              </select>
              <button className="rounded-full bg-ec-ink px-4 py-2.5 text-sm font-semibold text-white">
                OK
              </button>
            </form>
          </div>

          {result.items.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((product, index) => (
                <ProductCard key={`${product.entityType}-${product.id}`} product={product} priority={index < 3} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-ec-line bg-white p-10 text-center">
              <h2 className="text-2xl font-black text-ec-ink">Aucun produit trouvé</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ec-muted">
                Essayez un terme plus court, retirez une marque ou revenez au catalogue complet.
              </p>
              <ButtonLink href="/catalogue" className="mt-6" variant="secondary">
                Réinitialiser les filtres
              </ButtonLink>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-3">
              {page > 1 ? (
                <ButtonLink
                  href={`/catalogue?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${category ? `&categorie=${category}` : ""}${brand ? `&marque=${brand}` : ""}${sort ? `&tri=${sort}` : ""}`}
                  variant="secondary"
                >
                  Page précédente
                </ButtonLink>
              ) : null}
              <span className="text-sm font-semibold text-ec-muted">
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <ButtonLink
                  href={`/catalogue?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${category ? `&categorie=${category}` : ""}${brand ? `&marque=${brand}` : ""}${sort ? `&tri=${sort}` : ""}`}
                  variant="secondary"
                >
                  Page suivante
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
