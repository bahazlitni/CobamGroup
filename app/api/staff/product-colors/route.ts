import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createProductColorService,
  deleteProductColorService,
  listProductColorsService,
  parseColorInput,
  parseProductTaxonomyId,
  ProductTaxonomyServiceError,
  updateProductColorService,
} from "@/features/product-taxonomy/service";

function jsonError(error: unknown, fallback: string) {
  if (error instanceof AuthError || error instanceof ProductTaxonomyServiceError) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: error.status },
    );
  }

  console.error(fallback, error);
  return NextResponse.json(
    { ok: false, message: "Internal server error" },
    { status: 500 },
  );
}

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const items = await listProductColorsService(session);

    return NextResponse.json({ ok: true, items });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_COLORS_LIST_ERROR:");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const input = parseColorInput(await req.json());
    const item = await createProductColorService(session, input);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_COLOR_CREATE_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const id = parseProductTaxonomyId(body.id);
    const item = await updateProductColorService(
      session,
      id,
      parseColorInput(body.data),
    );

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_COLOR_UPDATE_ERROR:");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const id = parseProductTaxonomyId(searchParams.get("id"));

    await deleteProductColorService(session, id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_COLOR_DELETE_ERROR:");
  }
}
