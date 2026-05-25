"use client";

import { safeRandomUUID } from "@/lib/safe-random-uuid";

export const UNDO_TOAST_EVENT = "e-cobam-undo-toast";

export type UndoToastSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type UndoToastPayload = {
  id?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  durationMs?: number;
  size?: UndoToastSize;
  onUndo: () => void | Promise<void>;
};

export type UndoToastEventDetail = Required<Pick<UndoToastPayload, "id">> &
  Omit<UndoToastPayload, "id">;

export function pushUndoToast(payload: UndoToastPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const detail: UndoToastEventDetail = {
    ...payload,
    id: payload.id ?? safeRandomUUID(),
  };

  window.dispatchEvent(new CustomEvent<UndoToastEventDetail>(UNDO_TOAST_EVENT, { detail }));
}
