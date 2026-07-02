import {
    PRODUCTS,
    STOCK,
    stockForWarehouse,
} from "@/lib/demo/eliseData";
import type { ProductStockRow, StockMovement, Transfer } from "./types";

export function stockKey(warehouseId: string, productId: string, size: string, color: string): string {
    return `${warehouseId}|${productId}|${size}|${color}`;
}

export function buildAdjustments(
    transfers: Transfer[],
    movements: StockMovement[],
): Map<string, number> {
    const map = new Map<string, number>();

    for (const transfer of transfers) {
        const source = stockKey(
            transfer.sourceWarehouseId,
            transfer.productId,
            transfer.size,
            transfer.color,
        );
        const destination = stockKey(
            transfer.destWarehouseId,
            transfer.productId,
            transfer.size,
            transfer.color,
        );
        map.set(source, (map.get(source) ?? 0) - transfer.qty);
        map.set(destination, (map.get(destination) ?? 0) + transfer.qty);
    }

    for (const movement of movements) {
        const key = stockKey(
            movement.warehouseId,
            movement.productId,
            movement.size,
            movement.color,
        );
        map.set(key, (map.get(key) ?? 0) - movement.qty);
    }

    return map;
}

export function effectiveQty(
    warehouseId: string,
    productId: string,
    size: string,
    color: string,
    adjustments: Map<string, number>,
): number {
    const base =
        STOCK.find(
            (row) =>
                row.warehouseId === warehouseId &&
                row.productId === productId &&
                row.size === size &&
                row.color === color,
        )?.qty ?? 0;

    return Math.max(0, base + (adjustments.get(stockKey(warehouseId, productId, size, color)) ?? 0));
}

export function productRows(
    warehouseId: string,
    adjustments: Map<string, number>,
): ProductStockRow[] {
    return PRODUCTS.map((product) => {
        const rows = stockForWarehouse(warehouseId, product.id);
        let units = 0;

        for (const row of rows) {
            units += effectiveQty(warehouseId, product.id, row.size, row.color, adjustments);
        }

        return { product, units, value: units * product.costPrice };
    });
}
