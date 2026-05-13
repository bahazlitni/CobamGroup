# Cobam Workspace

This repository is an npm workspace containing the main COBAM GROUP app and the new `e-cobam` app.

## Structure

```text
apps/
  cobam-group/     Existing public + staff Next.js app
  e-cobam/         New e-commerce Next.js app
packages/
  db/              Shared Prisma schema, migrations, and Prisma client helper
  media-storage/   Shared local/S3 media storage driver
```

## Common Commands

```bash
npm run dev              # apps/cobam-group on port 3000
npm run dev:e-cobam      # apps/e-cobam on port 3001
npm run build:main
npm run build:e-cobam
npm run typecheck:all
npm run db:validate
npm run db:migrate:dev
npm run db:migrate:deploy
```

## Shared Database

The Prisma schema now lives at:

```text
packages/db/prisma/schema.prisma
```

Both apps must use the shared `@cobam/db` package. Generate and migrate from the root commands above so both apps stay aligned with the same schema and migrations.

## Shared Media Storage

Both apps must point to the same media storage backend.

For local workspace development, the default local storage path resolves to:

```text
.storage/media
```

For VPS/production, set the same storage variables in both app environments. With local disk storage, prefer an absolute shared path:

```env
STORAGE_DRIVER=local
MEDIA_LOCAL_ROOT=/var/www/cobam-storage/media
```

With S3-compatible storage, both apps should use the same bucket and credentials:

```env
STORAGE_DRIVER=s3
MEDIA_S3_ENDPOINT=
MEDIA_S3_REGION=us-east-1
MEDIA_S3_ACCESS_KEY_ID=
MEDIA_S3_SECRET_ACCESS_KEY=
MEDIA_S3_BUCKET=
```
