"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listProductCategoriesClient,
  ProductCategoriesClientError,
} from "../client";
import type { ProductCategoryListItemDto } from "../types";

export function useProductCategoriesTree() {
  const [items, setItems] = useState<ProductCategoryListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductCategories = useCallback(
    async (nextSearch = appliedSearch) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await listProductCategoriesClient({
          q: nextSearch,
          tree: true,
        });

        setItems(result.items);
        setTotal(result.total);
      } catch (err: unknown) {
        const message =
          err instanceof ProductCategoriesClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erreur inconnue";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedSearch],
  );

  useEffect(() => {
    void fetchProductCategories(appliedSearch);
  }, [appliedSearch, fetchProductCategories]);

  const submitSearch = useCallback(async () => {
    setAppliedSearch(search.trim());
  }, [search]);

  const clearSearch = useCallback(async () => {
    setSearch("");
    setAppliedSearch("");
  }, []);

  return {
    items,
    total,
    search,
    appliedSearch,
    isLoading,
    error,
    setSearch,
    submitSearch,
    clearSearch,
    refetch: fetchProductCategories,
  };
}
