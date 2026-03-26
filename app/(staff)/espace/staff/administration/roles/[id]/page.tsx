"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import Panel from "@/components/staff/ui/Panel";
import Loading from "@/components/staff/Loading";
import RoleEditorForm, {
  toRoleFormState,
  toRoleMutationInput,
  type RoleFormState,
} from "@/components/staff/roles/RoleEditorForm";
import { StaffNotice, StaffPageHeader, StaffStateCard } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { hasAnyPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { useRoleDetail } from "@/features/roles/hooks/use-role-detail";

export default function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useStaffSessionContext();
  const [roleId, setRoleId] = useState<string | null>(null);

  const canManage = user
    ? hasAnyPermission(user, [
        PERMISSIONS.ROLES_VIEW_ALL,
        PERMISSIONS.ROLES_CREATE_ALL,
        PERMISSIONS.ROLES_UPDATE_ALL,
        PERMISSIONS.ROLES_DELETE_ALL,
      ])
    : false;

  useEffect(() => {
    void params.then((value) => setRoleId(value.id));
  }, [params]);

  const { role, isLoading, isSaving, isDeleting, error, save, remove } =
    useRoleDetail(roleId);
  const [draftForm, setDraftForm] = useState<RoleFormState | null>(null);

  const form = useMemo(
    () => draftForm ?? (role ? toRoleFormState(role) : null),
    [draftForm, role],
  );

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

  if (isLoading || !form) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loading />
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    const nextRole = await save(toRoleMutationInput(form));
    if (!nextRole) {
      toast.error(error || "Impossible d'enregistrer le rôle.");
      return;
    }

    toast.success("Rôle mis à jour.");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Supprimer ce rôle ? Les utilisateurs qui le possèdent le perdront automatiquement.",
    );
    if (!confirmed) return;

    const success = await remove();
    if (!success) {
      toast.error(error || "Impossible de supprimer le rôle.");
      return;
    }

    toast.success("Rôle supprimé.");
    router.replace("/espace/staff/gestion/roles");
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        backHref="/espace/staff/gestion/roles"
        eyebrow="Rôles"
        title={role?.name ?? "Rôle"}
        icon={Shield}
      />

      {error ? (
        <StaffNotice variant="error" title="Modification impossible">
          {error}
        </StaffNotice>
      ) : null}

      <RoleEditorForm
        state={form}
        onChange={(patch) =>
          setDraftForm((current) => ({
            ...(current ?? toRoleFormState(role ?? undefined)),
            ...patch,
          }))
        }
        onSubmit={handleSave}
        isSubmitting={isSaving}
        submitLabel="Enregistrer les modifications"
      />

      <Panel
        pretitle=""
        title="Supprimer ce rôle"
        description="La suppression retire ce rôle de tous les utilisateurs qui l'ont encore."
      >
        <AnimatedUIButton
          type="button"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          loading={isDeleting}
          loadingText="Suppression..."
          variant="light"
          icon="delete"
          iconPosition="left"
          className="w-full border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100"
          textClassName="text-red-700"
          iconClassName="text-red-700"
        >
          Supprimer le rôle
        </AnimatedUIButton>
      </Panel>
    </div>
  );
}
