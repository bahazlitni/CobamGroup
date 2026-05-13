"use client";

import { useCallback, useEffect, useState } from "react";
import { listRolesClient } from "../client";
import type { RoleDetailDto } from "../types";

export function useRolesList() {
  const [items, setItems] = useState<RoleDetailDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listRolesClient();
      setItems(result.items);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Erreur lors du chargement des rôles",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    isLoading,
    error,
    reload: load,
  };
}
