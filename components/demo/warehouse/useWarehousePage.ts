"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import { useToast } from "@/hooks/use-toast";
import {
    LOW_STOCK_THRESHOLD,
    PRODUCTS,
    REGIONAL_WAREHOUSES,
    STORES,
    SUPPLIERS,
    getProduct,
    getStore,
    regionalWarehouseForRegion,
} from "@/lib/demo/eliseData";
import { getRoleFromUser } from "@/lib/demo/roles";
import { usePagination } from "@/lib/demo/usePagination";
import { useLocalCollection } from "@/lib/demo/useLocalCollection";
import type { StockMoveForm, Transfer, TransferForm } from "@/lib/demo/warehouse/types";
import type { StockMovement } from "@/lib/demo/warehouse/types";
import {
    buildAdjustments,
    effectiveQty,
    productRows,
} from "@/lib/demo/warehouse/warehouseUtils";
import { useMemo, useState } from "react";

const DEFAULT_TRANSFER_FORM: TransferForm = {
    regionId: REGIONAL_WAREHOUSES[0].regionId,
    destStoreId: STORES[0].id,
    productId: PRODUCTS[0].id,
    size: PRODUCTS[0].sizes[0],
    color: PRODUCTS[0].colors[0],
    qty: 10,
};

const DEFAULT_MOVE_FORM: StockMoveForm = {
    regionId: REGIONAL_WAREHOUSES[0].regionId,
    supplierId: SUPPLIERS[0].id,
    productId: PRODUCTS[0].id,
    size: PRODUCTS[0].sizes[0],
    color: PRODUCTS[0].colors[0],
    qty: 5,
    reason: "",
};

export function useWarehousePage() {
    const { user } = useAuth();
    const role = getRoleFromUser(user);
    const lockedStoreId = role === "store_manager" ? user?.storeId ?? null : null;
    const regionalAccess = useDemoAccess("warehouse_regional");
    const storeAccess = useDemoAccess("warehouse_store");
    const transferAccess = useDemoAccess("stock_transfer");
    const stockOutAccess = useDemoAccess("stock_out");
    const { toast } = useToast();

    const [transfers, addTransfer] = useLocalCollection<Transfer>("elise-demo-transfers");
    const [movements, addMovement] = useLocalCollection<StockMovement>("elise-demo-stock-movements");

    const adjustments = useMemo(
        () => buildAdjustments(transfers, movements),
        [transfers, movements],
    );

    const getEffectiveQty = (warehouseId: string, productId: string, size: string, color: string) =>
        effectiveQty(warehouseId, productId, size, color, adjustments);

    const [regionWhId, setRegionWhId] = useState<string>(REGIONAL_WAREHOUSES[0].id);
    const regionalRows = useMemo(
        () => productRows(regionWhId, adjustments),
        [regionWhId, adjustments],
    );
    const regionalUnits = regionalRows.reduce((sum, row) => sum + row.units, 0);
    const regionalValue = regionalRows.reduce((sum, row) => sum + row.value, 0);

    const storeOptions = lockedStoreId ? STORES.filter((store) => store.id === lockedStoreId) : STORES;
    const [storeId, setStoreId] = useState<string>(lockedStoreId ?? STORES[0].id);
    const storeWhId = `wh-${storeId}`;
    const storeRows = useMemo(
        () => productRows(storeWhId, adjustments),
        [storeWhId, adjustments],
    );
    const storeUnits = storeRows.reduce((sum, row) => sum + row.units, 0);
    const storeLow = storeRows.filter(
        (row) => row.units > 0 && row.units <= LOW_STOCK_THRESHOLD * 3,
    ).length;

    const regionalPager = usePagination(regionalRows, 10);
    const storePager = usePagination(storeRows, 10);

    const [transferOpen, setTransferOpen] = useState(false);
    const [transferForm, setTransferForm] = useState<TransferForm>({
        ...DEFAULT_TRANSFER_FORM,
        destStoreId: lockedStoreId ?? STORES[0].id,
    });

    const [outOpen, setOutOpen] = useState(false);
    const [returnOpen, setReturnOpen] = useState(false);
    const [moveForm, setMoveForm] = useState<StockMoveForm>(DEFAULT_MOVE_FORM);
    const defaultTab = regionalAccess.canAccess && !lockedStoreId ? "regional" : "store";
    const [activeTab, setActiveTab] = useState<"regional" | "store">(
        defaultTab as "regional" | "store",
    );

    const syncMoveFormForReturn = () => {
        if (activeTab === "store") {
            const store = getStore(storeId);
            if (store) {
                setMoveForm((current) => ({ ...current, regionId: store.regionId }));
            }
            return;
        }
        const warehouse = REGIONAL_WAREHOUSES.find((item) => item.id === regionWhId);
        if (warehouse) {
            setMoveForm((current) => ({ ...current, regionId: warehouse.regionId }));
        }
    };

    const handleReturnOpenChange = (open: boolean) => {
        if (open) {
            syncMoveFormForReturn();
        }
        setReturnOpen(open);
    };

    const transferProduct = getProduct(transferForm.productId)!;
    const sourceWhId =
        regionalWarehouseForRegion(transferForm.regionId)?.id ?? REGIONAL_WAREHOUSES[0].id;
    const transferAvailable = getEffectiveQty(
        sourceWhId,
        transferForm.productId,
        transferForm.size,
        transferForm.color,
    );

    const moveProduct = getProduct(moveForm.productId)!;
    const regionalMoveWhId =
        regionalWarehouseForRegion(moveForm.regionId)?.id ?? REGIONAL_WAREHOUSES[0].id;
    const storeMoveWhId = `wh-${storeId}`;
    const regionalMoveAvailable = getEffectiveQty(
        regionalMoveWhId,
        moveForm.productId,
        moveForm.size,
        moveForm.color,
    );
    const storeMoveAvailable = getEffectiveQty(
        storeMoveWhId,
        moveForm.productId,
        moveForm.size,
        moveForm.color,
    );
    const returnMoveAvailable = activeTab === "store" ? storeMoveAvailable : regionalMoveAvailable;

    const submitTransfer = () => {
        if (transferForm.qty <= 0) {
            toast({ title: "Số lượng không hợp lệ", variant: "destructive" });
            return;
        }
        if (transferForm.qty > transferAvailable) {
            toast({
                title: "Vượt quá tồn kho khu vực",
                description: `Chỉ còn ${transferAvailable} sản phẩm`,
                variant: "destructive",
            });
            return;
        }
        if (transferAccess.isProposeOnly) {
            toast({
                title: "Đã gửi đề nghị điều chuyển",
                description: `${transferForm.qty} x ${transferProduct.name} → ${getStore(transferForm.destStoreId)?.name}. Chờ phòng thu mua duyệt.`,
                variant: "success",
            });
            setTransferOpen(false);
            return;
        }
        addTransfer({
            id: `tr-${Date.now()}`,
            createdAt: new Date().toISOString(),
            sourceWarehouseId: sourceWhId,
            destWarehouseId: `wh-${transferForm.destStoreId}`,
            productId: transferForm.productId,
            size: transferForm.size,
            color: transferForm.color,
            qty: transferForm.qty,
        });
        toast({
            title: "Điều chuyển thành công",
            description: `${transferForm.qty} x ${transferProduct.name} → ${getStore(transferForm.destStoreId)?.name}`,
            variant: "success",
        });
        setTransferOpen(false);
    };

    const submitStockOut = () => {
        if (moveForm.qty <= 0 || moveForm.qty > regionalMoveAvailable) {
            toast({ title: "Số lượng không hợp lệ", variant: "destructive" });
            return;
        }
        addMovement({
            id: `mv-out-${Date.now()}`,
            createdAt: new Date().toISOString(),
            type: "out",
            warehouseId: regionalMoveWhId,
            productId: moveForm.productId,
            size: moveForm.size,
            color: moveForm.color,
            qty: moveForm.qty,
            reason: moveForm.reason || "Xuất kho",
        });
        toast({
            title: "Đã xuất kho",
            description: `${moveForm.qty} x ${moveProduct.name}`,
            variant: "success",
        });
        setOutOpen(false);
    };

    const submitReturnSupplier = () => {
        const returnWhId = activeTab === "store" ? storeMoveWhId : regionalMoveWhId;
        const available = activeTab === "store" ? storeMoveAvailable : regionalMoveAvailable;

        if (moveForm.qty <= 0 || moveForm.qty > available) {
            toast({ title: "Số lượng không hợp lệ", variant: "destructive" });
            return;
        }
        if (!moveForm.supplierId) {
            toast({ title: "Vui lòng chọn nhà cung cấp", variant: "destructive" });
            return;
        }
        const supplier = SUPPLIERS.find((item) => item.id === moveForm.supplierId);
        const store = activeTab === "store" ? getStore(storeId) : undefined;
        const regionalWarehouse = regionalWarehouseForRegion(moveForm.regionId);
        addMovement({
            id: `mv-ret-${Date.now()}`,
            createdAt: new Date().toISOString(),
            type: "return_supplier",
            warehouseId: returnWhId,
            supplierId: moveForm.supplierId,
            productId: moveForm.productId,
            size: moveForm.size,
            color: moveForm.color,
            qty: moveForm.qty,
            reason:
                moveForm.reason ||
                (activeTab === "store"
                    ? `Trả hàng NCC từ ${store?.name} → ${regionalWarehouse?.name}: ${supplier?.name}`
                    : `Trả hàng NCC: ${supplier?.name}`),
        });
        toast({
            title: "Đã trả hàng cho NCC",
            description:
                activeTab === "store"
                    ? `${moveForm.qty} x ${moveProduct.name} từ ${store?.name} → ${supplier?.name}`
                    : `${moveForm.qty} x ${moveProduct.name} → ${supplier?.name}`,
            variant: "success",
        });
        setReturnOpen(false);
    };

    const transferLabel = transferAccess.isProposeOnly ? "Đề nghị điều chuyển" : "Điều chuyển kho";
    const canTransfer = transferAccess.canWrite || transferAccess.isProposeOnly;

    const handleStoreIdChange = (nextStoreId: string) => {
        setStoreId(nextStoreId);
        const store = getStore(nextStoreId);
        if (store) {
            setMoveForm((current) => ({ ...current, regionId: store.regionId }));
        }
    };

    return {
        lockedStoreId,
        regionalAccess,
        storeAccess,
        transferAccess,
        stockOutAccess,
        transfers,
        movements,
        regionWhId,
        setRegionWhId,
        regionalRows,
        regionalUnits,
        regionalValue,
        regionalPager,
        storeOptions,
        storeId,
        setStoreId,
        storeUnits,
        storeLow,
        storePager,
        transferOpen,
        setTransferOpen,
        transferForm,
        setTransferForm,
        transferProduct,
        transferAvailable,
        submitTransfer,
        transferLabel,
        canTransfer,
        outOpen,
        setOutOpen,
        returnOpen,
        setReturnOpen,
        handleReturnOpenChange,
        moveForm,
        setMoveForm,
        regionalMoveAvailable,
        returnMoveAvailable,
        submitStockOut,
        submitReturnSupplier,
        defaultTab,
        activeTab,
        setActiveTab,
        handleStoreIdChange,
    };
}

export type WarehousePageState = ReturnType<typeof useWarehousePage>;
