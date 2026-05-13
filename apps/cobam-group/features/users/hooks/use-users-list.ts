"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  mergeUniqueById,
  readStaffInfiniteListCache,
  useStaffInfiniteScroll,
  useStaffScrollRestoration,
  writeStaffInfiniteListCache,
} from "@/lib/client/use-staff-infinite-scroll";
import { listUsersClient } from "../client";
import type { PowerType, StaffUserListItemDto } from "../types";

const PAGE_SIZE_OPTIONS: Array<10 | 20 | 50> = [10, 20, 50];
const LIST_CACHE_KEY = "users";

type UsersListCacheExtra = {
  search: string;
  activeSearch: string;
  roleKey: string;
  powerType: PowerType | "";
};

function getPageSize(value: number | undefined, fallback: 10 | 20 | 50) {
  return PAGE_SIZE_OPTIONS.includes(value as 10 | 20 | 50)
    ? (value as 10 | 20 | 50)
    : fallback;
}

export function useUsersList(initialPageSize: 10 | 20 | 50 = 20) {
  const [cache] = useState(() =>
    readStaffInfiniteListCache<StaffUserListItemDto, UsersListCacheExtra>(
      LIST_CACHE_KEY,
    ),
  );
  const [items, setItems] = useState<StaffUserListItemDto[]>(
    () => cache?.items ?? [],
  );
  const [total, setTotal] = useState(() => cache?.total ?? 0);
  const [page, setPage] = useState(() => cache?.page ?? 1);
  const [pageSize] = useState<10 | 20 | 50>(() =>
    getPageSize(cache?.pageSize, initialPageSize),
  );
  const [search, setSearch] = useState(() => cache?.extra?.search ?? "");
  const [activeSearch, setActiveSearch] = useState(
    () => cache?.extra?.activeSearch ?? cache?.extra?.search ?? "",
  );
  const [roleKey, setRoleKey] = useState(() => cache?.extra?.roleKey ?? "");
  const [powerType, setPowerType] = useState<PowerType | "">(
    () => cache?.extra?.powerType ?? "",
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
  const roleKeyRef = useRef(roleKey);
  const powerTypeRef = useRef(powerType);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    activeSearchRef.current = activeSearch;
  }, [activeSearch]);

  useEffect(() => {
    roleKeyRef.current = roleKey;
  }, [roleKey]);

  useEffect(() => {
    powerTypeRef.current = powerType;
  }, [powerType]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  );

  const fetchUsers = useCallback(
    async (opts?: {
      page?: number;
      search?: string;
      roleKey?: string;
      powerType?: PowerType | "";
      reset?: boolean;
    }) => {
      const nextPage = opts?.page ?? pageRef.current;
      const reset = opts?.reset ?? nextPage === 1;
      const nextSearch = opts?.search ?? activeSearchRef.current;
      const nextRoleKey = opts?.roleKey ?? roleKeyRef.current;
      const nextPowerType = opts?.powerType ?? powerTypeRef.current;
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
        const result = await listUsersClient({
          page: nextPage,
          pageSize,
          q: nextSearch,
          roleKey: nextRoleKey || undefined,
          powerType: nextPowerType || undefined,
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
    void fetchUsers({ page: 1, reset: true });
  }, [fetchUsers]);

  const submitSearch = useCallback(async () => {
    await fetchUsers({
      page: 1,
      search,
      roleKey,
      powerType,
      reset: true,
    });
  }, [fetchUsers, powerType, roleKey, search]);

  const loadMore = useCallback(async () => {
    if (isLoadingInitial || isLoadingMore || !hasMore) {
      return;
    }

    await fetchUsers({ page: page + 1, reset: false });
  }, [fetchUsers, hasMore, isLoadingInitial, isLoadingMore, page]);

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

    writeStaffInfiniteListCache<StaffUserListItemDto, UsersListCacheExtra>(
      LIST_CACHE_KEY,
      {
        items,
        total,
        page,
        pageSize,
        extra: {
          search,
          activeSearch,
          roleKey,
          powerType,
        },
      },
    );
  }, [
    activeSearch,
    isLoadingInitial,
    items,
    page,
    pageSize,
    powerType,
    roleKey,
    search,
    total,
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    search,
    roleKey,
    powerType,
    isLoading: isLoadingInitial,
    isLoadingMore,
    error,
    totalPages,
    canPrev: page > 1,
    canNext: hasMore,
    hasMore,
    sentinelRef,
    setSearch,
    setRoleKey,
    setPowerType,
    fetchUsers,
    submitSearch,
    loadMore,
  };
}
