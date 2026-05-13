import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseTagSuggestionQuery,
  TagValidationError,
} from "@/features/tags/schemas";
import {
  listTagSuggestionsService,
  TagServiceError,
} from "@/features/tags/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseTagSuggestionQuery(searchParams);

    const result = await listTagSuggestionsService(session, query);

    return NextResponse.json({ ok: true, items: result.items }, { status: 200 });
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

    console.error("TAG_SUGGESTIONS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
