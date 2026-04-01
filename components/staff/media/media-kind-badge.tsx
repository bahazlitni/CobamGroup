import { StaffBadge } from "@/components/staff/ui";
import type { MediaKind } from "@/features/media/types";
import { getMediaKindLabel } from "./utils";

export default function MediaKindBadge({ kind }: { kind: MediaKind }) {
  const className =
    kind === "IMAGE"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : kind === "VIDEO"
        ? "border-violet-200 bg-violet-50 text-violet-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <StaffBadge size="md" className={className}>
      {getMediaKindLabel(kind)}
    </StaffBadge>
  );
}
