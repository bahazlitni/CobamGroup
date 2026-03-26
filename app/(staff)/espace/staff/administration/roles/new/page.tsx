"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import RoleEditorForm, {
  toRoleFormState,
  toRoleMutationInput,
} from "@/components/staff/roles/RoleEditorForm";
import { StaffNotice, StaffPageHeader, StaffStateCard } from "@/components/staff/ui";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { hasAnyPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { useRoleDetail } from "@/features/roles/hooks/use-role-detail";

export default function NewRolePage() {
  const router = useRouter();
  const { user } = useStaffSessionContext();
  const { save, isSaving, error } = useRoleDetail(null);
  const [form, setForm] = useState(() => toRoleFormState());

  const canManage = user
    ? hasAnyPermission(user, [
        PERMISSIONS.ROLES_VIEW_ALL,
        PERMISSIONS.ROLES_CREATE_ALL,
        PERMISSIONS.ROLES_UPDATE_ALL,
        PERMISSIONS.ROLES_DELETE_ALL,
      ])
    : false;

  const title = useMemo(() => form.name.trim() || "Nouveau rôle", [form.name]);

  if (!canManage) {
    return (
      <StaffStateCard
        variant="forbidden"
        title="Accès refusé"
        description="Seuls les comptes Admin et Root peuvent gérer les rôles."
        actionHref="/espace/staff/gestion/roles"
        actionLabel="Retour aux rôles"
      />
    );
  }

  const handleSave = async () => {
    const role = await save(toRoleMutationInput(form));
    if (!role) {
      toast.error(error || "Impossible de créer le rôle.");
      return;
    }

    toast.success("Rôle créé.");
    router.replace(`/espace/staff//administration/roles/${role.id}`);
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        backHref="/espace/staff/gestion/roles"
        eyebrow="Rôles"
        title={title}
        icon={Shield}
      />

      {error ? (
        <StaffNotice variant="error" title="Enregistrement impossible">
          {error}
        </StaffNotice>
      ) : null}

      <RoleEditorForm
        state={form}
        onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
        onSubmit={handleSave}
        isSubmitting={isSaving}
        submitLabel="Créer le rôle"
      />
    </div>
  );
}
