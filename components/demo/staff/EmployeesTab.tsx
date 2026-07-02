"use client";

import Pagination from "@/components/demo/Pagination";
import { DoughnutChart, ELISE_COLORS } from "@/components/demo/DemoCharts";
import { EmployeeRoleBadges } from "@/components/demo/staff/EmployeeRolePicker";
import { STATUS_CLASS, STATUS_LABEL } from "@/components/demo/staff/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { getRegion, getStore } from "@/lib/demo/eliseData";
import { formatVnd } from "@/lib/demo/format";
import { Plus } from "lucide-react";
import type { StaffPageState } from "./useStaffPage";

interface EmployeesTabProps {
    state: StaffPageState;
}

export default function EmployeesTab({ state }: EmployeesTabProps) {
    const router = useRouter();
    const { hrAccess, canAssignRoles, byDept, employeePage } = state;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="rounded-xl border bg-white p-4 shadow-sm sm:w-[320px]">
                    <h2 className="mb-3 text-sm font-semibold text-slate-700">
                        Cơ cấu theo phòng ban
                    </h2>
                    <DoughnutChart
                        data={{
                            labels: byDept.labels,
                            datasets: [
                                {
                                    data: byDept.values,
                                    backgroundColor: ELISE_COLORS.palette,
                                },
                            ],
                        }}
                        height={180}
                    />
                </div>
                {hrAccess.canWrite && (
                    <Button
                        className="bg-custom text-white hover:bg-custom-hover"
                        onClick={() => state.openEmp()}
                    >
                        <Plus size={16} className="mr-1.5" /> Thêm nhân viên
                    </Button>
                )}
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Mã NV</th>
                            <th className="px-4 py-3 font-medium">Họ tên</th>
                            <th className="px-4 py-3 font-medium">Cửa hàng</th>
                            <th className="px-4 py-3 font-medium">Phòng ban</th>
                            <th className="px-4 py-3 font-medium">Vị trí</th>
                            {canAssignRoles && (
                                <th className="px-4 py-3 font-medium">Vai trò hệ thống</th>
                            )}
                            <th className="px-4 py-3 text-right font-medium">Lương</th>
                            <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {employeePage.pageItems.map((employee) => (
                            <tr
                                key={employee.id}
                                className="cursor-pointer hover:bg-orange-50/50"
                                onClick={() =>
                                    router.push({
                                        pathname: "/staff/[id]",
                                        params: { id: employee.id },
                                    })
                                }
                            >
                                <td className="px-4 py-3 text-slate-400">{employee.code}</td>
                                <td className="px-4 py-3 font-medium text-custom">{employee.name}</td>
                                <td className="px-4 py-3 text-slate-600">
                                    {getStore(employee.storeId)?.name}
                                    <span className="block text-xs text-slate-400">
                                        {getRegion(employee.regionId)?.name}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{employee.department}</td>
                                <td className="px-4 py-3 text-slate-600">{employee.position}</td>
                                {canAssignRoles && (
                                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                                        <EmployeeRoleBadges roles={employee.systemRoles} />
                                    </td>
                                )}
                                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                    {formatVnd(employee.salary)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Badge className={STATUS_CLASS[employee.status]}>
                                        {STATUS_LABEL[employee.status]}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    page={employeePage.page}
                    totalPages={employeePage.totalPages}
                    total={employeePage.total}
                    start={employeePage.start}
                    end={employeePage.end}
                    onPageChange={employeePage.setPage}
                    unit="nhân viên"
                />
            </div>
        </div>
    );
}
