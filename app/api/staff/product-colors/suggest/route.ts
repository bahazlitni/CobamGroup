import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductColorSuggestQuery,
  ProductColorValidationError,
} from "@/features/product-colors/schemas";
import {
  ProductColorServiceError,
  suggestProductColorsService,
} from "@/features/product-colors/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseProductColorSuggestQuery(searchParams);
    const items = await suggestProductColorsService(session, query);

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductColorServiceError ||
      error instanceof ProductColorValidationError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_COLOR_SUGGEST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
