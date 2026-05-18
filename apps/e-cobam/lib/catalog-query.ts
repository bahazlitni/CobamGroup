import type { ProductAvailability } from "@prisma/client";
import { normalizeSearchParam } from "@/lib/format";

export type CatalogSearchParams = {
  search?: string | string[];
  categorie?: string | string[];
  marque?: string | string[];
  tri?: string | string[];
  disponibilité?: string | string[];
  sélection?: string | string[];
  prixMin?: string | string[];
  prixMax?: string | string[];
  page?: string | string[];
};

export type CatalogFilters = {
  search: string | null;
  category: string[];
  brand: string[];
  sort: string;
  availability: ProductAvailability[];
  promotedOnly: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
};

export const CATALOG_AVAILABILITY_OPTIONS: Array<{ value: ProductAvailability; label: string }> = [
  { value: "IN_STOCK", label: "En stock" },
  { value: "ON_ORDER", label: "Sur commande" },
];

export const CATALOG_SORT_OPTIONS = [
  { value: "latest", label: "Plus récents" },
  { value: "name", label: "Nom" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "stock", label: "Stock" },
];

function resolvePage(value: string | string[] | undefined) {
  const raw = normalizeSearchParam(value);
  const page = raw ? Number(raw) : 1;

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function resolveValues(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function resolveAvailabilities(value: string | string[] | undefined): ProductAvailability[] {
  return resolveValues(value).filter(
    (item): item is ProductAvailability => item === "IN_STOCK" || item === "ON_ORDER",
  );
}

function resolvePrice(value: string | string[] | undefined) {
  const raw = normalizeSearchParam(value);
  if (!raw) {
    return null;
  }

  const price = Number(raw.replace(",", "."));
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export function appendValues(
  params: URLSearchParams,
  name: string,
  value: string | string[] | null | undefined,
) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  values.forEach((item) => params.append(name, item));
}

export function resolveCatalogFilters(params: CatalogSearchParams): CatalogFilters {
  const resolvedMinPrice = resolvePrice(params.prixMin);
  const resolvedMaxPrice = resolvePrice(params.prixMax);

  return {
    search: normalizeSearchParam(params.search),
    category: resolveValues(params.categorie),
    brand: resolveValues(params.marque),
    sort: normalizeSearchParam(params.tri) ?? "latest",
    availability: resolveAvailabilities(params.disponibilité),
    promotedOnly: normalizeSearchParam(params.sélection) === "promotion",
    minPrice:
      resolvedMinPrice != null && resolvedMaxPrice != null
        ? Math.min(resolvedMinPrice, resolvedMaxPrice)
        : resolvedMinPrice,
    maxPrice:
      resolvedMinPrice != null && resolvedMaxPrice != null
        ? Math.max(resolvedMinPrice, resolvedMaxPrice)
        : resolvedMaxPrice,
    page: resolvePage(params.page),
  };
}

export function resolveCatalogFiltersFromSearchParams(params: URLSearchParams): CatalogFilters {
  return resolveCatalogFilters({
    search: params.getAll("search"),
    categorie: params.getAll("categorie"),
    marque: params.getAll("marque"),
    tri: params.getAll("tri"),
    disponibilité: params.getAll("disponibilité"),
    sélection: params.getAll("sélection"),
    prixMin: params.getAll("prixMin"),
    prixMax: params.getAll("prixMax"),
    page: params.getAll("page"),
  });
}

export function catalogHref(input: {
  search?: string | null;
  category?: string | string[] | null;
  brand?: string | string[] | null;
  sort?: string | null;
  availability?: ProductAvailability | ProductAvailability[] | null;
  promotedOnly?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  page?: number | null;
}) {
  const params = new URLSearchParams();

  if (input.search) params.set("search", input.search);
  appendValues(params, "categorie", input.category);
  appendValues(params, "marque", input.brand);
  if (input.sort && input.sort !== "latest") params.set("tri", input.sort);
  appendValues(params, "disponibilité", input.availability);
  if (input.promotedOnly) params.set("sélection", "promotion");
  if (input.minPrice != null) params.set("prixMin", input.minPrice.toString());
  if (input.maxPrice != null) params.set("prixMax", input.maxPrice.toString());
  if (input.page && input.page > 1) params.set("page", input.page.toString());

  const query = params.toString();
  return query ? `/catalogue?${query}` : "/catalogue";
}
