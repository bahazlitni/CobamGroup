// @/lib/server/db/prisma
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

function parsePositiveInteger(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolvePoolMax() {
  const explicitValue = parsePositiveInteger(process.env.DATABASE_POOL_MAX);

  if (explicitValue != null) {
    return explicitValue;
  }

  try {
    const url = new URL(connectionString);
    const connectionLimit = parsePositiveInteger(
      url.searchParams.get("connection_limit"),
    );

    if (connectionLimit != null) {
      return connectionLimit;
    }
  } catch {
    // Ignore malformed URLs and fall back to a safe default below.
  }

  return process.env.NODE_ENV === "production" ? 1 : 10;
}

function resolveSslConfig() {
  const allowSelfSigned = process.env.DATABASE_ALLOW_SELF_SIGNED_SSL === "true";
  const caCertificate = process.env.DATABASE_SSL_CA_CERT?.replace(/\\n/g, "\n");

  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase() ?? null;

    if (caCertificate) {
      return {
        rejectUnauthorized: true,
        ca: caCertificate,
      };
    }

    if (sslmode === "no-verify" || allowSelfSigned) {
      return {
        rejectUnauthorized: false,
      };
    }

    if (sslmode && sslmode !== "disable") {
      return {
        rejectUnauthorized: true,
      };
    }
  } catch {
    if (allowSelfSigned) {
      return {
        rejectUnauthorized: false,
      };
    }
  }

  return undefined;
}

function resolvePoolConnectionString() {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase() ?? null;

    if (sslmode === "no-verify" || process.env.DATABASE_ALLOW_SELF_SIGNED_SSL === "true") {
      url.searchParams.delete("sslmode");
      return url.toString();
    }
  } catch {
    // Keep the original connection string if parsing fails.
  }

  return connectionString;
}

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString: resolvePoolConnectionString(),
    max: resolvePoolMax(),
    idleTimeoutMillis:
      parsePositiveInteger(process.env.DATABASE_POOL_IDLE_TIMEOUT_MS) ?? 10_000,
    connectionTimeoutMillis:
      parsePositiveInteger(process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS) ??
      10_000,
    keepAlive: true,
    ssl: resolveSslConfig(),
  });

globalForPrisma.prismaPool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["query", "error", "warn"],
  });

globalForPrisma.prisma = prisma;
