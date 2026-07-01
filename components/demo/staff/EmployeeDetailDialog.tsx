"use client";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { type Employee, getRegion, getStore } from "@/lib/demo/eliseData";
import { formatDate, formatVnd } from "@/lib/demo/format";
import { STATUS_CLASS, STATUS_LABEL } from "./shared";

interface EmployeeDetailDialogProps {
    employee: Employee | null;
    onClose: () => void;
}

export default function EmployeeDetailDialog({ employee, onClose }: EmployeeDetailDialogProps) {
    return (
        <Dialog open={!!employee} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                {employee && (
                    <>
                        <DialogHeader><DialogTitle>Hồ sơ nhân viên</DialogTitle></DialogHeader>
                        <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-custom">
                                {employee.name.charAt(0)}
                            </span>
                            <div>
                                <p className="text-lg font-bold text-slate-900">{employee.name}</p>
                                <p className="text-sm text-slate-500">{employee.code} · {employee.position}</p>
                            </div>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><dt className="text-slate-400">Phòng ban</dt><dd className="font-medium text-slate-700">{employee.department}</dd></div>
                            <div><dt className="text-slate-400">Trạng thái</dt><dd><Badge className={STATUS_CLASS[employee.status]}>{STATUS_LABEL[employee.status]}</Badge></dd></div>
                            <div><dt className="text-slate-400">Cửa hàng</dt><dd className="font-medium text-slate-700">{getStore(employee.storeId)?.name}</dd></div>
                            <div><dt className="text-slate-400">Khu vực</dt><dd className="font-medium text-slate-700">{getRegion(employee.regionId)?.name}</dd></div>
                            <div><dt className="text-slate-400">Lương</dt><dd className="font-medium text-slate-700">{formatVnd(employee.salary)}</dd></div>
                            <div><dt className="text-slate-400">Ngày vào làm</dt><dd className="font-medium text-slate-700">{formatDate(employee.joinedAt)}</dd></div>
                        </dl>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
