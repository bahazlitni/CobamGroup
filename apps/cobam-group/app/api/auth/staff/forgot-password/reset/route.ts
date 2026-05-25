import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { hashPassword } from "@/lib/api/auth/shared/password";
import { hashPasswordResetToken } from "@/lib/api/auth/shared/password-reset-token";
import { STAFF_PORTAL } from "@/features/auth/types";

export const runtime = "nodejs";

function parsePassword(value: unknown) {
  return String(value ?? "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const token = String(body?.token ?? "").trim();
    const newPassword = parsePassword(body?.newPassword);

    if (!token || !newPassword) {
      return NextResponse.json(
        { ok: false, message: "Lien et nouveau mot de passe requis." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          message: "Le nouveau mot de passe doit contenir au moins 8 caracteres.",
        },
        { status: 400 },
      );
    }

    const tokenHash = hashPasswordResetToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        consumedAt: true,
        user: {
          select: {
            id: true,
            portal: true,
          },
        },
      },
    });

    if (
      !resetToken ||
      resetToken.consumedAt ||
      resetToken.expiresAt < new Date() ||
      resetToken.user.portal !== STAFF_PORTAL
    ) {
      return NextResponse.json({ ok: false, message: "Lien invalide ou expire." }, { status: 401 });
    }

    const now = new Date();
    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          passwordChangedAt: now,
        },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          consumedAt: null,
        },
        data: { consumedAt: now },
      }),
      prisma.refreshToken.updateMany({
        where: {
          userId: resetToken.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("STAFF_FORGOT_PASSWORD_RESET_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
