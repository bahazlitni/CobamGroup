import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { signAccessToken, signRefreshToken } from "@/lib/api/auth/shared/jwt";
import { sha256 } from "@/lib/api/auth/shared/token";
import { prisma } from "@/lib/server/db/prisma";
import { STAFF_PORTAL } from "@/features/auth/types";
import { getStaffSessionByUserId } from "@/features/auth/server/session";

type StaffLoginUser = {
  id: string;
  email: string;
  portal: string;
};

export async function createStaffLoginResponse(
  user: StaffLoginUser,
  options: {
    body?: Record<string, unknown>;
    clearLoginOtpChallenge?: boolean;
  } = {},
) {
  if (user.portal !== STAFF_PORTAL) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }

  const tokenId = uuidv4();
  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
    portal: STAFF_PORTAL,
  });
  const refreshToken = await signRefreshToken({
    userId: user.id,
    tokenId,
  });
  const refreshTokenHash = sha256(refreshToken);

  await prisma.$transaction([
    ...(options.clearLoginOtpChallenge
      ? [
          prisma.oTPChallenge.deleteMany({
            where: {
              userId: user.id,
              type: "LOGIN",
            },
          }),
        ]
      : []),
    prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    }),
  ]);

  const session = await getStaffSessionByUserId(user.id);

  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Impossible de charger la session staff." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    ...options.body,
    accessToken,
    user: session,
  });

  response.cookies.set("staff_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
