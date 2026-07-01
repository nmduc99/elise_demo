/**
 * Cash book (sổ quỹ) seed data for the Elise demo.
 */

import { STORES } from "./stores";

export interface LedgerCategory {
    id: string;
    name: string;
    type: "in" | "out";
}

export interface LedgerEntry {
    id: string;
    code: string;
    time: string;
    storeId: string;
    type: "in" | "out";
    categoryId: string;
    payerOrPayee: string;
    amount: number;
    method: "cash" | "card" | "transfer";
    notes: string;
    status: "paid" | "pending";
}

export const LEDGER_CATEGORIES: LedgerCategory[] = [
    { id: "income_sales", name: "Tiền hàng", type: "in" },
    { id: "income_other", name: "Thu nhập khác", type: "in" },
    { id: "expense_other", name: "Chi phí khác", type: "out" },
    { id: "expense_salary", name: "Chi trả lương NV", type: "out" },
    { id: "expense_rent", name: "Thuê mặt bằng", type: "out" },
    { id: "expense_purchase", name: "Chi nhập hàng NCC", type: "out" },
    { id: "expense_transfer_withdraw", name: "Chuyển/Rút", type: "out" },
];

function buildLedger(): LedgerEntry[] {
    const entries: LedgerEntry[] = [];
    let counter = 1;
    const now = new Date();

    for (const store of STORES.slice(0, 6)) {
        for (let d = 0; d < 5; d++) {
            const date = new Date(now);
            date.setDate(date.getDate() - d);
            entries.push({
                id: `ledger-${counter}`,
                code: `PT${String(counter).padStart(4, "0")}`,
                time: date.toISOString(),
                storeId: store.id,
                type: "in",
                categoryId: "income_sales",
                payerOrPayee: "Doanh thu bán hàng",
                amount: 8_000_000 + counter * 120_000,
                method: counter % 3 === 0 ? "card" : "cash",
                notes: `Thu tiền bán hàng ngày ${date.toLocaleDateString("vi-VN")}`,
                status: "paid",
            });
            counter++;

            if (d % 2 === 0) {
                entries.push({
                    id: `ledger-${counter}`,
                    code: `PC${String(counter).padStart(4, "0")}`,
                    time: date.toISOString(),
                    storeId: store.id,
                    type: "out",
                    categoryId: d % 4 === 0 ? "expense_purchase" : "expense_other",
                    payerOrPayee: d % 4 === 0 ? "Nhà cung cấp" : "Chi phí vận hành",
                    amount: 1_500_000 + counter * 50_000,
                    method: "cash",
                    notes: d % 4 === 0 ? "Chi tiền nhập hàng" : "Chi phí phát sinh",
                    status: "paid",
                });
                counter++;
            }
        }
    }

    return entries.sort((a, b) => (a.time < b.time ? 1 : -1));
}

export const LEDGER_ENTRIES: LedgerEntry[] = buildLedger();

export function getLedgerCategory(id: string): LedgerCategory | undefined {
    return LEDGER_CATEGORIES.find((c) => c.id === id);
}
