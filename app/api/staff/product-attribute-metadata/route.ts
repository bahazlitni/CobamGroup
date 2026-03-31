import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductAttributeMetadataInput,
  ProductAttributeMetadataValidationError,
} from "@/features/product-attribute-metadata/schemas";
import {
  createProductAttributeMetadataService,
  listProductAttributeMetadataService,
  ProductAttributeMetadataServiceError,
} from "@/features/product-attribute-metadata/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const items = await listProductAttributeMetadataService(session);

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductAttributeMetadataServiceError ||
      error instanceof ProductAttributeMetadataValidationError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_ATTRIBUTE_METADATA_LIST_ERROR:", error);
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
    const input = parseProductAttributeMetadataInput(body);
    const item = await createProductAttributeMetadataService(session, input);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ProductAttributeMetadataServiceError ||
      error instanceof ProductAttributeMetadataValidationError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PRODUCT_ATTRIBUTE_METADATA_CREATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
