import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/api/auth/shared/jwt";
import { sha256 } from "@/lib/api/auth/shared/token";
import { hashOtpCode } from "@/lib/api/auth/otp/hash";
import { OTP_RULES } from "@/lib/api/auth/otp/config";
import { v4 as uuidv4 } from "uuid";
import { STAFF_PORTAL } from "@/features/auth/types";
import { getStaffSessionByUserId } from "@/features/auth/server/session";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const email = String(body.email ?? "").trim().toLowerCase();
        const code = String(body.code ?? "").trim();

        if (!email || !code) {
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
        },
        });

        if (!user || user.portal !== STAFF_PORTAL) {
        return NextResponse.json(
            { ok: false, message: "Code OTP invalide." },
            { status: 401 },
        );
        }

        const challenge = await prisma.oTPChallenge.findUnique({
        where: {
            userId_type: {
            userId: user.id,
            type: "LOGIN",
            },
        },
        });

        if (!challenge) {
        return NextResponse.json(
            { ok: false, message: "Code OTP invalide ou expiré." },
            { status: 401 },
        );
        }

        const rules = OTP_RULES.LOGIN;

        if (new Date(challenge.createdAt).getTime() + rules.ttlMs < new Date().getTime()) {
            await prisma.oTPChallenge.delete({
                where: { id: challenge.id },
            });

            return NextResponse.json(
                { ok: false, message: "Code OTP expiré." },
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

        await prisma.$transaction([
        prisma.oTPChallenge.delete({
            where: { id: challenge.id },
        }),
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
        console.error("STAFF_LOGIN_OTP_ERROR:", error);

        return NextResponse.json(
        { ok: false, message: "Internal server error" },
        { status: 500 },
        );
    }
}