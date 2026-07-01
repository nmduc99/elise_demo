/**
 * HTTP Client với tự động xử lý token expiration
 * 
 * Wrapper cho fetch API để tự động:
 * - Kiểm tra 401/403 responses
 * - Logout và redirect khi token hết hạn
 * - Centralized error handling
 */

import { clearAuthStorage, refreshAccessToken } from "./tokenService";
import { getCurrentTenant } from "./tenant";

type FetchOptions = RequestInit & {
    skipAuthCheck?: boolean; // Skip auto logout on 401
};

/**
 * Get current locale from URL
 */
function getCurrentLocale(): string {
    if (typeof window === "undefined") return "vi"; // Default for SSR
    const currentLocale = window.location.pathname.split("/")[1];
    const locale = currentLocale === "en" || currentLocale === "vi" ? currentLocale : "vi";
    return locale;
}

/**
 * Enhanced fetch with auto logout on token expiration
 */
export async function authFetch(url: string, options: FetchOptions = {}): Promise<Response> {
    const { skipAuthCheck = false, ...fetchOptions } = options;

    const locale = getCurrentLocale();
    const tenant = getCurrentTenant();

    const buildRequestInit = () => {
        const headers = new Headers(fetchOptions.headers);

        if (!headers.has("Accept-Language")) {
            headers.set("Accept-Language", locale);
        }
        if (!headers.has("Language")) {
            headers.set("Language", locale);
        }
        // Add tenant header for all API calls
        if (!headers.has("X-Tenant")) {
            headers.set("X-Tenant", tenant);
        }

        // Never set Authorization header - token is only sent via httpOnly cookie
        // Ensure credentials are included to send httpOnly cookies
        return { 
            ...fetchOptions, 
            headers,
            credentials: fetchOptions.credentials || "include", // Send cookies for authentication
        };
    };

    try {
        let response = await fetch(url, buildRequestInit());

        // Tự động logout nếu token hết hạn (401/403)
        if (!skipAuthCheck && (response.status === 401 || response.status === 403)) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                response = await fetch(url, buildRequestInit());
            }

            if (response.status === 401 || response.status === 403) {
                clearAuthStorage();

                await fetch("/api/auth/logout", { method: "POST" }).catch(console.error);

                if (typeof window !== "undefined") {
                    const currentLocale = getCurrentLocale();
                    const loginPath = currentLocale === "vi" ? "/vi/dang-nhap" : "/en/login";
                    window.location.href = loginPath;
                }
            }
        }

        return response;
    } catch (error) {
        console.error("[authFetch] Network error:", error);
        throw error;
    }
}

/**
 * Helper: authFetch với JSON response
 */
export async function authFetchJSON<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const response = await authFetch(url, options);
    return response.json();
}

/**
 * Helper: Check if user is still authenticated
 * Gọi /api/auth/me và tự động logout nếu token hết hạn
 */
export async function checkAuthStatus(): Promise<boolean> {
    try {
        const response = await authFetch("/api/auth/me", { skipAuthCheck: true });
        const data = await response.json();

        if (response.status === 401 || response.status === 403 || !data?.user) {
            // Token expired, trigger logout
            clearAuthStorage();
            await fetch("/api/auth/logout", { method: "POST" }).catch(console.error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("[checkAuthStatus] Error:", error);
        return false;
    }
}
