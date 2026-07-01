/**
 * RBAC permission matrix for the Elise chain demo.
 *
 * Access levels:
 * - full:    toàn quyền thao tác
 * - view:    chỉ xem
 * - monitor: theo dõi (POS — không thanh toán)
 * - propose: chỉ đề nghị (điều chuyển kho)
 * - store:   quyền trong phạm vi cửa hàng được gán
 * - none:    không truy cập
 */

import type { DemoRole } from "./roles";

export type AccessLevel = "none" | "view" | "monitor" | "propose" | "store" | "full";

/** Granular feature keys from the permission matrix. */
export type PermissionKey =
    | "dashboard_chain"
    | "dashboard_store"
    | "organization"
    | "hr"
    | "products"
    | "suppliers"
    | "warehouse_regional"
    | "warehouse_store"
    | "stock_in"
    | "stock_out"
    | "stock_transfer"
    | "pos"
    | "invoices"
    | "report_revenue"
    | "report_profit"
    | "report_inventory"
    | "users_rbac"
    | "franchise";

/** Keys used by navigation / page guards (may map to multiple granular keys). */
export type NavPermissionKey =
    | "dashboard"
    | "organization"
    | "products"
    | "procurement"
    | "warehouse"
    | "hr"
    | "franchise"
    | "reports"
    | "pos";

const MATRIX: Record<DemoRole, Partial<Record<PermissionKey, AccessLevel>>> = {
    director: {
        dashboard_chain: "full",
        dashboard_store: "full",
        organization: "full",
        hr: "full",
        products: "full",
        suppliers: "full",
        warehouse_regional: "full",
        warehouse_store: "full",
        stock_in: "full",
        stock_out: "full",
        stock_transfer: "full",
        pos: "monitor",
        invoices: "full",
        report_revenue: "full",
        report_profit: "full",
        report_inventory: "full",
        users_rbac: "full",
        franchise: "full",
    },
    accountant: {
        dashboard_chain: "full",
        dashboard_store: "none",
        organization: "none",
        hr: "view",
        products: "view",
        suppliers: "view",
        warehouse_regional: "view",
        warehouse_store: "view",
        stock_in: "view",
        stock_out: "view",
        stock_transfer: "none",
        pos: "view",
        invoices: "full",
        report_revenue: "full",
        report_profit: "full",
        report_inventory: "full",
        users_rbac: "none",
        franchise: "view",
    },
    procurement: {
        dashboard_chain: "none",
        dashboard_store: "none",
        organization: "none",
        hr: "none",
        products: "full",
        suppliers: "full",
        warehouse_regional: "full",
        warehouse_store: "full",
        stock_in: "full",
        stock_out: "full",
        stock_transfer: "full",
        pos: "none",
        invoices: "view",
        report_revenue: "none",
        report_profit: "none",
        report_inventory: "full",
        users_rbac: "none",
        franchise: "none",
    },
    store_manager: {
        dashboard_chain: "none",
        dashboard_store: "full",
        organization: "none",
        hr: "store",
        products: "view",
        suppliers: "none",
        warehouse_regional: "none",
        warehouse_store: "full",
        stock_in: "none",
        stock_out: "none",
        stock_transfer: "propose",
        pos: "full",
        invoices: "store",
        report_revenue: "store",
        report_profit: "none",
        report_inventory: "store",
        users_rbac: "none",
        franchise: "none",
    },
    franchise_monitor: {
        dashboard_chain: "full",
        dashboard_store: "none",
        organization: "none",
        hr: "none",
        products: "view",
        suppliers: "none",
        warehouse_regional: "none",
        warehouse_store: "view",
        stock_in: "none",
        stock_out: "none",
        stock_transfer: "none",
        pos: "none",
        invoices: "view",
        report_revenue: "full",
        report_profit: "none",
        report_inventory: "view",
        users_rbac: "none",
        franchise: "full",
    },
};

const NAV_KEY_MAP: Record<NavPermissionKey, PermissionKey[]> = {
    dashboard: ["dashboard_chain", "dashboard_store"],
    organization: ["organization"],
    products: ["products"],
    procurement: ["suppliers"],
    warehouse: ["warehouse_regional", "warehouse_store", "stock_in", "stock_out", "stock_transfer"],
    hr: ["hr"],
    franchise: ["franchise"],
    reports: ["report_revenue", "report_profit", "report_inventory", "invoices"],
    pos: ["pos"],
};

export function getAccessLevel(
    role: DemoRole | null | undefined,
    key: PermissionKey
): AccessLevel {
    if (!role) return "none";
    return MATRIX[role]?.[key] ?? "none";
}

export function hasAccess(role: DemoRole | null | undefined, key: PermissionKey): boolean {
    return getAccessLevel(role, key) !== "none";
}

export function hasNavAccess(role: DemoRole | null | undefined, key: NavPermissionKey): boolean {
    if (!role) return false;
    return NAV_KEY_MAP[key].some((k) => hasAccess(role, k));
}

export function canWriteLevel(level: AccessLevel): boolean {
    return level === "full" || level === "store";
}

export function canWrite(role: DemoRole | null | undefined, key: PermissionKey): boolean {
    return canWriteLevel(getAccessLevel(role, key));
}

export function isReadOnlyLevel(level: AccessLevel): boolean {
    return level === "view" || level === "monitor";
}

export function isReadOnly(role: DemoRole | null | undefined, key: PermissionKey): boolean {
    return isReadOnlyLevel(getAccessLevel(role, key));
}

export function isProposeOnly(role: DemoRole | null | undefined, key: PermissionKey): boolean {
    return getAccessLevel(role, key) === "propose";
}

export function isStoreScopedLevel(level: AccessLevel): boolean {
    return level === "store";
}

export function isStoreScoped(role: DemoRole | null | undefined, key: PermissionKey): boolean {
    return isStoreScopedLevel(getAccessLevel(role, key));
}

export function accessLabel(level: AccessLevel): string | null {
    switch (level) {
        case "view":
            return "Chỉ xem";
        case "monitor":
            return "Theo dõi";
        case "propose":
            return "Chỉ đề nghị";
        case "store":
            return "Phạm vi cửa hàng";
        default:
            return null;
    }
}

/**
 * Whether a role can see the whole chain (all regions/stores) or is scoped to
 * a single store.
 */
export function isChainWide(role: DemoRole | null | undefined): boolean {
    return (
        role === "director" ||
        role === "accountant" ||
        role === "procurement" ||
        role === "franchise_monitor"
    );
}
