"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import RegionalWarehouseTab from "@/components/demo/warehouse/RegionalWarehouseTab";
import StoreWarehouseTab from "@/components/demo/warehouse/StoreWarehouseTab";
import { useWarehouseActionDialogs } from "@/components/demo/warehouse/WarehouseActionDialogs";
import WarehouseHistory from "@/components/demo/warehouse/WarehouseHistory";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WarehousePageState } from "./useWarehousePage";

interface WarehousePageContentProps {
    state: WarehousePageState;
}

export default function WarehousePageContent({ state }: WarehousePageContentProps) {
    const {
        lockedStoreId,
        regionalAccess,
        storeAccess,
        transferAccess,
        transfers,
        movements,
        defaultTab,
    } = state;

    const { stockOutDialog, returnSupplierDialog, transferDialog } = useWarehouseActionDialogs(state);

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý kho 2 cấp</h1>
                    <p className="text-sm text-slate-500">
                        Kho khu vực (kho tổng vùng) và kho từng cửa hàng theo tỉnh thành
                    </p>
                </div>
                {!lockedStoreId && (
                    <div className="flex flex-wrap gap-2">
                        {stockOutDialog}
                        {returnSupplierDialog}
                        {transferAccess.canWrite && transferDialog}
                    </div>
                )}
            </div>

            <AccessBanner access={storeAccess.isReadOnly ? storeAccess : regionalAccess} />

            <Tabs defaultValue={defaultTab}>
                <TabsList>
                    {regionalAccess.canAccess && !lockedStoreId && (
                        <TabsTrigger value="regional">Kho khu vực</TabsTrigger>
                    )}
                    {storeAccess.canAccess && (
                        <TabsTrigger value="store">Kho cửa hàng</TabsTrigger>
                    )}
                </TabsList>

                <RegionalWarehouseTab state={state} />
                <StoreWarehouseTab state={state} transferDialog={transferDialog} />
            </Tabs>

            <WarehouseHistory transfers={transfers} movements={movements} />
        </>
    );
}
