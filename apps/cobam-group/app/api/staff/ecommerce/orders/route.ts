import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  EcommerceAdminServiceError,
  listEcommerceOrdersAdminService,
  parseEcommerceOrderId,
  parseEcommerceOrderStatusInput,
  updateEcommerceOrderStatusAdminService,
} from "@/features/ecommerce-admin/service";

function jsonError(error: unknown, fallback: string) {
  if (error instanceof AuthError || error instanceof EcommerceAdminServiceError) {
    return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
  }

  console.error(fallback, error);
  return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const data = await listEcommerceOrdersAdminService(session);

    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_ORDERS_ADMIN_LIST_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = (await req.json()) as { id?: unknown; data?: unknown };
    const orderId = parseEcommerceOrderId(body.id);
    const input = parseEcommerceOrderStatusInput(body.data);

    await updateEcommerceOrderStatusAdminService(session, orderId, input);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_ORDERS_ADMIN_UPDATE_ERROR:");
  }
}
