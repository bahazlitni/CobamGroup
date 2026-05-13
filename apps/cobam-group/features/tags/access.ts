import type { StaffSession } from "@/features/auth/types";

export function canAccessTags(session: StaffSession): boolean {
  return session.status !== "BANNED";
}

export function canCreateTags(session: StaffSession): boolean {
  void session;
  return false;
}

export function canManageTags(session: StaffSession): boolean {
  void session;
  return false;
}
