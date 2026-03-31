import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductAttributeMetadataSuggestQuery,
  ProductAttributeMetadataValidationError,
} from "@/features/product-attribute-metadata/schemas";
import {
  ProductAttributeMetadataServiceError,
  suggestProductAttributeMetadataService,
} from "@/features/product-attribute-metadata/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseProductAttributeMetadataSuggestQuery(searchParams);
    const items = await suggestProductAttributeMetadataService(session, query);

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

    console.error("PRODUCT_ATTRIBUTE_METADATA_SUGGEST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
