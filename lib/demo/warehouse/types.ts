export interface Transfer {
    id: string;
    createdAt: string;
    sourceWarehouseId: string;
    destWarehouseId: string;
    productId: string;
    size: string;
    color: string;
    qty: number;
}

export interface StockMovement {
    id: string;
    createdAt: string;
    type: "out" | "return_supplier";
    warehouseId: string;
    supplierId?: string;
    productId: string;
    size: string;
    color: string;
    qty: number;
    reason: string;
}

export interface StockMoveForm {
    regionId: string;
    supplierId: string;
    productId: string;
    size: string;
    color: string;
    qty: number;
    reason: string;
}

export interface TransferForm {
    regionId: string;
    destStoreId: string;
    productId: string;
    size: string;
    color: string;
    qty: number;
}

export interface ProductStockRow {
    product: {
        id: string;
        name: string;
        sku: string;
        costPrice: number;
    };
    units: number;
    value: number;
}
