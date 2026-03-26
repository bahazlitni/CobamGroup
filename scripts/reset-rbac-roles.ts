import "dotenv/config";
import { prisma } from "../lib/server/db/prisma";
import {
  PERMISSION_DEFINITIONS,
  type PermissionDefinition,
} from "../features/rbac/permissions";
import { DEFAULT_ROLE_SEED_DEFINITIONS } from "../features/rbac/policy";

async function syncPermissions() {
  const currentKeys = new Set(
    PERMISSION_DEFINITIONS.map((definition) => definition.key),
  );

  for (const definition of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { key: definition.key },
      update: toPermissionRecord(definition),
      create: {
        key: definition.key,
        ...toPermissionRecord(definition),
      },
    });
  }

  await prisma.permission.deleteMany({
    where: {
      key: {
        notIn: [...currentKeys],
      },
    },
  });
}

function toPermissionRecord(definition: PermissionDefinition) {
  return {
    label: definition.label,
    resource: definition.resource,
    action: definition.action,
    scope: definition.scope ?? null,
    description: definition.description ?? null,
  };
}

async function recreateRoles() {
  const permissions = await prisma.permission.findMany({
    select: {
      id: true,
      key: true,
    },
  });
  const permissionIdsByKey = new Map(
    permissions.map((permission) => [permission.key, permission.id]),
  );

  await prisma.role.deleteMany();

  for (const definition of DEFAULT_ROLE_SEED_DEFINITIONS) {
    const permissionLinks = definition.permissions
      .map((permissionKey) => {
        const permissionId = permissionIdsByKey.get(permissionKey);
        if (!permissionId) {
          throw new Error(
            `Missing permission ${permissionKey} while recreating roles.`,
          );
        }

        return {
          permissionId,
          allowed: true,
        };
      });

    await prisma.role.create({
      data: {
        key: definition.key,
        name: definition.name,
        color: definition.color,
        priorityIndex: definition.priorityIndex,
        description: definition.description,
        isActive: true,
        permissionLinks: {
          create: permissionLinks,
        },
      },
    });
  }
}

async function normalizePowerTypes() {
  await prisma.user.updateMany({
    where: {
      powerType: {
        notIn: ["ROOT", "ADMIN"],
      },
    },
    data: {
      powerType: "STAFF",
    },
  });
}

async function main() {
  console.log("Synchronizing permission catalog...");
  await syncPermissions();

  console.log("Recreating dynamic roles...");
  await recreateRoles();

  console.log("Normalizing non-protected users to STAFF powerType...");
  await normalizePowerTypes();

  const roles = await prisma.role.findMany({
    orderBy: [{ priorityIndex: "asc" }, { name: "asc" }],
    select: {
      key: true,
      name: true,
      color: true,
      priorityIndex: true,
      _count: {
        select: {
          permissionLinks: true,
          userAssignments: true,
        },
      },
    },
  });

  console.log("\nDynamic roles have been reset successfully.\n");
  console.table(
    roles.map((role) => ({
      key: role.key,
      name: role.name,
      color: role.color,
      priorityIndex: role.priorityIndex,
      permissions: role._count.permissionLinks,
      activeAssignments: role._count.userAssignments,
    })),
  );
}

main()
  .catch((error) => {
    console.error("RBAC_RESET_ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
