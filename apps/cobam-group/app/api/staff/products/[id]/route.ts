import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductIdParam,
  parseProductUpdateInput,
  ProductValidationError,
} from "@/features/products/schemas";
import {
  deleteProductService,
  getProductByIdService,
  ProductServiceError,
  updateProductService,
} from "@/features/products/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const productId = parseProductIdParam(idParam);

    const product = await getProductByIdService(session, productId);

    return NextResponse.json({ ok: true, product }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductValidationError ||
      error instanceof ProductServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_GET_ERROR:", error);
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
    const productId = parseProductIdParam(idParam);
    const body = await req.json();
    const input = parseProductUpdateInput(body);

    const product = await updateProductService(session, productId, input);

    return NextResponse.json({ ok: true, product }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductValidationError ||
      error instanceof ProductServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_UPDATE_ERROR:", error);
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
    const productId = parseProductIdParam(idParam);

    await deleteProductService(session, productId);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductValidationError ||
      error instanceof ProductServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
