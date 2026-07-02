"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import { ScopeFilter } from "@/components/demo/ScopeFilter";
import DepartmentsTab from "@/components/demo/staff/DepartmentsTab";
import EmployeeFormDialog from "@/components/demo/staff/EmployeeFormDialog";
import EmployeesTab from "@/components/demo/staff/EmployeesTab";
import {
    DepartmentDialog,
    PositionDialog,
} from "@/components/demo/staff/OrgUnitDialogs";
import PositionsTab from "@/components/demo/staff/PositionsTab";
import StaffStats from "@/components/demo/staff/StaffStats";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StaffPageState } from "./useStaffPage";

interface StaffPageContentProps {
    state: StaffPageState;
}

export default function StaffPageContent({ state }: StaffPageContentProps) {
    const { scope, hrAccess, department, setDepartment, departments } = state;

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý nhân sự</h1>
                    <p className="text-sm text-slate-500">
                        Nhân viên, phòng ban, vị trí, điều chuyển & hồ sơ
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ScopeFilter scope={scope} />
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger className="h-9 w-[180px] bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả phòng ban</SelectItem>
                            {departments.items.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <AccessBanner access={hrAccess} />

            <StaffStats
                total={state.filtered.length}
                active={state.active}
                probation={state.probation}
                payroll={state.payroll}
            />

            <Tabs defaultValue="employees">
                <TabsList>
                    <TabsTrigger value="employees">Nhân viên</TabsTrigger>
                    <TabsTrigger value="departments">Phòng ban</TabsTrigger>
                    <TabsTrigger value="positions">Vị trí</TabsTrigger>
                </TabsList>

                <TabsContent value="employees">
                    <EmployeesTab state={state} />
                </TabsContent>

                <TabsContent value="departments">
                    <DepartmentsTab state={state} />
                </TabsContent>

                <TabsContent value="positions">
                    <PositionsTab state={state} />
                </TabsContent>
            </Tabs>

            <EmployeeFormDialog
                open={state.empOpen}
                onOpenChange={state.setEmpOpen}
                draft={state.empDraft}
                setDraft={state.setEmpDraft}
                onSave={state.saveEmp}
                departments={departments.items}
                positions={state.positions.items}
                storeOptions={state.storeOptions}
                lockStore={!!scope.scopedStoreId}
                canAssignRoles={state.canAssignRoles}
            />

            <DepartmentDialog
                open={state.deptOpen}
                onOpenChange={state.setDeptOpen}
                draft={state.deptDraft}
                setDraft={state.setDeptDraft}
                onSave={state.saveDept}
            />

            <PositionDialog
                open={state.posOpen}
                onOpenChange={state.setPosOpen}
                draft={state.posDraft}
                setDraft={state.setPosDraft}
                onSave={state.savePos}
                departments={departments.items}
            />
        </>
    );
}
