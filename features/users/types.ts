import type { PowerType, RoleSummary } from "@/features/rbac/roles";
import type {
  BanReasonId,
  StaffUserStatus,
  UserBanDetails,
} from "./ban-details";

export type { BanReasonId, StaffUserStatus, UserBanDetails, PowerType, RoleSummary };

export type StaffUsersListQuery = {
  page: number;
  pageSize: 10 | 20 | 50;
  q?: string;
  roleKey?: string;
  powerType?: PowerType;
};

export type StaffUserProfileDto = {
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  phone: string | null;
  birthDate: string | null;
  avatarMediaId: number | null;
  bio: string | null;
};

export type StaffUserListItemDto = {
  id: string;
  email: string;
  powerType: PowerType;
  role: string;
  roleLabel: string;
  roleColor: string | null;
  assignedRoles: RoleSummary[];
  effectiveRole: RoleSummary | null;
  status: StaffUserStatus;
  bannedAt: string | null;
  banDetails: UserBanDetails | null;
  portal: "STAFF";
  createdAt: string;
  updatedAt: string;
  profile: StaffUserProfileDto | null;
};

export type StaffUserDetailDto = StaffUserListItemDto;

export type StaffUsersListResult = {
  items: StaffUserListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type UpdateStaffUserProfileInput = {
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  phone: string | null;
  birthDate: string | null;
  avatarMediaId: number | null;
  bio: string | null;
};

export type UpdateStaffUserAccessInput = {
  powerType: PowerType;
  roleIds: string[];
};

export type UpdateStaffUserCredentialsInput = {
  email?: string;
  password?: string;
};

export type UpdateStaffUserBanInput = {
  banned: boolean;
  presetReasonIds?: BanReasonId[];
  otherReason?: string | null;
  description?: string | null;
};

export type CreateStaffUserInput = {
  email: string;
  password: string;
  powerType?: PowerType;
  roleIds: string[];
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    jobTitle?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    avatarMediaId?: number | null;
    bio?: string | null;
  };
};
