import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  profileCompleted: boolean;
  [key: string]: unknown;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const ALG = "HS256";
const ISSUER = "syncforchange";
const AUDIENCE = "syncforchange-users";

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
