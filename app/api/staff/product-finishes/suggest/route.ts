import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductFinishSuggestQuery,
  ProductFinishValidationError,
} from "@/features/product-finishes/schemas";
import {
  ProductFinishServiceError,
  suggestProductFinishesService,
} from "@/features/product-finishes/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseProductFinishSuggestQuery(searchParams);
    const items = await suggestProductFinishesService(session, query);

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductFinishServiceError ||
      error instanceof ProductFinishValidationError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_FINISH_SUGGEST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
