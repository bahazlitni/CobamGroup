// @/app/api/staff/medias/route.ts

import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  MediaValidationError,
  parseMediaListQuery,
  parseMediaUploadFormData,
} from "@/features/media/schemas";
import {
  listMediaService,
  MediaFilenameConflictError,
  MediaServiceError,
  uploadMediaService,
} from "@/features/media/service";
import { getMediaMaxUploadBytes } from "@/lib/server/storage/media/upload-limits";

export const runtime = "nodejs";

const MEDIA_UPLOAD_MULTIPART_OVERHEAD_BYTES = 2 * 1024 * 1024;

function getUploadLimitMessage() {
  return `Fichier trop volumineux. Limite actuelle: ${Math.floor(
    getMediaMaxUploadBytes() / (1024 * 1024),
  )} MB.`;
}

function parseContentLength(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function isRequestBodyTooLargeError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("too large") ||
    message.includes("exceeded") ||
    message.includes("body size") ||
    message.includes("413")
  );
}

function assertRequestBodyWithinUploadLimit(req: Request) {
  const contentLength = parseContentLength(req.headers.get("content-length"));

  if (
    contentLength != null &&
    contentLength > getMediaMaxUploadBytes() + MEDIA_UPLOAD_MULTIPART_OVERHEAD_BYTES
  ) {
    throw new MediaValidationError(getUploadLimitMessage(), 413);
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseMediaListQuery(searchParams);
    const result = await listMediaService(session, query);

    return NextResponse.json({
      ok: true,
      items: result.items,
      currentFolder: result.currentFolder,
      breadcrumbs: result.breadcrumbs,
      folders: result.folders,
      folderOptions: result.folderOptions,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      stats: result.stats,
      storage: result.storage,
    });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof MediaValidationError ||
      error instanceof MediaServiceError
    ) {
      if (error instanceof MediaFilenameConflictError) {
        return NextResponse.json(
          {
            ok: false,
            message: error.message,
            code: error.code,
            conflict: {
              media: error.conflictMedia,
            },
          },
          { status: error.status },
        );
      }

      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("MEDIA_LIST_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    assertRequestBodyWithinUploadLimit(req);
    let formData: FormData;

    try {
      formData = await req.formData();
    } catch (error) {
      if (isRequestBodyTooLargeError(error)) {
        throw new MediaValidationError(getUploadLimitMessage(), 413);
      }

      console.error("MEDIA_UPLOAD_FORMDATA_ERROR:", error);
      throw new MediaValidationError(
        "Le fichier n'a pas pu être lu. Verifiez le fichier et reessayez.",
      );
    }

    const input = parseMediaUploadFormData(formData);
    const media = await uploadMediaService(session, input);

    return NextResponse.json({ ok: true, media }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof MediaValidationError ||
      error instanceof MediaServiceError
    ) {
      if (error instanceof MediaFilenameConflictError) {
        return NextResponse.json(
          {
            ok: false,
            message: error.message,
            code: error.code,
            conflict: {
              media: error.conflictMedia,
            },
          },
          { status: error.status },
        );
      }

      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("MEDIA_UPLOAD_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
