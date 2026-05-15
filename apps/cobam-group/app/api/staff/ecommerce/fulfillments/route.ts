import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  EcommerceAdminServiceError,
  listEcommerceFulfillmentsAdminService,
  parseEcommerceFulfillmentId,
  parseEcommerceFulfillmentStatusInput,
  updateEcommerceFulfillmentStatusAdminService,
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
    const data = await listEcommerceFulfillmentsAdminService(session);

    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_FULFILLMENTS_ADMIN_LIST_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = (await req.json()) as { id?: unknown; data?: unknown };
    const fulfillmentId = parseEcommerceFulfillmentId(body.id);
    const input = parseEcommerceFulfillmentStatusInput(body.data);

    await updateEcommerceFulfillmentStatusAdminService(session, fulfillmentId, input);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_FULFILLMENTS_ADMIN_UPDATE_ERROR:");
  }
}
