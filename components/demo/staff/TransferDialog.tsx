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
import { STORES, type Employee, getStore } from "@/lib/demo/eliseData";
import { labelClass } from "@/lib/demo/formClasses";

interface TransferDialogProps {
    employee: Employee | null;
    transferTo: string;
    setTransferTo: (id: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export default function TransferDialog({
    employee,
    transferTo,
    setTransferTo,
    onClose,
    onConfirm,
}: TransferDialogProps) {
    return (
        <Dialog open={!!employee} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Điều chuyển nhân viên</DialogTitle></DialogHeader>
                {employee && (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">{employee.name}</span> · hiện tại: {getStore(employee.storeId)?.name}
                        </p>
                        <div>
                            <label className={labelClass}>Chuyển đến cửa hàng</label>
                            <Select value={transferTo} onValueChange={setTransferTo}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{STORES.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onConfirm}>Xác nhận</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
