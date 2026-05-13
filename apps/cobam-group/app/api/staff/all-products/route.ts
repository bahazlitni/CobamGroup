import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  AllProductsValidationError,
  parseAllProductsListQuery,
} from "@/features/all-products/schemas";
import {
  AllProductsServiceError,
  listAllProductsService,
} from "@/features/all-products/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseAllProductsListQuery(searchParams);

    const result = await listAllProductsService(session, query);

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
      error instanceof AllProductsValidationError ||
      error instanceof AllProductsServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ALL_PRODUCTS_LIST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
