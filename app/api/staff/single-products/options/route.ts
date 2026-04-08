import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  getSingleProductFormOptionsService,
  SingleProductsServiceError,
} from "@/features/single-products/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const options = await getSingleProductFormOptionsService(session);

    return NextResponse.json({ ok: true, options }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof SingleProductsServiceError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("SINGLE_PRODUCT_OPTIONS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
