// @/features/media/service.ts

import { createHash, randomUUID } from "crypto";
import path from "path";
import sharp from "sharp";
import type { StaffSession } from "@/features/auth/types";
import {
  canAccessMediaLibrary,
  canDeleteMediaRecord,
  canForceRemoveMedia,
  canForceRemoveMediaRecord,
  canUpdateMediaRecord,
  canUploadMedia,
  canViewAllMedia,
  canViewMediaRecord,
  canViewOwnMedia,
} from "./access";
import {
  mapMediaFolderListItemDto,
  mapMediaFolderOptionDto,
  mapMediaFolderSummaryDto,
  mapMediaStatsDto,
  mapMediaToListItemDto,
} from "./mappers";
import {
  aggregateMediaStats,
  countMediaFolderContents,
  countMedia,
  createMediaFolderRecord,
  createMediaRecord,
  deleteMediaFolderRecord,
  deleteMediaRecord,
  detachMediaFolderRelationsAndDeleteFolderRecord,
  detachMediaReferencesAndDeleteMediaRecord,
  findImageMediaById,
  findMediaByFolderAndOriginalFilename,
  findMediaFolderById,
  findMediaById,
  findPublicMediaById,
  listAllMediaFolders,
  listMediaFoldersAtLevel,
  listMedia,
  moveMediaRecordAndOverwriteConflict,
  updateMediaFolderRecord,
  updateMediaFileRecord,
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
  MediaFolderCreateInput,
  MediaFolderUpdateInput,
  MediaFileVariant,
  MediaKind,
  MediaListQuery,
  MediaListResult,
  MediaUpdateInput,
  MediaUploadInput,
  MediaVisibility,
} from "./types";
import { MEDIA_KIND } from "./types";
import {
  getMediaMaxUploadBytes,
  getMediaStorageDriver,
  getMediaStorageInfo,
} from "@/lib/server/storage/media";
import { normalizeMediaFolderPath } from "./folder-path";

export class MediaServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const MEDIA_FILENAME_CONFLICT_CODE = "MEDIA_FILENAME_CONFLICT";

export class MediaFilenameConflictError extends MediaServiceError {
  code = MEDIA_FILENAME_CONFLICT_CODE;
  conflictMedia: ReturnType<typeof mapMediaToListItemDto>;

  constructor(conflictMedia: ReturnType<typeof mapMediaToListItemDto>) {
    super(
      `Un fichier nommé "${conflictMedia.originalFilename ?? conflictMedia.resolvedTitle}" existe déjà dans ce dossier.`,
      409,
    );
    this.conflictMedia = conflictMedia;
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

  throw new MediaServiceError("Accès refusé.", 403);
}

function buildMediaFolderPathData(folders: Awaited<ReturnType<typeof listAllMediaFolders>>) {
  const foldersById = new Map(folders.map((folder) => [folder.id.toString(), folder]));

  const buildBreadcrumbsForFolder = (folderId: bigint | null | undefined) => {
    const breadcrumbs: Array<{ id: bigint; name: string }> = [];
    let currentId = folderId ?? null;
    const visited = new Set<string>();

    while (currentId != null) {
      const key = currentId.toString();

      if (visited.has(key)) {
        break;
      }

      visited.add(key);
      const folder = foldersById.get(key);

      if (!folder) {
        break;
      }

      breadcrumbs.unshift({
        id: folder.id,
        name: folder.name,
      });
      currentId = folder.parentId;
    }

    return breadcrumbs;
  };

  return {
    buildBreadcrumbsForFolder,
    foldersById,
  };
}

function buildScopedFolderIds(options: {
  allFolders: Awaited<ReturnType<typeof listAllMediaFolders>>;
  folderId: number | null | undefined;
  includeDescendantFolders?: boolean;
}) {
  if (options.folderId == null) {
    return null;
  }

  const rootFolderId = BigInt(options.folderId);

  if (!options.includeDescendantFolders) {
    return [rootFolderId];
  }

  const childFolderIdsByParentId = new Map<string, bigint[]>();

  for (const folder of options.allFolders) {
    if (folder.parentId == null) {
      continue;
    }

    const parentKey = folder.parentId.toString();
    const currentChildren = childFolderIdsByParentId.get(parentKey) ?? [];
    currentChildren.push(folder.id);
    childFolderIdsByParentId.set(parentKey, currentChildren);
  }

  const scopedFolderIds = [rootFolderId];
  const pendingFolderIds = [rootFolderId];
  const seenFolderIds = new Set([rootFolderId.toString()]);

  while (pendingFolderIds.length > 0) {
    const currentFolderId = pendingFolderIds.pop();

    if (!currentFolderId) {
      continue;
    }

    for (const childFolderId of childFolderIdsByParentId.get(currentFolderId.toString()) ?? []) {
      const childKey = childFolderId.toString();

      if (seenFolderIds.has(childKey)) {
        continue;
      }

      seenFolderIds.add(childKey);
      scopedFolderIds.push(childFolderId);
      pendingFolderIds.push(childFolderId);
    }
  }

  return scopedFolderIds;
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

const IMAGE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "heic",
  "heif",
  "ico",
  "jfif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "tif",
  "tiff",
  "webp",
]);

const VIDEO_EXTENSIONS = new Set(["avi", "m4v", "mkv", "mov", "mp4", "mpeg", "mpg", "webm"]);

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  "7z": "application/x-7z-compressed",
  avi: "video/x-msvideo",
  avif: "image/avif",
  bmp: "image/bmp",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  jfif: "image/jpeg",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  json: "application/json",
  m4a: "audio/mp4",
  m4v: "video/x-m4v",
  mkv: "video/x-matroska",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  ogg: "audio/ogg",
  pdf: "application/pdf",
  png: "image/png",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  rar: "application/vnd.rar",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  txt: "text/plain",
  wav: "audio/wav",
  webm: "video/webm",
  webp: "image/webp",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml",
  zip: "application/zip",
};

const GENERIC_UPLOAD_MIME_TYPES = new Set(["application/octet-stream", "binary/octet-stream"]);

function normalizeUploadMimeType(mimeType: string | null, extension: string | null) {
  const normalizedMimeType = mimeType?.trim().toLowerCase() || null;
  const extensionMimeType = extension ? (MIME_TYPE_BY_EXTENSION[extension] ?? null) : null;

  if (!normalizedMimeType || GENERIC_UPLOAD_MIME_TYPES.has(normalizedMimeType)) {
    return extensionMimeType ?? normalizedMimeType;
  }

  return normalizedMimeType;
}

function inferMediaKind(input: { mimeType: string | null; extension: string | null }) {
  const mimeType = input.mimeType?.toLowerCase() ?? null;
  const extension = input.extension?.toLowerCase() ?? null;

  if ((extension && IMAGE_EXTENSIONS.has(extension)) || mimeType?.startsWith("image/")) {
    return MEDIA_KIND.IMAGE;
  }

  if ((extension && VIDEO_EXTENSIONS.has(extension)) || mimeType?.startsWith("video/")) {
    return MEDIA_KIND.VIDEO;
  }

  if (
    mimeType?.startsWith("audio/") ||
    mimeType?.startsWith("text/") ||
    mimeType === "application/pdf" ||
    extension === "pdf" ||
    mimeType?.startsWith("application/") ||
    extension
  ) {
    return MEDIA_KIND.DOCUMENT;
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

async function deleteStoredMediaObjects(media: MediaStorageReadableRecord) {
  const storage = getMediaStorageDriver();

  await storage.deleteObject(media.storagePath);

  if (media.kind === MEDIA_KIND.IMAGE) {
    await storage.deleteObject(getMediaVariantStoragePath(media.storagePath, "thumbnail"));
  }
}

async function convertImageToWebp(buffer: Buffer) {
  try {
    const image = sharp(buffer, { failOn: "none" }).rotate();
    const webpBuffer = await image.webp({ quality: 90 }).toBuffer();

    return {
      buffer: Buffer.from(webpBuffer),
      mimeType: "image/webp",
      extension: "webp",
    };
  } catch (error) {
    console.error("MEDIA_IMAGE_WEBP_ERROR:", error);
    throw new MediaServiceError("Impossible de convertir l'image en WebP.", 400);
  }
}

async function analyzeImageBuffer(buffer: Buffer, mimeType: string | null) {
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
      widthPx: typeof metadata.width === "number" ? metadata.width : null,
      heightPx: typeof metadata.height === "number" ? metadata.height : null,
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

function assertMediaCanBeDeletedWithoutForce(
  media: NonNullable<Awaited<ReturnType<typeof findMediaById>>>,
) {
  if (media._count.productFamilyLinks > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un média encore lié à une famille produit.",
      400,
    );
  }

  if (media._count.productVariantLinks > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un média encore lié à une variante produit.",
      400,
    );
  }

  if (media._count.brandLogoFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un média encore utilisé comme logo de marque.",
      400,
    );
  }

  if (media._count.productCategoryImageFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un média encore utilisé par une catégorie de produit.",
      400,
    );
  }

  if (media._count.productTypeMediaImageFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore utilise par un modele produit.",
      400,
    );
  }

  if (media._count.productCertificateImageFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore utilise par un certificat produit.",
      400,
    );
  }

  if (media._count.productFinishImageFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un média encore utilisé par une finition.",
      400,
    );
  }

  if (media._count.productSubcategoryImageFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un média encore utilisé par une sous-catégorie de produit.",
      400,
    );
  }

  if (media._count.staffProfileAvatarFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un média encore utilisé comme avatar.",
      400,
    );
  }

  if (media._count.commerceInvoicePdfFor > 0 || media._count.commercePromotionBannerFor > 0) {
    throw new MediaServiceError(
      "Impossible de supprimer un media encore utilise par le module e-commerce.",
      400,
    );
  }

  if (
    media._count.articleMediaLinks > 0 ||
    media._count.articleCoverFor > 0 ||
    media._count.articleOgImageFor > 0
  ) {
    throw new MediaServiceError(
      "Impossible de supprimer un média encore utilisé dans les articles.",
      400,
    );
  }
}

export async function listMediaService(
  session: StaffSession,
  query: MediaListQuery,
): Promise<MediaListResult> {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const ownerUserId = getOwnerScope(session);
  const allFolders = await listAllMediaFolders(ownerUserId);
  const { buildBreadcrumbsForFolder, foldersById } = buildMediaFolderPathData(allFolders);

  let requestedFolder =
    query.folderId != null ? (foldersById.get(String(query.folderId)) ?? null) : null;

  if (query.folderId != null && !requestedFolder) {
    requestedFolder = await findMediaFolderById(query.folderId, ownerUserId);

    if (!requestedFolder) {
      throw new MediaServiceError("Dossier introuvable.", 404);
    }
  }
  const currentFolder = query.browseMode === "folders" ? requestedFolder : null;
  const scopedFolderIds = buildScopedFolderIds({
    allFolders,
    folderId: query.folderId,
    includeDescendantFolders: query.includeDescendantFolders,
  });
  const statsFolderIds =
    query.browseMode === "folders"
      ? buildScopedFolderIds({
          allFolders,
          folderId: query.folderId,
          includeDescendantFolders: true,
        })
      : scopedFolderIds;

  const [items, total, stats, folders] = await Promise.all([
    listMedia({ query, ownerUserId, folderIds: scopedFolderIds }),
    countMedia({ query, ownerUserId, folderIds: scopedFolderIds }),
    aggregateMediaStats({
      q: query.q,
      status: query.status,
      ownerUserId,
      browseMode: query.browseMode,
      folderId: query.folderId ?? null,
      includeDescendantFolders: true,
      folderIds: statsFolderIds,
    }),
    query.browseMode === "folders"
      ? listMediaFoldersAtLevel({
          parentId: query.folderId ?? null,
          ownerUserId,
          q: query.q,
        })
      : Promise.resolve([]),
  ]);

  return {
    items: items.map((item) => mapMediaToListItemDto(item, session)),
    currentFolder: currentFolder ? mapMediaFolderSummaryDto(currentFolder) : null,
    breadcrumbs: buildBreadcrumbsForFolder(currentFolder?.id).map((folder) => ({
      id: Number(folder.id),
      name: folder.name,
    })),
    folders: folders.map((folder) => mapMediaFolderListItemDto(folder)),
    folderOptions: allFolders.map((folder) =>
      mapMediaFolderOptionDto({
        ...folder,
        pathLabel: buildBreadcrumbsForFolder(folder.id)
          .map((crumb) => crumb.name)
          .join(" / "),
      }),
    ),
    total,
    page: query.page,
    pageSize: query.pageSize,
    stats: mapMediaStatsDto(stats),
    storage: getMediaStorageInfo(),
  };
}

export async function resolveMediaFolderIdByPathService(session: StaffSession, path: string) {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  const normalizedPath = normalizeMediaFolderPath(path);

  if (!normalizedPath) {
    return null;
  }

  const ownerUserId = getOwnerScope(session);
  const allFolders = await listAllMediaFolders(ownerUserId);
  const { buildBreadcrumbsForFolder } = buildMediaFolderPathData(allFolders);

  const folder =
    allFolders.find((candidate) => {
      const candidatePath = buildBreadcrumbsForFolder(candidate.id)
        .map((crumb) => crumb.name)
        .join("/");

      return normalizeMediaFolderPath(candidatePath) === normalizedPath;
    }) ?? null;

  return folder ? Number(folder.id) : null;
}

export async function getMediaFolderByIdService(session: StaffSession, folderId: number) {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Acces refuse.", 403);
  }

  const ownerUserId = getOwnerScope(session);
  const folder = await findMediaFolderById(folderId, ownerUserId);

  if (!folder) {
    throw new MediaServiceError("Dossier introuvable.", 404);
  }

  return mapMediaFolderSummaryDto(folder);
}

export async function uploadMediaService(session: StaffSession, input: MediaUploadInput) {
  if (!canUploadMedia(session)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const maxUploadBytes = getMediaMaxUploadBytes();
  if (input.file.size > maxUploadBytes) {
    throw new MediaServiceError(
      `Fichier trop volumineux. Limite actuelle: ${Math.floor(maxUploadBytes / (1024 * 1024))} MB.`,
      413,
    );
  }

  const originalFilename = input.file.name || "upload";
  const ownerUserId = getOwnerScope(session);

  if (input.folderId != null) {
    const folder = await findMediaFolderById(input.folderId, ownerUserId);

    if (!folder) {
      throw new MediaServiceError("Dossier introuvable.", 404);
    }
  }

  const extension = getFileExtension(originalFilename, input.file.type || null);
  const uploadMimeType = normalizeUploadMimeType(input.file.type || null, extension);
  const kind = inferMediaKind({
    mimeType: uploadMimeType,
    extension,
  });
  let buffer: Buffer;

  try {
    buffer = Buffer.from(await input.file.arrayBuffer());
  } catch (error) {
    console.error("MEDIA_UPLOAD_READ_ERROR:", error);
    throw new MediaServiceError("Impossible de lire le fichier fourni.", 400);
  }

  let mimeType = uploadMimeType;
  let finalExtension = extension;
  let finalFilename = originalFilename;

  if (kind === MEDIA_KIND.IMAGE) {
    const converted = await convertImageToWebp(buffer);
    buffer = converted.buffer;
    mimeType = converted.mimeType;
    finalExtension = converted.extension;
    const baseName = path.basename(originalFilename, path.extname(originalFilename));
    finalFilename = `${baseName || "image"}.webp`;
  }

  const storagePath = buildMediaStorageKey({
    kind,
    originalFilename: finalFilename,
    extension: finalExtension,
  });
  const sha256Hash = createHash("sha256").update(buffer).digest("hex");
  const storage = getMediaStorageDriver();
  const imageArtifacts =
    kind === MEDIA_KIND.IMAGE ? await analyzeImageBuffer(buffer, mimeType) : null;
  const thumbnailStoragePath =
    kind === MEDIA_KIND.IMAGE ? getMediaVariantStoragePath(storagePath, "thumbnail") : null;
  const existingMedia = await findMediaByFolderAndOriginalFilename({
    folderId: input.folderId,
    originalFilename: finalFilename,
  });

  if (existingMedia) {
    if (!input.overwriteExisting) {
      throw new MediaFilenameConflictError(mapMediaToListItemDto(existingMedia, session));
    }

    if (!canUpdateMediaRecord(session, existingMedia.uploadedByUserId)) {
      throw new MediaServiceError("Accès refusé.", 403);
    }
  }

  let originalStored = false;
  let thumbnailStored = false;

  try {
    await storage.putObject({
      key: storagePath,
      body: new Uint8Array(buffer),
      contentType: mimeType,
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
    const media = existingMedia
      ? await updateMediaFileRecord(Number(existingMedia.id), {
          kind,
          visibility: input.visibility,
          storagePath,
          originalFilename: finalFilename,
          mimeType,
          extension: finalExtension,
          title: input.title ?? existingMedia.title,
          altText: input.altText ?? existingMedia.altText,
          widthPx: imageArtifacts?.widthPx ?? null,
          heightPx: imageArtifacts?.heightPx ?? null,
          sizeBytes: BigInt(buffer.byteLength),
          sha256Hash,
          updatedByUserId: session.id,
        })
      : await createMediaRecord({
          folderId: input.folderId,
          kind,
          visibility: input.visibility,
          storagePath,
          originalFilename: finalFilename,
          mimeType,
          extension: finalExtension,
          title: input.title,
          altText: input.altText,
          widthPx: imageArtifacts?.widthPx ?? null,
          heightPx: imageArtifacts?.heightPx ?? null,
          sizeBytes: BigInt(buffer.byteLength),
          sha256Hash,
          uploadedByUserId: session.id,
        });

    if (existingMedia) {
      await deleteStoredMediaObjects(existingMedia).catch((error) => {
        console.error("MEDIA_OVERWRITE_OLD_STORAGE_DELETE_ERROR:", error);
      });
    }

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

export async function getMediaByIdService(session: StaffSession, mediaId: number) {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const media = await findMediaById(mediaId);

  if (!media) {
    throw new MediaServiceError("Média introuvable.", 404);
  }

  if (!canViewMediaRecord(session, media.uploadedByUserId)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  return mapMediaToListItemDto(media, session);
}

export async function updateMediaService(
  session: StaffSession,
  mediaId: number,
  input: MediaUpdateInput,
) {
  if (!canAccessMediaLibrary(session)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const existingMedia = await findMediaById(mediaId);

  if (!existingMedia) {
    throw new MediaServiceError("Média introuvable.", 404);
  }

  if (!canUpdateMediaRecord(session, existingMedia.uploadedByUserId)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const ownerUserId = getOwnerScope(session);

  if (input.folderId != null) {
    const folder = await findMediaFolderById(input.folderId, ownerUserId);

    if (!folder) {
      throw new MediaServiceError("Dossier introuvable.", 404);
    }
  }

  const existingFolderId = existingMedia.folderId != null ? Number(existingMedia.folderId) : null;
  const shouldChangeVisibility =
    input.visibility != null && existingMedia.visibility !== input.visibility;
  const shouldChangeFolder = input.folderId !== undefined && existingFolderId !== input.folderId;
  const shouldChangeTitle = input.title !== undefined && existingMedia.title !== input.title;
  const shouldChangeAltText =
    input.altText !== undefined && existingMedia.altText !== input.altText;

  if (
    !shouldChangeVisibility &&
    !shouldChangeFolder &&
    !shouldChangeTitle &&
    !shouldChangeAltText
  ) {
    return mapMediaToListItemDto(existingMedia, session);
  }

  if (shouldChangeFolder && existingMedia.originalFilename) {
    const conflictingMedia = await findMediaByFolderAndOriginalFilename({
      folderId: input.folderId ?? null,
      originalFilename: existingMedia.originalFilename,
      excludeMediaId: mediaId,
    });

    if (conflictingMedia) {
      const conflictDto = mapMediaToListItemDto(conflictingMedia, session);

      if (!input.overwriteExisting) {
        throw new MediaFilenameConflictError(conflictDto);
      }

      const canOverwriteConflict =
        conflictingMedia._count.productFamilyLinks > 0 ||
        conflictingMedia._count.productVariantLinks > 0 ||
        conflictingMedia._count.brandLogoFor > 0 ||
        conflictingMedia._count.productCategoryImageFor > 0 ||
        conflictingMedia._count.productTypeMediaImageFor > 0 ||
        conflictingMedia._count.productCertificateImageFor > 0 ||
        conflictingMedia._count.productFinishImageFor > 0 ||
        conflictingMedia._count.productSubcategoryImageFor > 0 ||
        conflictingMedia._count.staffProfileAvatarFor > 0 ||
        conflictingMedia._count.commerceInvoicePdfFor > 0 ||
        conflictingMedia._count.commercePromotionBannerFor > 0 ||
        conflictingMedia._count.articleMediaLinks > 0 ||
        conflictingMedia._count.articleCoverFor > 0 ||
        conflictingMedia._count.articleOgImageFor > 0
          ? canForceRemoveMediaRecord(session, conflictingMedia.uploadedByUserId)
          : canDeleteMediaRecord(session, conflictingMedia.uploadedByUserId);

      if (
        !canOverwriteConflict ||
        !canUpdateMediaRecord(session, conflictingMedia.uploadedByUserId)
      ) {
        throw new MediaServiceError("Accès refusé.", 403);
      }

      const result = await moveMediaRecordAndOverwriteConflict({
        mediaId,
        conflictMediaId: Number(conflictingMedia.id),
        folderId: input.folderId ?? null,
        updatedByUserId: session.id,
      });

      await deleteStoredMediaObjects(result.overwrittenMedia).catch((error) => {
        console.error("MEDIA_MOVE_OVERWRITE_STORAGE_DELETE_ERROR:", error);
      });

      const updatedMedia =
        shouldChangeVisibility || shouldChangeTitle || shouldChangeAltText
          ? await updateMediaRecord(mediaId, {
              visibility: input.visibility,
              title: input.title,
              altText: input.altText,
              updatedByUserId: session.id,
            })
          : result.media;

      return mapMediaToListItemDto(updatedMedia, session);
    }
  }

  const updatedMedia = await updateMediaRecord(mediaId, {
    ...input,
    updatedByUserId: session.id,
  });

  return mapMediaToListItemDto(updatedMedia, session);
}

export async function createMediaFolderService(
  session: StaffSession,
  input: MediaFolderCreateInput,
) {
  if (!canAccessMediaLibrary(session) || !canUploadMedia(session)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const ownerUserId = getOwnerScope(session);

  if (input.parentId != null) {
    const parent = await findMediaFolderById(input.parentId, ownerUserId);

    if (!parent) {
      throw new MediaServiceError("Dossier parent introuvable.", 404);
    }
  }

  const folder = await createMediaFolderRecord({
    name: input.name.trim(),
    parentId: input.parentId,
    createdByUserId: session.id,
  });

  return mapMediaFolderSummaryDto(folder);
}

export async function deleteMediaFolderService(
  session: StaffSession,
  folderId: number,
  options: MediaDeleteOptions = {},
) {
  if (!canAccessMediaLibrary(session) || !canUploadMedia(session)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const ownerUserId = getOwnerScope(session);
  const existingFolder = await findMediaFolderById(folderId, ownerUserId);

  if (!existingFolder) {
    throw new MediaServiceError("Dossier introuvable.", 404);
  }

  if (existingFolder.isProtected) {
    throw new MediaServiceError("Ce dossier est protege et ne peut pas etre supprime.", 400);
  }

  const forceRemove = options.force === true;

  if (forceRemove && !canForceRemoveMedia(session)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const contents = await countMediaFolderContents(folderId, ownerUserId);

  if (!forceRemove && (contents.mediaCount > 0 || contents.childFolderCount > 0)) {
    throw new MediaServiceError(
      "Impossible de supprimer un dossier non vide sans forcer la suppression.",
      400,
    );
  }

  if (forceRemove) {
    await detachMediaFolderRelationsAndDeleteFolderRecord({
      folderId,
      parentId: existingFolder.parentId != null ? Number(existingFolder.parentId) : null,
      ownerUserId,
    });
    return;
  }

  await deleteMediaFolderRecord(folderId);
}

export async function updateMediaFolderService(
  session: StaffSession,
  folderId: number,
  input: MediaFolderUpdateInput,
) {
  if (!canAccessMediaLibrary(session) || !canUploadMedia(session)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const ownerUserId = getOwnerScope(session);
  const [existingFolder, allFolders] = await Promise.all([
    findMediaFolderById(folderId, ownerUserId),
    listAllMediaFolders(ownerUserId),
  ]);

  if (!existingFolder) {
    throw new MediaServiceError("Dossier introuvable.", 404);
  }

  if (input.parentId === folderId) {
    throw new MediaServiceError("Impossible de déplacer un dossier dans lui-même.", 400);
  }

  const foldersById = new Map(allFolders.map((folder) => [Number(folder.id), folder]));

  if (input.parentId != null) {
    const targetParent = foldersById.get(input.parentId);

    if (!targetParent) {
      throw new MediaServiceError("Dossier parent introuvable.", 404);
    }

    let currentParentId = targetParent.parentId != null ? Number(targetParent.parentId) : null;

    while (currentParentId != null) {
      if (currentParentId === folderId) {
        throw new MediaServiceError(
          "Impossible de déplacer un dossier dans l'un de ses sous-dossiers.",
          400,
        );
      }

      currentParentId =
        foldersById.get(currentParentId)?.parentId != null
          ? Number(foldersById.get(currentParentId)?.parentId)
          : null;
    }
  }

  const currentParentId = existingFolder.parentId != null ? Number(existingFolder.parentId) : null;

  if (currentParentId === input.parentId) {
    return mapMediaFolderSummaryDto(existingFolder);
  }

  const folder = await updateMediaFolderRecord({
    folderId,
    parentId: input.parentId,
  });

  return mapMediaFolderSummaryDto(folder);
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
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const forceRemove = options.force === true;
  const media = await findMediaById(mediaId);

  if (!media) {
    throw new MediaServiceError("Média introuvable.", 404);
  }

  if (
    forceRemove
      ? !canForceRemoveMediaRecord(session, media.uploadedByUserId)
      : !canDeleteMediaRecord(session, media.uploadedByUserId)
  ) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  if (!forceRemove) {
    assertMediaCanBeDeletedWithoutForce(media);
  }

  try {
    await deleteStoredMediaObjects(media);
  } catch (error) {
    console.error("MEDIA_STORAGE_DELETE_ERROR:", error);
    throw new MediaServiceError("Impossible de supprimer le fichier dans le stockage.", 500);
  }

  if (forceRemove) {
    await detachMediaReferencesAndDeleteMediaRecord(mediaId);
    return;
  }

  await deleteMediaRecord(mediaId);
}

async function readStoredMediaObject(
  media: MediaStorageReadableRecord,
  variant: MediaFileVariant = "original",
) {
  const storage = getMediaStorageDriver();
  const thumbnailStoragePath = getMediaVariantStoragePath(media.storagePath, "thumbnail");

  if (variant === "thumbnail" && media.kind === MEDIA_KIND.IMAGE) {
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
      throw new MediaServiceError("Fichier média introuvable dans le stockage.", 404);
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
        contentType: media.mimeType ?? originalObject.contentType ?? "application/octet-stream",
        originalFilename:
          buildMediaVariantFilename(media.originalFilename, "original") ??
          `media-${media.id}${media.extension ? `.${media.extension}` : ""}`,
      };
    }
  }

  const object = await storage.readObject(media.storagePath);

  if (!object) {
    throw new MediaServiceError("Fichier média introuvable dans le stockage.", 404);
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
    throw new MediaServiceError("Accès refusé.", 403);
  }

  const media = await findMediaById(mediaId);

  if (!media) {
    throw new MediaServiceError("Média introuvable.", 404);
  }

  if (!canViewMediaRecord(session, media.uploadedByUserId)) {
    throw new MediaServiceError("Accès refusé.", 403);
  }

  return readStoredMediaObject(media, variant);
}

export async function readPublicMediaFileService(
  mediaId: number,
  variant: MediaFileVariant = "original",
) {
  const media = await findPublicMediaById(mediaId);

  if (!media) {
    throw new MediaServiceError("Média introuvable.", 404);
  }

  return readStoredMediaObject(media, variant);
}
