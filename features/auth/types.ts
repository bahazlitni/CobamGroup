import type { PermissionKey } from "@/features/rbac/permissions";
import type { PowerType, RoleSummary } from "@/features/rbac/roles";
import type { StaffUserStatus, UserBanDetails } from "@/features/users/ban-details";

export const STAFF_PORTAL = "STAFF" as const;
export type StaffPortal = typeof STAFF_PORTAL;

export type StaffSessionProfile = {
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  phone: string | null;
  birthDate: string | null;
  avatarMediaId: number | null;
  bio: string | null;
};

export type StaffSession = {
  id: string;
  email: string;
  portal: StaffPortal;
  powerType: PowerType;
  role: string;
  roleLabel: string;
  roleColor: string | null;
  assignedRoles: RoleSummary[];
  effectiveRole: RoleSummary | null;
  permissions: PermissionKey[];
  status: StaffUserStatus;
  bannedAt: string | null;
  banDetails: UserBanDetails | null;
  profile: StaffSessionProfile | null;
};

export type StaffSessionResponse = {
  ok: boolean;
  user?: StaffSession;
  message?: string;
};

export type UseStaffSessionResult = {
  session: StaffSession | null;
  user: StaffSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setSession: React.Dispatch<React.SetStateAction<StaffSession | null>>;
  clearSession: () => void;
  refreshSession: () => Promise<StaffSession | null>;
};
