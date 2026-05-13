import type { PermissionKey } from "@/features/rbac/permissions";
import type { RoleSummary } from "@/features/rbac/roles";

export type RoleDetailDto = RoleSummary & {
  permissions: PermissionKey[];
};

export type RolesListResult = {
  items: RoleDetailDto[];
  total: number;
};

export type RoleMutationInput = {
  key: string;
  name: string;
  color: string;
  priorityIndex: number;
  description?: string | null;
  permissions: PermissionKey[];
  isActive?: boolean;
};
