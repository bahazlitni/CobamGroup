"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArticleCategoriesClientError,
  listArticleCategoriesClient,
} from "../client";
import type {
  ArticleCategoryListItemDto,
  ArticleCategoryPageSize,
} from "../types";
import { usePersistentPageSize } from "@/lib/client/use-persistent-page-size";

const PAGE_SIZE_OPTIONS: ArticleCategoryPageSize[] = [10, 20, 50];

export function useArticleCategoriesList(
  initialPageSize: ArticleCategoryPageSize = 20,
) {
  const [items, setItems] = useState<ArticleCategoryListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = usePersistentPageSize(
    "staff:article-categories:list:page-size",
    initialPageSize,
    PAGE_SIZE_OPTIONS,
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [pageSize, total],
  );

  const fetchArticleCategories = useCallback(
    async (options?: {
      page?: number;
      pageSize?: ArticleCategoryPageSize;
      search?: string;
    }) => {
      const nextPage = options?.page ?? pageRef.current;
      const nextPageSize = options?.pageSize ?? pageSizeRef.current;
      const nextSearch = options?.search ?? searchRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const result = await listArticleCategoriesClient({
          page: nextPage,
          pageSize: nextPageSize,
          q: nextSearch,
        });

        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
        setPageSize(result.pageSize as ArticleCategoryPageSize);
      } catch (err: unknown) {
        const message =
          err instanceof ArticleCategoriesClientError
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
    void fetchArticleCategories({ page: 1, pageSize });
  }, [fetchArticleCategories, pageSize]);

  const submitSearch = useCallback(async () => {
    await fetchArticleCategories({ page: 1, pageSize, search });
  }, [fetchArticleCategories, pageSize, search]);

  const updatePageSize = useCallback(
    async (value: ArticleCategoryPageSize) => {
      const safeValue = PAGE_SIZE_OPTIONS.includes(value) ? value : 20;
      setPageSize(safeValue);
      await fetchArticleCategories({ page: 1, pageSize: safeValue });
    },
    [fetchArticleCategories, setPageSize],
  );

  const goPrev = useCallback(async () => {
    if (page <= 1) return;
    await fetchArticleCategories({ page: page - 1 });
  }, [fetchArticleCategories, page]);

  const goNext = useCallback(async () => {
    if (page >= totalPages) return;
    await fetchArticleCategories({ page: page + 1 });
  }, [fetchArticleCategories, page, totalPages]);

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
    fetchArticleCategories,
    submitSearch,
    updatePageSize,
    goPrev,
    goNext,
  };
}
