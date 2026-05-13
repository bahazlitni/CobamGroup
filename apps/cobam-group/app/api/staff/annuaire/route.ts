import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  AnnuaireValidationError,
  parseAnnuaireListQuery,
  parseAnnuairePersonInput,
} from "@/features/annuaire/schemas";
import {
  AnnuaireServiceError,
  createAnnuairePersonService,
  listAnnuairePeopleService,
} from "@/features/annuaire/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseAnnuaireListQuery(searchParams);
    const result = await listAnnuairePeopleService(session, query);

    return NextResponse.json({
      ok: true,
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
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

    console.error("ANNUAIRE_LIST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const input = parseAnnuairePersonInput(await req.json());
    const person = await createAnnuairePersonService(session, input);

    return NextResponse.json({ ok: true, person }, { status: 201 });
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

    console.error("ANNUAIRE_CREATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
