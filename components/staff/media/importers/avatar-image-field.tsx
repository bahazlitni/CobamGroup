"use client";

import type { ReactNode } from "react";
import MediaImageField from "./media-image-field";

type AvatarImageFieldProps = {
  mediaId: number | null;
  onChange: (mediaId: number | null) => void;
  fallback?: ReactNode;
};

export default function AvatarImageField({
  mediaId,
  onChange,
  fallback,
}: AvatarImageFieldProps) {
  return (
    <MediaImageField
      label="Avatar"
      description=""
      dialogTitle="Choisir un avatar"
      dialogDescription="Parcourez la mediatheque ou importez une nouvelle image pour ce profil."
      mediaId={mediaId}
      onChange={onChange}
      emptyLabel="Aucun avatar selectionne."
      fallback={fallback}
      noImagePreview
    />
  );
}
