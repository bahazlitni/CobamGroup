import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createEcommerceCouponAdminService,
  deleteEcommerceCouponAdminService,
  EcommerceAdminServiceError,
  parseEcommerceCouponId,
  parseEcommerceCouponInput,
  parseEcommercePromotionId,
  updateEcommerceCouponAdminService,
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const item = await createEcommerceCouponAdminService(
      session,
      parseEcommercePromotionId(id),
      parseEcommerceCouponInput(await req.json()),
    );

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_COUPON_ADMIN_CREATE_ERROR:");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const body = await req.json();
    const record = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
    const item = await updateEcommerceCouponAdminService(
      session,
      parseEcommercePromotionId(id),
      parseEcommerceCouponId(record.id),
      parseEcommerceCouponInput(record.data),
    );

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_COUPON_ADMIN_UPDATE_ERROR:");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    await deleteEcommerceCouponAdminService(
      session,
      parseEcommercePromotionId(id),
      parseEcommerceCouponId(searchParams.get("couponId")),
    );

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "ECOMMERCE_COUPON_ADMIN_DELETE_ERROR:");
  }
}
