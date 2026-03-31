"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PRESET_BAN_REASON_OPTIONS,
  type BanReasonId,
  type UserBanDetails,
} from "@/features/users/ban-details";
import type { UpdateStaffUserBanInput } from "@/features/users/types";

type UserBanDialogProps = {
  open: boolean;
  email: string;
  isSubmitting?: boolean;
  initialDetails?: UserBanDetails | null;
  onClose: () => void;
  onConfirm: (input: UpdateStaffUserBanInput) => Promise<void> | void;
};

export default function UserBanDialog({
  open,
  email,
  isSubmitting = false,
  initialDetails,
  onClose,
  onConfirm,
}: UserBanDialogProps) {
  const [presetReasonIds, setPresetReasonIds] = useState<BanReasonId[]>(
    initialDetails?.presetReasonIds ?? [],
  );
  const [useOtherReason, setUseOtherReason] = useState(
    Boolean(initialDetails?.otherReason),
  );
  const [otherReason, setOtherReason] = useState(initialDetails?.otherReason ?? "");
  const [description, setDescription] = useState(
    initialDetails?.description ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const selectedCount = useMemo(() => {
    return presetReasonIds.length + (useOtherReason && otherReason.trim() ? 1 : 0);
  }, [otherReason, presetReasonIds.length, useOtherReason]);

  if (!open) return null;

  const toggleReason = (reasonId: BanReasonId) => {
    setPresetReasonIds((current) =>
      current.includes(reasonId)
        ? current.filter((value) => value !== reasonId)
        : [...current, reasonId],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedCount === 0) {
      setError("Selectionnez au moins un motif ou renseignez un autre motif.");
      return;
    }

    if (useOtherReason && !otherReason.trim()) {
      setError("Renseignez le motif libre ou decochez Autre.");
      return;
    }

    setError(null);

    await onConfirm({
      banned: true,
      presetReasonIds,
      otherReason: useOtherReason ? otherReason.trim() : null,
      description: description.trim() || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-300 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
              Moderation
            </p>
            <h2 className="mt-2 text-xl font-semibold text-cobam-dark-blue">
              Bannir un utilisateur
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choisissez les motifs pour le compte{" "}
              <span className="font-semibold text-slate-700">{email}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6 px-6 py-6">
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-cobam-dark-blue">
              Motifs preconfigures
            </Label>

            <div className="grid gap-3 sm:grid-cols-2">
              {PRESET_BAN_REASON_OPTIONS.map((option) => {
                const checked = presetReasonIds.includes(option.id);

                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                      checked
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-300 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleReason(option.id)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm leading-6 text-slate-700">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-300 bg-slate-50/70 p-4">
            <label className="flex items-center gap-3 text-sm font-semibold text-cobam-dark-blue">
              <input
                type="checkbox"
                checked={useOtherReason}
                onChange={(event) => setUseOtherReason(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              Ajouter un motif libre
            </label>

            {useOtherReason ? (
              <input
                type="text"
                value={otherReason}
                onChange={(event) => setOtherReason(event.target.value)}
                placeholder="Autre motif"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="ban-description"
              className="text-sm font-semibold text-cobam-dark-blue"
            >
              Description complementaire
            </Label>
            <Textarea
              id="ban-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Ajoutez un contexte plus detaille pour ce bannissement."
              className="min-h-[140px] rounded-2xl border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-5"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-amber-600 px-5 text-white hover:bg-amber-700"
            >
              {isSubmitting ? "Bannissement..." : "Confirmer le bannissement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
