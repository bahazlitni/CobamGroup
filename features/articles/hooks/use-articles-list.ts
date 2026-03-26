"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listArticlesClient } from "../client";
import type { ArticleListItemDto } from "../types";
import { usePersistentPageSize } from "@/lib/client/use-persistent-page-size";

export type UseArticlesListState = {
  items: ArticleListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
};

export function useArticlesList(initialPageSize = 12) {
  const [items, setItems] = useState<ArticleListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = usePersistentPageSize(
    "staff:articles:list:page-size",
    initialPageSize,
    [8, 12, 16, 20] as const,
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(page);
  const pageSizeRef = useRef(pageSize);
  const searchRef = useRef(search);
  const statusRef = useRef(status);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  );

  const fetchArticles = useCallback(
    async (opts?: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
    }) => {
      const nextPage = opts?.page ?? pageRef.current;
      const nextPageSize = opts?.pageSize ?? pageSizeRef.current;
      const nextSearch = opts?.search ?? searchRef.current;
      const nextStatus = opts?.status ?? statusRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const result = await listArticlesClient({
          page: nextPage,
          pageSize: nextPageSize,
          q: nextSearch,
          status: nextStatus,
        });

        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
        setPageSize(result.pageSize);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    },
    [setPageSize],
  );

  useEffect(() => {
    void fetchArticles({ page: 1, pageSize, status });
  }, [fetchArticles, pageSize, status]);

  const submitSearch = useCallback(async () => {
    await fetchArticles({ page: 1, pageSize, search, status });
  }, [fetchArticles, pageSize, search, status]);

  const updatePageSize = useCallback(
    async (value: number) => {
      setPageSize(value);
      await fetchArticles({ page: 1, pageSize: value });
    },
    [fetchArticles, setPageSize],
  );

  const goPrev = useCallback(async () => {
    if (page <= 1) return;
    await fetchArticles({ page: page - 1 });
  }, [fetchArticles, page]);

  const goNext = useCallback(async () => {
    if (page >= totalPages) return;
    await fetchArticles({ page: page + 1 });
  }, [fetchArticles, page, totalPages]);

  return {
    items,
    total,
    page,
    pageSize,
    search,
    status,
    isLoading,
    error,
    totalPages,
    canPrev: page > 1,
    canNext: page < totalPages,
    setSearch,
    setStatus,
    fetchArticles,
    submitSearch,
    updatePageSize,
    goPrev,
    goNext,
  };
}
