import type { OTPType } from "@prisma/client";

export const OTP_CODE_LENGTH = 6;

const FIVE_MINUTES = 300_000;
const TEN_MINUTES = 600_000;
const FIFTEEN_MINUTES = 900_000;

export const OTP_RULES = {
    LOGIN: {
        ttlMs: FIVE_MINUTES,
        maxAttempts: 3,
    },
    RESET_PASSWORD: {
        ttlMs: TEN_MINUTES,
        maxAttempts: 3,
    },
    VERIFY_EMAIL: {
        ttlMs: FIFTEEN_MINUTES,
        maxAttempts: 5,
    },
} satisfies Record<
    OTPType,
    {
        ttlMs: number;
        maxAttempts: number;
    }
>;