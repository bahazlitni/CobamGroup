import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  BrandValidationError,
  parseBrandIdParam,
  parseBrandUpdateInput,
} from "@/features/brands/schemas";
import {
  BrandServiceError,
  deleteBrandService,
  getBrandByIdService,
  updateBrandService,
} from "@/features/brands/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const brandId = parseBrandIdParam(idParam);

    const brand = await getBrandByIdService(session, brandId);

    return NextResponse.json({ ok: true, brand }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof BrandValidationError ||
      error instanceof BrandServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("BRAND_GET_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const brandId = parseBrandIdParam(idParam);
    const body = await req.json();
    const input = parseBrandUpdateInput(body);

    const brand = await updateBrandService(session, brandId, input);

    return NextResponse.json({ ok: true, brand }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof BrandValidationError ||
      error instanceof BrandServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("BRAND_UPDATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const brandId = parseBrandIdParam(idParam);

    await deleteBrandService(session, brandId);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof BrandValidationError ||
      error instanceof BrandServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("BRAND_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
