"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { emitNotificationsUpdated } from "@/lib/notifications-events";
import { pushUndoToast } from "@/lib/undo-actions";
import { useCustomerNotifications } from "@/lib/use-customer-notifications";

type NotificationsMutationResponse = {
  ok: boolean;
  changedIds?: string[];
};

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CustomerNotificationsMenu({
  compact = false,
  active = false,
  open,
  onOpenChange,
}: {
  compact?: boolean;
  active?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { data, refresh } = useCustomerNotifications({ take: 10 });
  const isOpen = open ?? uncontrolledOpen;
  const isSignedIn = data !== null;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeIfOutside(event: PointerEvent | FocusEvent) {
      const target = event.target;

      if (target instanceof Node && menuRef.current?.contains(target)) {
        return;
      }

      handleOpenChange(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", closeIfOutside, true);
    document.addEventListener("focusin", closeIfOutside, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", closeIfOutside, true);
      document.removeEventListener("focusin", closeIfOutside, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleOpenChange, isOpen]);

  const unreadLabel = useMemo(() => {
    if (!data?.unreadCount) return null;
    return data.unreadCount > 9 ? "9+" : String(data.unreadCount);
  }, [data?.unreadCount]);

  const markRead = useCallback(
    async (ids?: string[], all = false) => {
      setIsMutating(true);

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

        await refresh();
        emitNotificationsUpdated();

        if (all && mutation?.changedIds?.length) {
          const changedIds = mutation.changedIds;
          pushUndoToast({
            title: "Notifications marquées comme lues",
            description: `${changedIds.length} notification(s)`,
            onUndo: async () => {
              await fetch("/api/notifications", {
                method: "PATCH",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unreadIds: changedIds }),
              });
              await refresh();
              emitNotificationsUpdated();
            },
          });
        }
      } finally {
        setIsMutating(false);
      }
    },
    [refresh],
  );

  if (!isSignedIn) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className={cn(
          "relative grid place-items-center rounded-full border bg-white transition",
          compact ? "size-10" : "size-10",
          active || isOpen
            ? "border-ec-blue/50 bg-ec-blue/10 text-ec-blue shadow-[0_0_0_4px_rgba(10,141,193,0.08)]"
            : "border-ec-line text-ec-ink hover:border-ec-blue/40 hover:text-ec-blue",
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => handleOpenChange(!isOpen)}
      >
        <Bell className="size-5" />
        {unreadLabel ? (
          <span className="bg-ec-blue absolute -top-1 -right-1 grid min-h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-black text-white">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="notifications-menu"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="border-ec-line shadow-ec-ink/15 absolute top-full right-0 z-50 mt-3 w-[min(360px,88vw)] overflow-hidden rounded-[1.25rem] border bg-white shadow-2xl"
          >
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
                        handleOpenChange(false);
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
            onClick={() => handleOpenChange(false)}
          >
            Voir toutes les notifications
          </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
