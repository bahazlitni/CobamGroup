import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  parseUpdateStaffUserProfileInput,
  parseUserIdParam,
  UserValidationError,
} from "@/features/users/schemas";
import {
  deleteUserService,
  getUserByIdService,
  updateUserProfileService,
  UserServiceError,
} from "@/features/users/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const userId = parseUserIdParam(idParam);

    const user = await getUserByIdService(session, userId);

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof UserValidationError ||
      error instanceof UserServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("USER_GET_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const userId = parseUserIdParam(idParam);

    const body = await req.json();
    const input = parseUpdateStaffUserProfileInput(body);

    const user = await updateUserProfileService(session, userId, input);

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof UserValidationError ||
      error instanceof UserServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("USER_UPDATE_PROFILE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const userId = parseUserIdParam(idParam);

    await deleteUserService(session, userId);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof UserValidationError ||
      error instanceof UserServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("USER_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
