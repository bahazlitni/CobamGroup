// @/scripts/seed-staff-users.mjs

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

const DEFAULT_PASSWORD =
  process.env.STAFF_SEED_PASSWORD || "ChangeMeNow_123!";

const USERS = [
  {
    email: "root@cobamgroup.com",
    powerType: "ROOT",
    portal: "STAFF",
    roleKeys: [],
    profile: {
      firstName: "Root",
      lastName: "User",
      jobTitle: "Super Administrator",
    },
  },
  {
    email: "admin@cobamgroup.com",
    powerType: "ADMIN",
    portal: "STAFF",
    roleKeys: [],
    profile: {
      firstName: "Admin",
      lastName: "User",
      jobTitle: "Administrator",
    },
  },
  {
    email: "product.manager@cobamgroup.com",
    powerType: "STAFF",
    portal: "STAFF",
    roleKeys: ["PRODUCT_MANAGER"],
    profile: {
      firstName: "Product",
      lastName: "Manager",
      jobTitle: "Product Manager",
    },
  },
  {
    email: "author.manager@cobamgroup.com",
    powerType: "STAFF",
    portal: "STAFF",
    roleKeys: ["AUTHOR_MANAGER"],
    profile: {
      firstName: "Author",
      lastName: "Manager",
      jobTitle: "Author Manager",
    },
  },
  {
    email: "product.editor@cobamgroup.com",
    powerType: "STAFF",
    portal: "STAFF",
    roleKeys: ["PRODUCT_EDITOR"],
    profile: {
      firstName: "Product",
      lastName: "Editor",
      jobTitle: "Product Editor",
    },
  },
  {
    email: "author@cobamgroup.com",
    powerType: "STAFF",
    portal: "STAFF",
    roleKeys: ["AUTHOR"],
    profile: {
      firstName: "Author",
      lastName: "User",
      jobTitle: "Author",
    },
  },
  {
    email: "staff@cobamgroup.com",
    powerType: "STAFF",
    portal: "STAFF",
    roleKeys: [],
    profile: {
      firstName: "Staff",
      lastName: "User",
      jobTitle: "Staff Member",
    },
  },
];

async function syncUserRoles(tx, userId, roleKeys) {
  const keys = [...new Set(roleKeys)];
  const roles = keys.length
    ? await tx.role.findMany({
        where: {
          key: { in: keys },
        },
        select: {
          id: true,
          key: true,
        },
      })
    : [];

  if (roles.length !== keys.length) {
    const foundKeys = new Set(roles.map((role) => role.key));
    const missing = keys.filter((key) => !foundKeys.has(key));
    throw new Error(
      `Missing dynamic role(s): ${missing.join(", ")}. Reset roles before running this seed.`,
    );
  }

  const desiredRoleIds = new Set(roles.map((role) => String(role.id)));
  const currentAssignments = await tx.userRoleAssignment.findMany({
    where: {
      userId,
      revokedAt: null,
    },
    select: {
      id: true,
      roleId: true,
    },
  });

  for (const assignment of currentAssignments) {
    if (!desiredRoleIds.has(String(assignment.roleId))) {
      await tx.userRoleAssignment.update({
        where: { id: assignment.id },
        data: {
          revokedAt: new Date(),
          revokedByUserId: null,
        },
      });
    }
  }

  const currentRoleIds = new Set(
    currentAssignments.map((assignment) => String(assignment.roleId)),
  );

  for (const role of roles) {
    if (!currentRoleIds.has(String(role.id))) {
      await tx.userRoleAssignment.create({
        data: {
          userId,
          roleId: role.id,
        },
      });
    }
  }
}

async function upsertStaffUser(userData, passwordHash) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: userData.email },
      update: {
        powerType: userData.powerType,
        portal: userData.portal,
        passwordHash,
        status: "ACTIVE",
        bannedAt: null,
        bannedReason: null,
      },
      create: {
        email: userData.email,
        passwordHash,
        powerType: userData.powerType,
        portal: userData.portal,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        powerType: true,
        portal: true,
      },
    });

    await tx.staffProfile.upsert({
      where: { userId: user.id },
      update: {
        firstName: userData.profile.firstName,
        lastName: userData.profile.lastName,
        jobTitle: userData.profile.jobTitle,
      },
      create: {
        userId: user.id,
        firstName: userData.profile.firstName,
        lastName: userData.profile.lastName,
        jobTitle: userData.profile.jobTitle,
      },
    });

    await syncUserRoles(
      tx,
      user.id,
      userData.powerType === "STAFF" ? userData.roleKeys : [],
    );

    return user;
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const createdUsers = [];

  for (const userData of USERS) {
    const user = await upsertStaffUser(userData, passwordHash);
    createdUsers.push(user);
  }

  console.log("Seed completed successfully.\n");
  console.table(
    createdUsers.map((user) => {
      const definition = USERS.find((item) => item.email === user.email);
      return {
        id: user.id,
        email: user.email,
        powerType: user.powerType,
        roles:
          definition && definition.roleKeys.length > 0
            ? definition.roleKeys.join(", ")
            : "-",
        portal: user.portal,
      };
    }),
  );

  console.log("\nDefault password for seeded accounts:");
  console.log(DEFAULT_PASSWORD);
  console.log(
    "\nSet STAFF_SEED_PASSWORD in your .env if you want a different bootstrap password.",
  );
}

try {
  await main();
} catch (error) {
  console.error("SEED_ERROR:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
