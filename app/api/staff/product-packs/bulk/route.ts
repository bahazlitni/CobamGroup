import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  ProductPackServiceError,
  deleteProductPacksBulkService,
  updateProductPacksBulkService,
} from "@/features/product-packs/service";

function parseIds(input: unknown): number[] {
  if (!input || typeof input !== "object" || !("ids" in input)) {
    throw new ProductPackServiceError("Identifiants invalides.", 400);
  }

  const ids = (input as { ids?: unknown }).ids;
  if (!Array.isArray(ids)) {
    throw new ProductPackServiceError("Identifiants invalides.", 400);
  }

  const parsed = ids
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (parsed.length === 0) {
    throw new ProductPackServiceError("Identifiants invalides.", 400);
  }

  return parsed;
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const payload = (await req.json()) as Record<string, unknown>;
    const ids = parseIds(payload);
    const data = (payload as { data?: unknown }).data;

    if (!data || typeof data !== "object") {
      throw new ProductPackServiceError("Donnees invalides.", 400);
    }

    await updateProductPacksBulkService(session, ids, data as any);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
    }

    if (error instanceof ProductPackServiceError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("PRODUCT_PACKS_BULK_UPDATE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const payload = (await req.json()) as Record<string, unknown>;
    const ids = parseIds(payload);

    await deleteProductPacksBulkService(session, ids);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
    }

    if (error instanceof ProductPackServiceError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("PRODUCT_PACKS_BULK_DELETE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
