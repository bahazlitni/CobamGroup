import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { verifyPassword } from "@/lib/api/auth/shared/password";
import { signAccessToken, signRefreshToken } from "@/lib/api/auth/shared/jwt";
import { sha256 } from "@/lib/api/auth/shared/token";
import { v4 as uuidv4 } from "uuid";
import { STAFF_PORTAL } from "@/features/auth/types";
import { getStaffSessionByUserId } from "@/features/auth/server/session";
import { ensureRbacBootstrap } from "@/features/rbac/bootstrap";

export async function POST(req: Request) {
  try {
    await ensureRbacBootstrap();

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Missing email or password" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        portal: true,
      },
    });

    if (!user || user.portal !== STAFF_PORTAL) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const validPassword = await verifyPassword(password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const tokenId = uuidv4();

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      portal: user.portal,
    });

    const refreshToken = await signRefreshToken({
      userId: user.id,
      tokenId,
    });

    const refreshTokenHash = sha256(refreshToken);

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const session = await getStaffSessionByUserId(user.id);

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Impossible de charger la session staff" },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      ok: true,
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
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
