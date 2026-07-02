"use client";

import RoleGuard from "@/components/demo/RoleGuard";
import WarehousePageContent from "@/components/demo/warehouse/WarehousePageContent";
import { useWarehousePage } from "@/components/demo/warehouse/useWarehousePage";

export default function WarehousePage() {
    const state = useWarehousePage();

    return (
        <RoleGuard permission={["warehouse_regional", "warehouse_store"]}>
            <div className="w-full space-y-6 p-4 md:p-6">
                <WarehousePageContent state={state} />
            </div>
        </RoleGuard>
    );
}
