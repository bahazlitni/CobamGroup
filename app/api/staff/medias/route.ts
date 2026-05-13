// @/app/api/staff/medias/route.ts

import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  MediaValidationError,
  parseMediaListQuery,
  parseMediaUploadFormData,
} from "@/features/media/schemas";
import { listMediaService, MediaServiceError, uploadMediaService } from "@/features/media/service";

export const runtime = "nodejs";

function serializeUploadError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { value: String(error) };
}

function getUploadRequestDebug(req: Request) {
  return {
    url: req.url,
    method: req.method,
    contentType: req.headers.get("content-type"),
    contentLength: req.headers.get("content-length"),
    forwardedFor: req.headers.get("x-forwarded-for"),
    forwardedProto: req.headers.get("x-forwarded-proto"),
    userAgent: req.headers.get("user-agent"),
  };
}

function getUploadInputDebug(input: ReturnType<typeof parseMediaUploadFormData> | null) {
  if (!input) {
    return null;
  }

  return {
    fileName: input.file.name,
    fileType: input.file.type,
    fileSize: input.file.size,
    fileLastModified: input.file.lastModified,
    folderId: input.folderId,
    visibility: input.visibility,
    hasTitle: Boolean(input.title),
    hasAltText: Boolean(input.altText),
  };
}

function logUploadRouteFailure(input: {
  stage: string;
  req: Request;
  parsedInput: ReturnType<typeof parseMediaUploadFormData> | null;
  error: unknown;
}) {
  console.log(
    "MEDIA_UPLOAD_ROUTE_DEBUG_FAILURE",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        stage: input.stage,
        request: getUploadRequestDebug(input.req),
        input: getUploadInputDebug(input.parsedInput),
        error: serializeUploadError(input.error),
      },
      null,
      2,
    ),
  );
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
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("MEDIA_LIST_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let debugStage = "require_staff_session";
  let parsedInput: ReturnType<typeof parseMediaUploadFormData> | null = null;

  try {
    const session = await requireStaffSession(req);
    let formData: FormData;

    try {
      debugStage = "parse_form_data";
      formData = await req.formData();
    } catch (error) {
      console.error("MEDIA_UPLOAD_FORMDATA_ERROR:", error);
      throw new MediaValidationError(
        "Le fichier n'a pas pu etre lu. Verifiez le fichier et reessayez.",
      );
    }

    debugStage = "parse_upload_input";
    parsedInput = parseMediaUploadFormData(formData);
    debugStage = "upload_media_service";
    const media = await uploadMediaService(session, parsedInput);

    return NextResponse.json({ ok: true, media }, { status: 201 });
  } catch (error: unknown) {
    logUploadRouteFailure({
      stage: debugStage,
      req,
      parsedInput,
      error,
    });

    if (
      error instanceof AuthError ||
      error instanceof MediaValidationError ||
      error instanceof MediaServiceError
    ) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("MEDIA_UPLOAD_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
