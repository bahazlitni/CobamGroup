"use client";

import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffPageHeader, StaffStateCard } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { hasAnyPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { useRolesList } from "@/features/roles/hooks/use-roles-list";
import { canAccessRoles } from "@/features/roles/access";
import Loading from "@/components/staff/Loading";

const columns = ["Role", "Priorite", "Permissions", "Statut", "Actions"];

export default function RolesListPage() {
  const { user } = useStaffSessionContext();
  const { items, isLoading, error } = useRolesList();
  const canManage = user ? canAccessRoles(user) : false

  if(isLoading) return <Loading />

  if (!canManage) {
    return (
      <StaffStateCard
        variant="forbidden"
        title="Acces refuse"
        description="Seuls les comptes Admin et Root peuvent gerer les roles."
      />
    );
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Administration" title="Roles">
        <AnimatedUIButton
          href="/espace/staff//administration/roles/new"
          variant="primary"
          icon="plus"
          iconPosition="left"
        >
          Nouveau role
        </AnimatedUIButton>
      </StaffPageHeader>

      <PanelTable
        columns={columns}
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Aucun role personnalise."
      >
        {items.map((role) => (
          <tr key={role.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <div>
                  <p className="font-semibold text-cobam-dark-blue">{role.name}</p>
                  <p className="text-xs text-slate-400">{role.key}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600">{role.priorityIndex}</td>
            <td className="px-4 py-3 text-slate-600">
              {role.permissions.length}
            </td>
            <td className="px-4 py-3">
              <StaffBadge
                size="md"
                color={role.isActive ? "green" : "default"}
                icon={role.isActive ? "check-circle" : "pause"}
              >
                {role.isActive ? "Actif" : "Inactif"}
              </StaffBadge>
            </td>
            <td className="px-4 py-3 text-right">
              <AnimatedUIButton
                href={`/espace/staff//administration/roles/${role.id}`}
                variant="ghost"
                icon="arrow-right"
              >
                Ouvrir
              </AnimatedUIButton>
            </td>
          </tr>
        ))}
      </PanelTable>
    </div>
  );
}
