import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  UserValidationError,
  parseUpdateStaffUserTwoStepVerificationInput,
  parseUserIdParam,
} from "@/features/users/schemas";
import {
  UserServiceError,
  updateUserTwoStepVerificationService,
} from "@/features/users/service";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const userId = parseUserIdParam(idParam);

    const body = await req.json();
    const input = parseUpdateStaffUserTwoStepVerificationInput(body);

    const user = await updateUserTwoStepVerificationService(
      session,
      userId,
      input,
    );

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

    console.error("USER_UPDATE_TWO_STEP_VERIFICATION_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
