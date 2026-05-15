"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/cn";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationState = {
  unreadCount: number;
  items: NotificationItem[];
};

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CustomerNotificationsMenu({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<NotificationState | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const isSignedIn = data !== null;

  const load = useCallback(async () => {
    const response = await fetch("/api/notifications", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      setData(null);
      return;
    }

    if (!response.ok) {
      return;
    }

    setData((await response.json()) as NotificationState);
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 60_000);

    return () => window.clearInterval(interval);
  }, [load]);

  const unreadLabel = useMemo(() => {
    if (!data?.unreadCount) return null;
    return data.unreadCount > 9 ? "9+" : String(data.unreadCount);
  }, [data?.unreadCount]);

  const markRead = useCallback(
    async (ids?: string[], all = false) => {
      setIsMutating(true);

      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(all ? { all: true } : { ids }),
        });
        await load();
      } finally {
        setIsMutating(false);
      }
    },
    [load],
  );

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "border-ec-line text-ec-ink hover:border-ec-blue/40 hover:text-ec-blue relative grid place-items-center rounded-full border bg-white transition",
          compact ? "size-10" : "size-10",
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="size-5" />
        {unreadLabel ? (
          <span className="bg-ec-blue absolute -top-1 -right-1 grid min-h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-black text-white">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="border-ec-line shadow-ec-ink/15 absolute top-full right-0 z-50 mt-3 w-[min(360px,88vw)] overflow-hidden rounded-[1.25rem] border bg-white shadow-2xl">
          <div className="border-ec-line bg-ec-paper flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <p className="text-ec-ink text-sm font-black">Notifications</p>
              <p className="text-ec-muted text-xs font-semibold">{data.unreadCount} non lue(s)</p>
            </div>
            <button
              type="button"
              className="text-ec-blue inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black transition hover:bg-white"
              disabled={isMutating || data.unreadCount === 0}
              onClick={() => void markRead(undefined, true)}
            >
              <CheckCheck className="size-4" />
              Tout lire
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {data.items.length > 0 ? (
              data.items.map((item) => {
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-ec-ink text-sm font-black">{item.title}</p>
                      {!item.readAt ? (
                        <span
                          className="bg-ec-blue mt-1 size-2 rounded-full"
                          aria-label="Non lue"
                        />
                      ) : null}
                    </div>
                    <p className="text-ec-muted mt-1 text-xs leading-5">{item.body}</p>
                    <p className="text-ec-muted/70 mt-2 text-[11px] font-bold tracking-[0.16em] uppercase">
                      {timeLabel(item.createdAt)}
                    </p>
                  </>
                );

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="border-ec-line hover:bg-ec-paper block border-b px-4 py-3 transition"
                      onClick={() => {
                        setIsOpen(false);
                        if (!item.readAt) {
                          void markRead([item.id]);
                        }
                      }}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="border-ec-line hover:bg-ec-paper block w-full border-b px-4 py-3 text-left transition"
                    onClick={() => {
                      if (!item.readAt) {
                        void markRead([item.id]);
                      }
                    }}
                  >
                    {content}
                  </button>
                );
              })
            ) : (
              <div className="text-ec-muted px-4 py-8 text-center text-sm font-semibold">
                Aucune notification pour le moment.
              </div>
            )}
          </div>

          <Link
            href="/compte/notifications"
            className="bg-ec-ink hover:bg-ec-blue block px-4 py-3 text-center text-sm font-black text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Voir toutes les notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}
