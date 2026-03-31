// @/lib/server/storage/media/index.ts

import path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import { LocalMediaStorageDriver } from "./local-driver";
import { S3MediaStorageDriver } from "./s3-driver";
import type {
  MediaStorageDriver,
  MediaStorageDriverKind,
  MediaStorageInfo,
} from "./types";

const LOCAL_MEDIA_ROOT = path.resolve(
  process.cwd(),
  process.env.MEDIA_LOCAL_ROOT ?? ".storage/media",
);

const globalForMediaStorage = globalThis as typeof globalThis & {
  mediaStorageDriver?: MediaStorageDriver;
  mediaS3Client?: S3Client;
};

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
    locationLabel: "Disque du serveur",
    hint: "Pratique en developpement ou sur un VPS unique.",
  };
}

export function getMediaMaxUploadBytes() {
  const parsedMegabytes = Number(process.env.MEDIA_MAX_UPLOAD_MB ?? "100");
  const megabytes =
    Number.isFinite(parsedMegabytes) && parsedMegabytes > 0
      ? parsedMegabytes
      : 100;

  return Math.floor(megabytes * 1024 * 1024);
}
