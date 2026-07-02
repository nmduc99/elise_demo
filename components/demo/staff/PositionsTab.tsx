"use client";

import Pagination from "@/components/demo/Pagination";
import { Button } from "@/components/ui/button";
import { DEPARTMENTS } from "@/lib/demo/eliseData";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { StaffPageState } from "./useStaffPage";

interface PositionsTabProps {
    state: StaffPageState;
}

export default function PositionsTab({ state }: PositionsTabProps) {
    const { positions, employees, positionPage } = state;

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button
                    className="bg-custom text-white hover:bg-custom-hover"
                    onClick={() => {
                        state.setPosDraft({
                            id: "",
                            name: "",
                            department: state.departments.items[0]?.name ?? DEPARTMENTS[0],
                        });
                        state.setPosOpen(true);
                    }}
                >
                    <Plus size={16} className="mr-1.5" /> Thêm vị trí
                </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Vị trí</th>
                            <th className="px-4 py-3 font-medium">Phòng ban</th>
                            <th className="px-4 py-3 text-right font-medium">Số NV</th>
                            <th className="px-4 py-3 text-center font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {positionPage.pageItems.map((position) => (
                            <tr key={position.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{position.name}</td>
                                <td className="px-4 py-3 text-slate-600">{position.department}</td>
                                <td className="px-4 py-3 text-right text-slate-600">
                                    {
                                        employees.items.filter(
                                            (employee) => employee.position === position.name,
                                        ).length
                                    }
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => {
                                                state.setPosDraft(position);
                                                state.setPosOpen(true);
                                            }}
                                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => positions.remove(position.id)}
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
                    page={positionPage.page}
                    totalPages={positionPage.totalPages}
                    total={positionPage.total}
                    start={positionPage.start}
                    end={positionPage.end}
                    onPageChange={positionPage.setPage}
                    unit="vị trí"
                />
            </div>
        </div>
    );
}
