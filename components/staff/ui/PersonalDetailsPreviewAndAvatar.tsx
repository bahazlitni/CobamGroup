"use client";

import AvatarImageField from "@/components/staff/media/importers/avatar-image-field";
import ImagePreview from "@/components/staff/media/importers/ImagePreview";
import Panel from "@/components/staff/ui/Panel";
import Avatar from "./Avatar";

export type PersonalPreviewState = {
  avatarMediaId?: number | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  jobTitle?: string;
  phone?: string;
  birthDate?: string;
};

export default function PersonalDetailsPreviewAndAvatar({
  state,
  onAvatarMediaIdChange,
}: {
  state: PersonalPreviewState;
  onAvatarMediaIdChange?: (value: number | null) => void;
}) {
  const fullName =
    [state.firstName, state.lastName].filter(Boolean).join(" ").trim() ||
    "Profil staff";
  const initials =
    `${state.firstName?.[0] || ""}${state.lastName?.[0] || ""}`
      .trim()
      .toUpperCase() || "CG";

  return (
    <Panel
      pretitle="Aperçu"
      title="Profil et avatar"
      description="Aperçu rapide des informations saisies."
    >
      <div className="flex items-center gap-4">
        <Avatar initials={initials} size="lg" mediaId={state.avatarMediaId}/>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-cobam-dark-blue">
            {fullName}
          </div>
          <div className="mt-1 truncate text-sm text-slate-500">
            {state.email || "Email non renseigne"}
          </div>
          <div className="mt-1 truncate text-sm text-slate-400">
            {state.jobTitle || "Aucun poste renseigne"}
          </div>
        </div>
      </div>


      <AvatarImageField
        mediaId={state.avatarMediaId ?? null}
        onChange={(value) => onAvatarMediaIdChange?.(value)}
        fallback={
          <span className="text-lg font-semibold text-slate-400">
            {initials}
          </span>
        }
      />

      <div className="space-y-3 rounded-2xl border border-slate-300 p-4">
        <p className="text-xs text-slate-500">
          Téléphone:{" "}
          <span className="font-semibold text-slate-700">
            {state.phone || "Non renseigne"}
          </span>
        </p>
        <p className="text-xs text-slate-500">
          Date de naissance:{" "}
          <span className="font-semibold text-slate-700">
            {state.birthDate || "Non renseignee"}
          </span>
        </p>
      </div>
    </Panel>
  );
}
