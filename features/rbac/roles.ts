import type { PermissionKey } from "./permissions";

export const POWER_TYPES = ["ROOT", "ADMIN", "STAFF"] as const;
export type PowerType = (typeof POWER_TYPES)[number];

export type RoleSummary = {
  id: string;
  key: string;
  name: string;
  color: string;
  priorityIndex: number;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: PermissionKey[];
};

export type AccessSubjectLike = {
  id: string;
  powerType: PowerType;
  role: string;
  roleLabel: string;
  roleColor: string | null;
  effectiveRole: RoleSummary | null;
  assignedRoles: RoleSummary[];
  permissions: PermissionKey[];
  status?: string;
};

export function isPowerType(value: unknown): value is PowerType {
  return (
    typeof value === "string" &&
    (POWER_TYPES as readonly string[]).includes(value)
  );
}

export function sortRolesByPriority<
  T extends { priorityIndex: number; name: string },
>(roles: readonly T[]): T[] {
  return [...roles].sort(
    (left, right) =>
      left.priorityIndex - right.priorityIndex ||
      left.name.localeCompare(right.name, "fr-FR"),
  );
}

export function getHighestPriorityRole<
  T extends { priorityIndex: number; name: string },
>(roles: readonly T[]): T | null {
  return sortRolesByPriority(roles)[0] ?? null;
}

export function getRoleLabel(subject: {
  powerType: PowerType;
  effectiveRole: RoleSummary | null;
}): string {
  if (subject.powerType === "ROOT") return "Root";
  if (subject.powerType === "ADMIN") return "Admin";
  return subject.effectiveRole?.name ?? "Staff";
}

export function getRoleKey(subject: {
  powerType: PowerType;
  effectiveRole: RoleSummary | null;
}): string {
  if (subject.powerType === "ROOT") return "ROOT";
  if (subject.powerType === "ADMIN") return "ADMIN";
  return subject.effectiveRole?.key ?? "STAFF";
}

export function getRoleColor(subject: {
  powerType: PowerType;
  effectiveRole: RoleSummary | null;
}): string | null {
  if (subject.powerType === "ROOT") return "#7c2d12";
  if (subject.powerType === "ADMIN") return "#1d4ed8";
  return subject.effectiveRole?.color ?? "#475569";
}

function isBannedLike(subject: { status?: string }) {
  return subject.status === "BANNED";
}

export function canSetAdminPowerType(actorPowerType: PowerType): boolean {
  return actorPowerType === "ROOT";
}

export function isRoleBelowActor(
  actor: {
    powerType: PowerType;
    effectiveRole: RoleSummary | null;
    status?: string;
  },
  targetRole: RoleSummary | null,
): boolean {
  if (isBannedLike(actor)) {
    return false;
  }

  if (actor.powerType === "ROOT" || actor.powerType === "ADMIN") {
    return true;
  }

  if (!actor.effectiveRole || !targetRole) {
    return false;
  }

  return actor.effectiveRole.priorityIndex < targetRole.priorityIndex;
}

export function isTargetBelowActor(
  actor: {
    id: string;
    powerType: PowerType;
    effectiveRole: RoleSummary | null;
    status?: string;
  },
  target: {
    id: string;
    powerType: PowerType;
    effectiveRole: RoleSummary | null;
  },
  options?: { allowSelf?: boolean },
): boolean {
  if (isBannedLike(actor)) {
    return false;
  }

  if (!options?.allowSelf && actor.id === target.id) {
    return false;
  }

  if (actor.powerType === "ROOT") {
    return target.powerType !== "ROOT";
  }

  if (actor.powerType === "ADMIN") {
    return target.powerType === "STAFF";
  }

  if (actor.powerType !== "STAFF" || target.powerType !== "STAFF") {
    return false;
  }

  return isRoleBelowActor(actor, target.effectiveRole);
}

export function canAffectTargetUser(
  actor: {
    id: string;
    powerType: PowerType;
    effectiveRole: RoleSummary | null;
    status?: string;
  },
  target: {
    id: string;
    powerType: PowerType;
    effectiveRole: RoleSummary | null;
  },
  options?: { allowSelf?: boolean },
): boolean {
  return isTargetBelowActor(actor, target, options);
}

export function canAssignRole(
  actor: {
    powerType: PowerType;
    effectiveRole: RoleSummary | null;
    status?: string;
  },
  role: RoleSummary,
): boolean {
  if (isBannedLike(actor)) {
    return false;
  }

  if (actor.powerType === "ROOT" || actor.powerType === "ADMIN") {
    return true;
  }

  return isRoleBelowActor(actor, role);
}

export function getAssignableRoles(
  actor: {
    powerType: PowerType;
    effectiveRole: RoleSummary | null;
    status?: string;
  },
  roles: readonly RoleSummary[],
): RoleSummary[] {
  return sortRolesByPriority(roles).filter((role) => canAssignRole(actor, role));
}

export function isProtectedPowerType(powerType: PowerType): boolean {
  return powerType === "ROOT" || powerType === "ADMIN";
}
