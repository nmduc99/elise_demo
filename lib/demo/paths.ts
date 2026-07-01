/**
 * Demo Elise auth token helpers.
 */

import { isDemoRole, type DemoRole } from "./roles";

export function isDemoToken(token: string | undefined | null): boolean {
    return typeof token === "string" && token.startsWith("demo.");
}

export function getRoleFromDemoToken(token: string | undefined | null): DemoRole | null {
    if (!isDemoToken(token)) return null;
    const role = token!.slice("demo.".length);
    return isDemoRole(role) ? role : null;
}
