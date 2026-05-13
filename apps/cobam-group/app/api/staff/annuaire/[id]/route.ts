import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  AnnuaireValidationError,
  parseAnnuaireIdParam,
  parseAnnuairePersonInput,
} from "@/features/annuaire/schemas";
import {
  AnnuaireServiceError,
  deleteAnnuairePersonService,
  updateAnnuairePersonService,
} from "@/features/annuaire/service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const personId = parseAnnuaireIdParam(id);
    const input = parseAnnuairePersonInput(await req.json());
    const person = await updateAnnuairePersonService(session, personId, input);

    return NextResponse.json({ ok: true, person }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof AnnuaireValidationError ||
      error instanceof AnnuaireServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ANNUAIRE_UPDATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const personId = parseAnnuaireIdParam(id);

    await deleteAnnuairePersonService(session, personId);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof AnnuaireValidationError ||
      error instanceof AnnuaireServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ANNUAIRE_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
