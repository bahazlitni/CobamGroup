"use client";

export type FavoriteItemSnapshot = {
  id: number;
  entityType: "PRODUCT" | "FAMILY";
  sku: string | null;
  name: string;
  href: string;
  price: string | null;
  imageUrl: string | null;
  brandName: string | null;
  categoryName: string | null;
};

export type FavoritesState = {
  items: FavoriteItemSnapshot[];
};

const FAVORITES_KEY = "e-cobam-favorites";
export const FAVORITES_UPDATED_EVENT = "e-cobam-favorites-updated";

export const EMPTY_FAVORITES: FavoritesState = {
  items: [],
};
export const EMPTY_FAVORITE_ITEMS: FavoriteItemSnapshot[] = [];

let cachedRawFavorites: string | null = null;
let cachedFavoritesState: FavoritesState = EMPTY_FAVORITES;

export function favoriteKey(item: Pick<FavoriteItemSnapshot, "entityType" | "id">) {
  return `${item.entityType}:${item.id}`;
}

function parseFavorites(value: string | null): FavoriteItemSnapshot[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is FavoriteItemSnapshot => {
      return (
        item != null &&
        typeof item === "object" &&
        typeof (item as FavoriteItemSnapshot).id === "number" &&
        ((item as FavoriteItemSnapshot).entityType === "PRODUCT" ||
          (item as FavoriteItemSnapshot).entityType === "FAMILY") &&
        typeof (item as FavoriteItemSnapshot).name === "string" &&
        typeof (item as FavoriteItemSnapshot).href === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoriteItemSnapshot[]) {
  const raw = JSON.stringify(items);
  window.localStorage.setItem(FAVORITES_KEY, raw);
  const state = { items };
  cachedRawFavorites = raw;
  cachedFavoritesState = state;
  window.dispatchEvent(new CustomEvent<FavoritesState>(FAVORITES_UPDATED_EVENT, { detail: state }));
  return state;
}

export function readFavorites(): FavoritesState {
  return getFavoritesSnapshot();
}

export function getFavoritesSnapshot(): FavoritesState {
  if (typeof window === "undefined") {
    return EMPTY_FAVORITES;
  }

  const raw = window.localStorage.getItem(FAVORITES_KEY);

  if (raw === cachedRawFavorites) {
    return cachedFavoritesState;
  }

  cachedRawFavorites = raw;
  cachedFavoritesState = { items: parseFavorites(raw) };
  return cachedFavoritesState;
}

export function subscribeFavorites(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(FAVORITES_UPDATED_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(FAVORITES_UPDATED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function isFavorite(item: Pick<FavoriteItemSnapshot, "entityType" | "id">) {
  const key = favoriteKey(item);
  return readFavorites().items.some((favorite) => favoriteKey(favorite) === key);
}

export function addFavorite(item: FavoriteItemSnapshot) {
  const current = readFavorites().items;
  const key = favoriteKey(item);

  if (current.some((favorite) => favoriteKey(favorite) === key)) {
    return { items: current };
  }

  return writeFavorites([item, ...current]);
}

export function removeFavorite(item: Pick<FavoriteItemSnapshot, "entityType" | "id">) {
  const key = favoriteKey(item);
  return writeFavorites(readFavorites().items.filter((favorite) => favoriteKey(favorite) !== key));
}

export function toggleFavorite(item: FavoriteItemSnapshot) {
  return isFavorite(item) ? removeFavorite(item) : addFavorite(item);
}

export function clearFavorites() {
  return writeFavorites([]);
}
