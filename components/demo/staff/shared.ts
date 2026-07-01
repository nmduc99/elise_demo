import type { EmployeeStatus } from "@/lib/demo/eliseData";

export interface Department {
    id: string;
    name: string;
}

export interface Position {
    id: string;
    name: string;
    department: string;
}

export const STATUS_LABEL: Record<EmployeeStatus, string> = {
    active: "Đang làm việc",
    probation: "Thử việc",
    leave: "Nghỉ phép",
};

export const STATUS_CLASS: Record<EmployeeStatus, string> = {
    active: "bg-green-100 text-green-700 hover:bg-green-100",
    probation: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    leave: "bg-slate-100 text-slate-600 hover:bg-slate-100",
};
