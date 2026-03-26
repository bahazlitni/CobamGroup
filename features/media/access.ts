import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import {
  MEDIA_ACCESS_PERMISSION_KEYS,
  MEDIA_MANAGE_PERMISSION_KEYS,
  PERMISSIONS,
} from "@/features/rbac/permissions";

export function canAccessMediaLibrary(session: StaffSession): boolean {
  return hasAnyPermission(session, MEDIA_ACCESS_PERMISSION_KEYS);
}

export function canUploadMedia(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.MEDIA_CREATE);
}

export function canViewAllMedia(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.MEDIA_VIEW_ALL);
}

export function canViewOwnMedia(session: StaffSession): boolean {
  return (
    hasPermission(session, PERMISSIONS.MEDIA_VIEW_OWN) ||
    canUploadMedia(session) ||
    hasPermission(session, PERMISSIONS.MEDIA_DELETE_OWN)
  );
}

export function canDeleteAnyMedia(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.MEDIA_DELETE_ALL,
    PERMISSIONS.MEDIA_DELETE_BELOW_ROLE,
  ]);
}

export function canDeleteOwnMedia(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.MEDIA_DELETE_OWN);
}

export function canManageMedia(session: StaffSession): boolean {
  return hasAnyPermission(session, MEDIA_MANAGE_PERMISSION_KEYS);
}

export function canForceRemoveMedia(session: StaffSession): boolean {
  return (
    hasPermission(session, PERMISSIONS.MEDIA_FORCE_REMOVE) &&
    canAccessMediaLibrary(session) &&
    canManageMedia(session)
  );
}

export function canViewMediaRecord(
  session: StaffSession,
  uploadedByUserId: string | null,
) {
  if (canViewAllMedia(session) || canDeleteAnyMedia(session)) {
    return true;
  }

  return (
    uploadedByUserId != null &&
    uploadedByUserId === session.id &&
    canViewOwnMedia(session)
  );
}

export function canDeleteMediaRecord(
  session: StaffSession,
  uploadedByUserId: string | null,
) {
  if (canDeleteAnyMedia(session)) {
    return true;
  }

  return (
    uploadedByUserId != null &&
    uploadedByUserId === session.id &&
    (canDeleteOwnMedia(session) || canUploadMedia(session))
  );
}

export function canForceRemoveMediaRecord(
  session: StaffSession,
  uploadedByUserId: string | null,
) {
  return (
    canForceRemoveMedia(session) &&
    canDeleteMediaRecord(session, uploadedByUserId)
  );
}

export function canUpdateMediaRecord(
  session: StaffSession,
  uploadedByUserId: string | null,
) {
  if (canDeleteAnyMedia(session) || canViewAllMedia(session)) {
    return canAccessMediaLibrary(session);
  }

  return (
    uploadedByUserId != null &&
    uploadedByUserId === session.id &&
    (canUploadMedia(session) || canDeleteOwnMedia(session))
  );
}
