import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductFamilyGroupingInput,
  parseProductPickerQuery,
  ProductValidationError,
} from "@/features/products/schemas";
import {
  groupExistingProductsIntoFamilyService,
  listProductFamilyGroupingCandidatesService,
  ProductServiceError,
} from "@/features/products/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseProductPickerQuery(searchParams);
    const result = await listProductFamilyGroupingCandidatesService(session, query);

    return NextResponse.json(
      {
        ok: true,
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
      { status: 200 },
    );
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

    console.error("PRODUCT_FAMILY_GROUPING_CANDIDATES_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const input = parseProductFamilyGroupingInput(body);
    const product = await groupExistingProductsIntoFamilyService(session, input);

    return NextResponse.json({ ok: true, product }, { status: 201 });
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

    console.error("PRODUCT_FAMILY_GROUPING_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
