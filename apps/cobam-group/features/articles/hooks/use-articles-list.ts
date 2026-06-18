"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearStaffInfiniteListCache,
  mergeUniqueById,
  readStaffInfiniteListCache,
  useStaffInfiniteScroll,
  useStaffScrollRestoration,
  writeStaffInfiniteListCache,
} from "@/lib/client/use-staff-infinite-scroll";
import { listArticlesClient } from "../client";
import type { ArticleListItemDto } from "../types";

const LIST_CACHE_KEY = "articles";
const LIST_CACHE_VERSION = 3;

type ArticlesListCacheExtra = {
  cacheVersion?: number;
  search: string;
  activeSearch: string;
  status: string;
};

export type UseArticlesListState = {
  items: ArticleListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  hasMore: boolean;
};

export function useArticlesList(initialPageSize = 12) {
  const [cache] = useState(() => {
    const candidate = readStaffInfiniteListCache<ArticleListItemDto, ArticlesListCacheExtra>(
      LIST_CACHE_KEY,
    );

    if (
      candidate?.extra?.cacheVersion === LIST_CACHE_VERSION &&
      candidate.items.every(
        (item) => "scheduledPublishAt" in item && "seoStatus" in item && "seoScore" in item,
      )
    ) {
      return candidate;
    }

    clearStaffInfiniteListCache(LIST_CACHE_KEY);
    return null;
  });
  const [items, setItems] = useState<ArticleListItemDto[]>(() => cache?.items ?? []);
  const [total, setTotal] = useState(() => cache?.total ?? 0);
  const [page, setPage] = useState(() => cache?.page ?? 1);
  const [pageSize] = useState(() => cache?.pageSize ?? initialPageSize);
  const [search, setSearch] = useState(() => cache?.extra?.search ?? "");
  const [activeSearch, setActiveSearch] = useState(
    () => cache?.extra?.activeSearch ?? cache?.extra?.search ?? "",
  );
  const [status, setStatus] = useState(() => cache?.extra?.status ?? "");
  const [isLoadingInitial, setIsLoadingInitial] = useState(cache == null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => (cache ? cache.items.length < cache.total : true));
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const didLoadInitialRef = useRef(cache != null);
  const pageRef = useRef(page);
  const activeSearchRef = useRef(activeSearch);
  const statusRef = useRef(status);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    activeSearchRef.current = activeSearch;
  }, [activeSearch]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const fetchArticles = useCallback(
    async (opts?: { page?: number; search?: string; status?: string; reset?: boolean }) => {
      const nextPage = opts?.page ?? pageRef.current;
      const reset = opts?.reset ?? nextPage === 1;
      const nextSearch = opts?.search ?? activeSearchRef.current;
      const nextStatus = opts?.status ?? statusRef.current;
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
        const result = await listArticlesClient({
          page: nextPage,
          pageSize,
          q: nextSearch,
          status: nextStatus,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setItems((current) => (reset ? result.items : mergeUniqueById(current, result.items)));
        setTotal(result.total);
        setPage(result.page);
        setHasMore(result.page * result.pageSize < result.total);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(err instanceof Error ? err.message : "Erreur inconnue");
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
    void fetchArticles({ page: 1, reset: true });
  }, [fetchArticles]);

  const submitSearch = useCallback(async () => {
    await fetchArticles({ page: 1, search, status, reset: true });
  }, [fetchArticles, search, status]);

  const setStatusAndReload = useCallback(
    (value: string) => {
      setStatus(value);
      void fetchArticles({
        page: 1,
        search,
        status: value,
        reset: true,
      });
    },
    [fetchArticles, search],
  );

  const loadMore = useCallback(async () => {
    if (isLoadingInitial || isLoadingMore || !hasMore) {
      return;
    }

    await fetchArticles({ page: page + 1, reset: false });
  }, [fetchArticles, hasMore, isLoadingInitial, isLoadingMore, page]);

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

    writeStaffInfiniteListCache<ArticleListItemDto, ArticlesListCacheExtra>(LIST_CACHE_KEY, {
      items,
      total,
      page,
      pageSize,
      extra: {
        cacheVersion: LIST_CACHE_VERSION,
        search,
        activeSearch,
        status,
      },
    });
  }, [activeSearch, isLoadingInitial, items, page, pageSize, search, status, total]);

  return {
    items,
    total,
    page,
    pageSize,
    search,
    status,
    isLoading: isLoadingInitial,
    isLoadingMore,
    error,
    totalPages,
    canPrev: page > 1,
    canNext: hasMore,
    hasMore,
    sentinelRef,
    setSearch,
    setStatus: setStatusAndReload,
    fetchArticles,
    submitSearch,
    loadMore,
  };
}
