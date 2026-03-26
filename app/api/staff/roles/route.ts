import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { RoleValidationError, parseRoleMutationInput } from "@/features/roles/schemas";
import { createRoleService, listRolesService, RoleServiceError } from "@/features/roles/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const result = await listRolesService(session);

    return NextResponse.json({ ok: true, items: result.items, total: result.total });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof RoleServiceError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("ROLES_LIST_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const input = parseRoleMutationInput(body);
    const role = await createRoleService(session, input);

    return NextResponse.json({ ok: true, role }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof RoleValidationError ||
      error instanceof RoleServiceError
    ) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("ROLE_CREATE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
