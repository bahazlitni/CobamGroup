import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseProductAttributeMetadataIdParam,
  parseProductAttributeMetadataInput,
  ProductAttributeMetadataValidationError,
} from "@/features/product-attribute-metadata/schemas";
import {
  deleteProductAttributeMetadataService,
  ProductAttributeMetadataServiceError,
  updateProductAttributeMetadataService,
} from "@/features/product-attribute-metadata/service";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const metadataId = parseProductAttributeMetadataIdParam(id);
    const body = await req.json();
    const input = parseProductAttributeMetadataInput(body);
    const item = await updateProductAttributeMetadataService(
      session,
      metadataId,
      input,
    );

    return NextResponse.json({ ok: true, item }, { status: 200 });
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

    console.error("PRODUCT_ATTRIBUTE_METADATA_UPDATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const metadataId = parseProductAttributeMetadataIdParam(id);
    await deleteProductAttributeMetadataService(session, metadataId);

    return NextResponse.json({ ok: true }, { status: 200 });
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

    console.error("PRODUCT_ATTRIBUTE_METADATA_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
