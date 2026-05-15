import type { Metadata } from "next";
import type { ProductAvailability } from "@prisma/client";
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
  disponibilite?: string | string[];
  sélection?: string | string[];
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

function resolveAvailability(value: string | string[] | undefined): ProductAvailability | null {
  const raw = normalizeSearchParam(value);

  if (raw === "IN_STOCK" || raw === "ON_ORDER" || raw === "OUT_OF_STOCK") {
    return raw;
  }

  return null;
}

function catalogHref(input: {
  search?: string | null;
  category?: string | null;
  brand?: string | null;
  sort?: string | null;
  availability?: ProductAvailability | null;
  promotedOnly?: boolean;
  page?: number | null;
}) {
  const params = new URLSearchParams();

  if (input.search) params.set("search", input.search);
  if (input.category) params.set("categorie", input.category);
  if (input.brand) params.set("marque", input.brand);
  if (input.sort && input.sort !== "latest") params.set("tri", input.sort);
  if (input.availability) params.set("disponibilite", input.availability);
  if (input.promotedOnly) params.set("sélection", "promotion");
  if (input.page && input.page > 1) params.set("page", input.page.toString());

  const query = params.toString();
  return query ? `/catalogue?${query}` : "/catalogue";
}

const availabilityOptions: Array<{ value: ProductAvailability | null; label: string }> = [
  { value: null, label: "Toutes disponibilités" },
  { value: "IN_STOCK", label: "En stock" },
  { value: "ON_ORDER", label: "Sur commande" },
  { value: "OUT_OF_STOCK", label: "Rupture" },
];

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
  const availability = resolveAvailability(params.disponibilite);
  const promotedOnly = normalizeSearchParam(params.sélection) === "promotion";
  const page = resolvePage(params.page);
  const result = await listCommerceProducts({
    category,
    brand,
    search,
    sort,
    availability,
    promotedOnly,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(result.total / 36));
  const availabilityLabel = availabilityOptions.find((item) => item.value === availability)?.label;
  const activeFilterSummary = [
    result.activeCategory?.name ?? "Tous les produits",
    availability ? availabilityLabel : null,
    promotedOnly ? "Sélections COBAM" : null,
    search ? `recherche "${search}"` : null,
  ].filter(Boolean);

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
            {availability ? <input type="hidden" name="disponibilite" value={availability} /> : null}
            {promotedOnly ? <input type="hidden" name="sélection" value="promotion" /> : null}
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
            <Link
              href={catalogHref({ search, brand, availability, promotedOnly })}
              className={activeClass(!category)}
            >
              Tous les rayons
            </Link>
            {result.categories.map((item) => (
              <div key={item.slug}>
                <Link
                  href={catalogHref({
                    category: item.slug,
                    search,
                    brand,
                    availability,
                    promotedOnly,
                  })}
                  className={activeClass(
                    category === item.slug ||
                      item.subcategories.some((subcategory) => subcategory.slug === category),
                  )}
                >
                  <span>{item.name}</span>
                  <span className="float-right text-xs opacity-60">
                    {formatCompactNumber(item.productCount)}
                  </span>
                </Link>
                {item.subcategories.length > 0 ? (
                  <div className="mt-1 space-y-1 pl-3">
                    {item.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={catalogHref({
                          category: subcategory.slug,
                          search,
                          brand,
                          availability,
                          promotedOnly,
                        })}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition",
                          category === subcategory.slug
                            ? "bg-ec-blue/10 text-ec-blue"
                            : "text-ec-muted hover:bg-ec-stone hover:text-ec-ink",
                        )}
                      >
                        <span>{subcategory.name}</span>
                        <span className="opacity-60">
                          {formatCompactNumber(subcategory.productCount)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-ec-line bg-white p-4">
            <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.18em] text-ec-muted">
              <SlidersHorizontal className="size-4" />
              Marques
            </div>
            <Link
              href={catalogHref({ category, search, availability, promotedOnly })}
              className={activeClass(!brand)}
            >
              Toutes les marques
            </Link>
            {result.brands.slice(0, 14).map((item) => (
              <Link
                key={item.slug}
                href={catalogHref({
                  brand: item.slug,
                  category,
                  search,
                  availability,
                  promotedOnly,
                })}
                className={activeClass(brand === item.slug)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-ec-line bg-white p-4">
            <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.18em] text-ec-muted">
              <SlidersHorizontal className="size-4" />
              Disponibilité
            </div>
            {availabilityOptions.map((item) => (
              <Link
                key={item.value ?? "all"}
                href={catalogHref({
                  category,
                  brand,
                  search,
                  availability: item.value,
                  promotedOnly,
                })}
                className={activeClass(availability === item.value)}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-3 border-t border-ec-line" />
            <Link
              href={catalogHref({ category, brand, search, availability })}
              className={activeClass(!promotedOnly)}
            >
              Toutes les offres
            </Link>
            <Link
              href={catalogHref({
                category,
                brand,
                search,
                availability,
                promotedOnly: true,
              })}
              className={activeClass(promotedOnly)}
            >
              Sélections COBAM
            </Link>
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
            {availability || promotedOnly ? (
              <p className="text-xs font-semibold text-ec-blue sm:text-right">
                {activeFilterSummary.join(" · ")}
              </p>
            ) : null}
            <form action="/catalogue" className="flex items-center gap-2">
              {search ? <input type="hidden" name="search" value={search} /> : null}
              {category ? <input type="hidden" name="categorie" value={category} /> : null}
              {brand ? <input type="hidden" name="marque" value={brand} /> : null}
              {availability ? <input type="hidden" name="disponibilite" value={availability} /> : null}
              {promotedOnly ? <input type="hidden" name="sélection" value="promotion" /> : null}
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
                  href={catalogHref({
                    page: page - 1,
                    search,
                    category,
                    brand,
                    sort,
                    availability,
                    promotedOnly,
                  })}
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
                  href={catalogHref({
                    page: page + 1,
                    search,
                    category,
                    brand,
                    sort,
                    availability,
                    promotedOnly,
                  })}
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
