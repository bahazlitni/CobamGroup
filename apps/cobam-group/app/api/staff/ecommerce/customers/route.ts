import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  EcommerceAdminServiceError,
  listEcommerceCustomersAdminService,
} from "@/features/ecommerce-admin/service";

function jsonError(error: unknown, fallback: string) {
  if (error instanceof AuthError || error instanceof EcommerceAdminServiceError) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: error.status },
    );
  }

  console.error(fallback, error);
  return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const data = await listEcommerceCustomersAdminService(session);

    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_CUSTOMERS_ADMIN_LIST_ERROR:");
  }
}
