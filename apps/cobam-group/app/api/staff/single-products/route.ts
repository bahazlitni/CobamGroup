import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createSingleProductService,
  SingleProductsServiceError,
} from "@/features/single-products/service";
import {
  parseSingleProductCreateInput,
  SingleProductsValidationError,
} from "@/features/single-products/schemas";

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const input = parseSingleProductCreateInput(body);

    const product = await createSingleProductService(session, input);

    return NextResponse.json({ ok: true, product }, { status: 201 });
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

    console.error("SINGLE_PRODUCT_CREATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
