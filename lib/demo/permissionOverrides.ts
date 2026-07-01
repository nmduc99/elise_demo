/**
 * Client-side permission overrides (director RBAC admin).
 */

import { getAccessLevel, getMatrix, type AccessLevel, type PermissionKey } from "./permissions";
import type { DemoRole } from "./roles";

const OVERRIDE_KEY = "elise-demo-permission-overrides";

export type OverrideMap = Partial<Record<DemoRole, Partial<Record<PermissionKey, AccessLevel>>>>;

export function loadPermissionOverrides(): OverrideMap {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(OVERRIDE_KEY);
        return raw ? (JSON.parse(raw) as OverrideMap) : {};
    } catch {
        return {};
    }
}

export function savePermissionOverrides(overrides: OverrideMap): void {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
}

export function clearPermissionOverrides(): void {
    localStorage.removeItem(OVERRIDE_KEY);
}

export function getEffectiveAccessLevel(
    role: DemoRole | null | undefined,
    key: PermissionKey
): AccessLevel {
    if (!role) return "none";
    const overrides = loadPermissionOverrides();
    const override = overrides[role]?.[key];
    if (override) return override;
    return getMatrix()[role]?.[key] ?? getAccessLevel(role, key);
}
