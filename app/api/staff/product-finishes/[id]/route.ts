import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductFinishIdParam,
  parseProductFinishInput,
  ProductFinishValidationError,
} from "@/features/product-finishes/schemas";
import {
  deleteProductFinishService,
  ProductFinishServiceError,
  updateProductFinishService,
} from "@/features/product-finishes/service";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const finishId = parseProductFinishIdParam(id);
    const body = await req.json();
    const input = parseProductFinishInput(body);
    const item = await updateProductFinishService(session, finishId, input);

    return NextResponse.json({ ok: true, item }, { status: 200 });
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

    console.error("PRODUCT_FINISH_UPDATE_ERROR:", error);
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
    const finishId = parseProductFinishIdParam(id);
    await deleteProductFinishService(session, finishId);

    return NextResponse.json({ ok: true }, { status: 200 });
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

    console.error("PRODUCT_FINISH_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
