import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createProductAttributeDefinitionService,
  deleteProductAttributeDefinitionService,
  listProductAttributeDefinitionsService,
  parseAttributeDefinitionInput,
  parseProductTaxonomyId,
  ProductTaxonomyServiceError,
  updateProductAttributeDefinitionService,
} from "@/features/product-taxonomy/service";

function jsonError(error: unknown, fallback: string) {
  if (error instanceof AuthError || error instanceof ProductTaxonomyServiceError) {
    return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
  }

  console.error(fallback, error);
  return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const items = await listProductAttributeDefinitionsService(session);

    return NextResponse.json({ ok: true, items });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_ATTRIBUTE_DEFINITIONS_LIST_ERROR:");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const input = parseAttributeDefinitionInput(await req.json());
    const item = await createProductAttributeDefinitionService(session, input);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_ATTRIBUTE_DEFINITION_CREATE_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const id = parseProductTaxonomyId(body.id);
    const item = await updateProductAttributeDefinitionService(
      session,
      id,
      parseAttributeDefinitionInput(body.data),
    );

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_ATTRIBUTE_DEFINITION_UPDATE_ERROR:");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const id = parseProductTaxonomyId(searchParams.get("id"));

    await deleteProductAttributeDefinitionService(session, id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_ATTRIBUTE_DEFINITION_DELETE_ERROR:");
  }
}
