import { PRODUCTS, REGIONAL_WAREHOUSES, SUPPLIERS } from "@/lib/demo/eliseData";
import type { PurchaseOrderLine } from "@/lib/demo/eliseData";

export interface PoLineDraft {
    productId: string;
    quantity: number;
    unitCost: number;
}

export interface PoDraft {
    supplierId: string;
    warehouseId: string;
    lines: PoLineDraft[];
}

export function emptyPoLine(productId = PRODUCTS[0].id): PoLineDraft {
    const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
    return {
        productId: product.id,
        quantity: 50,
        unitCost: product.costPrice,
    };
}

export function emptyPoDraft(): PoDraft {
    return {
        supplierId: SUPPLIERS[0].id,
        warehouseId: REGIONAL_WAREHOUSES[0].id,
        lines: [emptyPoLine()],
    };
}

export function calcPoTotals(lines: PoLineDraft[] | PurchaseOrderLine[]) {
    const units = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalAmount = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
    return { units, totalAmount };
}

export function formatPoProductSummary(lines: PurchaseOrderLine[] | undefined, maxNames = 2): string {
    if (!lines?.length) {
        return "—";
    }
    const names = lines
        .map((line) => PRODUCTS.find((p) => p.id === line.productId)?.name)
        .filter(Boolean) as string[];
    if (names.length <= maxNames) {
        return names.join(", ");
    }
    return `${names.slice(0, maxNames).join(", ")} +${names.length - maxNames}`;
}
