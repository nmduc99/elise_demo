import { AUTH_CONFIG } from "@/lib/authConfig";
import { isDemoUser } from "@/lib/demo/roles";

/**
 * Detect Elise demo session on the client (localStorage user cache).
 * Used to skip external API refresh/logout flows that would break demo mode.
 */
export function isDemoSessionClient(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        const cached = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        if (!cached) {
            return false;
        }
        return isDemoUser(JSON.parse(cached));
    } catch {
        return false;
    }
}
