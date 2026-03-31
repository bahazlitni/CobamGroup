import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductColorIdParam,
  parseProductColorInput,
  ProductColorValidationError,
} from "@/features/product-colors/schemas";
import {
  deleteProductColorService,
  ProductColorServiceError,
  updateProductColorService,
} from "@/features/product-colors/service";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const colorId = parseProductColorIdParam(id);
    const body = await req.json();
    const input = parseProductColorInput(body);
    const item = await updateProductColorService(session, colorId, input);

    return NextResponse.json({ ok: true, item }, { status: 200 });
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

    console.error("PRODUCT_COLOR_UPDATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const colorId = parseProductColorIdParam(id);
    await deleteProductColorService(session, colorId);

    return NextResponse.json({ ok: true }, { status: 200 });
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

    console.error("PRODUCT_COLOR_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
