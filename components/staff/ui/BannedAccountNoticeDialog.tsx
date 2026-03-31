"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserBanDetails } from "@/features/users/ban-details";

type BannedAccountNoticeDialogProps = {
  open: boolean;
  banDetails: UserBanDetails | null;
  onClose: (options: { remember: boolean }) => void;
};

export default function BannedAccountNoticeDialog({
  open,
  banDetails,
  onClose,
}: BannedAccountNoticeDialogProps) {
  const [remember, setRemember] = useState(false);

  if (!open) return null;

  const reasons = [
    ...(banDetails?.presetLabels ?? []),
    ...(banDetails?.otherReason ? [banDetails.otherReason] : []),
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-xl rounded-[28px] border border-red-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.26)]">
        <div className="border-b border-red-100 px-6 py-5">
          <div className="inline-flex h-10 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
            Compte banni
          </p>
          <h2 className="mt-2 text-xl font-semibold text-cobam-dark-blue">
            Votre compte staff est actuellement banni
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ce message s&apos;affiche a la connexion pour vous informer du motif
            du bannissement.
          </p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-slate-300 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-cobam-dark-blue">
              Motifs communiques
            </p>

            {reasons.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-400" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Aucun motif detaille n&apos;a ete fourni.
              </p>
            )}
          </div>

          {banDetails?.description ? (
            <div className="rounded-2xl border border-slate-300 p-4">
              <p className="text-sm font-semibold text-cobam-dark-blue">
                Description complementaire
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {banDetails.description}
              </p>
            </div>
          ) : null}

          <label className="flex items-start gap-3 rounded-2xl border border-slate-300 p-4 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cobam-dark-blue focus:ring-cobam-water-blue"
            />
            <span>
              Ne plus afficher ce message pour ce bannissement precis.
            </span>
          </label>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => onClose({ remember })}
              className="rounded-full bg-cobam-dark-blue px-5 text-white hover:bg-cobam-water-blue"
            >
              J&apos;ai compris
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
