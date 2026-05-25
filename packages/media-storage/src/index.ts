import path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import { LocalMediaStorageDriver } from "./local-driver";
import { S3MediaStorageDriver } from "./s3-driver";
import { getMediaMaxUploadBytes } from "./upload-limits";
import type {
  MediaStorageDriver,
  MediaStorageDriverKind,
  MediaStorageInfo,
} from "./types";

const DEFAULT_LOCAL_MEDIA_ROOT = ".storage/media";

const globalForMediaStorage = globalThis as typeof globalThis & {
  mediaStorageDriver?: MediaStorageDriver;
  mediaS3Client?: S3Client;
};

function resolveWorkspaceRootFromAppCwd(cwd: string) {
  const parent = path.dirname(cwd);

  if (path.basename(parent) === "apps") {
    return path.dirname(parent);
  }

  return null;
}

function resolveLocalMediaRoot() {
  if (process.env.MEDIA_LOCAL_ROOT) {
    return path.resolve(
      /*turbopackIgnore: true*/ process.cwd(),
      process.env.MEDIA_LOCAL_ROOT,
    );
  }

  const workspaceRoot = resolveWorkspaceRootFromAppCwd(process.cwd());

  if (workspaceRoot) {
    return path.resolve(workspaceRoot, DEFAULT_LOCAL_MEDIA_ROOT);
  }

  return path.resolve(
    /*turbopackIgnore: true*/ process.cwd(),
    DEFAULT_LOCAL_MEDIA_ROOT,
  );
}

const LOCAL_MEDIA_ROOT = resolveLocalMediaRoot();

function getDriverKind(): MediaStorageDriverKind {
  return process.env.STORAGE_DRIVER === "s3" ? "s3" : "local";
}

function createS3Client() {
  const endpoint = process.env.MEDIA_S3_ENDPOINT;
  const region = process.env.MEDIA_S3_REGION || "us-east-1";
  const accessKeyId = process.env.MEDIA_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.MEDIA_S3_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing MEDIA_S3_ENDPOINT, MEDIA_S3_ACCESS_KEY_ID or MEDIA_S3_SECRET_ACCESS_KEY for S3 media storage.",
    );
  }

  return (
    globalForMediaStorage.mediaS3Client ??
    new S3Client({
      endpoint,
      region,
      forcePathStyle: process.env.MEDIA_S3_FORCE_PATH_STYLE !== "false",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  );
}

function createDriver(): MediaStorageDriver {
  if (getDriverKind() === "s3") {
    const bucket = process.env.MEDIA_S3_BUCKET;

    if (!bucket) {
      throw new Error("Missing MEDIA_S3_BUCKET for S3 media storage.");
    }

    const client = createS3Client();

    if (process.env.NODE_ENV !== "production") {
      globalForMediaStorage.mediaS3Client = client;
    }

    return new S3MediaStorageDriver(client, bucket);
  }

  return new LocalMediaStorageDriver(LOCAL_MEDIA_ROOT);
}

export function getMediaStorageDriver(): MediaStorageDriver {
  if (process.env.NODE_ENV === "production") {
    return createDriver();
  }

  if (!globalForMediaStorage.mediaStorageDriver) {
    globalForMediaStorage.mediaStorageDriver = createDriver();
  }

  return globalForMediaStorage.mediaStorageDriver;
}

export function getMediaStorageInfo(): MediaStorageInfo {
  if (getDriverKind() === "s3") {
    return {
      driver: "s3",
      label: "Object Storage S3 compatible",
      locationLabel: process.env.MEDIA_S3_BUCKET || "Bucket non configure",
      hint: "Adapte a OVH Object Storage et aux deploiements multi-instance.",
    };
  }

  return {
    driver: "local",
    label: "Stockage local",
    locationLabel: "Stockage partage",
    hint: "Les applications du workspace utilisent le même dossier local par défaut.",
  };
}

export { getMediaMaxUploadBytes };
export type {
  MediaStorageDriver,
  MediaStorageDriverKind,
  MediaStorageInfo,
  PutStoredMediaObjectInput,
  StoredMediaObject,
} from "./types";
