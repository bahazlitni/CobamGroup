"use client";

import type { ComponentProps } from "react";
import ImageImporter from "@/components/staff/media/importers/ImageImporter";

type StaffImageImporterProps = ComponentProps<typeof ImageImporter>;

export default function StaffImageImporter(props: StaffImageImporterProps) {
  return <ImageImporter {...props} folderPath={props.folderPath ?? "/produits"} />;
}
