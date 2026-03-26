import {
  getProtectedPowerTypePermissions,
  STAFF_BASE_PERMISSION_KEYS,
  type PermissionKey,
} from "./permissions";
import {
  getHighestPriorityRole,
  getRoleColor,
  getRoleKey,
  getRoleLabel,
  sortRolesByPriority,
  type PowerType,
  type RoleSummary,
} from "./roles";

export type RolePermissionRecord = {
  allowed: boolean;
  permission: {
    key: string;
  };
};

export type AssignedRoleRecord = {
  role: {
    id: bigint;
    key: string;
    name: string;
    color: string;
    priorityIndex: number;
    description: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    permissionLinks?: RolePermissionRecord[];
  };
};

export type ResolvedAccess = {
  powerType: PowerType;
  assignedRoles: RoleSummary[];
  effectiveRole: RoleSummary | null;
  permissions: PermissionKey[];
  role: string;
  roleLabel: string;
  roleColor: string | null;
};

export function mapRoleRecordToSummary(role: AssignedRoleRecord["role"]): RoleSummary {
  return {
    id: String(role.id),
    key: role.key,
    name: role.name,
    color: role.color,
    priorityIndex: role.priorityIndex,
    description: role.description,
    isActive: role.isActive,
    createdAt: role.createdAt?.toISOString(),
    updatedAt: role.updatedAt?.toISOString(),
    permissions:
      role.permissionLinks
        ?.filter((link) => link.allowed)
        .map((link) => link.permission.key as PermissionKey) ?? [],
  };
}

function uniquePermissions(keys: readonly PermissionKey[]): PermissionKey[] {
  return [...new Set(keys)] as PermissionKey[];
}

export function resolveAccessFromAssignments(input: {
  powerType: PowerType;
  status?: string;
  assignments: AssignedRoleRecord[];
}): ResolvedAccess {
  const assignedRoles = sortRolesByPriority(
    input.assignments
      .map((assignment) => mapRoleRecordToSummary(assignment.role))
      .filter((role) => role.isActive),
  );

  const effectiveRole = getHighestPriorityRole(assignedRoles);

  const permissions =
    input.powerType === "ROOT" || input.powerType === "ADMIN" || input.status === "BANNED"
      ? getProtectedPowerTypePermissions({
          powerType: input.powerType,
          status: input.status,
        })
      : uniquePermissions([
          ...STAFF_BASE_PERMISSION_KEYS,
          ...(effectiveRole?.permissions ?? []),
        ]);

  return {
    powerType: input.powerType,
    assignedRoles,
    effectiveRole,
    permissions,
    role: getRoleKey({ powerType: input.powerType, effectiveRole }),
    roleLabel: getRoleLabel({ powerType: input.powerType, effectiveRole }),
    roleColor: getRoleColor({ powerType: input.powerType, effectiveRole }),
  };
}
