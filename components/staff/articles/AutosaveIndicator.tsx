import { StaffBadge } from "@/components/staff/ui";
import type { AnimatedIconName } from "@/components/ui/custom/AnimatedIcon";
import type { StaffColorName } from "@/components/ui/custom/animated-ui.shared";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AutosaveIndicator({
  isDirty,
  isSubmitting,
  lastSavedAt,
}: {
  isDirty: boolean;
  isSubmitting: boolean;
  lastSavedAt: Date | null;
}) {
  let label = "Aucune sauvegarde";
  let color: StaffColorName = "default";
  let icon: AnimatedIconName = "save";

  if (isSubmitting) {
    label = "Enregistrement...";
    color = "blue";
    icon = "loader";
  } else if (isDirty) {
    label = "Modifications non enregistrees";
    color = "amber";
    icon = "warning";
  } else if (lastSavedAt) {
    label = `Sauvegarde a ${formatTime(lastSavedAt)}`;
    color = "green";
    icon = "check-circle";
  }

  return (
    <div className="hidden sm:inline-flex">
      <StaffBadge size="lg" color={color} icon={icon}>
        {label}
      </StaffBadge>
    </div>
  );
}
