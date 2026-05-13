// @/app/api/staff/medias/[id]/file/route.ts

import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseMediaFileVariant,
  MediaValidationError,
  parseMediaIdParam,
} from "@/features/media/schemas";
import {
  MediaServiceError,
  readMediaFileService,
} from "@/features/media/service";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const mediaId = parseMediaIdParam(idParam);
    const { searchParams } = new URL(req.url);
    const shouldDownload =
      searchParams.get("download") === "1" ||
      searchParams.get("download") === "true";
    const variant = parseMediaFileVariant(searchParams);

    const file = await readMediaFileService(session, mediaId, variant);
    const headers = new Headers();
    headers.set("Content-Type", file.contentType);
    headers.set("Cache-Control", "private, max-age=31536000, immutable");
    headers.set(
      "Content-Disposition",
      `${shouldDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(file.originalFilename)}"`,
    );
    const bytes = new Uint8Array(file.body.byteLength);
    bytes.set(file.body);
    const body = new Blob([bytes.buffer], { type: file.contentType });

    return new Response(body, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof MediaValidationError ||
      error instanceof MediaServiceError
    ) {
      return new Response(error.message, { status: error.status });
    }

    console.error("MEDIA_FILE_READ_ERROR:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
