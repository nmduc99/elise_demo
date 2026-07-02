"use client";

import Pagination from "@/components/demo/Pagination";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { OrganizationPageState } from "./useOrganizationPage";

interface ProvincesTabProps {
    state: OrganizationPageState;
}

export default function ProvincesTab({ state }: ProvincesTabProps) {
    const { provinces, stores, provincePage, regionName } = state;

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button
                    className="bg-custom text-white hover:bg-custom-hover"
                    onClick={() => {
                        state.setProvDraft({
                            id: "",
                            name: "",
                            regionId: state.regions.items[0]?.id ?? "",
                        });
                        state.setProvOpen(true);
                    }}
                >
                    <Plus size={16} className="mr-1.5" /> Thêm tỉnh/thành
                </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Tỉnh/thành</th>
                            <th className="px-4 py-3 font-medium">Khu vực</th>
                            <th className="px-4 py-3 text-right font-medium">Cửa hàng</th>
                            <th className="px-4 py-3 text-center font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {provincePage.pageItems.map((province) => (
                            <tr key={province.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {province.name}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {regionName(province.regionId)}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">
                                    {stores.items.filter((s) => s.provinceId === province.id).length}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => {
                                                state.setProvDraft(province);
                                                state.setProvOpen(true);
                                            }}
                                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => provinces.remove(province.id)}
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
                    page={provincePage.page}
                    totalPages={provincePage.totalPages}
                    total={provincePage.total}
                    start={provincePage.start}
                    end={provincePage.end}
                    onPageChange={provincePage.setPage}
                    unit="tỉnh/thành"
                />
            </div>
        </div>
    );
}
