import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  listProductCategoryParentOptionsService,
  ProductCategoryServiceError,
} from "@/features/product-categories/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const items = await listProductCategoryParentOptionsService(session);

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductCategoryServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_CATEGORY_PARENT_OPTIONS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
