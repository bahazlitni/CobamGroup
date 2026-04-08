import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  AllProductsValidationError,
  parseAllProductIdParam,
  parseAllProductLifecycleInput,
} from "@/features/all-products/schemas";
import {
  AllProductsServiceError,
  updateAllProductLifecycleService,
} from "@/features/all-products/service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const productId = parseAllProductIdParam(idParam);
    const body = await req.json();
    const lifecycle = parseAllProductLifecycleInput(body);

    const product = await updateAllProductLifecycleService(
      session,
      productId,
      lifecycle,
    );

    return NextResponse.json({ ok: true, product }, { status: 200 });
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

    console.error("ALL_PRODUCTS_LIFECYCLE_UPDATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
