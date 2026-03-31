import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductFinishInput,
  ProductFinishValidationError,
} from "@/features/product-finishes/schemas";
import {
  createProductFinishService,
  listProductFinishesService,
  ProductFinishServiceError,
} from "@/features/product-finishes/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const items = await listProductFinishesService(session);

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductFinishServiceError ||
      error instanceof ProductFinishValidationError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_FINISH_LIST_ERROR:", error);
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
    const input = parseProductFinishInput(body);
    const item = await createProductFinishService(session, input);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductFinishServiceError ||
      error instanceof ProductFinishValidationError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_FINISH_CREATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
