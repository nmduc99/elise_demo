/**
 * Global fetch wrapper - Tự động thêm Language header cho tất cả requests
 * Import và sử dụng thay vì fetch() thông thường
 */

/**
 * Get current locale from URL pathname
 */
import { clearAuthStorage, refreshAccessToken } from "./tokenService";
import { getCurrentTenant } from "./tenant";

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let redirectingToLogin = false;

function getCurrentLocale(): "vi" | "en" {
    if (typeof window === "undefined") return "vi";
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const locale = pathParts[0];
    return locale === "en" || locale === "vi" ? locale : "vi";
}

/**
 * Custom fetch with automatic Language header
 * Drop-in replacement for native fetch()
 */
export async function fetchWithLocale(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const locale = getCurrentLocale();
    const tenant = getCurrentTenant();

    // Merge headers
    const headers = new Headers(init?.headers);

    // Only add Language and Tenant headers for internal API calls
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("/api/")) {
        if (!headers.has("Language")) {
            headers.set("Language", locale);
        }
        if (!headers.has("Accept-Language")) {
            headers.set("Accept-Language", locale);
        }
        // Add tenant header for all API calls
        if (!headers.has("X-Tenant")) {
            headers.set("X-Tenant", tenant);
        }
    }

    // Ensure credentials are included to send httpOnly cookies (token)
    // Never set Authorization header - token is only sent via httpOnly cookie
    const requestInit: RequestInit = { 
        ...init, 
        headers,
        credentials: init?.credentials || "include", // Send cookies for authentication
    };
    const executeFetch = () => fetch(input, requestInit);

    let response = await executeFetch();

    const shouldAttemptRefresh = (() => {
        if (response.status !== 401 && response.status !== 403) {
            return false;
        }

        if (typeof input === "string") {
            return input.startsWith("/api/");
        }

        if (input instanceof URL) {
            return input.pathname.startsWith("/api/");
        }

        try {
            const url = "url" in input ? input.url : "";
            return url.startsWith("/api/");
        } catch {
            return false;
        }
    })();

    if (shouldAttemptRefresh) {
        // Prevent multiple simultaneous refresh attempts
        if (isRefreshing) {
            // If already refreshing, wait a bit and return the original response
            // This prevents multiple refresh calls
            return response;
        }

        // Skip if already redirecting to login
        if (redirectingToLogin) {
            return response;
        }

        isRefreshing = true;
        try {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                response = await executeFetch();
            }

            if (response.status === 401 || response.status === 403) {
                clearAuthStorage();
                try {
                    await fetch("/api/auth/logout", { method: "POST" });
                } catch (error) {
                    console.error("[fetchWithLocale] Failed to call logout after refresh failure:", error);
                }

                // Redirect to login page to prevent infinite retry loop
                if (typeof window !== "undefined") {
                    const currentLocale = getCurrentLocale();
                    const loginPath = currentLocale === "vi" ? "/vi/dang-nhap" : "/en/login";

                    // Only redirect if not already on login page
                    if (!window.location.pathname.includes("/dang-nhap") && !window.location.pathname.includes("/login")) {
                        redirectingToLogin = true;
                        window.location.href = loginPath;
                    }
                }
            }
        } finally {
            isRefreshing = false;
        }
    }

    return response;
}

/**
 * Alias for better semantics
 */
export const apiFetch = fetchWithLocale;

/**
 * Helper: Safely parse JSON from response
 */
export async function safeParseJSON<T = any>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType || "unknown"}: ${text.substring(0, 200)}`);
    }
    return response.json();
}

/**
 * Helper: Fetch JSON response
 */
export async function fetchJSON<T = any>(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<T> {
    const response = await fetchWithLocale(input, init);
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error ${response.status}: ${error}`);
    }
    return safeParseJSON<T>(response);
}
