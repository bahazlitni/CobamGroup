import { createHash, randomUUID } from "crypto";
import path from "path";
import { MediaKind, MediaVisibility } from "@prisma/client";
import sharp from "sharp";
import type { StaffSession } from "@/features/auth/types";
import {
  canAccessMediaLibrary,
  canDeleteMediaRecord,
  canForceRemoveMediaRecord,
  canUpdateMediaRecord,
  canUploadMedia,
  canViewAllMedia,
  canViewMediaRecord,
  canViewOwnMedia,
} from "./access";
import { mapMediaStatsDto, mapMediaToListItemDto, toMediaAuditSnapshot } from "./mappers";
import {
  aggregateMediaStats,
  countMedia,
  createMediaAuditLog,
  createMediaRecord,
  deleteMediaRecord,
  detachMediaReferencesAndDeleteMediaRecord,
  findImageMediaById,
  findMediaById,
  findPublicMediaById,
  listMedia,
  updateMediaRecord,
} from "./repository";
import {
  buildMediaVariantFilename,
  getMediaThumbnailMaxWidth,
  getMediaThumbnailQuality,
  getMediaVariantStoragePath,
} from "./file-variants";
import type {
  MediaDeleteOptions,
  MediaFileVariant,
  MediaListQuery,
  MediaListResult,
  MediaUpdateInput,
  MediaUploadInput,
} from "./types";
import {
  getMediaMaxUploadBytes,
  getMediaStorageDriver,
  getMediaStorageInfo,
} from "@/lib/server/storage/media";

export class MediaServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type MediaStorageReadableRecord = {
  id: bigint;
  kind: MediaKind;
  visibility?: MediaVisibility;
  storagePath: string;
  originalFilename: string | null;
  mimeType: string | null;
  extension: string | null;
};

function getOwnerScope(session: StaffSession) {
  if (canViewAllMedia(session)) {
    return null;
  }

  if (canViewOwnMedia(session) || canUploadMedia(session)) {
    return session.id;
  }

  throw new MediaServiceError("Acces refuse.", 403);
}

function sanitizeFilename(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFileExtension(filename: string, mimeType: string | null) {
  const parsedExtension = path.extname(filename).replace(/^\./, "").toLowerCase();

  if (parsedExtension) {
    return parsedExtension;
  }

  if (!mimeType) {
    return null;
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  const [, subtype = "bin"] = mimeType.split("/");
  return subtype.toLowerCase();
}

function inferMediaKind(input: { mimeType: string | null; extension: string | null }) {
  const mimeType = input.mimeType?.toLowerCase() ?? null;
  const extension = input.extension?.toLowerCase() ?? null;

  if (mimeType?.startsWith("image/")) {
    return MediaKind.IMAGE;
  }

  if (mimeType?.startsWith("video/")) {
    return MediaKind.VIDEO;
  }

  if (
    mimeType?.startsWith("audio/") ||
    mimeType?.startsWith("text/") ||
    mimeType === "application/pdf" ||
    extension === "pdf" ||
    mimeType?.startsWith("application/") ||
    extension
  ) {
    return MediaKind.DOCUMENT;
  }

  throw new MediaServiceError(
    "Format non pris en charge. Utilisez une image, une video, un audio ou un document.",
    400,
  );
}

function buildMediaStorageKey(input: {
  kind: MediaKind;
  originalFilename: string;
  extension: string | null;
}) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const baseName = sanitizeFilename(
    path.basename(input.originalFilename, path.extname(input.originalFilename)),
  );
  const extension = input.extension ?? "bin";

  return `media/${input.kind.toLowerCase()}/${year}/${month}/${randomUUID()}-${baseName || "file"}.${extension}`;
}

async function analyzeImageBuffer(
  buffer: Buffer,
  mimeType: string | null,
) {
  try {
    const image = sharp(buffer, { failOn: "none" }).rotate();
    const metadata = await image.metadata();
    const thumbnailBuffer = await image
      .clone()
      .resize({
        width: getMediaThumbnailMaxWidth(),
        withoutEnlargement: true,
      })
      .webp({
        quality: getMediaThumbnailQuality(),
      })
      .toBuffer();

    return {
      widthPx:
        typeof metadata.width === "number" ? metadata.width : null,
      heightPx:
        typeof metadata.height === "number" ? metadata.height : null,
      thumbnailBuffer,
      thumbnailContentType: "image/webp" as const,
    };
  } catch (error) {
    console.error("MEDIA_IMAGE_PROCESSING_ERROR:", error);
    throw new MediaServiceError(
      `Impossible de traiter cette image${mimeType ? ` (${mimeType})` : ""}.`,
      400,
    );
  }
}

function getMediaReferenceCount(media: Awaited<ReturnType<typeof findMediaById>>) {
  if (!media) {
    return 0;
  }

  return (
    media._count.productModelLinks +
    media._count.productLinks +
    media._count.brandLogoFor +
    media._count.productCategoryImageFor +
    media._count.staffProfileAvatarFor +
    media._count.articleMediaLinks +
    media._count.articleCoverFor +
    media._count.articleOgImageFor
  );
}

function assertMediaCanBeDeletedWithoutForce(
  media: NonNullable<Awaited<ReturnType<typeof findMediaById>>>,
) {
  if (media._count.productModelLinks > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore lie a un modele produit.",
      400,
    );
  }

  if (media._count.productLinks > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore lie a un produit.",
      400,
    );
  }

  if (media._count.brandLogoFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore utilise comme logo de marque.",
      400,
    );
  }

  if (media._count.productCategoryImageFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore utilise par une categorie de produit.",
      400,
    );
  }

  if (media._count.staffProfileAvatarFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore utilise comme avatar.",
      400,
    );
  }

  if (
    media._count.articleMediaLinks > 0 ||
    media._count.articleCoverFor > 0 ||
    media._count.articleOgImageFor > 0
  ) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore utilise dans les articles.",
      400,
    );
  }
}

export async function listMediaService(
  session: StaffSession,
  query: MediaListQuery,
): Promise<MediaListResult> {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  const ownerUserId = getOwnerScope(session);

  const [items, total, stats] = await Promise.all([
    listMedia({ query, ownerUserId }),
    countMedia({ query, ownerUserId }),
    aggregateMediaStats({
      q: query.q,
      status: query.status,
      ownerUserId,
    }),
  ]);

  return {
    items: items.map((item) => mapMediaToListItemDto(item, session)),
    total,
    page: query.page,
    pageSize: query.pageSize,
    stats: mapMediaStatsDto(stats),
    storage: getMediaStorageInfo(),
  };
}

export async function uploadMediaService(
  session: StaffSession,
  input: MediaUploadInput,
) {
  if (!canUploadMedia(session)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  const maxUploadBytes = getMediaMaxUploadBytes();
  if (input.file.size > maxUploadBytes) {
    throw new MediaServiceError(
      `Fichier trop volumineux. Limite actuelle: ${Math.floor(maxUploadBytes / (1024 * 1024))} MB.`,
      400,
    );
  }

  const originalFilename = input.file.name || "upload";
  const extension = getFileExtension(originalFilename, input.file.type || null);
  const kind = inferMediaKind({
    mimeType: input.file.type || null,
    extension,
  });
  const storagePath = buildMediaStorageKey({
    kind,
    originalFilename,
    extension,
  });
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const sha256Hash = createHash("sha256").update(buffer).digest("hex");
  const storage = getMediaStorageDriver();
  const imageArtifacts =
    kind === MediaKind.IMAGE
      ? await analyzeImageBuffer(buffer, input.file.type || null)
      : null;
  const thumbnailStoragePath =
    kind === MediaKind.IMAGE
      ? getMediaVariantStoragePath(storagePath, "thumbnail")
      : null;
  let originalStored = false;
  let thumbnailStored = false;

  try {
    await storage.putObject({
      key: storagePath,
      body: new Uint8Array(buffer),
      contentType: input.file.type || null,
    });
    originalStored = true;

    if (thumbnailStoragePath && imageArtifacts) {
      await storage.putObject({
        key: thumbnailStoragePath,
        body: new Uint8Array(imageArtifacts.thumbnailBuffer),
        contentType: imageArtifacts.thumbnailContentType,
      });
      thumbnailStored = true;
    }
  } catch (error) {
    if (thumbnailStored && thumbnailStoragePath) {
      await storage.deleteObject(thumbnailStoragePath).catch(() => undefined);
    }

    if (originalStored) {
      await storage.deleteObject(storagePath).catch(() => undefined);
    }

    throw error;
  }

  try {
    const media = await createMediaRecord({
      kind,
      visibility: input.visibility,
      storagePath,
      originalFilename,
      mimeType: input.file.type || null,
      extension,
      title: input.title,
      altText: input.altText,
      description: input.description,
      widthPx: imageArtifacts?.widthPx ?? null,
      heightPx: imageArtifacts?.heightPx ?? null,
      sizeBytes: BigInt(buffer.byteLength),
      sha256Hash,
      uploadedByUserId: session.id,
    });

    await createMediaAuditLog({
      actorUserId: session.id,
      actionType: "CREATE",
      entityId: String(media.id),
      targetLabel: media.originalFilename ?? media.title ?? `Media ${media.id}`,
      summary: "Import d'un media",
      afterSnapshotJson: toMediaAuditSnapshot(media),
    });

    return mapMediaToListItemDto(media, session);
  } catch (error) {
    if (thumbnailStored && thumbnailStoragePath) {
      await storage.deleteObject(thumbnailStoragePath).catch(() => undefined);
    }
    if (originalStored) {
      await storage.deleteObject(storagePath).catch(() => undefined);
    }
    throw error;
  }
}

export async function getMediaByIdService(
  session: StaffSession,
  mediaId: number,
) {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  const media = await findMediaById(mediaId);

  if (!media) {
    throw new MediaServiceError("Media introuvable.", 404);
  }

  if (!canViewMediaRecord(session, media.uploadedByUserId)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  return mapMediaToListItemDto(media, session);
}

export async function updateMediaVisibilityService(
  session: StaffSession,
  mediaId: number,
  input: MediaUpdateInput,
) {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  const existingMedia = await findMediaById(mediaId);

  if (!existingMedia) {
    throw new MediaServiceError("Media introuvable.", 404);
  }

  if (!canUpdateMediaRecord(session, existingMedia.uploadedByUserId)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  if (existingMedia.visibility === input.visibility) {
    return mapMediaToListItemDto(existingMedia, session);
  }

  const updatedMedia = await updateMediaRecord(mediaId, {
    ...input,
    updatedByUserId: session.id,
  });

  await createMediaAuditLog({
    actorUserId: session.id,
    actionType: "UPDATE",
    entityId: String(updatedMedia.id),
    targetLabel:
      updatedMedia.originalFilename ??
      updatedMedia.title ??
      `Media ${updatedMedia.id}`,
    summary:
      input.visibility === MediaVisibility.PUBLIC
        ? "Passage d'un media en public"
        : "Passage d'un media en prive",
    beforeSnapshotJson: toMediaAuditSnapshot(existingMedia),
    afterSnapshotJson: toMediaAuditSnapshot(updatedMedia),
  });

  return mapMediaToListItemDto(updatedMedia, session);
}

export async function imageMediaExists(mediaId: number) {
  const media = await findImageMediaById(mediaId);
  return !!media;
}

export async function deleteMediaService(
  session: StaffSession,
  mediaId: number,
  options: MediaDeleteOptions = {},
) {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  const forceRemove = options.force === true;
  const media = await findMediaById(mediaId);

  if (!media) {
    throw new MediaServiceError("Media introuvable.", 404);
  }

  if (
    forceRemove
      ? !canForceRemoveMediaRecord(session, media.uploadedByUserId)
      : !canDeleteMediaRecord(session, media.uploadedByUserId)
  ) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  if (!forceRemove) {
    assertMediaCanBeDeletedWithoutForce(media);
  }

  const storage = getMediaStorageDriver();
  try {
    await storage.deleteObject(media.storagePath);

    if (media.kind === MediaKind.IMAGE) {
      await storage.deleteObject(getMediaVariantStoragePath(media.storagePath, "thumbnail"));
    }
  } catch (error) {
    console.error("MEDIA_STORAGE_DELETE_ERROR:", error);
    throw new MediaServiceError(
      "Impossible de supprimer le fichier dans le stockage.",
      500,
    );
  }

  const deletionResult = forceRemove
    ? await detachMediaReferencesAndDeleteMediaRecord(mediaId)
    : {
        deletedMedia: await deleteMediaRecord(mediaId),
        detachedReferences: null,
      };
  const referenceCount = forceRemove
    ? deletionResult.detachedReferences?.total ?? getMediaReferenceCount(media)
    : getMediaReferenceCount(media);
  const forceSummarySuffix =
    forceRemove && referenceCount > 0
      ? ` (${deletionResult.detachedReferences?.total ?? 0} reference(s) retirees)`
      : "";

  await createMediaAuditLog({
    actorUserId: session.id,
    actionType: "DELETE",
    entityId: String(media.id),
    targetLabel: media.originalFilename ?? media.title ?? `Media ${media.id}`,
    summary: forceRemove
      ? `Suppression forcee d'un media${forceSummarySuffix}`
      : "Suppression d'un media",
    beforeSnapshotJson: toMediaAuditSnapshot(media),
    afterSnapshotJson: toMediaAuditSnapshot(deletionResult.deletedMedia),
  });
}

async function readStoredMediaObject(
  media: MediaStorageReadableRecord,
  variant: MediaFileVariant = "original",
) {
  const storage = getMediaStorageDriver();
  const thumbnailStoragePath = getMediaVariantStoragePath(
    media.storagePath,
    "thumbnail",
  );

  if (variant === "thumbnail" && media.kind === MediaKind.IMAGE) {
    const existingThumbnail = await storage.readObject(thumbnailStoragePath);

    if (existingThumbnail) {
      return {
        body: existingThumbnail.body,
        contentType: existingThumbnail.contentType ?? "image/webp",
        originalFilename:
          buildMediaVariantFilename(media.originalFilename, "thumbnail") ??
          `media-${media.id}-thumbnail.webp`,
      };
    }

    const originalObject = await storage.readObject(media.storagePath);

    if (!originalObject) {
      throw new MediaServiceError(
        "Fichier media introuvable dans le stockage.",
        404,
      );
    }

    try {
      const imageArtifacts = await analyzeImageBuffer(
        Buffer.from(originalObject.body),
        media.mimeType ?? originalObject.contentType,
      );

      await storage.putObject({
        key: thumbnailStoragePath,
        body: new Uint8Array(imageArtifacts.thumbnailBuffer),
        contentType: imageArtifacts.thumbnailContentType,
      });

      return {
        body: new Uint8Array(imageArtifacts.thumbnailBuffer),
        contentType: imageArtifacts.thumbnailContentType,
        originalFilename:
          buildMediaVariantFilename(media.originalFilename, "thumbnail") ??
          `media-${media.id}-thumbnail.webp`,
      };
    } catch (error) {
      console.error("MEDIA_THUMBNAIL_GENERATION_ERROR:", error);

      return {
        body: originalObject.body,
        contentType:
          media.mimeType ??
          originalObject.contentType ??
          "application/octet-stream",
        originalFilename:
          buildMediaVariantFilename(media.originalFilename, "original") ??
          `media-${media.id}${media.extension ? `.${media.extension}` : ""}`,
      };
    }
  }

  const object = await storage.readObject(media.storagePath);

  if (!object) {
    throw new MediaServiceError("Fichier media introuvable dans le stockage.", 404);
  }

  return {
    body: object.body,
    contentType: media.mimeType ?? object.contentType ?? "application/octet-stream",
    originalFilename:
      buildMediaVariantFilename(
        media.originalFilename ??
          `media-${media.id}${media.extension ? `.${media.extension}` : ""}`,
        "original",
      ) ?? `media-${media.id}${media.extension ? `.${media.extension}` : ""}`,
  };
}

export async function readMediaFileService(
  session: StaffSession,
  mediaId: number,
  variant: MediaFileVariant = "original",
) {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  const media = await findMediaById(mediaId);

  if (!media) {
    throw new MediaServiceError("Media introuvable.", 404);
  }

  if (!canViewMediaRecord(session, media.uploadedByUserId)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  return readStoredMediaObject(media, variant);
}

export async function readPublicMediaFileService(
  mediaId: number,
  variant: MediaFileVariant = "original",
) {
  const media = await findPublicMediaById(mediaId);

  if (!media) {
    throw new MediaServiceError("Media introuvable.", 404);
  }

  return readStoredMediaObject(media, variant);
}
