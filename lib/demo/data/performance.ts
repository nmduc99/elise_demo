/**
 * Generated stock, monthly performance and purchase orders, plus the
 * aggregation selectors used across dashboards, analytics and reports.
 */

import { PRODUCTS, SUPPLIERS, getProduct } from "./catalog";
import { randInt, rngFor } from "./rng";
import {
    REGIONAL_WAREHOUSES,
    STORES,
    StoreType,
    WAREHOUSES,
} from "./stores";

export interface StockRow {
    warehouseId: string;
    productId: string;
    size: string;
    color: string;
    qty: number;
}

export interface MonthlyPerformance {
    storeId: string;
    /** YYYY-MM */
    month: string;
    revenue: number;
    cogs: number;
    /** Operating expense (rent, staff, utilities...). */
    opex: number;
    profit: number;
    orders: number;
    units: number;
}

export interface PurchaseOrderLine {
    productId: string;
    quantity: number;
    unitCost: number;
}

export interface PurchaseOrder {
    id: string;
    code: string;
    supplierId: string;
    warehouseId: string;
    createdAt: string;
    status: "draft" | "ordered" | "received";
    totalAmount: number;
    units: number;
    lines: PurchaseOrderLine[];
}

export const LOW_STOCK_THRESHOLD = 8;

function buildStock(): StockRow[] {
    const rows: StockRow[] = [];
    for (const wh of WAREHOUSES) {
        for (const product of PRODUCTS) {
            for (const size of product.sizes) {
                for (const color of product.colors) {
                    const rng = rngFor(`${wh.id}|${product.id}|${size}|${color}`);
                    // Regional warehouses hold far more stock than store warehouses.
                    const base = wh.type === "regional" ? randInt(rng, 40, 220) : randInt(rng, 0, 38);
                    rows.push({ warehouseId: wh.id, productId: product.id, size, color, qty: base });
                }
            }
        }
    }
    return rows;
}

export const STOCK: StockRow[] = buildStock();

export function monthKey(offsetFromCurrent: number): string {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - offsetFromCurrent, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Last 12 months, oldest first. */
export const MONTHS: string[] = Array.from({ length: 12 }, (_, i) => monthKey(11 - i));

function buildPerformance(): MonthlyPerformance[] {
    const rows: MonthlyPerformance[] = [];
    for (const store of STORES) {
        // Each store has its own steady growth trend + seasonality.
        const rng = rngFor(`perf|${store.id}`);
        const growth = 0.9 + rng() * 0.35; // baseline factor vs target
        for (let i = 0; i < MONTHS.length; i++) {
            const month = MONTHS[i];
            const monthIndex = Number(month.split("-")[1]);
            // Seasonality: peaks in months 11, 12, 1 (Tết) and a mid-year sale.
            const seasonal =
                monthIndex === 12 || monthIndex === 1
                    ? 1.35
                    : monthIndex === 11
                    ? 1.2
                    : monthIndex === 7
                    ? 1.1
                    : 1;
            const noise = 0.85 + rngFor(`${store.id}|${month}`)() * 0.3;
            const trend = 1 + i * 0.012; // slight month-over-month growth
            const revenue = Math.round(store.monthlyTarget * growth * seasonal * noise * trend);
            const grossMarginRate = 0.55 + rngFor(`gm|${store.id}|${month}`)() * 0.08;
            const cogs = Math.round(revenue * (1 - grossMarginRate));
            // Owned stores carry rent + payroll opex; franchise pay royalty instead.
            const opexRate = store.type === "owned" ? 0.3 : 0.18;
            const opex = Math.round(revenue * opexRate);
            const profit = revenue - cogs - opex;
            const avgOrderValue = 1_150_000 + rngFor(`aov|${store.id}|${month}`)() * 500_000;
            const orders = Math.max(1, Math.round(revenue / avgOrderValue));
            const units = Math.round(orders * (1.4 + rngFor(`u|${store.id}|${month}`)() * 0.8));
            rows.push({ storeId: store.id, month, revenue, cogs, opex, profit, orders, units });
        }
    }
    return rows;
}

export const PERFORMANCE: MonthlyPerformance[] = buildPerformance();

function buildPurchaseOrders(): PurchaseOrder[] {
    const orders: PurchaseOrder[] = [];
    let counter = 1;
    for (const wh of REGIONAL_WAREHOUSES) {
        const rng = rngFor(`po|${wh.id}`);
        const count = randInt(rng, 3, 4);
        for (let i = 0; i < count; i++) {
            const supplier = SUPPLIERS[randInt(rng, 0, SUPPLIERS.length - 1)];
            const lineCount = randInt(rng, 1, 4);
            const lines: PurchaseOrderLine[] = [];
            for (let j = 0; j < lineCount; j++) {
                const product = PRODUCTS[randInt(rng, 0, PRODUCTS.length - 1)];
                const quantity = randInt(rng, 20, 300);
                lines.push({
                    productId: product.id,
                    quantity,
                    unitCost: product.costPrice,
                });
            }
            const units = lines.reduce((sum, line) => sum + line.quantity, 0);
            const totalAmount = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
            const statusRoll = rng();
            const status: PurchaseOrder["status"] = statusRoll > 0.66 ? "received" : statusRoll > 0.33 ? "ordered" : "draft";
            const month = randInt(rng, 0, 3);
            const day = randInt(rng, 1, 27);
            const d = new Date();
            d.setMonth(d.getMonth() - month);
            d.setDate(day);
            orders.push({
                id: `po-${String(counter).padStart(3, "0")}`,
                code: `PO${String(counter).padStart(4, "0")}`,
                supplierId: supplier.id,
                warehouseId: wh.id,
                createdAt: d.toISOString(),
                status,
                totalAmount,
                units,
                lines,
            });
            counter++;
        }
    }
    return orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const PURCHASE_ORDERS: PurchaseOrder[] = buildPurchaseOrders();

/* -------------------------------------------------------------------------- */
/* Aggregation selectors                                                      */
/* -------------------------------------------------------------------------- */

export interface PerfTotals {
    revenue: number;
    cogs: number;
    opex: number;
    profit: number;
    orders: number;
    units: number;
}

export function emptyTotals(): PerfTotals {
    return { revenue: 0, cogs: 0, opex: 0, profit: 0, orders: 0, units: 0 };
}

export function sumPerformance(rows: MonthlyPerformance[]): PerfTotals {
    return rows.reduce((acc, r) => {
        acc.revenue += r.revenue;
        acc.cogs += r.cogs;
        acc.opex += r.opex;
        acc.profit += r.profit;
        acc.orders += r.orders;
        acc.units += r.units;
        return acc;
    }, emptyTotals());
}

export interface PerfFilter {
    regionId?: string | null;
    storeId?: string | null;
    month?: string | null;
    months?: string[] | null;
    storeType?: StoreType | null;
}

export function filterPerformance(filter: PerfFilter = {}): MonthlyPerformance[] {
    const storeById = new Map(STORES.map((s) => [s.id, s]));
    return PERFORMANCE.filter((row) => {
        const store = storeById.get(row.storeId);
        if (!store) return false;
        if (filter.storeId && row.storeId !== filter.storeId) return false;
        if (filter.regionId && store.regionId !== filter.regionId) return false;
        if (filter.storeType && store.type !== filter.storeType) return false;
        if (filter.month && row.month !== filter.month) return false;
        if (filter.months && !filter.months.includes(row.month)) return false;
        return true;
    });
}

/** Stock-on-hand quantity for a warehouse (optionally a single product). */
export function stockForWarehouse(warehouseId: string, productId?: string): StockRow[] {
    return STOCK.filter((s) => s.warehouseId === warehouseId && (!productId || s.productId === productId));
}

export function totalUnitsInWarehouse(warehouseId: string): number {
    return stockForWarehouse(warehouseId).reduce((sum, s) => sum + s.qty, 0);
}

export function stockValueForWarehouse(warehouseId: string): number {
    return stockForWarehouse(warehouseId).reduce((sum, s) => {
        const product = getProduct(s.productId);
        return sum + s.qty * (product?.costPrice || 0);
    }, 0);
}
