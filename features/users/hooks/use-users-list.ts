"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listUsersClient } from "../client";
import type { PowerType, StaffUserListItemDto } from "../types";
import { usePersistentPageSize } from "@/lib/client/use-persistent-page-size";

const PAGE_SIZE_OPTIONS: Array<10 | 20 | 50> = [10, 20, 50];

export function useUsersList(initialPageSize: 10 | 20 | 50 = 20) {
  const [items, setItems] = useState<StaffUserListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = usePersistentPageSize(
    "staff:users:list:page-size",
    initialPageSize,
    PAGE_SIZE_OPTIONS,
  );
  const [search, setSearch] = useState("");
  const [roleKey, setRoleKey] = useState("");
  const [powerType, setPowerType] = useState<PowerType | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(page);
  const pageSizeRef = useRef(pageSize);
  const searchRef = useRef(search);
  const roleKeyRef = useRef(roleKey);
  const powerTypeRef = useRef(powerType);

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
      pageSize?: number;
      search?: string;
      roleKey?: string;
      powerType?: PowerType | "";
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const nextPage = opts?.page ?? pageRef.current;
        const nextPageSize = opts?.pageSize ?? pageSizeRef.current;
        const nextSearch = opts?.search ?? searchRef.current;
        const nextRoleKey = opts?.roleKey ?? roleKeyRef.current;
        const nextPowerType = opts?.powerType ?? powerTypeRef.current;

        const result = await listUsersClient({
          page: nextPage,
          pageSize: nextPageSize,
          q: nextSearch,
          roleKey: nextRoleKey || undefined,
          powerType: nextPowerType || undefined,
        });

        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
        setPageSize(result.pageSize as 10 | 20 | 50);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    },
    [setPageSize],
  );

  useEffect(() => {
    void fetchUsers({ page: 1, pageSize });
  }, [fetchUsers, pageSize]);

  const submitSearch = useCallback(async () => {
    await fetchUsers({ page: 1, pageSize, search, roleKey, powerType });
  }, [fetchUsers, pageSize, powerType, roleKey, search]);

  const updatePageSize = useCallback(
    async (value: 10 | 20 | 50) => {
      const safeValue = PAGE_SIZE_OPTIONS.includes(value) ? value : 20;
      setPageSize(safeValue);
      await fetchUsers({ page: 1, pageSize: safeValue });
    },
    [fetchUsers, setPageSize],
  );

  const goPrev = useCallback(async () => {
    if (page <= 1) return;
    await fetchUsers({ page: page - 1 });
  }, [fetchUsers, page]);

  const goNext = useCallback(async () => {
    if (page >= totalPages) return;
    await fetchUsers({ page: page + 1 });
  }, [fetchUsers, page, totalPages]);

  return {
    items,
    total,
    page,
    pageSize,
    search,
    roleKey,
    powerType,
    isLoading,
    error,
    totalPages,
    canPrev: page > 1,
    canNext: page < totalPages,
    setSearch,
    setRoleKey,
    setPowerType,
    fetchUsers,
    submitSearch,
    updatePageSize,
    goPrev,
    goNext,
  };
}

