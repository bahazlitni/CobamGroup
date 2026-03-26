import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductCategoryCreateInput,
  parseProductCategoryListQuery,
  ProductCategoryValidationError,
} from "@/features/product-categories/schemas";
import {
  createProductCategoryService,
  listProductCategoriesService,
  ProductCategoryServiceError,
} from "@/features/product-categories/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseProductCategoryListQuery(searchParams);

    const result = await listProductCategoriesService(session, query);

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
      error instanceof ProductCategoryValidationError ||
      error instanceof ProductCategoryServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_CATEGORIES_LIST_ERROR:", error);
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
    const input = parseProductCategoryCreateInput(body);

    const category = await createProductCategoryService(session, input);

    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductCategoryValidationError ||
      error instanceof ProductCategoryServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_CATEGORY_CREATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
