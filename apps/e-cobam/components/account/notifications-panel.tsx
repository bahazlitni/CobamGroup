"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationsData = {
  unreadCount: number;
  items: NotificationItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationsPanel({ initialData }: { initialData: NotificationsData }) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    const response = await fetch("/api/notifications", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.ok) {
      setData((await response.json()) as NotificationsData);
    }
  }, []);

  const markRead = useCallback(
    async (ids?: string[], all = false) => {
      setIsLoading(true);

      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(all ? { all: true } : { ids }),
        });
        await reload();
      } finally {
        setIsLoading(false);
      }
    },
    [reload],
  );

  return (
    <section className="border-ec-line rounded-[1.5rem] border bg-white">
      <div className="border-ec-line flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-ec-ink text-xl font-black">Centre de notifications</h2>
          <p className="text-ec-muted mt-1 text-sm font-semibold">
            {data.unreadCount} notification(s) non lue(s)
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading || data.unreadCount === 0}
          onClick={() => void markRead(undefined, true)}
        >
          <CheckCheck className="size-4" />
          Tout marquer comme lu
        </Button>
      </div>

      {data.items.length > 0 ? (
        <div className="divide-ec-line divide-y">
          {data.items.map((item) => {
            const content = (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {!item.readAt ? (
                    <span className="bg-ec-blue rounded-full px-3 py-1 text-[11px] font-black tracking-[0.16em] text-white uppercase">
                      Nouveau
                    </span>
                  ) : null}
                  <span className="text-ec-muted text-xs font-bold tracking-[0.18em] uppercase">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <h3 className="text-ec-ink mt-3 text-lg font-black">{item.title}</h3>
                <p className="text-ec-muted mt-2 text-sm leading-7">{item.body}</p>
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="hover:bg-ec-paper/70 block p-5 transition"
                  onClick={() => {
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
                className="hover:bg-ec-paper/70 block w-full p-5 text-left transition"
                onClick={() => {
                  if (!item.readAt) {
                    void markRead([item.id]);
                  }
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center">
          <Bell className="text-ec-blue mx-auto size-10" />
          <h2 className="text-ec-ink mt-4 text-2xl font-black">Aucune notification</h2>
          <p className="text-ec-muted mx-auto mt-2 max-w-lg text-sm leading-7">
            Les changements de statut de vos commandes apparaitront ici.
          </p>
        </div>
      )}
    </section>
  );
}
