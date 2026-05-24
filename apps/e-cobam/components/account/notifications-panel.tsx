"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  emitNotificationsUpdated,
  NOTIFICATIONS_UPDATED_EVENT,
} from "@/lib/notifications-events";
import { pushUndoToast } from "@/lib/undo-actions";

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

type NotificationsMutationResponse = {
  ok: boolean;
  changedIds?: string[];
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
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(all ? { all: true } : { ids }),
        });
        const mutation = response.ok
          ? ((await response.json().catch(() => null)) as NotificationsMutationResponse | null)
          : null;

        await reload();
        emitNotificationsUpdated();

        if (all && mutation?.changedIds?.length) {
          const changedIds = mutation.changedIds;
          pushUndoToast({
            title: "Notifications marquees comme lues",
            description: `${changedIds.length} notification(s)`,
            onUndo: async () => {
              await fetch("/api/notifications", {
                method: "PATCH",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unreadIds: changedIds }),
              });
              await reload();
              emitNotificationsUpdated();
            },
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [reload],
  );

  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, reload);

    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, reload);
  }, [reload]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Centre de notifications</CardTitle>
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
      </CardHeader>
      <Separator />

      {data.items.length > 0 ? (
        <div className="divide-ec-line divide-y">
          {data.items.map((item) => {
            const content = (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {!item.readAt ? (
                    <Badge variant="blue" className="tracking-[0.16em] uppercase">
                      Nouveau
                    </Badge>
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
        <CardContent className="p-10 text-center sm:p-10">
          <Bell className="text-ec-blue mx-auto size-10" />
          <h2 className="text-ec-ink mt-4 text-2xl font-black">Aucune notification</h2>
          <p className="text-ec-muted mx-auto mt-2 max-w-lg text-sm leading-7">
            Les changements de statut de vos commandes apparaitront ici.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
