import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createTaxonomyAttributeGroupService,
  createTaxonomyAttributeService,
  createTaxonomyGroupService,
  createTaxonomyProductTypeService,
  deleteTaxonomyAttributeGroupService,
  deleteTaxonomyAttributeService,
  deleteTaxonomyGroupService,
  deleteTaxonomyProductTypeService,
  listProductTypesAdminService,
  parseAttributeGroupInput,
  parseAttributeInput,
  parseGroupInput,
  parseProductTaxonomyOrder,
  parseProductTaxonomyEntity,
  parseProductTaxonomyId,
  parseProductTypeInput,
  ProductTaxonomyServiceError,
  reorderTaxonomyGroupsService,
  reorderTaxonomyProductTypesService,
  updateTaxonomyAttributeGroupService,
  updateTaxonomyAttributeService,
  updateTaxonomyGroupService,
  updateTaxonomyProductTypeService,
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
    const data = await listProductTypesAdminService(session);

    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_TYPES_ADMIN_LIST_ERROR:");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const entity = parseProductTaxonomyEntity(body.entity);

    if (entity === "group") {
      const item = await createTaxonomyGroupService(session, parseGroupInput(body.data));
      return NextResponse.json({ ok: true, item }, { status: 201 });
    }

    if (entity === "productType") {
      const item = await createTaxonomyProductTypeService(
        session,
        parseProductTypeInput(body.data),
      );
      return NextResponse.json({ ok: true, item }, { status: 201 });
    }

    if (entity === "attributeGroup") {
      const item = await createTaxonomyAttributeGroupService(
        session,
        parseAttributeGroupInput(body.data),
      );
      return NextResponse.json({ ok: true, item }, { status: 201 });
    }

    const item = await createTaxonomyAttributeService(session, parseAttributeInput(body.data));
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_TYPES_ADMIN_CREATE_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const entity = parseProductTaxonomyEntity(body.entity);
    const id = parseProductTaxonomyId(body.id);

    if (entity === "group") {
      const item = await updateTaxonomyGroupService(session, id, parseGroupInput(body.data));
      return NextResponse.json({ ok: true, item });
    }

    if (entity === "productType") {
      const item = await updateTaxonomyProductTypeService(
        session,
        id,
        parseProductTypeInput(body.data),
      );
      return NextResponse.json({ ok: true, item });
    }

    if (entity === "attributeGroup") {
      const item = await updateTaxonomyAttributeGroupService(
        session,
        id,
        parseAttributeGroupInput(body.data),
      );
      return NextResponse.json({ ok: true, item });
    }

    const item = await updateTaxonomyAttributeService(session, id, parseAttributeInput(body.data));
    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_TYPES_ADMIN_UPDATE_ERROR:");
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const order = parseProductTaxonomyOrder(body.order);

    if (body.action === "reorderGroups") {
      const data = await reorderTaxonomyGroupsService(session, order);
      return NextResponse.json({ ok: true, ...data });
    }

    if (body.action === "reorderProductTypes") {
      const data = await reorderTaxonomyProductTypesService(session, order);
      return NextResponse.json({ ok: true, ...data });
    }

    return NextResponse.json({ ok: false, message: "Action invalide." }, { status: 400 });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_TYPES_ADMIN_REORDER_ERROR:");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const entity = parseProductTaxonomyEntity(searchParams.get("entity"));
    const id = parseProductTaxonomyId(searchParams.get("id"));

    if (entity === "group") {
      await deleteTaxonomyGroupService(session, id);
    } else if (entity === "productType") {
      await deleteTaxonomyProductTypeService(session, id);
    } else if (entity === "attributeGroup") {
      await deleteTaxonomyAttributeGroupService(session, id);
    } else {
      await deleteTaxonomyAttributeService(session, id);
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_TYPES_ADMIN_DELETE_ERROR:");
  }
}
