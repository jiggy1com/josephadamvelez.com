import { jwtVerify, SignJWT } from 'jose';
import type { NextApiRequest, NextApiResponse } from 'next';

export const SESSION_COOKIE_NAME = 'bruh_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

// The claims we bake into the JWT. Nothing sensitive here — no password, no salt.
export type SessionPayload = {
    profilesId: number;
    username: string;
    name: string;
    role: 'child' | 'parent';
    isAdmin: boolean;
};

function getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET env var is not set');
    }
    return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
        .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        // Runtime shape check — the JWT could be from an older version with different claims.
        if (
            typeof payload.profilesId === 'number' &&
            typeof payload.username === 'string' &&
            typeof payload.name === 'string' &&
            (payload.role === 'child' || payload.role === 'parent') &&
            typeof payload.isAdmin === 'boolean'
        ) {
            return {
                profilesId: payload.profilesId,
                username: payload.username,
                name: payload.name,
                role: payload.role,
                isAdmin: payload.isAdmin,
            };
        }
        return null;
    } catch {
        return null;
    }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {};
    const out: Record<string, string> = {};
    for (const part of cookieHeader.split(';')) {
        const idx = part.indexOf('=');
        if (idx === -1) continue;
        const k = part.slice(0, idx).trim();
        const v = decodeURIComponent(part.slice(idx + 1).trim());
        if (k) out[k] = v;
    }
    return out;
}

// For API routes.
export async function getSessionFromReq(req: NextApiRequest): Promise<SessionPayload | null> {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) return null;
    return await verifySession(token);
}

// For getServerSideProps (context has .req with headers.cookie same as NextApiRequest).
export async function getSessionFromCookieHeader(
    cookieHeader: string | undefined,
): Promise<SessionPayload | null> {
    const cookies = parseCookies(cookieHeader);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) return null;
    return await verifySession(token);
}

export function setSessionCookie(res: NextApiResponse, token: string) {
    const parts = [
        `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
        `Max-Age=${SESSION_DURATION_SECONDS}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
    ];
    if (process.env.NODE_ENV === 'production') {
        parts.push('Secure');
    }
    res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: NextApiResponse) {
    const parts = [
        `${SESSION_COOKIE_NAME}=`,
        'Max-Age=0',
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
    ];
    if (process.env.NODE_ENV === 'production') {
        parts.push('Secure');
    }
    res.setHeader('Set-Cookie', parts.join('; '));
}
