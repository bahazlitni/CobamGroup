"use client";

import { StaffBadge } from "@/components/staff/ui";
import type { MediaVisibility } from "@/features/media/types";

export default function MediaVisibilityBadge({
  visibility,
}: {
  visibility: MediaVisibility;
}) {
  return (
    <StaffBadge
      size="md"
      color={visibility === "PUBLIC" ? "blue" : "default"}
    >
      {visibility === "PUBLIC" ? "Public" : "Prive"}
    </StaffBadge>
  );
}
