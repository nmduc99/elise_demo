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
import { LOW_STOCK_THRESHOLD, REGIONAL_WAREHOUSES } from "@/lib/demo/eliseData";
import { formatNumber, formatVndShort } from "@/lib/demo/format";
import type { WarehousePageState } from "./useWarehousePage";
import { PackageSearch, Warehouse as WarehouseIcon } from "lucide-react";

interface RegionalWarehouseTabProps {
    state: WarehousePageState;
}

export default function RegionalWarehouseTab({ state }: RegionalWarehouseTabProps) {
    const { regionalAccess, lockedStoreId, regionWhId, setRegionWhId, regionalUnits, regionalValue, regionalRows, regionalPager } = state;

    if (!regionalAccess.canAccess || lockedStoreId) {
        return null;
    }

    return (
        <TabsContent value="regional" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Select value={regionWhId} onValueChange={setRegionWhId}>
                    <SelectTrigger className="h-9 w-[260px] bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {REGIONAL_WAREHOUSES.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    label="Tổng tồn kho"
                    value={`${formatNumber(regionalUnits)} sp`}
                    icon={WarehouseIcon}
                    accent="primary"
                />
                <StatCard
                    label="Giá trị tồn (vốn)"
                    value={formatVndShort(regionalValue)}
                    icon={PackageSearch}
                    accent="green"
                />
                <StatCard
                    label="Số mã hàng"
                    value={formatNumber(regionalRows.length)}
                    accent="blue"
                />
            </div>
            <WarehouseStockTable pager={regionalPager} lowThreshold={LOW_STOCK_THRESHOLD * 5} />
        </TabsContent>
    );
}
