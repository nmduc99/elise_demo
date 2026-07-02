"use client";

import Pagination from "@/components/demo/Pagination";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatVndShort } from "@/lib/demo/format";
import type { PaginationState } from "@/lib/demo/usePagination";
import type { ProductStockRow } from "@/lib/demo/warehouse/types";

interface WarehouseStockTableProps {
    pager: PaginationState<ProductStockRow>;
    lowThreshold: number;
}

export default function WarehouseStockTable({ pager, lowThreshold }: WarehouseStockTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-4 py-3 font-medium">Sản phẩm</th>
                        <th className="px-4 py-3 font-medium">SKU</th>
                        <th className="px-4 py-3 text-right font-medium">Tồn kho</th>
                        <th className="px-4 py-3 text-right font-medium">Giá trị (vốn)</th>
                        <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {pager.pageItems.map(({ product, units, value }) => {
                        const out = units === 0;
                        const low = !out && units <= lowThreshold;

                        return (
                            <tr key={product.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{product.name}</td>
                                <td className="px-4 py-3 text-slate-400">{product.sku}</td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                    {formatNumber(units)}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">
                                    {formatVndShort(value)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {out ? (
                                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                                            Hết hàng
                                        </Badge>
                                    ) : low ? (
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                            Sắp hết
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                            Còn hàng
                                        </Badge>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Pagination
                page={pager.page}
                totalPages={pager.totalPages}
                total={pager.total}
                start={pager.start}
                end={pager.end}
                onPageChange={pager.setPage}
                unit="mã hàng"
            />
        </div>
    );
}
