import type { OTPType } from "@prisma/client";

export const OTP_CODE_LENGTH = 6;
export const OTP_RESEND_COOLDOWN_MS = 30_000;
export const STAFF_LOGIN_OTP_CHALLENGE_COOKIE = "staff_login_otp_challenge";
export const STAFF_PASSWORD_OTP_CHALLENGE_COOKIE = "staff_password_otp_challenge";
export const STAFF_PASSWORD_RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

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
