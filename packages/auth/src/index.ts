// Password utilities
export { hashPassword, verifyPassword, validatePasswordStrength } from './password';

// JWT utilities
export {
    signToken,
    signRefreshToken,
    verifyToken,
    verifyRefreshToken,
    decodeToken,
    type TokenPayload,
} from './jwt';

// Session management
export {
    register,
    login,
    logout,
    refreshSession,
    validateSession,
    getUserById,
    AuthError,
    type AuthResult,
} from './session';

// Middleware
export {
    requireAuth,
    requireRole,
    requireAdmin,
    requireStaff,
    setAuthCookies,
    clearAuthCookies,
} from './middleware';
