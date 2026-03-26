import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductCategoryIdParam,
  parseProductCategoryUpdateInput,
  ProductCategoryValidationError,
} from "@/features/product-categories/schemas";
import {
  deleteProductCategoryService,
  getProductCategoryByIdService,
  ProductCategoryServiceError,
  updateProductCategoryService,
} from "@/features/product-categories/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const categoryId = parseProductCategoryIdParam(idParam);

    const category = await getProductCategoryByIdService(session, categoryId);

    return NextResponse.json({ ok: true, category }, { status: 200 });
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

    console.error("PRODUCT_CATEGORY_GET_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const categoryId = parseProductCategoryIdParam(idParam);
    const body = await req.json();
    const input = parseProductCategoryUpdateInput(body);

    const category = await updateProductCategoryService(
      session,
      categoryId,
      input,
    );

    return NextResponse.json({ ok: true, category }, { status: 200 });
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

    console.error("PRODUCT_CATEGORY_UPDATE_ERROR:", error);
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
    const { id: idParam } = await params;
    const categoryId = parseProductCategoryIdParam(idParam);

    await deleteProductCategoryService(session, categoryId);

    return NextResponse.json({ ok: true }, { status: 200 });
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

    console.error("PRODUCT_CATEGORY_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
