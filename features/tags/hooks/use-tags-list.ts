"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listTagsClient, TagsClientError } from "../client";
import type { TagListItemDto, TagPageSize } from "../types";
import { usePersistentPageSize } from "@/lib/client/use-persistent-page-size";

const PAGE_SIZE_OPTIONS: TagPageSize[] = [10, 20, 50];

export function useTagsList(initialPageSize: TagPageSize = 20) {
  const [items, setItems] = useState<TagListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = usePersistentPageSize(
    "staff:tags:list:page-size",
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

  const fetchTags = useCallback(
    async (options?: {
      page?: number;
      pageSize?: TagPageSize;
      search?: string;
    }) => {
      const nextPage = options?.page ?? pageRef.current;
      const nextPageSize = options?.pageSize ?? pageSizeRef.current;
      const nextSearch = options?.search ?? searchRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const result = await listTagsClient({
          page: nextPage,
          pageSize: nextPageSize,
          q: nextSearch,
        });

        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
        setPageSize(result.pageSize as TagPageSize);
      } catch (err: unknown) {
        const message =
          err instanceof TagsClientError
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
    void fetchTags({ page: 1, pageSize });
  }, [fetchTags, pageSize]);

  const submitSearch = useCallback(async () => {
    await fetchTags({ page: 1, pageSize, search });
  }, [fetchTags, pageSize, search]);

  const updatePageSize = useCallback(
    async (value: TagPageSize) => {
      const safeValue = PAGE_SIZE_OPTIONS.includes(value) ? value : 20;
      setPageSize(safeValue);
      await fetchTags({ page: 1, pageSize: safeValue });
    },
    [fetchTags, setPageSize],
  );

  const goPrev = useCallback(async () => {
    if (page <= 1) return;
    await fetchTags({ page: page - 1 });
  }, [fetchTags, page]);

  const goNext = useCallback(async () => {
    if (page >= totalPages) return;
    await fetchTags({ page: page + 1 });
  }, [fetchTags, page, totalPages]);

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
    fetchTags,
    submitSearch,
    updatePageSize,
    goPrev,
    goNext,
  };
}
