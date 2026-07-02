"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    PRODUCTS,
    REGIONAL_WAREHOUSES,
    getProduct,
} from "@/lib/demo/eliseData";
import type { StockMoveForm } from "@/lib/demo/warehouse/types";

interface StockMoveFieldsProps {
    form: StockMoveForm;
    setForm: React.Dispatch<React.SetStateAction<StockMoveForm>>;
    available: number;
    showSupplier?: boolean;
    suppliers?: { id: string; name: string }[];
    /** Khi trả hàng NCC: thứ tự & nhãn field theo tab kho khu vực / kho cửa hàng */
    returnMode?: "regional" | "store";
    storeId?: string;
    storeOptions?: { id: string; name: string }[];
    lockedStoreId?: string | null;
    onStoreIdChange?: (storeId: string) => void;
}

export default function StockMoveFields({
    form,
    setForm,
    available,
    showSupplier = false,
    suppliers = [],
    returnMode,
    storeId,
    storeOptions = [],
    lockedStoreId,
    onStoreIdChange,
}: StockMoveFieldsProps) {
    const moveProduct = getProduct(form.productId)!;
    const isStoreReturn = showSupplier && returnMode === "store";
    const isRegionalReturn = showSupplier && returnMode === "regional";

    const supplierField = showSupplier ? (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
                Nhà cung cấp
            </label>
            <Select
                value={form.supplierId}
                onValueChange={(value) =>
                    setForm((current) => ({ ...current, supplierId: value }))
                }
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    ) : null;

    const regionalWarehouseField = (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
                {isStoreReturn ? "Trả về kho khu vực" : "Kho khu vực"}
            </label>
            <Select
                value={form.regionId}
                onValueChange={(value) =>
                    setForm((current) => ({ ...current, regionId: value }))
                }
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {REGIONAL_WAREHOUSES.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.regionId}>
                            {warehouse.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    const storeField = isStoreReturn && storeId ? (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
                Cửa hàng
            </label>
            <Select
                value={storeId}
                onValueChange={(value) => onStoreIdChange?.(value)}
                disabled={!!lockedStoreId}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {storeOptions.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                            {store.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    ) : null;

    return (
        <div className="space-y-3">
            {isStoreReturn && storeField}
            {isStoreReturn && regionalWarehouseField}
            {isStoreReturn && supplierField}
            {isRegionalReturn && regionalWarehouseField}
            {isRegionalReturn && supplierField}
            {showSupplier && !returnMode && supplierField}

            <div className="grid grid-cols-2 gap-3">
                {!showSupplier && (
                    <div className="col-span-2">
                        {regionalWarehouseField}
                    </div>
                )}
                <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">Sản phẩm</label>
                    <Select
                        value={form.productId}
                        onValueChange={(value) => {
                            const product = getProduct(value)!;
                            setForm((current) => ({
                                ...current,
                                productId: value,
                                size: product.sizes[0],
                                color: product.colors[0],
                            }));
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PRODUCTS.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Size</label>
                    <Select
                        value={form.size}
                        onValueChange={(value) =>
                            setForm((current) => ({ ...current, size: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {moveProduct.sizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Màu</label>
                    <Select
                        value={form.color}
                        onValueChange={(value) =>
                            setForm((current) => ({ ...current, color: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {moveProduct.colors.map((color) => (
                                <SelectItem key={color} value={color}>
                                    {color}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                        Số lượng (tồn: {available})
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={form.qty}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                qty: Number(event.target.value),
                            }))
                        }
                        className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
                <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">Ghi chú</label>
                    <input
                        value={form.reason}
                        onChange={(event) =>
                            setForm((current) => ({ ...current, reason: event.target.value }))
                        }
                        className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
            </div>
        </div>
    );
}
