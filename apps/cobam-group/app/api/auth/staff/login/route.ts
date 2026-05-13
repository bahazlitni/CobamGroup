// /api/auth/staff/login/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { verifyPassword } from "@/lib/api/auth/shared/password";
import { STAFF_PORTAL } from "@/features/auth/types";
import { ensureRbacBootstrap } from "@/features/rbac/bootstrap";
import { OTP_CODE_LENGTH } from "@/lib/api/auth/otp/config";
import { generateOtpCode } from "@/lib/api/auth/otp/code";
import { hashOtpCode } from "@/lib/api/auth/otp/hash";
import { requiredEnv } from "@/lib/utils";
import { createTransporter } from "@/lib/nodemailer/create-transporter";
import { sendEmail } from "@/lib/nodemailer/send-email";
import buildLoginOtpCodeHtml from "@/lib/html-builders/buildLoginOtpCodeHtml";
import { createStaffLoginResponse } from "@/features/auth/server/staff-login-response";

export const runtime = "nodejs";

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
        twoStepVerificationEnabled: true,
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

    if (!user.twoStepVerificationEnabled) {
      return createStaffLoginResponse(user, {
        body: { requiresOtp: false },
        clearLoginOtpChallenge: true,
      });
    }

    const code = generateOtpCode(OTP_CODE_LENGTH);
    const codeHash = hashOtpCode(code);

    await prisma.oTPChallenge.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: "LOGIN",
        },
      },
      update: {
        codeHash,
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        userId: user.id,
        type: "LOGIN",
        codeHash,
      },
    });

    const transporter = createTransporter();
    await sendEmail(transporter, {
      fromEmail: requiredEnv("CONTACT_EMAIL"),
      fromName: process.env.CONTACT_NAME?.trim() || "Cobam Group",
      to: user.email,
      subject: "Votre code de connexion | Cobam Group",
      text: `Votre code de connexion Cobam Group est : ${code}`,
      html: buildLoginOtpCodeHtml(code),
    });

    return NextResponse.json({
      ok: true,
      requiresOtp: true,
      message: "Code OTP envoyé.",
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
