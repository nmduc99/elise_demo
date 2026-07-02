"use client";

import { Button } from "@/components/ui/button";
import { Building, Pencil, Plus, Trash2 } from "lucide-react";
import type { StaffPageState } from "./useStaffPage";

interface DepartmentsTabProps {
    state: StaffPageState;
}

export default function DepartmentsTab({ state }: DepartmentsTabProps) {
    const { departments, employees } = state;

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button
                    className="bg-custom text-white hover:bg-custom-hover"
                    onClick={() => {
                        state.setDeptDraft({ id: "", name: "" });
                        state.setDeptOpen(true);
                    }}
                >
                    <Plus size={16} className="mr-1.5" /> Thêm phòng ban
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {departments.items.map((department) => (
                    <div
                        key={department.id}
                        className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Building size={16} />
                            </span>
                            <div>
                                <p className="font-semibold text-slate-800">{department.name}</p>
                                <p className="text-xs text-slate-400">
                                    {
                                        employees.items.filter(
                                            (employee) => employee.department === department.name,
                                        ).length
                                    }{" "}
                                    NV
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    state.setDeptDraft(department);
                                    state.setDeptOpen(true);
                                }}
                                className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={() => departments.remove(department.id)}
                                className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
