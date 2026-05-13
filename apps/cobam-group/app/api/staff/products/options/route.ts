import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  getProductFormOptionsService,
  ProductServiceError,
} from "@/features/products/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const options = await getProductFormOptionsService(session);

    return NextResponse.json({ ok: true, options }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof ProductServiceError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_OPTIONS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
