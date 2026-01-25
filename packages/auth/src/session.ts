import { db } from '@vouch/db';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password';
import { signToken, signRefreshToken, verifyToken, verifyRefreshToken } from './jwt';
import type { User } from '@vouch/types';

export interface AuthResult {
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
}

export class AuthError extends Error {
    constructor(
        message: string,
        public code: 'INVALID_CREDENTIALS' | 'USER_EXISTS' | 'USER_NOT_FOUND' | 'INVALID_TOKEN' | 'WEAK_PASSWORD'
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export interface RegistrationData {
    businessName?: string;
    accountType: 'personal' | 'business';
    businessStructure?: string;
    turnoverBand?: string;
    sector?: string;
    taxIdentityNumber?: string; // Maps to taxIdentityNumber or tinNumber in DB? schema says taxIdentityNumber
    businessAddress?: string;
    phoneNumber?: string;
    rentAmount?: number;
    paysRent?: boolean;
    annualIncome?: number;
    isVatExempt?: boolean;
    isTaxExempt?: boolean;
}

/**
 * Register a new user
 */
export async function register(
    email: string,
    password: string,
    data: RegistrationData,
    ipAddress?: string
): Promise<AuthResult> {
    // Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
        throw new AuthError(passwordError, 'WEAK_PASSWORD');
    }

    // Check if user exists
    const existing = await db.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (existing) {
        throw new AuthError('User with this email already exists', 'USER_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            businessName: data.businessName,
            accountType: data.accountType,
            businessStructure: data.businessStructure,
            turnoverBand: data.turnoverBand,
            sector: data.sector,
            taxIdentityNumber: data.taxIdentityNumber,
            businessAddress: data.businessAddress,
            phoneNumber: data.phoneNumber,
            rentAmount: data.rentAmount,
            paysRent: data.paysRent,
            annualIncome: data.annualIncome,
            isVatExempt: data.isVatExempt,
            isTaxExempt: data.isTaxExempt,
            subscriptionTier: 'free',
        },
    });

    // Generate tokens
    const accessToken = await signToken({
        userId: newUser.id,
        email: newUser.email,
        role: 'user', // Default to user
    });

    const refreshToken = await signRefreshToken(newUser.id);

    // Store refresh token
    await db.refreshToken.create({
        data: {
            userId: newUser.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
    });

    // Audit log
    await db.auditLog.create({
        data: {
            userId: newUser.id,
            action: 'USER_REGISTERED',
            resource: 'user',
            resourceId: newUser.id,
            ipAddress,
            details: {
                accountType: data.accountType,
                sector: data.sector,
            },
        },
    });

    // Return user without sensitive data
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    // Cast to User type ensuring type safety
    return {
        user: userWithoutPassword as unknown as Omit<User, 'passwordHash'>,
        accessToken,
        refreshToken,
    };
}

/**
 * Login a user
 */
export async function login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    // Find user
    const user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) {
        // Audit failed attempt
        await db.auditLog.create({
            data: {
                action: 'LOGIN_FAILED',
                details: { email, reason: 'user_not_found' },
                ipAddress,
                userAgent,
            },
        });
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
        // Audit failed attempt
        await db.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN_FAILED',
                details: { reason: 'invalid_password' },
                ipAddress,
                userAgent,
            },
        });
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check if user is an admin
    const adminRecord = await db.admin_users.findUnique({
        where: { email: user.email },
    });

    const role = adminRecord ? 'admin' : 'user';

    // Generate tokens
    const accessToken = await signToken({
        userId: user.id,
        email: user.email,
        role,
    });

    const refreshToken = await signRefreshToken(user.id);

    // Store refresh token
    await db.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });

    // Update last login
    await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    // Audit success
    await db.auditLog.create({
        data: {
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            ipAddress,
            userAgent,
        },
    });

    // Return user without sensitive data
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
        user: { ...userWithoutPassword, role } as unknown as Omit<User, 'passwordHash'>,
        accessToken,
        refreshToken,
    };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshSession(token: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    const payload = await verifyRefreshToken(token);
    if (!payload) {
        throw new AuthError('Invalid refresh token', 'INVALID_TOKEN');
    }

    // Check if token exists in database
    const storedToken = await db.refreshToken.findUnique({
        where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new AuthError('Refresh token expired or revoked', 'INVALID_TOKEN');
    }

    // Get user
    const user = await db.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user) {
        throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Generate new access token
    const accessToken = await signToken({
        userId: user.id,
        email: user.email,
        role: 'user', // Default to user
    });

    return { accessToken };
}

/**
 * Logout - revoke refresh token
 */
export async function logout(token: string, userId: string): Promise<void> {
    // Use deleteMany because token is unique constraint but we want to be safe
    await db.refreshToken.delete({
        where: { token },
    });

    await db.auditLog.create({
        data: {
            userId,
            action: 'LOGOUT',
        },
    });
}

/**
 * Validate access token and return user
 */
export async function validateSession(accessToken: string): Promise<Omit<User, 'passwordHash'> | null> {
    const payload = await verifyToken(accessToken);
    if (!payload) {
        return null;
    }

    const user = await db.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user) {
        return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as Omit<User, 'passwordHash'>;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await db.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as Omit<User, 'passwordHash'>;
}
