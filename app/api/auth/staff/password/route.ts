// /api/auth/staff/login/password.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import {
  hashPassword,
  verifyPassword,
} from "@/lib/api/auth/shared/password";
import { hashOtpCode } from "@/lib/api/auth/otp/hash";
import { OTP_RULES } from "@/lib/api/auth/otp/config";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { STAFF_PORTAL } from "@/features/auth/types";

function parsePassword(value: unknown) {
  return String(value ?? "");
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();

    const currentPassword = parsePassword(body.currentPassword);
    const newPassword = parsePassword(body.newPassword);
    const code = String(body.code ?? body.otpCode ?? "").trim();

    if (!currentPassword || !newPassword || !code) {
      return NextResponse.json(
        { ok: false, message: "Les mots de passe et le code OTP sont requis." },
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

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          ok: false,
          message: "Le nouveau mot de passe doit etre different de l'ancien.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        portal: true,
        passwordHash: true,
      },
    });

    if (!user || user.portal !== STAFF_PORTAL) {
      return NextResponse.json(
        { ok: false, message: "Utilisateur introuvable." },
        { status: 404 },
      );
    }

    const matches = await verifyPassword(currentPassword, user.passwordHash);

    if (!matches) {
      return NextResponse.json(
        { ok: false, message: "Mot de passe actuel incorrect." },
        { status: 401 },
      );
    }

    const challenge = await prisma.oTPChallenge.findUnique({
      where: {
        userId_type: {
          userId: user.id,
          type: "RESET_PASSWORD",
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { ok: false, message: "Code OTP invalide ou expire." },
        { status: 401 },
      );
    }

    const rules = OTP_RULES.RESET_PASSWORD;

    if (
      new Date(challenge.createdAt).getTime() + rules.ttlMs <
      new Date().getTime()
    ) {
      await prisma.oTPChallenge.delete({
        where: { id: challenge.id },
      });

      return NextResponse.json(
        { ok: false, message: "Code OTP expire." },
        { status: 401 },
      );
    }

    if (challenge.attempts >= rules.maxAttempts) {
      await prisma.oTPChallenge.delete({
        where: { id: challenge.id },
      });

      return NextResponse.json(
        { ok: false, message: "Trop de tentatives. Veuillez recommencer." },
        { status: 429 },
      );
    }

    const codeHash = hashOtpCode(code);

    if (challenge.codeHash !== codeHash) {
      await prisma.oTPChallenge.update({
        where: { id: challenge.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      return NextResponse.json(
        { ok: false, message: "Code OTP invalide." },
        { status: 401 },
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
        },
      }),
      prisma.oTPChallenge.delete({
        where: { id: challenge.id },
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("STAFF_PASSWORD_CHANGE_ERROR:", error);

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
