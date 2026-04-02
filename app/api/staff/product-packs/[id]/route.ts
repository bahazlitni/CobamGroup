import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductPackIdParam,
  parseProductPackUpdateInput,
  ProductPackValidationError,
} from "@/features/product-packs/schemas";
import {
  deleteProductPackService,
  getProductPackByIdService,
  ProductPackServiceError,
  updateProductPackService,
} from "@/features/product-packs/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const packId = parseProductPackIdParam(idParam);
    const pack = await getProductPackByIdService(session, packId);

    return NextResponse.json({ ok: true, pack }, { status: 200 });
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

    console.error("PRODUCT_PACK_GET_ERROR:", error);
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
    const packId = parseProductPackIdParam(idParam);
    const body = await req.json();
    const input = parseProductPackUpdateInput(body);
    const pack = await updateProductPackService(session, packId, input);

    return NextResponse.json({ ok: true, pack }, { status: 200 });
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

    console.error("PRODUCT_PACK_UPDATE_ERROR:", error);
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
    const packId = parseProductPackIdParam(idParam);

    await deleteProductPackService(session, packId);

    return NextResponse.json({ ok: true }, { status: 200 });
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

    console.error("PRODUCT_PACK_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
