import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { verifyPassword } from "@/lib/api/auth/shared/password";
import { OTP_CODE_LENGTH } from "@/lib/api/auth/otp/config";
import { generateOtpCode } from "@/lib/api/auth/otp/code";
import { hashOtpCode } from "@/lib/api/auth/otp/hash";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { STAFF_PORTAL } from "@/features/auth/types";
import { createTransporter } from "@/lib/nodemailer/create-transporter";
import { sendEmail } from "@/lib/nodemailer/send-email";
import { requiredEnv } from "@/lib/utils";
import buildPasswordChangeOtpCodeHtml from "@/lib/html-builders/buildPasswordChangeOtpCodeHtml";

export const runtime = "nodejs";

function parsePassword(value: unknown) {
  return String(value ?? "");
}

function validatePasswordChangeInput(input: {
  currentPassword: string;
  newPassword: string;
}) {
  if (!input.currentPassword || !input.newPassword) {
    return "Les deux mots de passe sont requis.";
  }

  if (input.newPassword.length < 8) {
    return "Le nouveau mot de passe doit contenir au moins 8 caracteres.";
  }

  if (input.currentPassword === input.newPassword) {
    return "Le nouveau mot de passe doit etre different de l'ancien.";
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const currentPassword = parsePassword(body.currentPassword);
    const newPassword = parsePassword(body.newPassword);
    const validationError = validatePasswordChangeInput({
      currentPassword,
      newPassword,
    });

    if (validationError) {
      return NextResponse.json(
        { ok: false, message: validationError },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
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

    const code = generateOtpCode(OTP_CODE_LENGTH);
    const codeHash = hashOtpCode(code);

    await prisma.oTPChallenge.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: "RESET_PASSWORD",
        },
      },
      update: {
        codeHash,
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        userId: user.id,
        type: "RESET_PASSWORD",
        codeHash,
      },
    });

    const transporter = createTransporter();
    await sendEmail(transporter, {
      fromEmail: requiredEnv("CONTACT_EMAIL"),
      fromName: process.env.CONTACT_NAME?.trim() || "Cobam Group",
      to: user.email,
      subject: "Confirmez votre changement de mot de passe | Cobam Group",
      text: `Votre code de confirmation Cobam Group est : ${code}`,
      html: buildPasswordChangeOtpCodeHtml(code),
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Code OTP envoyé.",
        email: user.email,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("STAFF_PASSWORD_OTP_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
