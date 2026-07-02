"use client";

import StatCard from "@/components/demo/StatCard";
import WarehouseStockTable from "@/components/demo/warehouse/WarehouseStockTable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { LOW_STOCK_THRESHOLD } from "@/lib/demo/eliseData";
import { formatNumber } from "@/lib/demo/format";
import type { WarehousePageState } from "./useWarehousePage";
import { Warehouse as WarehouseIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StoreWarehouseTabProps {
    state: WarehousePageState;
    transferDialog: ReactNode;
}

export default function StoreWarehouseTab({ state, transferDialog }: StoreWarehouseTabProps) {
    const {
        storeAccess,
        lockedStoreId,
        storeOptions,
        storeId,
        setStoreId,
        storeUnits,
        storeLow,
        storePager,
    } = state;

    if (!storeAccess.canAccess) {
        return null;
    }

    return (
        <TabsContent value="store" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Select value={storeId} onValueChange={setStoreId} disabled={!!lockedStoreId}>
                    <SelectTrigger className="h-9 w-[260px] bg-white">
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
                {lockedStoreId && transferDialog}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                    label="Tồn kho cửa hàng"
                    value={`${formatNumber(storeUnits)} sp`}
                    icon={WarehouseIcon}
                    accent="primary"
                />
                <StatCard label="Mã sắp hết hàng" value={formatNumber(storeLow)} accent="amber" />
            </div>
            <WarehouseStockTable pager={storePager} lowThreshold={LOW_STOCK_THRESHOLD * 3} />
        </TabsContent>
    );
}
