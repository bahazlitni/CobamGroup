import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseSingleProductIdParam,
  parseSingleProductUpdateInput,
  SingleProductsValidationError,
} from "@/features/single-products/schemas";
import {
  deleteSingleProductService,
  getSingleProductByIdService,
  SingleProductsServiceError,
  updateSingleProductService,
} from "@/features/single-products/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const productId = parseSingleProductIdParam(idParam);

    const product = await getSingleProductByIdService(session, productId);

    return NextResponse.json({ ok: true, product }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof SingleProductsValidationError ||
      error instanceof SingleProductsServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("SINGLE_PRODUCT_GET_ERROR:", error);
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
    const productId = parseSingleProductIdParam(idParam);
    const body = await req.json();
    const input = parseSingleProductUpdateInput(body);

    const product = await updateSingleProductService(session, productId, input);

    return NextResponse.json({ ok: true, product }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof SingleProductsValidationError ||
      error instanceof SingleProductsServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("SINGLE_PRODUCT_UPDATE_ERROR:", error);
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
    const productId = parseSingleProductIdParam(idParam);

    await deleteSingleProductService(session, productId);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof SingleProductsValidationError ||
      error instanceof SingleProductsServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("SINGLE_PRODUCT_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
