import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { hashOtpCode } from "@/lib/api/auth/otp/hash";
import { OTP_RULES, STAFF_LOGIN_OTP_CHALLENGE_COOKIE } from "@/lib/api/auth/otp/config";
import {
  hashOtpChallengeSecret,
  parseOtpChallengeCookie,
} from "@/lib/api/auth/otp/challenge-token";
import { STAFF_PORTAL } from "@/features/auth/types";
import { createStaffLoginResponse } from "@/features/auth/server/staff-login-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const code = String(body.code ?? "").trim();
    const parsedChallenge = parseOtpChallengeCookie(
      req.cookies.get(STAFF_LOGIN_OTP_CHALLENGE_COOKIE)?.value,
    );

    if (!email || !code || !parsedChallenge) {
      return NextResponse.json(
        { ok: false, message: "Email et code OTP requis." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        portal: true,
        twoStepVerificationEnabled: true,
      },
    });

    if (!user || user.portal !== STAFF_PORTAL) {
      return NextResponse.json({ ok: false, message: "Code OTP invalide." }, { status: 401 });
    }

    if (!user.twoStepVerificationEnabled) {
      return NextResponse.json(
        {
          ok: false,
          message: "La verification OTP est desactivee pour ce compte.",
        },
        { status: 400 },
      );
    }

    const challenge = await prisma.oTPChallenge.findFirst({
      where: {
        id: parsedChallenge.challengeId,
        userId: user.id,
        type: "LOGIN",
        challengeTokenHash: hashOtpChallengeSecret(parsedChallenge.secret),
        consumedAt: null,
      },
    });

    if (!challenge) {
      const response = NextResponse.json(
        { ok: false, message: "Code OTP invalide ou expire." },
        { status: 401 },
      );
      response.cookies.delete(STAFF_LOGIN_OTP_CHALLENGE_COOKIE);
      return response;
    }

    const rules = OTP_RULES.LOGIN;
    const now = new Date();
    const expiresAt =
      challenge.expiresAt ?? new Date(new Date(challenge.createdAt).getTime() + rules.ttlMs);

    if (expiresAt < now) {
      await prisma.oTPChallenge.delete({
        where: { id: challenge.id },
      });

      const response = NextResponse.json(
        { ok: false, message: "Code OTP expire." },
        { status: 401 },
      );
      response.cookies.delete(STAFF_LOGIN_OTP_CHALLENGE_COOKIE);
      return response;
    }

    if (challenge.attempts >= rules.maxAttempts) {
      await prisma.oTPChallenge.delete({
        where: { id: challenge.id },
      });

      const response = NextResponse.json(
        { ok: false, message: "Trop de tentatives. Veuillez recommencer." },
        { status: 429 },
      );
      response.cookies.delete(STAFF_LOGIN_OTP_CHALLENGE_COOKIE);
      return response;
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

      return NextResponse.json({ ok: false, message: "Code OTP invalide." }, { status: 401 });
    }

    await prisma.oTPChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: now },
    });

    const response = await createStaffLoginResponse(user);
    response.cookies.delete(STAFF_LOGIN_OTP_CHALLENGE_COOKIE);
    return response;
  } catch (error) {
    console.error("STAFF_LOGIN_OTP_ERROR:", error);

    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
