"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePersistentPageSize } from "@/lib/client/use-persistent-page-size";
import { listProductPacksClient, ProductPacksClientError } from "../client";
import type { ProductPackListItemDto } from "../types";
import { PRODUCT_PAGE_SIZE_OPTIONS, type ProductPageSize } from "@/features/products/types";

export function useProductPacksList(initialPageSize: ProductPageSize = 20) {
  const [items, setItems] = useState<ProductPackListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = usePersistentPageSize(
    "staff:product-packs:list:page-size",
    initialPageSize,
    PRODUCT_PAGE_SIZE_OPTIONS,
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(page);
  const pageSizeRef = useRef(pageSize);
  const searchRef = useRef(search);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);

  const fetchPacks = useCallback(
    async (override?: { page?: number; pageSize?: ProductPageSize; search?: string }) => {
      const nextPage = override?.page ?? pageRef.current;
      const nextPageSize = override?.pageSize ?? pageSizeRef.current;
      const nextSearch = override?.search ?? searchRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const result = await listProductPacksClient({
          page: nextPage,
          pageSize: nextPageSize,
          q: nextSearch,
        });

        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
        setPageSize(result.pageSize as ProductPageSize);
      } catch (err: unknown) {
        const message =
          err instanceof ProductPacksClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erreur inconnue";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setPageSize],
  );

  useEffect(() => {
    void fetchPacks({ page: 1, pageSize });
  }, [fetchPacks, pageSize]);

  const submitFilters = useCallback(async () => {
    await fetchPacks({
      page: 1,
      pageSize,
      search,
    });
  }, [fetchPacks, pageSize, search]);

  const updatePageSize = useCallback(
    async (value: ProductPageSize) => {
      const safeValue = PRODUCT_PAGE_SIZE_OPTIONS.includes(value) ? value : 20;
      setPageSize(safeValue);
      await fetchPacks({ page: 1, pageSize: safeValue });
    },
    [fetchPacks, setPageSize],
  );

  const goPrev = useCallback(async () => {
    if (page <= 1) return;
    await fetchPacks({ page: page - 1 });
  }, [fetchPacks, page]);

  const goNext = useCallback(async () => {
    if (page >= totalPages) return;
    await fetchPacks({ page: page + 1 });
  }, [fetchPacks, page, totalPages]);

  return {
    items,
    total,
    page,
    pageSize,
    search,
    isLoading,
    error,
    totalPages,
    canPrev: page > 1,
    canNext: page < totalPages,
    setSearch,
    submitFilters,
    updatePageSize,
    goPrev,
    goNext,
  };
}
