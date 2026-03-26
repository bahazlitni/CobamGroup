import type { StaffSession } from "@/features/auth/types";
import type { PermissionKey } from "./permissions";
import type { PowerType } from "./roles";

export class PermissionError extends Error {
  status: number;

  constructor(message = "Forbidden", status = 403) {
    super(message);
    this.status = status;
  }
}

type PermissionSubject = {
  powerType: PowerType;
  permissions: PermissionKey[];
  status?: string;
};

function isPermissionSubject(value: unknown): value is PermissionSubject {
  return (
    typeof value === "object" &&
    value !== null &&
    "powerType" in value &&
    "permissions" in value
  );
}

export function hasPermission(
  subject: StaffSession | PermissionSubject,
  permission: PermissionKey,
): boolean {
  if (!isPermissionSubject(subject)) {
    return false;
  }

  if (subject.powerType === "ROOT" && subject.status !== "BANNED") {
    return true;
  }

  return subject.permissions.includes(permission);
}

export function hasAnyPermission(
  subject: StaffSession | PermissionSubject,
  permissions: readonly PermissionKey[],
): boolean {
  return permissions.some((permission) => hasPermission(subject, permission));
}

export function assertPermission(
  subject: StaffSession | PermissionSubject,
  permission: PermissionKey,
): void {
  if (!hasPermission(subject, permission)) {
    throw new PermissionError("Forbidden", 403);
  }
}
