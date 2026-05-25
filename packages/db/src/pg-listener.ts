import { Client } from "pg";

function resolveConnectionString() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL is required to initialize a PostgreSQL listener.");
  }

  return value;
}

function resolveSslConfig(connectionString: string) {
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

function resolveListenerConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase() ?? null;

    if (
      sslmode === "no-verify" ||
      process.env.DATABASE_ALLOW_SELF_SIGNED_SSL === "true"
    ) {
      url.searchParams.delete("sslmode");
      return url.toString();
    }
  } catch {
    // Keep the original connection string if parsing fails.
  }

  return connectionString;
}

export function createPostgresListenerClient(applicationName = "cobam-listener") {
  const connectionString = resolveConnectionString();

  return new Client({
    application_name: applicationName,
    connectionString: resolveListenerConnectionString(connectionString),
    keepAlive: true,
    ssl: resolveSslConfig(connectionString),
  });
}
