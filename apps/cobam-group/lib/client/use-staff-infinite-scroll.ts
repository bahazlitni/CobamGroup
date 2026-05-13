"use client";

import { type RefCallback, useCallback, useEffect, useRef } from "react";

const SCROLL_STORAGE_PREFIX = "staff-scroll";
const LIST_CACHE_STORAGE_PREFIX = "staff-list";
const LIST_CACHE_MAX_AGE_MS = 30 * 60 * 1000;

export type StaffInfiniteListCache<TItem, TExtra = unknown> = {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  extra?: TExtra;
  savedAt: number;
};

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function getListCacheKey(key: string) {
  return `${LIST_CACHE_STORAGE_PREFIX}:${key}`;
}

function getScrollCacheKey(key: string) {
  return `${SCROLL_STORAGE_PREFIX}:${key}`;
}

export function readStaffInfiniteListCache<TItem, TExtra = unknown>(
  key: string,
): StaffInfiniteListCache<TItem, TExtra> | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getListCacheKey(key));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StaffInfiniteListCache<TItem, TExtra>;
    if (
      !parsed ||
      !Array.isArray(parsed.items) ||
      typeof parsed.total !== "number" ||
      typeof parsed.page !== "number" ||
      typeof parsed.pageSize !== "number" ||
      typeof parsed.savedAt !== "number"
    ) {
      return null;
    }

    if (Date.now() - parsed.savedAt > LIST_CACHE_MAX_AGE_MS) {
      window.sessionStorage.removeItem(getListCacheKey(key));
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeStaffInfiniteListCache<TItem, TExtra = unknown>(
  key: string,
  cache: Omit<StaffInfiniteListCache<TItem, TExtra>, "savedAt">,
) {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getListCacheKey(key),
      JSON.stringify({ ...cache, savedAt: Date.now() }),
    );
  } catch {
    // Ignore storage failures; the list still works without restoration.
  }
}

export function mergeUniqueById<TItem extends { id: number | string }>(
  current: TItem[],
  incoming: TItem[],
) {
  const knownIds = new Set(current.map((item) => item.id));
  const merged = [...current];

  for (const item of incoming) {
    if (!knownIds.has(item.id)) {
      merged.push(item);
      knownIds.add(item.id);
    }
  }

  return merged;
}

export function useStaffInfiniteScroll({
  enabled = true,
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "560px 0px",
}: {
  enabled?: boolean;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void | Promise<void>;
  rootMargin?: string;
}): RefCallback<HTMLDivElement> {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef(onLoadMore);
  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node;
  }, []);

  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!enabled || !node || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, hasMore, isLoading, rootMargin]);

  return setSentinelRef;
}

export function useStaffScrollRestoration(key: string, ready = true) {
  const restoredKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!canUseSessionStorage()) {
      return;
    }

    const storageKey = getScrollCacheKey(key);
    let frameId = 0;

    const save = () => {
      try {
        window.sessionStorage.setItem(
          storageKey,
          String(Math.max(0, Math.round(window.scrollY))),
        );
      } catch {
        // Ignore storage failures; scroll restoration is a convenience.
      }
    };

    const onScroll = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        save();
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        save();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      save();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      window.removeEventListener("beforeunload", save);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [key]);

  useEffect(() => {
    if (!ready || !canUseSessionStorage() || restoredKeyRef.current === key) {
      return;
    }

    const raw = window.sessionStorage.getItem(getScrollCacheKey(key));
    const targetY = raw ? Number(raw) : NaN;
    if (!Number.isFinite(targetY) || targetY <= 0) {
      restoredKeyRef.current = key;
      return;
    }

    restoredKeyRef.current = key;
    let frameId = 0;
    let timeoutId = 0;
    let attempts = 0;

    const restore = () => {
      attempts += 1;
      window.scrollTo({ top: targetY, behavior: "auto" });

      if (attempts < 18 && Math.abs(window.scrollY - targetY) > 2) {
        timeoutId = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(restore);
        }, 50);
      }
    };

    frameId = window.requestAnimationFrame(restore);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      if (timeoutId !== 0) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [key, ready]);
}
