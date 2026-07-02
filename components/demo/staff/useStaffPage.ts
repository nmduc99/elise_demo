"use client";

import { useDemoScope } from "@/components/demo/ScopeFilter";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import type { Department, Position } from "@/components/demo/staff/shared";
import { useToast } from "@/hooks/use-toast";
import {
    DEPARTMENTS,
    EMPLOYEES,
    STORES,
    getStore,
    type Employee,
} from "@/lib/demo/eliseData";
import {
    DEPT_SEED,
    DEFAULT_STORE_ID,
    POS_SEED,
    emptyEmployee,
    newId,
} from "@/lib/demo/staff/staffUtils";
import { usePagination } from "@/lib/demo/usePagination";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import { useMemo, useState } from "react";

export function useStaffPage() {
    const scope = useDemoScope();
    const hrAccess = useDemoAccess("hr");
    const canAssignRoles = hrAccess.role === "director" && hrAccess.canWrite;
    const { toast } = useToast();

    const employees = useCrudCollection<Employee>("elise-demo-employees", EMPLOYEES);
    const departments = useCrudCollection<Department>("elise-demo-departments", DEPT_SEED);
    const positions = useCrudCollection<Position>("elise-demo-positions", POS_SEED);

    const [department, setDepartment] = useState("all");

    const filtered = useMemo(() => {
        return employees.items.filter((employee) => {
            if (scope.storeId && employee.storeId !== scope.storeId) return false;
            if (scope.regionId && employee.regionId !== scope.regionId) return false;
            if (department !== "all" && employee.department !== department) return false;
            return true;
        });
    }, [employees.items, scope.storeId, scope.regionId, department]);

    const active = filtered.filter((employee) => employee.status === "active").length;
    const probation = filtered.filter((employee) => employee.status === "probation").length;
    const payroll = filtered.reduce((sum, employee) => sum + employee.salary, 0);

    const byDept = useMemo(() => {
        const labels = departments.items.map((dept) => dept.name);
        const values = labels.map(
            (dept) => filtered.filter((employee) => employee.department === dept).length,
        );
        return { labels, values };
    }, [departments.items, filtered]);

    const storeOptions = scope.scopedStoreId
        ? STORES.filter((store) => store.id === scope.scopedStoreId)
        : STORES;

    const [empOpen, setEmpOpen] = useState(false);
    const [empDraft, setEmpDraft] = useState<Employee>(
        emptyEmployee(scope.scopedStoreId ?? DEFAULT_STORE_ID),
    );
    const openEmp = (employee?: Employee) => {
        setEmpDraft(
            employee
                ? { ...employee }
                : emptyEmployee(scope.scopedStoreId ?? DEFAULT_STORE_ID),
        );
        setEmpOpen(true);
    };
    const saveEmp = () => {
        if (!empDraft.name.trim()) {
            toast({ title: "Thiếu họ tên", variant: "destructive" });
            return;
        }
        const payload: Employee = {
            ...empDraft,
            regionId: getStore(empDraft.storeId)?.regionId ?? empDraft.regionId,
        };
        if (empDraft.id) {
            employees.update(empDraft.id, payload);
            toast({
                title: "Đã cập nhật nhân viên",
                description: payload.name,
                variant: "success",
            });
        } else {
            employees.add({
                ...payload,
                id: newId("e"),
                code: payload.code || `NV${Date.now().toString().slice(-4)}`,
            });
            toast({
                title: "Đã thêm nhân viên",
                description: payload.name,
                variant: "success",
            });
        }
        setEmpOpen(false);
    };

    const [deptOpen, setDeptOpen] = useState(false);
    const [deptDraft, setDeptDraft] = useState<Department>({ id: "", name: "" });
    const saveDept = () => {
        if (!deptDraft.name.trim()) {
            toast({ title: "Thiếu tên phòng ban", variant: "destructive" });
            return;
        }
        if (deptDraft.id) departments.update(deptDraft.id, deptDraft);
        else departments.add({ ...deptDraft, id: newId("dept") });
        setDeptOpen(false);
    };

    const [posOpen, setPosOpen] = useState(false);
    const [posDraft, setPosDraft] = useState<Position>({
        id: "",
        name: "",
        department: DEPARTMENTS[0],
    });
    const savePos = () => {
        if (!posDraft.name.trim()) {
            toast({ title: "Thiếu tên vị trí", variant: "destructive" });
            return;
        }
        if (posDraft.id) positions.update(posDraft.id, posDraft);
        else positions.add({ ...posDraft, id: newId("pos") });
        setPosOpen(false);
    };

    const employeePage = usePagination(filtered, 10);
    const positionPage = usePagination(positions.items, 10);

    return {
        scope,
        hrAccess,
        canAssignRoles,
        department,
        setDepartment,
        filtered,
        active,
        probation,
        payroll,
        byDept,
        storeOptions,
        employees,
        departments,
        positions,
        empOpen,
        setEmpOpen,
        empDraft,
        setEmpDraft,
        openEmp,
        saveEmp,
        deptOpen,
        setDeptOpen,
        deptDraft,
        setDeptDraft,
        saveDept,
        posOpen,
        setPosOpen,
        posDraft,
        setPosDraft,
        savePos,
        employeePage,
        positionPage,
    };
}

export type StaffPageState = ReturnType<typeof useStaffPage>;
