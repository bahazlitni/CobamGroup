import type { Metadata } from "next";
import type { ProductAvailability } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Filter, Search, SlidersHorizontal, X } from "lucide-react";

import { ProductCard } from "@/components/commerce/product-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getCommerceProductTypeDetail } from "@/lib/commerce";
import { cn } from "@/lib/cn";
import { formatCompactNumber, normalizeSearchParam } from "@/lib/format";

export const dynamic = "force-dynamic";

type ProductTypePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ProductTypeSearchParams>;
};

type ProductTypeSearchParams = {
  search?: string | string[];
  marque?: string | string[];
  tri?: string | string[];
  disponibilite?: string | string[];
  selection?: string | string[];
  page?: string | string[];
  [key: string]: string | string[] | undefined;
};

type AttributeFilters = Record<string, string[]>;

const availabilityOptions: Array<{ value: ProductAvailability | null; label: string }> = [
  { value: null, label: "Toutes disponibilites" },
  { value: "IN_STOCK", label: "En stock" },
  { value: "ON_ORDER", label: "Sur commande" },
  { value: "OUT_OF_STOCK", label: "Rupture" },
];

function valuesFromParam(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .flatMap((item) => item.split("||"))
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAttributeFilters(params: ProductTypeSearchParams): AttributeFilters {
  const filters: AttributeFilters = {};

  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith("f_")) {
      continue;
    }

    const filterKey = key.slice(2);
    const values = valuesFromParam(value);

    if (filterKey && values.length > 0) {
      filters[filterKey] = Array.from(new Set(values));
    }
  }

  return filters;
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

function toggleAttributeFilter(filters: AttributeFilters, key: string, value: string) {
  const next: AttributeFilters = Object.fromEntries(
    Object.entries(filters).map(([filterKey, filterValues]) => [filterKey, [...filterValues]]),
  );
  const selected = new Set(next[key] ?? []);

  if (selected.has(value)) {
    selected.delete(value);
  } else {
    selected.add(value);
  }

  if (selected.size > 0) {
    next[key] = Array.from(selected);
  } else {
    delete next[key];
  }

  return next;
}

function productTypeHref(
  slug: string,
  input: {
    search?: string | null;
    brand?: string | null;
    sort?: string | null;
    availability?: ProductAvailability | null;
    promotedOnly?: boolean;
    page?: number | null;
    attributeFilters?: AttributeFilters;
  },
) {
  const params = new URLSearchParams();

  if (input.search) params.set("search", input.search);
  if (input.brand) params.set("marque", input.brand);
  if (input.sort && input.sort !== "latest") params.set("tri", input.sort);
  if (input.availability) params.set("disponibilite", input.availability);
  if (input.promotedOnly) params.set("selection", "promotion");
  if (input.page && input.page > 1) params.set("page", input.page.toString());

  for (const [key, values] of Object.entries(input.attributeFilters ?? {})) {
    for (const value of values) {
      params.append(`f_${key}`, value);
    }
  }

  const query = params.toString();
  return query ? `/types-produits/${slug}?${query}` : `/types-produits/${slug}`;
}

function HiddenFilterInputs({ filters }: { filters: AttributeFilters }) {
  return (
    <>
      {Object.entries(filters).flatMap(([key, values]) =>
        values.map((value) => (
          <input key={`${key}-${value}`} type="hidden" name={`f_${key}`} value={value} />
        )),
      )}
    </>
  );
}

function activeLinkClass(active: boolean) {
  return cn(
    "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
    active ? "bg-ec-ink text-white" : "text-ec-muted hover:bg-white hover:text-ec-ink",
  );
}

export async function generateMetadata({ params }: ProductTypePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCommerceProductTypeDetail({ slug, pageSize: 1 });

  if (!result) {
    return {
      title: "Type produit introuvable",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: result.productType.titleSeo ?? `${result.productType.displayName} | Types de produits`,
    description:
      result.productType.descriptionSeo ??
      result.productType.description ??
      "Explorez les produits e-cobam par template avec des filtres techniques dedies.",
    openGraph: {
      title: result.productType.titleSeo ?? result.productType.displayName,
      description:
        result.productType.descriptionSeo ??
        result.productType.description ??
        "Explorez les produits e-cobam par template avec des filtres techniques dedies.",
      images: result.productType.image?.url ? [{ url: result.productType.image.url }] : undefined,
    },
  };
}

export default async function ProductTypePage({ params, searchParams }: ProductTypePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const search = normalizeSearchParam(query.search);
  const brand = normalizeSearchParam(query.marque);
  const sort = normalizeSearchParam(query.tri) ?? "latest";
  const availability = resolveAvailability(query.disponibilite);
  const promotedOnly = normalizeSearchParam(query.selection) === "promotion";
  const page = resolvePage(query.page);
  const attributeFilters = parseAttributeFilters(query);
  const result = await getCommerceProductTypeDetail({
    slug,
    brand,
    search,
    sort,
    availability,
    promotedOnly,
    attributeFilters,
    page,
  });

  if (!result) {
    notFound();
  }

  const totalPages = Math.max(1, Math.ceil(result.total / 36));
  const activeAttributeFilterCount = Object.values(attributeFilters).reduce(
    (sum, values) => sum + values.length,
    0,
  );
  const availabilityLabel = availabilityOptions.find((item) => item.value === availability)?.label;

  return (
    <main className="commerce-container py-8 sm:py-10 lg:py-14">
      <section className="overflow-hidden rounded-[2rem] bg-ec-ink text-white">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(10,141,193,0.24),transparent_50%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <Link
                href="/types-produits"
                className="text-sm font-semibold uppercase tracking-[0.28em] text-ec-blue transition hover:text-white"
              >
                Exploration par type
              </Link>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                {result.productType.displayName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
                {result.productType.description ||
                  "Un espace technique dedie a ce template, avec des filtres construits a partir de ses attributs filtrables."}
              </p>
            </div>
            <Card className="border-white/10 bg-white/[0.06] text-white shadow-none">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-white/45">
                    Produits visibles
                  </span>
                  <Badge variant="blue">{result.productType.group?.name ?? "Template"}</Badge>
                </div>
                <p className="text-5xl font-black">{formatCompactNumber(result.productType.productCount)}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/[0.06] p-3">
                    <p className="text-2xl font-black">{result.filters.length}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                      filtres
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.06] p-3">
                    <p className="text-2xl font-black">{activeAttributeFilterCount}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                      actifs
                    </p>
                  </div>
                </div>
                {result.productType.image?.thumbnailUrl || result.productType.image?.url ? (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-ec-ink">
                    <Image
                      src={result.productType.image.thumbnailUrl ?? result.productType.image.url}
                      alt={result.productType.image.altText ?? result.productType.displayName}
                      fill
                      sizes="(min-width: 1024px) 360px, 90vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[315px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="size-4 text-ec-blue" />
                Recherche
              </CardTitle>
              <CardDescription>Dans ce type de produit uniquement.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={`/types-produits/${slug}`} className="space-y-3">
                {brand ? <input type="hidden" name="marque" value={brand} /> : null}
                {availability ? <input type="hidden" name="disponibilite" value={availability} /> : null}
                {promotedOnly ? <input type="hidden" name="selection" value="promotion" /> : null}
                {sort !== "latest" ? <input type="hidden" name="tri" value={sort} /> : null}
                <HiddenFilterInputs filters={attributeFilters} />
                <Input name="search" defaultValue={search ?? ""} placeholder="Nom, SKU, attribut..." />
                <button className="bg-ec-ink hover:bg-ec-blue h-11 w-full rounded-full text-sm font-black text-white transition">
                  Rechercher
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="size-4 text-ec-blue" />
                Marques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Link
                href={productTypeHref(slug, {
                  search,
                  sort,
                  availability,
                  promotedOnly,
                  attributeFilters,
                })}
                className={activeLinkClass(!brand)}
              >
                Toutes les marques
              </Link>
              {result.brands.slice(0, 16).map((item) => (
                <Link
                  key={item.slug}
                  href={productTypeHref(slug, {
                    brand: item.slug,
                    search,
                    sort,
                    availability,
                    promotedOnly,
                    attributeFilters,
                  })}
                  className={activeLinkClass(brand === item.slug)}
                >
                  {item.name}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="size-4 text-ec-blue" />
                Disponibilite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {availabilityOptions.map((item) => (
                <Link
                  key={item.value ?? "all"}
                  href={productTypeHref(slug, {
                    brand,
                    search,
                    sort,
                    availability: item.value,
                    promotedOnly,
                    attributeFilters,
                  })}
                  className={activeLinkClass(availability === item.value)}
                >
                  {item.label}
                </Link>
              ))}
              <Separator className="my-3" />
              <Link
                href={productTypeHref(slug, {
                  brand,
                  search,
                  sort,
                  availability,
                  attributeFilters,
                })}
                className={activeLinkClass(!promotedOnly)}
              >
                Toutes les offres
              </Link>
              <Link
                href={productTypeHref(slug, {
                  brand,
                  search,
                  sort,
                  availability,
                  promotedOnly: true,
                  attributeFilters,
                })}
                className={activeLinkClass(promotedOnly)}
              >
                Selections COBAM
              </Link>
            </CardContent>
          </Card>

          {result.filters.map((filter) => (
            <Card key={filter.key}>
              <CardHeader>
                <CardTitle className="text-base">{filter.label}</CardTitle>
                {filter.unit ? <CardDescription>Unite : {filter.unit}</CardDescription> : null}
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {filter.options.map((option) => {
                  const nextFilters = toggleAttributeFilter(
                    attributeFilters,
                    filter.key,
                    option.value,
                  );

                  return (
                    <Badge
                      key={`${filter.key}-${option.value}`}
                      asChild
                      variant={option.active ? "default" : "outline"}
                      className="hover:border-ec-blue hover:text-ec-blue"
                    >
                      <Link
                        href={productTypeHref(slug, {
                          brand,
                          search,
                          sort,
                          availability,
                          promotedOnly,
                          attributeFilters: nextFilters,
                        })}
                      >
                        {option.label}
                        <span className="opacity-60">{formatCompactNumber(option.count)}</span>
                      </Link>
                    </Badge>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </aside>

        <div>
          <Card className="mb-5">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-ec-ink">
                  {formatCompactNumber(result.total)} resultat{result.total > 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-sm text-ec-muted">
                  {[
                    result.productType.displayName,
                    brand ? `marque ${brand}` : null,
                    availability ? availabilityLabel : null,
                    search ? `recherche "${search}"` : null,
                  ]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {activeAttributeFilterCount > 0 || brand || search || availability || promotedOnly ? (
                  <ButtonLink
                    href={`/types-produits/${slug}`}
                    variant="secondary"
                    size="sm"
                    icon={<X className="size-4" />}
                  >
                    Reinitialiser
                  </ButtonLink>
                ) : null}
                <form action={`/types-produits/${slug}`} className="flex items-center gap-2">
                  {search ? <input type="hidden" name="search" value={search} /> : null}
                  {brand ? <input type="hidden" name="marque" value={brand} /> : null}
                  {availability ? <input type="hidden" name="disponibilite" value={availability} /> : null}
                  {promotedOnly ? <input type="hidden" name="selection" value="promotion" /> : null}
                  <HiddenFilterInputs filters={attributeFilters} />
                  <label className="text-sm text-ec-muted" htmlFor="tri">
                    Trier
                  </label>
                  <select
                    id="tri"
                    name="tri"
                    defaultValue={sort}
                    className="h-11 rounded-full border border-ec-line bg-white px-4 text-sm font-semibold text-ec-ink outline-none focus:border-ec-blue"
                  >
                    <option value="latest">Plus recents</option>
                    <option value="name">Nom</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix decroissant</option>
                    <option value="stock">Stock</option>
                  </select>
                  <button className="bg-ec-ink hover:bg-ec-blue h-11 rounded-full px-4 text-sm font-black text-white transition">
                    OK
                  </button>
                </form>
              </div>
            </CardContent>
          </Card>

          {result.items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {result.items.map((product, index) => (
                <ProductCard
                  key={`${product.entityType}-${product.id}`}
                  product={product}
                  priority={index < 3}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center sm:p-12">
                <h2 className="text-2xl font-black text-ec-ink">Aucun produit trouve</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ec-muted">
                  Retirez un filtre technique, une marque ou votre recherche pour elargir les resultats.
                </p>
                <ButtonLink href={`/types-produits/${slug}`} className="mt-6" variant="secondary">
                  Reinitialiser les filtres
                </ButtonLink>
              </CardContent>
            </Card>
          )}

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-3">
              {page > 1 ? (
                <ButtonLink
                  href={productTypeHref(slug, {
                    page: page - 1,
                    search,
                    brand,
                    sort,
                    availability,
                    promotedOnly,
                    attributeFilters,
                  })}
                  variant="secondary"
                >
                  Page precedente
                </ButtonLink>
              ) : null}
              <span className="text-sm font-semibold text-ec-muted">
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <ButtonLink
                  href={productTypeHref(slug, {
                    page: page + 1,
                    search,
                    brand,
                    sort,
                    availability,
                    promotedOnly,
                    attributeFilters,
                  })}
                  variant="secondary"
                  icon={<ArrowRight className="size-4" />}
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
