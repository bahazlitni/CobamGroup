import { resolveAccessFromAssignments } from "@/features/rbac/user-access";
import type { StaffUserDetailDto, StaffUserListItemDto, StaffUserProfileDto } from "./types";
import { parseBanDetails } from "./ban-details";

function mapProfile(profile: {
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  phone: string | null;
  birthDate: Date | null;
  avatarMediaId: bigint | null;
  bio: string | null;
} | null): StaffUserProfileDto | null {
  if (!profile) return null;

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    jobTitle: profile.jobTitle,
    phone: profile.phone,
    birthDate: profile.birthDate ? profile.birthDate.toISOString() : null,
    avatarMediaId:
      profile.avatarMediaId != null ? Number(profile.avatarMediaId) : null,
    bio: profile.bio,
  };
}

export function mapUserToListItemDto(user: {
  id: string;
  email: string;
  powerType: StaffUserListItemDto["powerType"];
  status: StaffUserListItemDto["status"];
  bannedAt: Date | null;
  bannedReason: string | null;
  portal: string;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    firstName: string | null;
    lastName: string | null;
    jobTitle: string | null;
    phone: string | null;
    birthDate: Date | null;
    avatarMediaId: bigint | null;
    bio: string | null;
  } | null;
  receivedRoleAssignments: Array<{
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
      permissionLinks?: Array<{
        allowed: boolean;
        permission: { key: string };
      }>;
    };
  }>;
}): StaffUserListItemDto {
  const access = resolveAccessFromAssignments({
    powerType: user.powerType,
    status: user.status,
    assignments: user.receivedRoleAssignments,
  });

  return {
    id: user.id,
    email: user.email,
    powerType: user.powerType,
    role: access.role,
    roleLabel: access.roleLabel,
    roleColor: access.roleColor,
    assignedRoles: access.assignedRoles,
    effectiveRole: access.effectiveRole,
    status: user.status,
    bannedAt: user.bannedAt ? user.bannedAt.toISOString() : null,
    banDetails: parseBanDetails(user.bannedReason),
    portal: "STAFF",
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    profile: mapProfile(user.profile),
  };
}

export function mapUserToDetailDto(user: Parameters<typeof mapUserToListItemDto>[0]): StaffUserDetailDto {
  return mapUserToListItemDto(user);
}

