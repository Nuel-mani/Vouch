import { db } from '@vouch/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export interface AdminUser {
    userId: string;
    email: string;
    role: string;
}

/**
 * Get the current admin user from the session cookie
 */
export async function getAdminUser(): Promise<AdminUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret),
            { issuer: 'vouch', audience: 'vouch' }
        );

        const role = payload.role as string;

        // Only admin or staff roles are valid for admin panel
        if (role !== 'admin' && role !== 'staff') {
            return null;
        }

        return {
            userId: payload.userId as string,
            email: payload.email as string,
            role,
        };
    } catch {
        return null;
    }
}

/**
 * Check if a user has a specific permission.
 * 
 * IMPORTANT: This follows an "allow by default" policy.
 * If no permissions are configured in the database, ALL permissions are granted.
 * This allows the system to work without configuration initially.
 * Once permissions are set up in the admin area, they will be enforced.
 * 
 * Admin role users always have all permissions.
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
    // Get user's basic role
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!user) return false;

    // Admin users always have all permissions
    if (user.role === 'admin') {
        return true;
    }

    // Staff users: check if permissions are configured
    const totalPermissions = await db.adminPermission.count();

    // If no permissions are configured, allow everything (permissive mode)
    if (totalPermissions === 0) {
        return true;
    }

    // Check if user has the permission through their admin roles
    const permission = await db.adminPermission.findUnique({
        where: { name: permissionName },
    });

    if (!permission) {
        // Permission doesn't exist in database, allow by default
        return true;
    }

    // Check if user has this permission through any of their roles
    const userRole = await db.userAdminRole.findFirst({
        where: {
            userId,
            role: {
                permissions: {
                    some: {
                        permissionId: permission.id,
                    },
                },
            },
        },
    });

    return !!userRole;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!user) return [];

    // Admin users have all permissions
    if (user.role === 'admin') {
        const allPermissions = await db.adminPermission.findMany({
            select: { name: true },
        });
        return allPermissions.map(p => p.name);
    }

    // Get permissions through admin roles
    const userRoles = await db.userAdminRole.findMany({
        where: { userId },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            },
        },
    });

    const permissions = new Set<string>();
    for (const ur of userRoles) {
        for (const rp of ur.role.permissions) {
            permissions.add(rp.permission.name);
        }
    }

    return Array.from(permissions);
}

/**
 * Predefined permission names for type safety
 */
export const PERMISSIONS = {
    // User management
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'manage_users',
    DELETE_USERS: 'delete_users',

    // Subscription management
    VIEW_SUBSCRIPTIONS: 'view_subscriptions',
    MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',

    // Compliance
    VIEW_COMPLIANCE: 'view_compliance',
    APPROVE_COMPLIANCE: 'approve_compliance',
    REJECT_COMPLIANCE: 'reject_compliance',

    // Integrations
    VIEW_INTEGRATIONS: 'view_integrations',
    MANAGE_INTEGRATIONS: 'manage_integrations',

    // Audit logs
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    CLEAR_AUDIT_LOGS: 'clear_audit_logs',

    // Settings
    VIEW_SETTINGS: 'view_settings',
    MANAGE_SETTINGS: 'manage_settings',

    // Admin roles
    VIEW_ADMIN_ROLES: 'view_admin_roles',
    MANAGE_ADMIN_ROLES: 'manage_admin_roles',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];
