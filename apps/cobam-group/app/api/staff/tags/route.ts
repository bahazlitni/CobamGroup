import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseTagCreateInput,
  parseTagListQuery,
  TagValidationError,
} from "@/features/tags/schemas";
import {
  createTagService,
  listTagsService,
  TagServiceError,
} from "@/features/tags/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseTagListQuery(searchParams);

    const result = await listTagsService(session, query);

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
      error instanceof TagValidationError ||
      error instanceof TagServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("TAGS_LIST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const input = parseTagCreateInput(body);

    const tag = await createTagService(session, input);

    return NextResponse.json({ ok: true, tag }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof TagValidationError ||
      error instanceof TagServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("TAG_CREATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
