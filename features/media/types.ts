import type { MediaKind, MediaVisibility } from "@prisma/client";
import type { MediaStorageInfo } from "@/lib/server/storage/media/types";

export const DEFAULT_MEDIA_PAGE_SIZE = 36;
export const MAX_MEDIA_PAGE_SIZE = 96;

export type MediaFilterStatus = "all" | "active" | "inactive";
export type MediaFilterKind = MediaKind | "ALL";
export type MediaSortBy = "date" | "name" | "size";
export type MediaSortDirection = "asc" | "desc";
export type MediaView = "all" | "images" | "videos" | "pdf" | "audio" | "other";
export type MediaFileVariant = "original" | "thumbnail";
export type MediaDeleteOptions = {
  force?: boolean;
};

export type MediaListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  kind?: MediaFilterKind;
  status?: MediaFilterStatus;
  sortBy?: MediaSortBy;
  sortDirection?: MediaSortDirection;
};

export type MediaUploadInput = {
  file: File;
  title: string | null;
  altText: string | null;
  description: string | null;
  visibility: MediaVisibility;
};

export type MediaUploadRequest = {
  file: File;
  title?: string;
  altText?: string;
  description?: string;
  visibility?: MediaVisibility;
};

export type MediaUpdateInput = {
  visibility: MediaVisibility;
};

export type MediaUsageDto = {
  productModels: number;
  products: number;
  brandLogos: number;
  productCategoryImages: number;
  staffAvatars: number;
  articleAttachments: number;
  articleCovers: number;
  articleOgImages: number;
  total: number;
};

export type MediaListItemDto = {
  id: number;
  kind: MediaKind;
  visibility: MediaVisibility;
  storagePath: string;
  fileEndpoint: string;
  publicFileEndpoint: string;
  originalFilename: string | null;
  title: string | null;
  description: string | null;
  altText: string | null;
  mimeType: string | null;
  extension: string | null;
  widthPx: number | null;
  heightPx: number | null;
  durationSeconds: number | null;
  sizeBytes: number | null;
  sha256Hash: string | null;
  isActive: boolean;
  uploadedByUserId: string | null;
  uploadedByLabel: string | null;
  uploadedByCurrentUser: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canForceRemove: boolean;
  usage: MediaUsageDto;
  createdAt: string;
  updatedAt: string;
};

export type MediaUploadBatchItemResult =
  | {
      ok: true;
      input: MediaUploadRequest;
      media: MediaListItemDto;
    }
  | {
      ok: false;
      input: MediaUploadRequest;
      errorMessage: string;
    };

export type MediaUploadBatchResult = {
  total: number;
  successCount: number;
  errorCount: number;
  items: MediaUploadBatchItemResult[];
};

export type MediaUploadBatchCallbacks = {
  onItemStart?: (context: { index: number; input: MediaUploadRequest }) => void;
  onItemComplete?: (context: {
    index: number;
    result: MediaUploadBatchItemResult;
  }) => void;
};

export type MediaStatsDto = {
  total: number;
  images: number;
  videos: number;
  documents: number;
  totalSizeBytes: number;
};

export type MediaListResult = {
  items: MediaListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  stats: MediaStatsDto;
  storage: MediaStorageInfo;
};
