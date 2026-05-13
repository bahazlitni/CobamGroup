import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createOrganizationService,
  deleteOrganizationService,
  listOrganizationsService,
  OrganizationServiceError,
  parseOrganizationId,
  parseOrganizationInput,
  updateOrganizationService,
} from "@/features/organizations/service";

function jsonError(error: unknown, fallback: string) {
  if (error instanceof AuthError || error instanceof OrganizationServiceError) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: error.status },
    );
  }

  console.error(fallback, error);
  return NextResponse.json(
    { ok: false, message: "Internal server error" },
    { status: 500 },
  );
}

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const items = await listOrganizationsService(session);

    return NextResponse.json({ ok: true, items });
  } catch (error: unknown) {
    return jsonError(error, "ORGANIZATIONS_LIST_ERROR:");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const input = parseOrganizationInput(await req.json());
    const item = await createOrganizationService(session, input);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error, "ORGANIZATION_CREATE_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const id = parseOrganizationId(body.id);
    const item = await updateOrganizationService(
      session,
      id,
      parseOrganizationInput(body.data),
    );

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    return jsonError(error, "ORGANIZATION_UPDATE_ERROR:");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const id = parseOrganizationId(searchParams.get("id"));

    await deleteOrganizationService(session, id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "ORGANIZATION_DELETE_ERROR:");
  }
}
