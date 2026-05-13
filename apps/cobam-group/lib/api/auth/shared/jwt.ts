import { SignJWT, jwtVerify } from "jose";
import type { StaffPortal } from "@/features/auth/types";

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

export type AccessTokenPayload = {
  userId: string;
  email: string;
  portal: StaffPortal;
};

export type RefreshTokenPayload = {
  userId: string;
  tokenId: string;
};

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRES_IN!)
    .sign(accessSecret);
}

export async function signRefreshToken(payload: RefreshTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN!)
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret);
  return payload as AccessTokenPayload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret);
  return payload as RefreshTokenPayload;
}
