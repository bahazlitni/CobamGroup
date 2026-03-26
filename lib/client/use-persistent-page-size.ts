"use client";

import { useEffect, useState } from "react";

export function usePersistentPageSize<T extends number>(
  storageKey: string,
  initialValue: T,
  allowedValues: readonly T[],
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const rawValue = window.localStorage.getItem(storageKey);

      if (!rawValue) {
        return initialValue;
      }

      const parsedValue = Number(rawValue) as T;

      return allowedValues.includes(parsedValue) ? parsedValue : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, String(value));
    } catch {
      // Ignore localStorage persistence failures.
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}
