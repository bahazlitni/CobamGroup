import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createEcommercePromotionAdminService,
  deleteEcommercePromotionAdminService,
  EcommerceAdminServiceError,
  listEcommercePromotionsAdminService,
  parseEcommercePromotionId,
  parseEcommercePromotionInput,
  updateEcommercePromotionAdminService,
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
    const data = await listEcommercePromotionsAdminService(session);

    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_PROMOTIONS_ADMIN_LIST_ERROR:");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const item = await createEcommercePromotionAdminService(
      session,
      parseEcommercePromotionInput(await req.json()),
    );

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_PROMOTIONS_ADMIN_CREATE_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const record = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
    const item = await updateEcommercePromotionAdminService(
      session,
      parseEcommercePromotionId(record.id),
      parseEcommercePromotionInput(record.data),
    );

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_PROMOTIONS_ADMIN_UPDATE_ERROR:");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);

    await deleteEcommercePromotionAdminService(
      session,
      parseEcommercePromotionId(searchParams.get("id")),
    );

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_PROMOTIONS_ADMIN_DELETE_ERROR:");
  }
}
