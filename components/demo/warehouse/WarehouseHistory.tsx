"use client";

import { Badge } from "@/components/ui/badge";
import { getProduct, getStore, getWarehouse } from "@/lib/demo/eliseData";
import type { StockMovement, Transfer } from "@/lib/demo/warehouse/types";

interface WarehouseHistoryProps {
    transfers: Transfer[];
    movements: StockMovement[];
}

export default function WarehouseHistory({ transfers, movements }: WarehouseHistoryProps) {
    if (transfers.length === 0 && movements.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-3 text-sm font-semibold text-slate-700">
                Lịch sử thao tác kho trong phiên
            </div>
            <div className="divide-y text-sm">
                {transfers.slice(0, 5).map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between px-5 py-2.5">
                        <span className="text-slate-700">
                            <Badge className="mr-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                                Điều chuyển
                            </Badge>
                            {getProduct(transfer.productId)?.name} ({transfer.size}/{transfer.color}) ×{" "}
                            {transfer.qty}
                        </span>
                        <span className="text-slate-400">
                            {getWarehouse(transfer.sourceWarehouseId)?.name} →{" "}
                            {getStore(transfer.destWarehouseId.replace("wh-", ""))?.name}
                        </span>
                    </div>
                ))}
                {movements.slice(0, 5).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between px-5 py-2.5">
                        <span className="text-slate-700">
                            <Badge
                                className={`mr-2 ${
                                    movement.type === "out"
                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                        : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                }`}
                            >
                                {movement.type === "out" ? "Xuất kho" : "Trả NCC"}
                            </Badge>
                            {getProduct(movement.productId)?.name} ({movement.size}/{movement.color}) ×{" "}
                            {movement.qty}
                        </span>
                        <span className="text-slate-400">{movement.reason}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
