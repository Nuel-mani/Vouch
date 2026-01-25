import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface TokenPayload extends JWTPayload {
    userId: string;
    role: 'user' | 'staff' | 'admin';
    email: string;
    impersonatedBy?: string;
}

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'development-secret-change-in-production'
);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * Sign a JWT token
 */
export async function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .setIssuer('vouch')
        .setAudience('vouch')
        .sign(JWT_SECRET);
}

/**
 * Sign a refresh token (longer-lived)
 */
export async function signRefreshToken(userId: string): Promise<string> {
    return new SignJWT({ userId, type: 'refresh' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
        .setIssuer('vouch')
        .setAudience('vouch')
        .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            issuer: 'vouch',
            audience: 'vouch',
        });
        return payload as TokenPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            issuer: 'vouch',
            audience: 'vouch',
        });
        if (payload.type !== 'refresh') {
            return null;
        }
        return { userId: payload.userId as string };
    } catch (error) {
        return null;
    }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
    try {
        const [, payloadBase64] = token.split('.');
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
        return payload as TokenPayload;
    } catch {
        return null;
    }
}
