// /api/auth/staff/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { verifyPassword } from "@/lib/api/auth/shared/password";
import { STAFF_PORTAL } from "@/features/auth/types";
import { ensureRbacBootstrap } from "@/features/rbac/bootstrap";
import {
  OTP_CODE_LENGTH,
  OTP_RESEND_COOLDOWN_MS,
  OTP_RULES,
  STAFF_LOGIN_OTP_CHALLENGE_COOKIE,
} from "@/lib/api/auth/otp/config";
import { generateOtpCode } from "@/lib/api/auth/otp/code";
import { hashOtpCode } from "@/lib/api/auth/otp/hash";
import {
  encodeOtpChallengeCookie,
  generateOtpChallengeSecret,
  hashOtpChallengeSecret,
  parseOtpChallengeCookie,
} from "@/lib/api/auth/otp/challenge-token";
import { requiredEnv } from "@/lib/utils";
import { createTransporter } from "@/lib/nodemailer/create-transporter";
import { sendEmail } from "@/lib/nodemailer/send-email";
import buildLoginOtpCodeHtml from "@/lib/html-builders/buildLoginOtpCodeHtml";
import { createStaffLoginResponse } from "@/features/auth/server/staff-login-response";

export const runtime = "nodejs";

const MAX_ACTIVE_LOGIN_CHALLENGES_PER_USER = 5;

function getCooldownPayload(createdAt: Date, now: Date) {
  const resendAvailableAtMs = new Date(createdAt).getTime() + OTP_RESEND_COOLDOWN_MS;
  const cooldownRemainingMs = Math.max(0, resendAvailableAtMs - now.getTime());

  return {
    cooldownSeconds: Math.ceil(cooldownRemainingMs / 1000),
    resendAvailableAt: new Date(resendAvailableAtMs).toISOString(),
  };
}

function setLoginChallengeCookie(
  response: NextResponse,
  value: string,
  maxAgeSeconds = Math.ceil(OTP_RULES.LOGIN.ttlMs / 1000),
) {
  response.cookies.set(STAFF_LOGIN_OTP_CHALLENGE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

function clearLoginChallengeCookie(response: NextResponse) {
  response.cookies.delete(STAFF_LOGIN_OTP_CHALLENGE_COOKIE);
}

async function pruneLoginChallenges(userId: string, now: Date) {
  await prisma.oTPChallenge.deleteMany({
    where: {
      userId,
      type: "LOGIN",
      OR: [
        { consumedAt: { not: null } },
        { expiresAt: { lt: now } },
        {
          expiresAt: null,
          createdAt: { lt: new Date(now.getTime() - OTP_RULES.LOGIN.ttlMs) },
        },
      ],
    },
  });

  const staleActiveChallenges = await prisma.oTPChallenge.findMany({
    where: {
      userId,
      type: "LOGIN",
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
    skip: MAX_ACTIVE_LOGIN_CHALLENGES_PER_USER,
    select: { id: true },
  });

  if (staleActiveChallenges.length > 0) {
    await prisma.oTPChallenge.deleteMany({
      where: { id: { in: staleActiveChallenges.map((item) => item.id) } },
    });
  }
}

async function getCookieBoundLoginChallenge(req: NextRequest, userId: string) {
  const parsed = parseOtpChallengeCookie(req.cookies.get(STAFF_LOGIN_OTP_CHALLENGE_COOKIE)?.value);

  if (!parsed) {
    return null;
  }

  return prisma.oTPChallenge.findFirst({
    where: {
      id: parsed.challengeId,
      userId,
      type: "LOGIN",
      challengeTokenHash: hashOtpChallengeSecret(parsed.secret),
      consumedAt: null,
    },
  });
}

async function sendLoginOtpEmail(email: string, code: string) {
  const transporter = createTransporter();

  await sendEmail(transporter, {
    fromEmail: requiredEnv("CONTACT_EMAIL"),
    fromName: process.env.CONTACT_NAME?.trim() || "Cobam Group",
    to: email,
    subject: "Votre code de connexion | Cobam Group",
    text: `Votre code de connexion Cobam Group est : ${code}`,
    html: buildLoginOtpCodeHtml(code),
  });
}

export async function POST(req: NextRequest) {
  try {
    await ensureRbacBootstrap();

    const body = await req.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
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
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    if (!user.twoStepVerificationEnabled) {
      const response = await createStaffLoginResponse(user, {
        body: { requiresOtp: false },
        clearLoginOtpChallenge: true,
      });

      clearLoginChallengeCookie(response);
      return response;
    }

    const now = new Date();
    await pruneLoginChallenges(user.id, now);

    const existingChallenge = await getCookieBoundLoginChallenge(req, user.id);

    if (existingChallenge) {
      const activeExpiresAt =
        existingChallenge.expiresAt ??
        new Date(new Date(existingChallenge.createdAt).getTime() + OTP_RULES.LOGIN.ttlMs);
      const cooldown = getCooldownPayload(existingChallenge.createdAt, now);

      if (activeExpiresAt > now && cooldown.cooldownSeconds > 0) {
        return NextResponse.json({
          ok: true,
          requiresOtp: true,
          message: "Un code OTP est déjà actif. Continuez avec le code reçu.",
          ...cooldown,
        });
      }

      const code = generateOtpCode(OTP_CODE_LENGTH);
      const codeHash = hashOtpCode(code);
      const expiresAt = new Date(now.getTime() + OTP_RULES.LOGIN.ttlMs);

      await prisma.oTPChallenge.update({
        where: { id: existingChallenge.id },
        data: {
          codeHash,
          attempts: 0,
          expiresAt,
          consumedAt: null,
          createdAt: now,
        },
      });

      await sendLoginOtpEmail(user.email, code);

      const cookieValue = req.cookies.get(STAFF_LOGIN_OTP_CHALLENGE_COOKIE)?.value;
      const response = NextResponse.json({
        ok: true,
        requiresOtp: true,
        message: "Code OTP envoyé.",
        ...getCooldownPayload(now, now),
      });

      if (cookieValue) {
        setLoginChallengeCookie(response, cookieValue);
      }

      return response;
    }

    const secret = generateOtpChallengeSecret();
    const code = generateOtpCode(OTP_CODE_LENGTH);
    const codeHash = hashOtpCode(code);
    const expiresAt = new Date(now.getTime() + OTP_RULES.LOGIN.ttlMs);
    const challenge = await prisma.oTPChallenge.create({
      data: {
        userId: user.id,
        type: "LOGIN",
        codeHash,
        challengeTokenHash: hashOtpChallengeSecret(secret),
        expiresAt,
      },
      select: { id: true },
    });

    await pruneLoginChallenges(user.id, now);
    await sendLoginOtpEmail(user.email, code);

    const response = NextResponse.json({
      ok: true,
      requiresOtp: true,
      message: "Code OTP envoyé.",
      ...getCooldownPayload(now, now),
    });

    setLoginChallengeCookie(response, encodeOtpChallengeCookie(challenge.id, secret));

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
