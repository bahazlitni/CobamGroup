import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { hashOtpCode } from "@/lib/api/auth/otp/hash";
import { OTP_RULES } from "@/lib/api/auth/otp/config";
import { STAFF_PORTAL } from "@/features/auth/types";
import { createStaffLoginResponse } from "@/features/auth/server/staff-login-response";

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
            twoStepVerificationEnabled: true,
        },
        });

        if (!user || user.portal !== STAFF_PORTAL) {
        return NextResponse.json(
            { ok: false, message: "Code OTP invalide." },
            { status: 401 },
        );
        }

        if (!user.twoStepVerificationEnabled) {
        return NextResponse.json(
            { ok: false, message: "La verification OTP est desactivee pour ce compte." },
            { status: 400 },
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

        return createStaffLoginResponse(user, {
            clearLoginOtpChallenge: true,
        });
    } catch (error) {
        console.error("STAFF_LOGIN_OTP_ERROR:", error);

        return NextResponse.json(
        { ok: false, message: "Internal server error" },
        { status: 500 },
        );
    }
}
