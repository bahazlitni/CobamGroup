import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { parseProductIdParam, ProductValidationError } from "@/features/products/schemas";
import {
  dissolveProductFamilyService,
  ProductServiceError,
} from "@/features/products/service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const familyId = parseProductIdParam(idParam);
    const result = await dissolveProductFamilyService(session, familyId);

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductValidationError ||
      error instanceof ProductServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_FAMILY_DISSOLVE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
