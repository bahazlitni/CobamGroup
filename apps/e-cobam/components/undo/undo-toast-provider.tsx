"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { safeRandomUUID } from "@/lib/safe-random-uuid";
import {
  UNDO_TOAST_EVENT,
  type UndoToastEventDetail,
  type UndoToastSize,
} from "@/lib/undo-actions";

const DEFAULT_DURATION_MS = 3_000;
const DESKTOP_QUERY = "(min-width: 640px)";

type UndoToastSizeConfig = {
  width: string;
  radius: string;
  contentPadding: string;
  contentGap: string;
  iconShell: string;
  iconSize: string;
  titleText: string;
  descriptionText: string;
  actionHeight: string;
  actionPadding: string;
  actionGap: string;
  actionText: string;
  actionIcon: string;
  closeSize: string;
  closeIcon: string;
  progressHeight: string;
};

const undoToastSizeMap: Record<UndoToastSize, UndoToastSizeConfig> = {
  xs: {
    width: "w-[min(360px,calc(100vw-1.5rem))]",
    radius: "rounded-[1.1rem]",
    contentPadding: "px-3 py-3",
    contentGap: "gap-2.5",
    iconShell: "size-8",
    iconSize: "size-4",
    titleText: "text-xs",
    descriptionText: "text-[11px]",
    actionHeight: "h-7",
    actionPadding: "px-2.5",
    actionGap: "gap-1",
    actionText: "text-[11px]",
    actionIcon: "size-3",
    closeSize: "size-6",
    closeIcon: "size-3",
    progressHeight: "h-1",
  },
  sm: {
    width: "w-[min(440px,calc(100vw-2rem))]",
    radius: "rounded-[1.35rem]",
    contentPadding: "px-4 py-3.5",
    contentGap: "gap-3",
    iconShell: "size-9",
    iconSize: "size-[18px]",
    titleText: "text-sm",
    descriptionText: "text-xs",
    actionHeight: "h-8",
    actionPadding: "px-3",
    actionGap: "gap-1.5",
    actionText: "text-xs",
    actionIcon: "size-3.5",
    closeSize: "size-7",
    closeIcon: "size-3.5",
    progressHeight: "h-1",
  },
  md: {
    width: "w-[min(540px,calc(100vw-2rem))]",
    radius: "rounded-[1.55rem]",
    contentPadding: "px-5 py-4",
    contentGap: "gap-3.5",
    iconShell: "size-10",
    iconSize: "size-5",
    titleText: "text-[15px]",
    descriptionText: "text-sm",
    actionHeight: "h-9",
    actionPadding: "px-4",
    actionGap: "gap-2",
    actionText: "text-sm",
    actionIcon: "size-4",
    closeSize: "size-8",
    closeIcon: "size-3.5",
    progressHeight: "h-1.5",
  },
  lg: {
    width: "w-[min(620px,calc(100vw-2rem))]",
    radius: "rounded-[1.75rem]",
    contentPadding: "px-6 py-[18px]",
    contentGap: "gap-4",
    iconShell: "size-11",
    iconSize: "size-5",
    titleText: "text-base",
    descriptionText: "text-sm",
    actionHeight: "h-10",
    actionPadding: "px-[18px]",
    actionGap: "gap-2",
    actionText: "text-sm",
    actionIcon: "size-4",
    closeSize: "size-8",
    closeIcon: "size-4",
    progressHeight: "h-1.5",
  },
  xl: {
    width: "w-[min(700px,calc(100vw-2rem))]",
    radius: "rounded-[2rem]",
    contentPadding: "px-7 py-5",
    contentGap: "gap-[18px]",
    iconShell: "size-12",
    iconSize: "size-[22px]",
    titleText: "text-lg",
    descriptionText: "text-sm",
    actionHeight: "h-11",
    actionPadding: "px-5",
    actionGap: "gap-2.5",
    actionText: "text-base",
    actionIcon: "size-[18px]",
    closeSize: "size-9",
    closeIcon: "size-4",
    progressHeight: "h-2",
  },
  "2xl": {
    width: "w-[min(780px,calc(100vw-2rem))]",
    radius: "rounded-[2.2rem]",
    contentPadding: "px-8 py-6",
    contentGap: "gap-5",
    iconShell: "size-14",
    iconSize: "size-6",
    titleText: "text-xl",
    descriptionText: "text-base",
    actionHeight: "h-12",
    actionPadding: "px-6",
    actionGap: "gap-3",
    actionText: "text-base",
    actionIcon: "size-5",
    closeSize: "size-10",
    closeIcon: "size-[18px]",
    progressHeight: "h-2",
  },
};

type UndoToastRecord = UndoToastEventDetail & {
  actionLabel: string;
  durationMs: number;
  instanceId: string;
};

function UndoToastCard({
  item,
  onDismiss,
}: {
  item: UndoToastRecord;
  onDismiss: (id: string) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [remainingMs, setRemainingMs] = useState(item.durationMs);
  const [paused, setPaused] = useState(false);
  const [isCloseVisible, setIsCloseVisible] = useState(false);
  const remainingRef = useRef(item.durationMs);
  const finishedRef = useRef(false);
  const sizeConfig = undoToastSizeMap[item.size ?? "sm"];

  useEffect(() => {
    if (paused || finishedRef.current) {
      return;
    }

    let previous = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - previous;
      previous = now;
      const next = Math.max(0, remainingRef.current - elapsed);
      remainingRef.current = next;
      setRemainingMs(next);

      if (next <= 0) {
        finishedRef.current = true;
        onDismiss(item.id);
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [item.id, onDismiss, paused]);

  async function handleUndo() {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    onDismiss(item.id);

    try {
      await item.onUndo();
    } catch (cause) {
      toast.error("Action non annulee", {
        description:
          cause instanceof Error
            ? cause.message
            : "Impossible d'annuler cette action pour le moment.",
      });
    }
  }

  const progress = Math.max(0, Math.min(100, (remainingMs / item.durationMs) * 100));

  return (
    <motion.div
      data-undo-toast
      layout
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.8 }}
      onMouseEnter={() => {
        setPaused(true);
        setIsCloseVisible(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
        setIsCloseVisible(false);
      }}
      onFocusCapture={() => setIsCloseVisible(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsCloseVisible(false);
        }
      }}
      className={cn(
        "pointer-events-auto relative overflow-visible",
        sizeConfig.width,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border border-white/55 bg-white/62 text-ec-ink shadow-[0_22px_70px_rgba(20,32,46,0.22)] backdrop-blur-2xl",
          sizeConfig.radius,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.68),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0.06))]" />
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/90" />

        <div
          className={cn(
            "relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center",
            sizeConfig.contentGap,
            sizeConfig.contentPadding,
          )}
        >
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-full bg-ec-blue/10 text-ec-blue ring-1 ring-ec-blue/15",
              sizeConfig.iconShell,
            )}
          >
            <CheckCircle2 className={sizeConfig.iconSize} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className={cn("truncate font-black", sizeConfig.titleText)}>{item.title}</p>
            {item.description ? (
              <p className={cn("mt-0.5 truncate font-semibold text-ec-muted", sizeConfig.descriptionText)}>
                {item.description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void handleUndo()}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full bg-ec-ink font-black text-white shadow-[0_10px_24px_rgba(20,32,46,0.18)] transition hover:bg-ec-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue",
              sizeConfig.actionHeight,
              sizeConfig.actionPadding,
              sizeConfig.actionGap,
              sizeConfig.actionText,
            )}
          >
            {item.actionLabel}
          </button>
        </div>

        <div className={cn("relative overflow-hidden bg-white/34", sizeConfig.progressHeight)}>
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#0a8dc1,#72d1ee)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.08, ease: "linear" }}
          />
        </div>
      </div>

      <button
        type="button"
        aria-label="Fermer"
        onClick={() => onDismiss(item.id)}
        style={{
          opacity: isCloseVisible ? 1 : 0,
          pointerEvents: isCloseVisible ? "auto" : "none",
          transform: `translate(50%, -50%) scale(${isCloseVisible ? 1 : 0.9})`,
        }}
        className={cn(
          "absolute right-0 top-0 z-10 grid place-items-center rounded-full border border-white/70 bg-white/80 text-ec-muted shadow-[0_12px_28px_rgba(20,32,46,0.18)] backdrop-blur-xl transition duration-150 ease-out hover:bg-white hover:text-ec-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue",
          sizeConfig.closeSize,
        )}
      >
        <X className={sizeConfig.closeIcon} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

export function UndoToastProvider() {
  const [item, setItem] = useState<UndoToastRecord | null>(null);

  useEffect(() => {
    function handleUndoToast(event: Event) {
      const detail = (event as CustomEvent<UndoToastEventDetail>).detail;

      if (!detail?.id || typeof detail.onUndo !== "function") {
        return;
      }

      const defaultSize: UndoToastSize = window.matchMedia(DESKTOP_QUERY).matches ? "md" : "sm";

      setItem({
        ...detail,
        actionLabel: detail.actionLabel ?? "Annuler",
        durationMs: detail.durationMs ?? DEFAULT_DURATION_MS,
        instanceId: safeRandomUUID(),
        size: detail.size ?? defaultSize,
      });
    }

    window.addEventListener(UNDO_TOAST_EVENT, handleUndoToast);

    return () => window.removeEventListener(UNDO_TOAST_EVENT, handleUndoToast);
  }, []);

  function dismiss(id: string) {
    setItem((current) => (current?.id === id ? null : current));
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[10000] flex justify-center px-4 sm:bottom-8">
      <div className="flex w-full max-w-[820px] items-center justify-center">
        <AnimatePresence mode="wait">
          {item ? <UndoToastCard key={item.instanceId} item={item} onDismiss={dismiss} /> : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
