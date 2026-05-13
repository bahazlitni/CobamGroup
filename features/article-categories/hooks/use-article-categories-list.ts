"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  mergeUniqueById,
  readStaffInfiniteListCache,
  useStaffInfiniteScroll,
  useStaffScrollRestoration,
  writeStaffInfiniteListCache,
} from "@/lib/client/use-staff-infinite-scroll";
import {
  ArticleCategoriesClientError,
  listArticleCategoriesClient,
} from "../client";
import type {
  ArticleCategoryListItemDto,
  ArticleCategoryPageSize,
} from "../types";

const LIST_CACHE_KEY = "article-categories";

type ArticleCategoriesListCacheExtra = {
  search: string;
  activeSearch: string;
};

export function useArticleCategoriesList(
  initialPageSize: ArticleCategoryPageSize = 20,
) {
  const [cache] = useState(() =>
    readStaffInfiniteListCache<
      ArticleCategoryListItemDto,
      ArticleCategoriesListCacheExtra
    >(LIST_CACHE_KEY),
  );
  const [items, setItems] = useState<ArticleCategoryListItemDto[]>(
    () => cache?.items ?? [],
  );
  const [total, setTotal] = useState(() => cache?.total ?? 0);
  const [page, setPage] = useState(() => cache?.page ?? 1);
  const [pageSize] = useState<ArticleCategoryPageSize>(
    () => (cache?.pageSize as ArticleCategoryPageSize) ?? initialPageSize,
  );
  const [search, setSearch] = useState(() => cache?.extra?.search ?? "");
  const [activeSearch, setActiveSearch] = useState(
    () => cache?.extra?.activeSearch ?? cache?.extra?.search ?? "",
  );
  const [isLoadingInitial, setIsLoadingInitial] = useState(cache == null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() =>
    cache ? cache.items.length < cache.total : true,
  );
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const didLoadInitialRef = useRef(cache != null);
  const pageRef = useRef(page);
  const activeSearchRef = useRef(activeSearch);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    activeSearchRef.current = activeSearch;
  }, [activeSearch]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [pageSize, total],
  );

  const fetchArticleCategories = useCallback(
    async (options?: {
      page?: number;
      search?: string;
      reset?: boolean;
    }) => {
      const nextPage = options?.page ?? pageRef.current;
      const reset = options?.reset ?? nextPage === 1;
      const nextSearch = options?.search ?? activeSearchRef.current;
      const requestId = ++requestIdRef.current;

      if (reset) {
        setIsLoadingInitial(true);
        setItems([]);
        setPage(1);
        setHasMore(true);
        setActiveSearch(nextSearch);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const result = await listArticleCategoriesClient({
          page: nextPage,
          pageSize,
          q: nextSearch,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setItems((current) =>
          reset ? result.items : mergeUniqueById(current, result.items),
        );
        setTotal(result.total);
        setPage(result.page);
        setHasMore(result.page * result.pageSize < result.total);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          err instanceof ArticleCategoriesClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erreur inconnue";
        setError(message);
        if (reset) {
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoadingInitial(false);
          setIsLoadingMore(false);
        }
      }
    },
    [pageSize],
  );

  useEffect(() => {
    if (didLoadInitialRef.current) {
      return;
    }

    didLoadInitialRef.current = true;
    void fetchArticleCategories({ page: 1, reset: true });
  }, [fetchArticleCategories]);

  const submitSearch = useCallback(async () => {
    await fetchArticleCategories({ page: 1, search, reset: true });
  }, [fetchArticleCategories, search]);

  const loadMore = useCallback(async () => {
    if (isLoadingInitial || isLoadingMore || !hasMore) {
      return;
    }

    await fetchArticleCategories({ page: page + 1, reset: false });
  }, [fetchArticleCategories, hasMore, isLoadingInitial, isLoadingMore, page]);

  const sentinelRef = useStaffInfiniteScroll({
    hasMore,
    isLoading: isLoadingInitial || isLoadingMore,
    onLoadMore: loadMore,
    enabled: !error,
  });

  useStaffScrollRestoration(LIST_CACHE_KEY, !isLoadingInitial);

  useEffect(() => {
    if (isLoadingInitial && items.length === 0 && total === 0) {
      return;
    }

    writeStaffInfiniteListCache<
      ArticleCategoryListItemDto,
      ArticleCategoriesListCacheExtra
    >(LIST_CACHE_KEY, {
      items,
      total,
      page,
      pageSize,
      extra: {
        search,
        activeSearch,
      },
    });
  }, [activeSearch, isLoadingInitial, items, page, pageSize, search, total]);

  return {
    items,
    total,
    page,
    pageSize,
    search,
    isLoading: isLoadingInitial,
    isLoadingMore,
    error,
    totalPages,
    canPrev: page > 1,
    canNext: hasMore,
    hasMore,
    sentinelRef,
    setSearch,
    fetchArticleCategories,
    submitSearch,
    loadMore,
  };
}
