"use client";

import type { ComponentProps } from "react";
import ImageImporter from "@/components/staff/media/importers/ImageImporter";
import { MEDIA_FOLDER_SCOPE_IDS, MEDIA_FOLDER_SCOPE_LABELS } from "@/features/media/folder-scopes";

type StaffImageImporterProps = ComponentProps<typeof ImageImporter>;

export default function StaffImageImporter(props: StaffImageImporterProps) {
  if (props.folderId !== undefined || props.folderPath) {
    return <ImageImporter {...props} />;
  }

  return (
    <ImageImporter
      {...props}
      folderId={MEDIA_FOLDER_SCOPE_IDS.PRODUCT_IMAGES}
      folderLabel={MEDIA_FOLDER_SCOPE_LABELS[MEDIA_FOLDER_SCOPE_IDS.PRODUCT_IMAGES]}
    />
  );
}
