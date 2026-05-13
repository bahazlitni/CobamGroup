import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { MediaValidationError } from "@/features/media/schemas";
import {
  MediaServiceError,
  resolveMediaFolderIdByPathService,
} from "@/features/media/service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const url = new URL(req.url);
    const path = url.searchParams.get("path")?.trim();

    if (!path) {
      throw new MediaValidationError("Le chemin du dossier est requis.");
    }

    const folderId = await resolveMediaFolderIdByPathService(session, path);

    return NextResponse.json({ ok: true, folderId }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof MediaValidationError ||
      error instanceof MediaServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("MEDIA_FOLDER_RESOLVE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
