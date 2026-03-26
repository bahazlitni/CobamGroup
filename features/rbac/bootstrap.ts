import { prisma } from "@/lib/server/db/prisma";
import { DEFAULT_ROLE_SEED_DEFINITIONS } from "./policy";
import { PERMISSION_DEFINITIONS } from "./permissions";

const globalForRbacBootstrap = globalThis as unknown as {
  rbacBootstrapPromise?: Promise<void>;
};

async function syncPermissions() {
  const currentKeys = new Set(PERMISSION_DEFINITIONS.map((definition) => definition.key));

  for (const definition of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { key: definition.key },
      update: {
        label: definition.label,
        resource: definition.resource,
        action: definition.action,
        scope: definition.scope ?? null,
        description: definition.description ?? null,
      },
      create: {
        key: definition.key,
        label: definition.label,
        resource: definition.resource,
        action: definition.action,
        scope: definition.scope ?? null,
        description: definition.description ?? null,
      },
    });
  }

  const obsoletePermissions = await prisma.permission.findMany({
    where: {
      key: {
        notIn: [...currentKeys],
      },
    },
    select: { id: true },
  });

  if (obsoletePermissions.length > 0) {
    await prisma.permission.deleteMany({
      where: {
        id: { in: obsoletePermissions.map((permission) => permission.id) },
      },
    });
  }
}

async function syncDefaultRoles() {
  await prisma.role.deleteMany({
    where: { key: "STAFF" },
  });

  const permissions = await prisma.permission.findMany({
    select: { id: true, key: true },
  });
  const permissionIdsByKey = new Map(
    permissions.map((permission) => [permission.key, permission.id]),
  );

  for (const definition of DEFAULT_ROLE_SEED_DEFINITIONS) {
    const existingRole = await prisma.role.findUnique({
      where: { key: definition.key },
      select: { id: true },
    });

    if (existingRole) {
      continue;
    }

    const permissionRows = definition.permissions
      .map((permissionKey) => {
        const permissionId = permissionIdsByKey.get(permissionKey);
        if (!permissionId) {
          return null;
        }

        return {
          permissionId,
          allowed: true,
        };
      })
      .filter(
        (
          value,
        ): value is { permissionId: bigint; allowed: true } => value != null,
      );

    await prisma.role.create({
      data: {
        key: definition.key,
        name: definition.name,
        color: definition.color,
        priorityIndex: definition.priorityIndex,
        description: definition.description,
        isActive: true,
        permissionLinks: permissionRows.length
          ? {
              create: permissionRows,
            }
          : undefined,
      },
    });
  }
}

async function bootstrapRbac() {
  await syncPermissions();
  await syncDefaultRoles();
}

export async function ensureRbacBootstrap() {
  if (!globalForRbacBootstrap.rbacBootstrapPromise) {
    globalForRbacBootstrap.rbacBootstrapPromise = bootstrapRbac().catch(
      (error) => {
        globalForRbacBootstrap.rbacBootstrapPromise = undefined;
        throw error;
      },
    );
  }

  return globalForRbacBootstrap.rbacBootstrapPromise;
}
