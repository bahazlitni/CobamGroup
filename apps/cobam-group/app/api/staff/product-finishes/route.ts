import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createProductFinishService,
  deleteProductFinishService,
  listProductFinishesService,
  parseFinishInput,
  parseProductTaxonomyId,
  ProductTaxonomyServiceError,
  updateProductFinishService,
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
    const items = await listProductFinishesService(session);

    return NextResponse.json({ ok: true, items });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_FINISHES_LIST_ERROR:");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const input = parseFinishInput(await req.json());
    const item = await createProductFinishService(session, input);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_FINISH_CREATE_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const id = parseProductTaxonomyId(body.id);
    const item = await updateProductFinishService(
      session,
      id,
      parseFinishInput(body.data),
    );

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_FINISH_UPDATE_ERROR:");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const id = parseProductTaxonomyId(searchParams.get("id"));

    await deleteProductFinishService(session, id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_FINISH_DELETE_ERROR:");
  }
}
