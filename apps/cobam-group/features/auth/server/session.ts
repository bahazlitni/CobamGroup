import { prisma } from "@/lib/server/db/prisma";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/api/auth/shared/jwt";
import { sha256 } from "@/lib/api/auth/shared/token";
import {
  STAFF_PORTAL,
  type StaffSession,
  type StaffSessionProfile,
} from "@/features/auth/types";
import { ensureRbacBootstrap } from "@/features/rbac/bootstrap";
import { resolveAccessFromAssignments } from "@/features/rbac/user-access";
import { parseBanDetails } from "@/features/users/ban-details";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

function extractBearerToken(req: Request): string {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError("Missing access token", 401);
  }

  return authHeader.slice("Bearer ".length).trim();
}

function toSessionProfile(profile: {
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  phone: string | null;
  birthDate: Date | null;
  avatarMediaId: bigint | null;
  bio: string | null;
} | null): StaffSessionProfile | null {
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

export async function getStaffSessionByUserId(
  userId: string,
): Promise<StaffSession | null> {
  await ensureRbacBootstrap();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      portal: true,
      powerType: true,
      status: true,
      bannedAt: true,
      bannedReason: true,
      twoStepVerificationEnabled: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          jobTitle: true,
          phone: true,
          birthDate: true,
          avatarMediaId: true,
          bio: true,
        },
      },
      receivedRoleAssignments: {
        where: { revokedAt: null },
        select: {
          role: {
            select: {
              id: true,
              key: true,
              name: true,
              color: true,
              priorityIndex: true,
              description: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              permissionLinks: {
                where: { allowed: true },
                select: {
                  allowed: true,
                  permission: {
                    select: { key: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;
  if (user.portal !== STAFF_PORTAL) return null;

  const access = resolveAccessFromAssignments({
    powerType: user.powerType,
    status: user.status,
    assignments: user.receivedRoleAssignments,
  });

  return {
    id: user.id,
    email: user.email,
    portal: STAFF_PORTAL,
    powerType: user.powerType,
    role: access.role,
    roleLabel: access.roleLabel,
    roleColor: access.roleColor,
    assignedRoles: access.assignedRoles,
    effectiveRole: access.effectiveRole,
    permissions: access.permissions,
    status: user.status,
    bannedAt: user.bannedAt ? user.bannedAt.toISOString() : null,
    banDetails: parseBanDetails(user.bannedReason),
    twoStepVerificationEnabled: user.twoStepVerificationEnabled,
    profile: toSessionProfile(user.profile),
  };
}

export async function getOptionalStaffSession(
  req: Request,
): Promise<StaffSession | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.slice("Bearer ".length).trim();
    const payload = await verifyAccessToken(token);
    return await getStaffSessionByUserId(payload.userId);
  } catch {
    return null;
  }
}

export async function requireStaffSession(
  req: Request,
): Promise<StaffSession> {
  const token = extractBearerToken(req);

  let payload: Awaited<ReturnType<typeof verifyAccessToken>>;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    throw new AuthError("Invalid or expired access token", 401);
  }

  const session = await getStaffSessionByUserId(payload.userId);

  if (!session) {
    throw new AuthError("Forbidden", 403);
  }

  return session;
}

export async function getStaffSessionByRefreshToken(
  refreshToken: string | null | undefined,
): Promise<StaffSession | null> {
  if (!refreshToken) {
    return null;
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    const refreshTokenHash = sha256(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      select: {
        tokenHash: true,
        revokedAt: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            portal: true,
          },
        },
      },
    });

    if (!storedToken || storedToken.user.portal !== STAFF_PORTAL) {
      return null;
    }

    if (storedToken.tokenHash !== refreshTokenHash) {
      return null;
    }

    if (storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return null;
    }

    return getStaffSessionByUserId(storedToken.user.id);
  } catch {
    return null;
  }
}
