import { Prisma } from "@prisma/client";
import { STAFF_PORTAL } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import type { PowerType, StaffUsersListQuery } from "./types";

const USER_ROLE_SELECT = {
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
} as const;

const USER_DETAIL_SELECT = {
  id: true,
  email: true,
  powerType: true,
  status: true,
  bannedAt: true,
  bannedReason: true,
  portal: true,
  createdAt: true,
  updatedAt: true,
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
    select: USER_ROLE_SELECT,
  },
} as const;

function buildUsersWhere(
  query: StaffUsersListQuery,
  options?: { includeBanned?: boolean },
): Prisma.UserWhereInput {
  const and: Prisma.UserWhereInput[] = [{ portal: STAFF_PORTAL }];
  const includeBanned = options?.includeBanned ?? true;

  if (query.powerType) {
    and.push({ powerType: query.powerType });
  }

  if (query.roleKey) {
    if (query.roleKey === "ROOT" || query.roleKey === "ADMIN" || query.roleKey === "STAFF") {
      and.push({ powerType: query.roleKey });
    } else {
      and.push({
        receivedRoleAssignments: {
          some: {
            revokedAt: null,
            role: {
              key: query.roleKey,
            },
          },
        },
      });
    }
  }

  if (!includeBanned) {
    and.push({ status: { not: "BANNED" } });
  }

  if (query.q) {
    and.push({
      OR: [
        { email: { contains: query.q, mode: "insensitive" } },
        {
          profile: {
            is: {
              firstName: { contains: query.q, mode: "insensitive" },
            },
          },
        },
        {
          profile: {
            is: {
              lastName: { contains: query.q, mode: "insensitive" },
            },
          },
        },
        {
          profile: {
            is: {
              jobTitle: { contains: query.q, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  return { AND: and };
}

export async function listUsers(
  query: StaffUsersListQuery,
  options?: { includeBanned?: boolean },
) {
  return prisma.user.findMany({
    where: buildUsersWhere(query, options),
    orderBy: { createdAt: "desc" },
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
    select: USER_DETAIL_SELECT,
  });
}

export async function listUsersForScope(
  query: StaffUsersListQuery,
  options?: { includeBanned?: boolean },
) {
  return prisma.user.findMany({
    where: buildUsersWhere(query, options),
    orderBy: { createdAt: "desc" },
    select: USER_DETAIL_SELECT,
  });
}

export async function countUsers(
  query: StaffUsersListQuery,
  options?: { includeBanned?: boolean },
) {
  return prisma.user.count({
    where: buildUsersWhere(query, options),
  });
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: USER_DETAIL_SELECT,
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
}

export async function countArticlesByAuthor(userId: string) {
  return prisma.article.count({
    where: { authorId: userId },
  });
}

export async function findRolesByIds(roleIds: string[]) {
  const normalizedIds = [...new Set(roleIds)].map((value) => BigInt(value));

  if (normalizedIds.length === 0) {
    return [];
  }

  return prisma.role.findMany({
    where: {
      id: { in: normalizedIds },
      isActive: true,
    },
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
    },
  });
}

export async function upsertUserProfile(
  userId: string,
  input: {
    firstName: string | null;
    lastName: string | null;
    jobTitle: string | null;
    phone: string | null;
    birthDate: string | null;
    avatarMediaId: number | null;
    bio: string | null;
  },
) {
  let parsedBirthDate: Date | null = null;

  if (input.birthDate) {
    const parsed = new Date(input.birthDate);
    if (!Number.isNaN(parsed.getTime())) {
      parsedBirthDate = parsed;
    }
  }

  await prisma.staffProfile.upsert({
    where: { userId },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      jobTitle: input.jobTitle,
      phone: input.phone,
      birthDate: parsedBirthDate,
      avatarMediaId:
        input.avatarMediaId != null ? BigInt(input.avatarMediaId) : null,
      bio: input.bio,
    },
    create: {
      userId,
      firstName: input.firstName,
      lastName: input.lastName,
      jobTitle: input.jobTitle,
      phone: input.phone,
      birthDate: parsedBirthDate,
      avatarMediaId:
        input.avatarMediaId != null ? BigInt(input.avatarMediaId) : null,
      bio: input.bio,
    },
  });

  return findUserById(userId);
}


export async function updateUserAccess(data: {
  actorUserId: string;
  userId: string;
  powerType: PowerType;
  roleIds: string[];
}) {
  return prisma.$transaction(async (tx) => {
    const normalizedRoleIds = [...new Set(data.roleIds)].map((value) => BigInt(value));
    const roles = normalizedRoleIds.length
      ? await tx.role.findMany({
          where: { id: { in: normalizedRoleIds } },
          select: { id: true },
        })
      : [];

    await tx.user.update({
      where: { id: data.userId },
      data: {
        powerType: data.powerType,
      },
    });

    const currentAssignments = await tx.userRoleAssignment.findMany({
      where: {
        userId: data.userId,
        revokedAt: null,
      },
      select: { id: true, roleId: true },
    });

    const currentRoleIds = new Set(
      currentAssignments.map((assignment) => String(assignment.roleId)),
    );
    const nextRoleIds = new Set(roles.map((role) => String(role.id)));

    for (const assignment of currentAssignments) {
      if (!nextRoleIds.has(String(assignment.roleId))) {
        await tx.userRoleAssignment.update({
          where: { id: assignment.id },
          data: {
            revokedAt: new Date(),
            revokedByUserId: data.actorUserId,
          },
        });
      }
    }

    for (const role of roles) {
      if (!currentRoleIds.has(String(role.id))) {
        await tx.userRoleAssignment.create({
          data: {
            userId: data.userId,
            roleId: role.id,
            grantedByUserId: data.actorUserId,
          },
        });
      }
    }

    return tx.user.findUniqueOrThrow({
      where: { id: data.userId },
      select: USER_DETAIL_SELECT,
    });
  });
}

export async function updateUserCredentials(data: {
  userId: string;
  email?: string;
  passwordHash?: string;
}) {
  return prisma.user.update({
    where: { id: data.userId },
    data: {
      ...(data.email ? { email: data.email } : {}),
      ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
    },
    select: USER_DETAIL_SELECT,
  });
}

export async function updateUserBanState(data: {
  userId: string;
  banned: boolean;
  reasonJson?: string | null;
}) {
  return prisma.user.update({
    where: { id: data.userId },
    data: {
      status: data.banned ? "BANNED" : "ACTIVE",
      bannedAt: data.banned ? new Date() : null,
      bannedReason: data.banned ? data.reasonJson ?? null : null,
    },
    select: USER_DETAIL_SELECT,
  });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  powerType: PowerType;
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
}) {
  let parsedBirthDate: Date | null = null;

  if (data.profile?.birthDate) {
    const parsed = new Date(data.profile.birthDate);
    if (!Number.isNaN(parsed.getTime())) {
      parsedBirthDate = parsed;
    }
  }

  const roleIds = [...new Set(data.roleIds)].map((value) => BigInt(value));
  const roles = roleIds.length
    ? await prisma.role.findMany({
        where: { id: { in: roleIds } },
        select: { id: true },
      })
    : [];

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      powerType: data.powerType,
      portal: STAFF_PORTAL,
      profile: {
        create: {
          firstName: data.profile?.firstName ?? null,
          lastName: data.profile?.lastName ?? null,
          jobTitle: data.profile?.jobTitle ?? null,
          phone: data.profile?.phone ?? null,
          birthDate: parsedBirthDate,
          avatarMediaId:
            data.profile?.avatarMediaId != null
              ? BigInt(data.profile.avatarMediaId)
              : null,
          bio: data.profile?.bio ?? null,
        },
      },
      receivedRoleAssignments: {
        create: roles.map((role) => ({
          roleId: role.id,
        })),
      },
    },
    select: USER_DETAIL_SELECT,
  });
}

export async function deleteUser(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  });
}
