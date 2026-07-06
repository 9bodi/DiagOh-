import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const IMPERSONATION_COOKIE = 'ohe_impersonate';
export const IMPERSONATION_MAX_AGE = 4 * 60 * 60; // 4h en secondes

interface ImpersonationPayload {
  superadminId: string;
  organizationId: string;
  logId: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET manquant');
  return new TextEncoder().encode(secret);
}

export async function signImpersonationToken(payload: ImpersonationPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${IMPERSONATION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyImpersonationToken(token: string): Promise<ImpersonationPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.superadminId === 'string' &&
      typeof payload.organizationId === 'string' &&
      typeof payload.logId === 'string'
    ) {
      return {
        superadminId: payload.superadminId,
        organizationId: payload.organizationId,
        logId: payload.logId,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Lit le cookie d'impersonation depuis les cookies serveur. */
export async function readImpersonationFromCookies(): Promise<ImpersonationPayload | null> {
  const store = await cookies();
  const token = store.get(IMPERSONATION_COOKIE)?.value;
  if (!token) return null;
  return verifyImpersonationToken(token);
}
