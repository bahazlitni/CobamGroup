"use client";

import type { MediaVisibility } from "@prisma/client";
import { StaffBadge } from "@/components/staff/ui";

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
