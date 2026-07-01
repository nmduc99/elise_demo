/**
 * Centralized Authentication Configuration
 * 
 * Quản lý tập trung tất cả thông số liên quan đến token và authentication
 */

export const AUTH_CONFIG = {
    /**
     * Thời gian token có hiệu lực (giây)
     * - Mặc định: 15 phút (900 giây)
     * - Phải khớp với backend API expiresIn
     */
    TOKEN_EXPIRES_IN: Number(process.env.NEXT_PUBLIC_AUTH_TOKEN_EXPIRE) || 15 * 60,

    /**
     * Thời gian refresh token có hiệu lực (giây)
     * - Mặc định: 30 ngày
     */
    REFRESH_TOKEN_EXPIRES_IN: 30 * 24 * 60 * 60, // 30 days in seconds

    /**
     * Thời gian cache user data trong localStorage (ms)
     * - Mặc định: 5 phút
     * - Nên ngắn hơn TOKEN_EXPIRES_IN để đảm bảo fresh data
     */
    USER_CACHE_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds

    /**
     * Thời gian buffer trước khi token hết hạn để refresh (giây)
     * - Mặc định: 2 phút trước khi token expire
     * - Dùng để auto refresh token trước khi hết hạn
     */
    TOKEN_REFRESH_BUFFER: 2 * 60, // 2 minutes in seconds

    /**
     * Key lưu trong localStorage
     */
    STORAGE_KEYS: {
        USER: 'auth_user',
        CACHED_AT: 'auth_cached_at',
        TOKEN_EXPIRES_AT: 'auth_token_expires_at', // Thêm để track token expiration
    },

    /**
     * Cookie names
     */
    COOKIES: {
        TOKEN: 'bmg_inventory_token',
        REFRESH_TOKEN: 'bmg_inventory_refreshToken',
        DEVICE_ID: 'deviceId',
    },
} as const;

/**
 * Helper: Tính thời điểm token hết hạn
 * @param expiresIn - Thời gian token còn hiệu lực (giây)
 * @returns Timestamp (ms) khi token hết hạn
 */
export function calculateTokenExpiresAt(expiresIn: number = AUTH_CONFIG.TOKEN_EXPIRES_IN): number {
    return Date.now() + (expiresIn * 1000);
}

/**
 * Helper: Kiểm tra token còn hiệu lực không
 * @param expiresAt - Timestamp (ms) khi token hết hạn
 * @param bufferSeconds - Thời gian buffer (giây) trước khi hết hạn
 * @returns true nếu token còn hiệu lực
 */
export function isTokenValid(expiresAt: number, bufferSeconds: number = 0): boolean {
    return Date.now() < (expiresAt - bufferSeconds * 1000);
}

/**
 * Helper: Kiểm tra cache còn fresh không
 * @param cachedAt - Timestamp (ms) khi cache được tạo
 * @returns true nếu cache còn fresh
 */
export function isCacheFresh(cachedAt: number): boolean {
    return (Date.now() - cachedAt) < AUTH_CONFIG.USER_CACHE_TTL;
}
