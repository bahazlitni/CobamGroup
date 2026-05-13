import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { parseRoleIdParam, parseRoleMutationInput, RoleValidationError } from "@/features/roles/schemas";
import {
  deleteRoleService,
  getRoleByIdService,
  RoleServiceError,
  updateRoleService,
} from "@/features/roles/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const role = await getRoleByIdService(session, parseRoleIdParam(id));

    return NextResponse.json({ ok: true, role });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof RoleValidationError ||
      error instanceof RoleServiceError
    ) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("ROLE_GET_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    const body = await req.json();
    const input = parseRoleMutationInput(body);
    const role = await updateRoleService(session, parseRoleIdParam(id), input);

    return NextResponse.json({ ok: true, role });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof RoleValidationError ||
      error instanceof RoleServiceError
    ) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("ROLE_UPDATE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id } = await params;
    await deleteRoleService(session, parseRoleIdParam(id));

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof RoleValidationError ||
      error instanceof RoleServiceError
    ) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("ROLE_DELETE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
