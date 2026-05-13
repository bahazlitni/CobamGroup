import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ path: "apps/cobam-group/.env" });

export default defineConfig({
  schema: "packages/db/prisma/schema.prisma",
  migrations: {
    path: "packages/db/prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
