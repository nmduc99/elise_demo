/**
 * Role-aware navigation config for the Elise chain demo.
 */

import { hasNavAccess, type NavPermissionKey } from "./permissions";
import type { DemoRole } from "./roles";

export interface DemoNavItem {
    href: string;
    /** Translation key under the `elise.nav` namespace. */
    labelKey: string;
    permission: NavPermissionKey;
}

export const DEMO_NAV: DemoNavItem[] = [
    { href: "/dashboard", labelKey: "dashboard", permission: "dashboard" },
    { href: "/organization", labelKey: "organization", permission: "organization" },
    { href: "/catalog", labelKey: "products", permission: "products" },
    { href: "/procurement", labelKey: "procurement", permission: "procurement" },
    { href: "/warehouse", labelKey: "warehouse", permission: "warehouse" },
    { href: "/staff", labelKey: "hr", permission: "hr" },
    { href: "/franchise", labelKey: "franchise", permission: "franchise" },
    { href: "/transactions", labelKey: "transactions", permission: "transactions" },
    { href: "/ledger", labelKey: "ledger", permission: "ledger" },
    { href: "/report-center", labelKey: "reports", permission: "reports" },
    { href: "/permissions", labelKey: "permissions", permission: "permissions" },
];

export const POS_NAV: DemoNavItem = { href: "/pos", labelKey: "pos", permission: "pos" };

export function navForRole(role: DemoRole | null): DemoNavItem[] {
    return DEMO_NAV.filter((item) => hasNavAccess(role, item.permission));
}

/** Trang landing ưu tiên theo role (logical path cho next-intl router). */
const ROLE_HOME: Partial<Record<DemoRole, string>> = {
    procurement: "/procurement",
};

/**
 * Trang mặc định sau đăng nhập — trang đầu tiên user có quyền, không phải luôn /dashboard.
 */
export function getDefaultHomePath(role: DemoRole | null | undefined): string {
    if (!role) return "/dashboard";
    if (ROLE_HOME[role]) return ROLE_HOME[role]!;

    const items = navForRole(role);
    if (items.length > 0) return items[0].href;

    return "/catalog";
}
