import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/api/auth/shared/password-reset-token";
import { STAFF_PASSWORD_RESET_TOKEN_TTL_MS } from "@/lib/api/auth/otp/config";
import { STAFF_PORTAL } from "@/features/auth/types";
import { createTransporter } from "@/lib/nodemailer/create-transporter";
import { sendEmail } from "@/lib/nodemailer/send-email";
import { requiredEnv } from "@/lib/utils";
import buildStaffPasswordResetMagicLinkHtml from "@/lib/html-builders/buildStaffPasswordResetMagicLinkHtml";

export const runtime = "nodejs";

const RESET_REQUEST_COOLDOWN_MS = 60_000;
const GENERIC_RESPONSE = {
  ok: true,
  message: "Si ce compte existe, un lien de réinitialisation vient d'être envoyé.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        portal: true,
      },
    });

    if (!user || user.portal !== STAFF_PORTAL) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const now = new Date();
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        createdAt: {
          gt: new Date(now.getTime() - RESET_REQUEST_COOLDOWN_MS),
        },
      },
      select: { id: true },
    });

    if (recentToken) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(now.getTime() + STAFF_PASSWORD_RESET_TOKEN_TTL_MS);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = new URL(
      `/login/staff/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`,
      req.url,
    ).toString();
    const transporter = createTransporter();

    await sendEmail(transporter, {
      fromEmail: requiredEnv("CONTACT_EMAIL"),
      fromName: process.env.CONTACT_NAME?.trim() || "Cobam Group",
      to: user.email,
      subject: "Reinitialisation de votre mot de passe | Cobam Group",
      text: `Pour reinitialiser votre mot de passe, ouvrez ce lien : ${resetUrl}`,
      html: buildStaffPasswordResetMagicLinkHtml(resetUrl),
    });

    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  } catch (error) {
    console.error("STAFF_FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  }
}
