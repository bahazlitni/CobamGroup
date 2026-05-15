import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  EcommerceAdminServiceError,
  listEcommercePaymentsAdminService,
  parseEcommercePaymentId,
  parseEcommercePaymentStatusInput,
  updateEcommercePaymentStatusAdminService,
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
    const data = await listEcommercePaymentsAdminService(session);

    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_PAYMENTS_ADMIN_LIST_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = (await req.json()) as { id?: unknown; data?: unknown };
    const paymentId = parseEcommercePaymentId(body.id);
    const input = parseEcommercePaymentStatusInput(body.data);

    await updateEcommercePaymentStatusAdminService(session, paymentId, input);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_PAYMENTS_ADMIN_UPDATE_ERROR:");
  }
}
