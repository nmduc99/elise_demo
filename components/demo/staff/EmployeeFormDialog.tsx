"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type Employee, type EmployeeStatus, type Store } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";
import type { Department, Position } from "./shared";

interface EmployeeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Employee;
    setDraft: (e: Employee) => void;
    onSave: () => void;
    departments: Department[];
    positions: Position[];
    storeOptions: Store[];
    lockStore: boolean;
}

export default function EmployeeFormDialog({
    open,
    onOpenChange,
    draft,
    setDraft,
    onSave,
    departments,
    positions,
    storeOptions,
    lockStore,
}: EmployeeFormDialogProps) {
    const positionsForDept = positions.filter((p) => p.department === draft.department);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa nhân viên" : "Thêm nhân viên"}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>Mã NV</label><input className={inputClass} value={draft.code} placeholder="Tự sinh nếu để trống" onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></div>
                    <div><label className={labelClass}>Họ tên</label><input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                    <div className="col-span-2">
                        <label className={labelClass}>Cửa hàng (Assign Store)</label>
                        <Select value={draft.storeId} onValueChange={(v) => setDraft({ ...draft, storeId: v })} disabled={lockStore}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{storeOptions.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className={labelClass}>Phòng ban</label>
                        <Select value={draft.department} onValueChange={(v) => setDraft({ ...draft, department: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{departments.map((d) => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className={labelClass}>Vị trí</label>
                        <Select value={draft.position} onValueChange={(v) => setDraft({ ...draft, position: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {(positionsForDept.length ? positionsForDept : positions).map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div><label className={labelClass}>Lương (đ)</label><input type="number" className={inputClass} value={draft.salary} onChange={(e) => setDraft({ ...draft, salary: Number(e.target.value) })} /></div>
                    <div><label className={labelClass}>Ngày vào làm</label><input type="date" className={inputClass} value={draft.joinedAt.slice(0, 10)} onChange={(e) => setDraft({ ...draft, joinedAt: e.target.value })} /></div>
                    <div className="col-span-2">
                        <label className={labelClass}>Trạng thái</label>
                        <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as EmployeeStatus })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Đang làm việc</SelectItem>
                                <SelectItem value="probation">Thử việc</SelectItem>
                                <SelectItem value="leave">Nghỉ phép</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
