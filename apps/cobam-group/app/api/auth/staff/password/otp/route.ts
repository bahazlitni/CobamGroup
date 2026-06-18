import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { verifyPassword } from "@/lib/api/auth/shared/password";
import {
  OTP_CODE_LENGTH,
  OTP_RESEND_COOLDOWN_MS,
  OTP_RULES,
  STAFF_PASSWORD_OTP_CHALLENGE_COOKIE,
} from "@/lib/api/auth/otp/config";
import { generateOtpCode } from "@/lib/api/auth/otp/code";
import { hashOtpCode } from "@/lib/api/auth/otp/hash";
import {
  encodeOtpChallengeCookie,
  generateOtpChallengeSecret,
  hashOtpChallengeSecret,
  parseOtpChallengeCookie,
} from "@/lib/api/auth/otp/challenge-token";
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

function validatePasswordChangeInput(input: { currentPassword: string; newPassword: string }) {
  if (!input.currentPassword || !input.newPassword) {
    return "Les deux mots de passe sont requis.";
  }

  if (input.newPassword.length < 8) {
    return "Le nouveau mot de passe doit contenir au moins 8 caracteres.";
  }

  if (input.currentPassword === input.newPassword) {
    return "Le nouveau mot de passe doit être different de l'ancien.";
  }

  return null;
}

function cooldownPayload(createdAt: Date, now: Date) {
  const resendAvailableAtMs = new Date(createdAt).getTime() + OTP_RESEND_COOLDOWN_MS;
  const cooldownRemainingMs = Math.max(0, resendAvailableAtMs - now.getTime());

  return {
    cooldownSeconds: Math.ceil(cooldownRemainingMs / 1000),
    resendAvailableAt: new Date(resendAvailableAtMs).toISOString(),
  };
}

function setPasswordOtpCookie(response: NextResponse, value: string) {
  response.cookies.set(STAFF_PASSWORD_OTP_CHALLENGE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.ceil(OTP_RULES.RESET_PASSWORD.ttlMs / 1000),
  });
}

async function getCookieBoundPasswordChallenge(req: NextRequest, userId: string) {
  const parsed = parseOtpChallengeCookie(
    req.cookies.get(STAFF_PASSWORD_OTP_CHALLENGE_COOKIE)?.value,
  );

  if (!parsed) {
    return null;
  }

  return prisma.oTPChallenge.findFirst({
    where: {
      id: parsed.challengeId,
      userId,
      type: "RESET_PASSWORD",
      challengeTokenHash: hashOtpChallengeSecret(parsed.secret),
      consumedAt: null,
    },
  });
}

async function sendPasswordOtpEmail(email: string, code: string) {
  const transporter = createTransporter();

  await sendEmail(transporter, {
    fromEmail: requiredEnv("CONTACT_EMAIL"),
    fromName: process.env.CONTACT_NAME?.trim() || "Cobam Group",
    to: email,
    subject: "Confirmez votre changement de mot de passe | Cobam Group",
    text: `Votre code de confirmation Cobam Group est : ${code}`,
    html: buildPasswordChangeOtpCodeHtml(code),
  });
}

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ ok: false, message: validationError }, { status: 400 });
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
      return NextResponse.json({ ok: false, message: "Utilisateur introuvable." }, { status: 404 });
    }

    const matches = await verifyPassword(currentPassword, user.passwordHash);

    if (!matches) {
      return NextResponse.json(
        { ok: false, message: "Mot de passe actuel incorrect." },
        { status: 401 },
      );
    }

    const now = new Date();
    const existingChallenge = await getCookieBoundPasswordChallenge(req, user.id);

    if (existingChallenge) {
      const activeExpiresAt =
        existingChallenge.expiresAt ??
        new Date(new Date(existingChallenge.createdAt).getTime() + OTP_RULES.RESET_PASSWORD.ttlMs);
      const cooldown = cooldownPayload(existingChallenge.createdAt, now);

      if (activeExpiresAt > now && cooldown.cooldownSeconds > 0) {
        return NextResponse.json(
          {
            ok: true,
            message: "Un code OTP est déjà actif. Continuez avec le code reçu.",
            email: user.email,
            ...cooldown,
          },
          { status: 200 },
        );
      }

      const code = generateOtpCode(OTP_CODE_LENGTH);
      await prisma.oTPChallenge.update({
        where: { id: existingChallenge.id },
        data: {
          codeHash: hashOtpCode(code),
          attempts: 0,
          createdAt: now,
          expiresAt: new Date(now.getTime() + OTP_RULES.RESET_PASSWORD.ttlMs),
          consumedAt: null,
        },
      });

      await sendPasswordOtpEmail(user.email, code);

      const response = NextResponse.json(
        {
          ok: true,
          message: "Code OTP envoyé.",
          email: user.email,
          ...cooldownPayload(now, now),
        },
        { status: 200 },
      );
      const cookieValue = req.cookies.get(STAFF_PASSWORD_OTP_CHALLENGE_COOKIE)?.value;

      if (cookieValue) {
        setPasswordOtpCookie(response, cookieValue);
      }

      return response;
    }

    const secret = generateOtpChallengeSecret();
    const code = generateOtpCode(OTP_CODE_LENGTH);
    const challenge = await prisma.oTPChallenge.create({
      data: {
        userId: user.id,
        type: "RESET_PASSWORD",
        codeHash: hashOtpCode(code),
        challengeTokenHash: hashOtpChallengeSecret(secret),
        expiresAt: new Date(now.getTime() + OTP_RULES.RESET_PASSWORD.ttlMs),
      },
      select: { id: true },
    });

    await sendPasswordOtpEmail(user.email, code);

    const response = NextResponse.json(
      {
        ok: true,
        message: "Code OTP envoyé.",
        email: user.email,
        ...cooldownPayload(now, now),
      },
      { status: 200 },
    );

    setPasswordOtpCookie(response, encodeOtpChallengeCookie(challenge.id, secret));

    return response;
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    console.error("STAFF_PASSWORD_OTP_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
