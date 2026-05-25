"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notifications-events";

export type CustomerNotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export type CustomerNotificationsState = {
  unreadCount: number;
  items: CustomerNotificationItem[];
};

type NotificationChange = {
  operation: "INSERT" | "UPDATE" | "DELETE" | string;
  notification: CustomerNotificationItem;
  oldReadAt: string | null;
};

function sortByNewest(items: CustomerNotificationItem[]) {
  return [...items].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function applyNotificationChange(
  previous: CustomerNotificationsState | null,
  change: NotificationChange,
  take: number,
): CustomerNotificationsState | null {
  if (!previous) {
    return previous;
  }

  const existing = previous.items.find((item) => item.id === change.notification.id);
  const wasUnread = existing ? existing.readAt === null : change.oldReadAt === null;
  const isUnread = change.notification.readAt === null;
  const operation = change.operation.toUpperCase();

  if (operation === "DELETE") {
    return {
      unreadCount: Math.max(0, previous.unreadCount - (wasUnread ? 1 : 0)),
      items: previous.items.filter((item) => item.id !== change.notification.id),
    };
  }

  const withoutCurrent = previous.items.filter((item) => item.id !== change.notification.id);
  const nextItems = sortByNewest([change.notification, ...withoutCurrent]).slice(0, take);
  let unreadCount = previous.unreadCount;

  if (operation === "INSERT" && isUnread && !existing) {
    unreadCount += 1;
  } else if (operation === "UPDATE") {
    if (wasUnread && !isUnread) {
      unreadCount -= 1;
    } else if (!wasUnread && isUnread) {
      unreadCount += 1;
    }
  }

  return {
    unreadCount: Math.max(0, unreadCount),
    items: nextItems,
  };
}

export function useCustomerNotifications({
  initialData = null,
  take = 10,
}: {
  initialData?: CustomerNotificationsState | null;
  take?: number;
} = {}) {
  const safeTake = Math.min(Math.max(take, 1), 50);
  const [data, setData] = useState<CustomerNotificationsState | null>(initialData);
  const [canStream, setCanStream] = useState(Boolean(initialData));
  const hasInitialData = useRef(initialData !== null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/notifications", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      setCanStream(false);
      setData(null);
      return;
    }

    if (!response.ok) {
      return;
    }

    const nextData = (await response.json()) as CustomerNotificationsState;
    setData({
      unreadCount: nextData.unreadCount,
      items: nextData.items.slice(0, safeTake),
    });
    setCanStream(true);
  }, [safeTake]);

  useEffect(() => {
    if (hasInitialData.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [refresh]);

  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);

    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
  }, [refresh]);

  useEffect(() => {
    if (!canStream) {
      return;
    }

    const source = new EventSource(`/api/notifications/stream?take=${safeTake}`);

    function handleSnapshot(event: MessageEvent<string>) {
      try {
        const snapshot = JSON.parse(event.data) as CustomerNotificationsState;
        setData({
          unreadCount: snapshot.unreadCount,
          items: snapshot.items.slice(0, safeTake),
        });
      } catch {
        // Ignore malformed stream events; the EventSource will keep listening.
      }
    }

    function handleChange(event: MessageEvent<string>) {
      try {
        const change = JSON.parse(event.data) as NotificationChange;
        setData((current) => applyNotificationChange(current, change, safeTake));
      } catch {
        // Ignore malformed stream events; the EventSource will keep listening.
      }
    }

    source.addEventListener("snapshot", handleSnapshot);
    source.addEventListener("change", handleChange);

    return () => {
      source.removeEventListener("snapshot", handleSnapshot);
      source.removeEventListener("change", handleChange);
      source.close();
    };
  }, [canStream, safeTake]);

  return useMemo(
    () => ({
      data,
      refresh,
      setData,
    }),
    [data, refresh],
  );
}
