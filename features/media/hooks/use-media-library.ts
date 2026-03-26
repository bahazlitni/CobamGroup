"use client";

import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  deleteMediaClient,
  listMediaClient,
  updateMediaClient,
  uploadMediaClient,
} from "../client";
import type {
  MediaDeleteOptions,
  MediaUploadBatchCallbacks,
  MediaUploadBatchResult,
  MediaUploadRequest,
  MediaFilterKind,
  MediaListItemDto,
  MediaListResult,
  MediaSortBy,
  MediaSortDirection,
  MediaUpdateInput,
  MediaView,
} from "../types";
import { DEFAULT_MEDIA_PAGE_SIZE } from "../types";
import { getMediaGroupDescriptor, getMediaViewForItem } from "@/components/staff/media/utils";

type MediaRenderGroup = {
  key: string;
  label: string;
  items: MediaListItemDto[];
};

const SERVER_KIND_BY_VIEW: Record<MediaView, MediaFilterKind> = {
  all: "ALL",
  images: "IMAGE",
  videos: "VIDEO",
  pdf: "DOCUMENT",
  audio: "DOCUMENT",
  other: "DOCUMENT",
};

function matchesView(media: MediaListItemDto, view: MediaView) {
  return view === "all" ? true : getMediaViewForItem(media) === view;
}

export function useMediaLibrary(pageSize = DEFAULT_MEDIA_PAGE_SIZE) {
  const [items, setItems] = useState<MediaListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [activeView, setActiveViewState] = useState<MediaView>("all");
  const [sortBy, setSortByState] = useState<MediaSortBy>("date");
  const [sortDirection, setSortDirection] = useState<MediaSortDirection>("desc");
  const [stats, setStats] = useState<MediaListResult["stats"] | null>(null);
  const [storage, setStorage] = useState<MediaListResult["storage"] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [isDeletingSelection, setIsDeletingSelection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openedMediaId, setOpenedMediaId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async ({ nextPage, reset }: { nextPage: number; reset: boolean }) => {
      const requestId = ++requestIdRef.current;

      if (reset) {
        setIsLoadingInitial(true);
        setItems([]);
        setPage(1);
        setHasMore(true);
        setSelectedIds([]);
        setOpenedMediaId(null);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      try {
        const result = await listMediaClient({
          page: nextPage,
          pageSize,
          q: deferredSearch,
          kind: SERVER_KIND_BY_VIEW[activeView],
          sortBy,
          sortDirection,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setItems((current) => {
          if (reset) {
            return result.items;
          }

          const knownIds = new Set(current.map((item) => item.id));
          const merged = [...current];

          for (const item of result.items) {
            if (!knownIds.has(item.id)) {
              merged.push(item);
            }
          }

          return merged;
        });
        setTotal(result.total);
        setStats(result.stats);
        setStorage(result.storage);
        setPage(nextPage);
        setHasMore(nextPage * pageSize < result.total);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des medias",
        );
        if (reset) {
          setTotal(0);
          setStats(null);
          setStorage(null);
          setHasMore(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          if (reset) {
            setIsLoadingInitial(false);
          } else {
            setIsLoadingMore(false);
          }
        }
      }
    },
    [activeView, deferredSearch, pageSize, sortBy, sortDirection],
  );

  useEffect(() => {
    void fetchPage({ nextPage: 1, reset: true });
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingInitial || isLoadingMore || !hasMore) {
      return;
    }

    await fetchPage({ nextPage: page + 1, reset: false });
  }, [fetchPage, hasMore, isLoadingInitial, isLoadingMore, page]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      {
        rootMargin: "640px 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  const visibleItems = useMemo(
    () => items.filter((item) => matchesView(item, activeView)),
    [activeView, items],
  );

  const groups = useMemo<MediaRenderGroup[]>(() => {
    const result: MediaRenderGroup[] = [];

    for (const item of visibleItems) {
      const descriptor = getMediaGroupDescriptor(item, sortBy);
      const currentGroup = result[result.length - 1];

      if (!currentGroup || currentGroup.key !== descriptor.key) {
        result.push({
          key: descriptor.key,
          label: descriptor.label,
          items: [item],
        });
        continue;
      }

      currentGroup.items.push(item);
    }

    return result;
  }, [sortBy, visibleItems]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIdSet.has(item.id)),
    [items, selectedIdSet],
  );

  const selectedMedia = useMemo(
    () => items.find((item) => item.id === openedMediaId) ?? null,
    [items, openedMediaId],
  );

  const selectedTotalSize = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + (item.sizeBytes ?? 0),
        0,
      ),
    [selectedItems],
  );

  const selectionRequiresForceDelete = selectedItems.some(
    (item) => item.usage.total > 0,
  );
  const canDeleteSelection =
    selectedItems.length > 0 &&
    selectedItems.every((item) =>
      item.usage.total > 0 ? item.canForceRemove : item.canDelete,
    );

  const setActiveView = useCallback((view: MediaView) => {
    startTransition(() => {
      setActiveViewState(view);
    });
  }, []);

  const setSortBy = useCallback((value: MediaSortBy) => {
    startTransition(() => {
      setSortByState(value);
    });
  }, []);

  const toggleSortDirection = useCallback(() => {
    startTransition(() => {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    });
  }, []);

  const toggleSelected = useCallback((mediaId: number, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(mediaId);
      } else {
        next.delete(mediaId);
      }

      return Array.from(next);
    });
  }, []);

  const toggleManySelected = useCallback((mediaIds: number[], checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      for (const mediaId of mediaIds) {
        if (checked) {
          next.add(mediaId);
        } else {
          next.delete(mediaId);
        }
      }

      return Array.from(next);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const openMedia = useCallback((mediaId: number) => {
    setOpenedMediaId(mediaId);
  }, []);

  const closeMedia = useCallback(() => {
    setOpenedMediaId(null);
  }, []);

  const upload = useCallback(
    async (input: MediaUploadRequest) => {
      setIsUploading(true);
      setError(null);

      try {
        const media = await uploadMediaClient(input);
        await fetchPage({ nextPage: 1, reset: true });
        return media;
      } finally {
        setIsUploading(false);
      }
    },
    [fetchPage],
  );

  const uploadMany = useCallback(
    async (
      inputs: MediaUploadRequest[],
      callbacks?: MediaUploadBatchCallbacks,
    ): Promise<MediaUploadBatchResult> => {
      setIsUploading(true);
      setError(null);

      try {
        const results: MediaUploadBatchResult["items"] = [];

        for (const [index, input] of inputs.entries()) {
          callbacks?.onItemStart?.({ index, input });

          try {
            const media = await uploadMediaClient(input);
            const result = {
              ok: true as const,
              input,
              media,
            };

            results.push(result);
            callbacks?.onItemComplete?.({ index, result });
          } catch (error: unknown) {
            const result = {
              ok: false as const,
              input,
              errorMessage:
                error instanceof Error
                  ? error.message
                  : "Erreur lors de l'import du media.",
            };

            results.push(result);
            callbacks?.onItemComplete?.({ index, result });
          }
        }

        const successCount = results.filter((result) => result.ok).length;
        const errorCount = results.length - successCount;

        if (successCount > 0) {
          await fetchPage({ nextPage: 1, reset: true });
        }

        return {
          total: results.length,
          successCount,
          errorCount,
          items: results,
        };
      } finally {
        setIsUploading(false);
      }
    },
    [fetchPage],
  );

  const remove = useCallback(
    async (mediaId: number, options: MediaDeleteOptions = {}) => {
      setDeletingMediaId(mediaId);
      setError(null);

      try {
        await deleteMediaClient(mediaId, options);
        setSelectedIds((current) => current.filter((id) => id !== mediaId));
        setOpenedMediaId((current) => (current === mediaId ? null : current));
        await fetchPage({ nextPage: 1, reset: true });
        return true;
      } finally {
        setDeletingMediaId(null);
      }
    },
    [fetchPage],
  );

  const removeSelected = useCallback(async (options: MediaDeleteOptions = {}) => {
    if (selectedItems.length === 0) {
      return 0;
    }

    setIsDeletingSelection(true);
    setError(null);

    try {
      for (const item of selectedItems) {
        const shouldForceDelete = options.force === true && item.usage.total > 0;

        await deleteMediaClient(item.id, shouldForceDelete ? { force: true } : {});
      }

      const deletedCount = selectedItems.length;
      setSelectedIds([]);
      setOpenedMediaId(null);
      await fetchPage({ nextPage: 1, reset: true });
      return deletedCount;
    } finally {
      setIsDeletingSelection(false);
    }
  }, [fetchPage, selectedItems]);

  const updateMedia = useCallback(
    async (mediaId: number, input: MediaUpdateInput) => {
      const updatedMedia = await updateMediaClient(mediaId, input);

      setItems((current) =>
        current.map((item) => (item.id === mediaId ? updatedMedia : item)),
      );

      return updatedMedia;
    },
    [],
  );

  return {
    items,
    visibleItems,
    groups,
    total,
    stats,
    storage,
    search,
    setSearch,
    activeView,
    setActiveView,
    sortBy,
    setSortBy,
    sortDirection,
    toggleSortDirection,
    selectedIds,
    selectedItems,
    selectedTotalSize,
    selectionRequiresForceDelete,
    canDeleteSelection,
    toggleSelected,
    toggleManySelected,
    clearSelection,
    selectedMedia,
    openMedia,
    closeMedia,
    openedMediaId,
    hasMore,
    isLoadingInitial,
    isLoadingMore,
    isUploading,
    deletingMediaId,
    isDeletingSelection,
    error,
    upload,
    uploadMany,
    remove,
    removeSelected,
    updateMedia,
    refetch: () => fetchPage({ nextPage: 1, reset: true }),
    sentinelRef,
  };
}
