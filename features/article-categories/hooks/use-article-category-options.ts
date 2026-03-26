"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArticleCategoriesClientError,
  listArticleCategoryOptionsClient,
} from "../client";
import type { ArticleCategoryOptionDto } from "../types";

export function useArticleCategoryOptions(enabled = true) {
  const [items, setItems] = useState<ArticleCategoryOptionDto[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextItems = await listArticleCategoryOptionsClient();
      setItems(nextItems);
    } catch (err: unknown) {
      const message =
        err instanceof ArticleCategoriesClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors du chargement des categories d'articles";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

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
