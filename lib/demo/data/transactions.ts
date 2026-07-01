/**
 * Transaction seed data (sales orders, pre-orders, returns) for the Elise demo.
 */

import { STORES } from "./stores";
import { CUSTOMERS } from "./catalog";
import { randInt, rngFor } from "./rng";

export interface SalesTransaction {
    id: string;
    code: string;
    storeId: string;
    customerName: string;
    createdAt: string;
    totalAmount: number;
    itemCount: number;
    paymentMethod: "cash" | "card" | "transfer";
    status: "completed" | "cancelled";
}

export interface OrderTransaction {
    id: string;
    code: string;
    storeId: string;
    customerName: string;
    createdAt: string;
    totalAmount: number;
    deposit: number;
    status: "pending" | "confirmed" | "delivered" | "cancelled";
    deliveryDate: string;
}

export interface ReturnTransaction {
    id: string;
    code: string;
    storeId: string;
    customerName: string;
    createdAt: string;
    totalAmount: number;
    reason: string;
    status: "pending" | "approved" | "refunded";
}

function buildSales(): SalesTransaction[] {
    const rows: SalesTransaction[] = [];
    let counter = 1;
    for (const store of STORES) {
        const rng = rngFor(`sales|${store.id}`);
        const count = randInt(rng, 4, 8);
        for (let i = 0; i < count; i++) {
            const customer = CUSTOMERS[randInt(rng, 0, CUSTOMERS.length - 1)];
            const d = new Date();
            d.setDate(d.getDate() - randInt(rng, 0, 30));
            rows.push({
                id: `sale-${counter}`,
                code: `BH${String(counter).padStart(5, "0")}`,
                storeId: store.id,
                customerName: customer.name,
                createdAt: d.toISOString(),
                totalAmount: randInt(rng, 500_000, 4_500_000),
                itemCount: randInt(rng, 1, 5),
                paymentMethod: (["cash", "card", "transfer"] as const)[randInt(rng, 0, 2)],
                status: rng() > 0.05 ? "completed" : "cancelled",
            });
            counter++;
        }
    }
    return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function buildOrders(): OrderTransaction[] {
    const rows: OrderTransaction[] = [];
    let counter = 1;
    for (const store of STORES.slice(0, 8)) {
        const rng = rngFor(`orders|${store.id}`);
        const count = randInt(rng, 2, 4);
        for (let i = 0; i < count; i++) {
            const total = randInt(rng, 800_000, 3_000_000);
            const d = new Date();
            d.setDate(d.getDate() - randInt(rng, 0, 14));
            const delivery = new Date(d);
            delivery.setDate(delivery.getDate() + randInt(rng, 2, 7));
            rows.push({
                id: `ord-${counter}`,
                code: `DH${String(counter).padStart(5, "0")}`,
                storeId: store.id,
                customerName: CUSTOMERS[randInt(rng, 1, CUSTOMERS.length - 1)].name,
                createdAt: d.toISOString(),
                totalAmount: total,
                deposit: Math.round(total * 0.3),
                status: (["pending", "confirmed", "delivered", "cancelled"] as const)[randInt(rng, 0, 3)],
                deliveryDate: delivery.toISOString().slice(0, 10),
            });
            counter++;
        }
    }
    return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function buildReturns(): ReturnTransaction[] {
    const rows: ReturnTransaction[] = [];
    let counter = 1;
    const reasons = ["Sai size", "Lỗi chất liệu", "Không vừa ý", "Đổi màu", "Hàng lỗi"];
    for (const store of STORES.slice(0, 6)) {
        const rng = rngFor(`returns|${store.id}`);
        const count = randInt(rng, 1, 3);
        for (let i = 0; i < count; i++) {
            const d = new Date();
            d.setDate(d.getDate() - randInt(rng, 0, 20));
            rows.push({
                id: `ret-${counter}`,
                code: `TH${String(counter).padStart(5, "0")}`,
                storeId: store.id,
                customerName: CUSTOMERS[randInt(rng, 1, CUSTOMERS.length - 1)].name,
                createdAt: d.toISOString(),
                totalAmount: randInt(rng, 200_000, 2_000_000),
                reason: reasons[randInt(rng, 0, reasons.length - 1)],
                status: (["pending", "approved", "refunded"] as const)[randInt(rng, 0, 2)],
            });
            counter++;
        }
    }
    return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const SALES_TRANSACTIONS: SalesTransaction[] = buildSales();
export const ORDER_TRANSACTIONS: OrderTransaction[] = buildOrders();
export const RETURN_TRANSACTIONS: ReturnTransaction[] = buildReturns();
