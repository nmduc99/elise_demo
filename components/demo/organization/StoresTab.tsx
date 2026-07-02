"use client";

import Pagination from "@/components/demo/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVndShort } from "@/lib/demo/format";
import { STORE_STATUS } from "@/lib/demo/organization/organizationUtils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { OrganizationPageState } from "./useOrganizationPage";

interface StoresTabProps {
    state: OrganizationPageState;
}

export default function StoresTab({ state }: StoresTabProps) {
    const { stores, storePage, provinceName } = state;

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button
                    className="bg-custom text-white hover:bg-custom-hover"
                    onClick={() => state.openStore()}
                >
                    <Plus size={16} className="mr-1.5" /> Thêm cửa hàng
                </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Cửa hàng</th>
                            <th className="px-4 py-3 font-medium">Tỉnh/thành</th>
                            <th className="px-4 py-3 font-medium">Loại hình</th>
                            <th className="px-4 py-3 font-medium">Quản lý</th>
                            <th className="px-4 py-3 text-right font-medium">Mục tiêu/tháng</th>
                            <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                            <th className="px-4 py-3 text-center font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {storePage.pageItems.map((store) => (
                            <tr key={store.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-800">{store.name}</p>
                                    <p className="text-xs text-slate-400">{store.code}</p>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {provinceName(store.provinceId)}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        className={
                                            store.type === "franchise"
                                                ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                                : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                        }
                                    >
                                        {store.type === "franchise" ? "Nhượng quyền" : "Sở hữu"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{store.managerName}</td>
                                <td className="px-4 py-3 text-right text-slate-700">
                                    {formatVndShort(store.monthlyTarget)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Badge className={STORE_STATUS[store.status ?? "active"].cls}>
                                        {STORE_STATUS[store.status ?? "active"].label}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => state.openStore(store)}
                                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => stores.remove(store.id)}
                                            className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    page={storePage.page}
                    totalPages={storePage.totalPages}
                    total={storePage.total}
                    start={storePage.start}
                    end={storePage.end}
                    onPageChange={storePage.setPage}
                    unit="cửa hàng"
                />
            </div>
        </div>
    );
}
