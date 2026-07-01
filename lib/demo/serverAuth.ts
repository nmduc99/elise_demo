/**
 * Server-side helpers for detecting Elise demo sessions from cookies.
 */

import { AUTH_CONFIG } from "@/lib/authConfig";
import { isDemoToken } from "@/lib/demo/paths";
import { cookies } from "next/headers";

export { isDemoToken };

export async function getSessionToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_CONFIG.COOKIES.TOKEN)?.value ?? null;
}

export async function isDemoSession(): Promise<boolean> {
    const token = await getSessionToken();
    return isDemoToken(token);
}
