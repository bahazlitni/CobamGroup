import "server-only";

import crypto from "crypto";

const RESET_TOKEN_BYTES = 32;

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function generatePasswordResetToken() {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString("base64url");
}

export function generateOtpCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function generateChallengeSecret() {
  return crypto.randomBytes(32).toString("base64url");
}
