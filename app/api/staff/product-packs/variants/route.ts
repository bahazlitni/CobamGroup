import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductPackVariantSearchQuery,
  ProductPackValidationError,
} from "@/features/product-packs/schemas";
import {
  ProductPackServiceError,
  searchProductPackVariantsService,
} from "@/features/product-packs/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseProductPackVariantSearchQuery(searchParams);

    const items = await searchProductPackVariantsService(session, query);

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductPackValidationError ||
      error instanceof ProductPackServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_PACK_VARIANTS_SEARCH_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
