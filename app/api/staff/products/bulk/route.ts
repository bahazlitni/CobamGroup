import { NextResponse } from "next/server";
import { AuthError } from "@/lib/server/auth/errors";
import { getStaffSession } from "@/lib/server/auth/staff-session";
import { ProductServiceError } from "@/features/products/service";
import {
  deleteProductFamiliesBulkService,
  updateProductFamiliesBulkService,
} from "@/features/products/bulk";

function parseIds(input: unknown): number[] {
  if (!input || typeof input !== "object" || !("ids" in input)) {
    throw new ProductServiceError("Identifiants invalides.", 400);
  }

  const ids = (input as { ids?: unknown }).ids;
  if (!Array.isArray(ids)) {
    throw new ProductServiceError("Identifiants invalides.", 400);
  }

  const parsed = ids
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (parsed.length === 0) {
    throw new ProductServiceError("Identifiants invalides.", 400);
  }

  return parsed;
}

export async function POST(req: Request) {
  try {
    const session = await getStaffSession();
    const payload = (await req.json()) as Record<string, unknown>;
    const ids = parseIds(payload);
    const data = (payload as { data?: unknown }).data;

    if (!data || typeof data !== "object") {
      throw new ProductServiceError("Donnees invalides.", 400);
    }

    await updateProductFamiliesBulkService(session, ids, data as any);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
    }

    if (error instanceof ProductServiceError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("PRODUCT_FAMILIES_BULK_UPDATE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getStaffSession();
    const payload = (await req.json()) as Record<string, unknown>;
    const ids = parseIds(payload);

    await deleteProductFamiliesBulkService(session, ids);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
    }

    if (error instanceof ProductServiceError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("PRODUCT_FAMILIES_BULK_DELETE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
