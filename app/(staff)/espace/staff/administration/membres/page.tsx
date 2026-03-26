"use client";

import { useCallback } from "react";
import { Search } from "lucide-react";
import Avatar from "@/components/staff/ui/Avatar";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffFilterBar, StaffPageHeader, StaffSelect } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { useRolesList } from "@/features/roles/hooks/use-roles-list";
import { useUsersList } from "@/features/users/hooks/use-users-list";
import type { StaffUserListItemDto } from "@/features/users/types";

const PAGE_SIZE_OPTIONS: Array<10 | 20 | 50> = [10, 20, 50];
const columns = ["Utilisateur", "Acces", "Poste", "Cree le", "Actions"];

function getDisplayName(user: StaffUserListItemDto) {
  const first = user.profile?.firstName?.trim() || "";
  const last = user.profile?.lastName?.trim() || "";
  const full = `${first} ${last}`.trim();
  return full || "-";
}

function getInitials(user: StaffUserListItemDto) {
  const first = user.profile?.firstName?.trim() || "";
  const last = user.profile?.lastName?.trim() || "";
  return first[0] + last[0];
}

function getUserStatusBadge(isBanned: boolean) {
  return isBanned
    ? {
        label: "Banni",
        color: "amber" as const,
        icon: "warning" as const,
      }
    : null;
}

function getAccessBadge(user: StaffUserListItemDto) {
  switch (user.powerType) {
    case "ROOT":
      return {
        label: user.roleLabel,
        color: "rose" as const,
        icon: "shield" as const,
      };
    case "ADMIN":
      return {
        label: user.roleLabel,
        color: "violet" as const,
        icon: "shield" as const,
      };
    case "STAFF":
    default:
      return {
        label: user.roleLabel,
        color: "blue" as const,
        icon: "user" as const,
      };
  }
}

export default function UsersListPage() {
  const { user: authUser } = useStaffSessionContext();
  const { items: roles } = useRolesList();
  const canCreateUser =
    !!authUser && hasPermission(authUser, PERMISSIONS.USERS_CREATE_BELOW_ROLE);

  const {
    items,
    total,
    page,
    pageSize,
    search,
    roleKey,
    powerType,
    isLoading,
    error,
    totalPages,
    canPrev,
    canNext,
    setSearch,
    setRoleKey,
    setPowerType,
    submitSearch,
    updatePageSize,
    goPrev,
    goNext,
    fetchUsers,
  } = useUsersList(20);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      await submitSearch();
    },
    [submitSearch],
  );

  const handleRoleChange = useCallback(
    async (value: string) => {
      setRoleKey(value);
      await fetchUsers({ page: 1, roleKey: value });
    },
    [fetchUsers, setRoleKey],
  );

  const handlePowerTypeChange = useCallback(
    async (value: "" | "ROOT" | "ADMIN" | "STAFF") => {
      setPowerType(value);
      await fetchUsers({ page: 1, powerType: value });
    },
    [fetchUsers, setPowerType],
  );

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Utilisateurs" title="Gestion des comptes staff">
        {canCreateUser ? (
          <AnimatedUIButton
            href="/espace/staff/administration/membres/new"
            variant="secondary"
            icon="plus"
            iconPosition="left"
          >
            Creer un utilisateur
          </AnimatedUIButton>
        ) : null}
      </StaffPageHeader>

      <form onSubmit={handleSubmit}>
        <StaffFilterBar
          summary={
            <span>
              {total} utilisateur{total > 1 ? "s" : ""} - Page {page}/{totalPages}
            </span>
          }
        >
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par email, nom, poste..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-cobam-water-blue focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/40"
            />
          </div>

          <div className="w-full sm:w-48">
            <StaffSelect
              value={powerType}
              onValueChange={(value) =>
                void handlePowerTypeChange(value as "" | "ROOT" | "ADMIN" | "STAFF")
              }
              emptyLabel="Tous les pouvoirs"
              options={[
                { value: "ROOT", label: "Root" },
                { value: "ADMIN", label: "Admin" },
                { value: "STAFF", label: "Staff" },
              ]}
            />
          </div>

          <div className="w-full sm:w-56">
            <StaffSelect
              value={roleKey}
              onValueChange={(value) => void handleRoleChange(value)}
              emptyLabel="Tous les roles"
              options={roles.map((role) => ({
                value: role.key,
                label: role.name,
              }))}
            />
          </div>
        </StaffFilterBar>
      </form>

      <PanelTable
        columns={columns}
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Aucun utilisateur ne correspond a ces criteres."
        pagination={{
          goPrev,
          goNext,
          updatePageSize: (value) => updatePageSize(value as 10 | 20 | 50),
          canPrev,
          canNext,
          pageSize,
          total,
          totalPages,
          page,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          itemLabel: "utilisateur",
        }}
      >
        {items.map((user) => {
          const statusBadge = getUserStatusBadge(user.status === "BANNED");
          const accessBadge = getAccessBadge(user);

          return (
            <tr key={user.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 align-top">
                <div className="flex flex-wrap items-center gap-3 font-semibold text-cobam-dark-blue">
                  <Avatar
                    initials={getInitials(user)}
                    size="sm"
                    mediaId={user.profile?.avatarMediaId}
                  />
                  <div className="flex flex-col justify-start gap-1">
                    <div className="inline-flex flex-wrap items-center gap-2">
                      <p>{getDisplayName(user)}</p>
                      {statusBadge ? (
                        <StaffBadge
                          size="sm"
                          color={statusBadge.color}
                          icon={statusBadge.icon}
                        >
                          {statusBadge.label}
                        </StaffBadge>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 align-top text-slate-700">
                <StaffBadge
                  size="md"
                  color={accessBadge.color}
                  icon={accessBadge.icon}
                >
                  {accessBadge.label}
                </StaffBadge>
              </td>

              <td className="px-4 py-3 align-top text-slate-600">
                {user.profile?.jobTitle || "-"}
              </td>

              <td className="px-4 py-3 align-top text-xs text-slate-600">
                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </td>

              <td className="px-4 py-3 align-top text-right">
                <AnimatedUIButton
                  href={`/espace/staff/administration/membres/${user.id}`}
                  variant="ghost"
                  icon="modify"
                  iconPosition="left"
                >
                  Voir / Editer
                </AnimatedUIButton>
              </td>
            </tr>
          );
        })}
      </PanelTable>
    </div>
  );
}
