import {
  MediaValidationError,
  parseMediaFileVariant,
  parseMediaIdParam,
} from "@/features/media/schemas";
import {
  MediaServiceError,
  readPublicMediaFileService,
} from "@/features/media/service";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const mediaId = parseMediaIdParam(idParam);
    const { searchParams } = new URL(req.url);
    const shouldDownload =
      searchParams.get("download") === "1" ||
      searchParams.get("download") === "true";
    const variant = parseMediaFileVariant(searchParams);
    const file = await readPublicMediaFileService(mediaId, variant);
    const headers = new Headers();

    headers.set("Content-Type", file.contentType);
    headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
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
      error instanceof MediaValidationError ||
      error instanceof MediaServiceError
    ) {
      return new Response(error.message, { status: error.status });
    }

    console.error("PUBLIC_MEDIA_FILE_READ_ERROR:", error);
    return new Response("Internal server error", { status: 500 });
  }
}