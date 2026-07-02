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
import { REGIONAL_WAREHOUSES, type Supplier } from "@/lib/demo/eliseData";
import { formatVnd } from "@/lib/demo/format";
import { inputClass, labelClass } from "@/lib/demo/formClasses";

export interface PoDraft {
    supplierId: string;
    warehouseId: string;
    units: number;
    unitCost: number;
}

interface PurchaseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: PoDraft;
    setDraft: (d: PoDraft) => void;
    onSave: () => void;
    suppliers: Supplier[];
}

export default function PurchaseOrderDialog({ open, onOpenChange, draft, setDraft, onSave, suppliers }: PurchaseOrderDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Tạo đơn nhập hàng</DialogTitle></DialogHeader>
                <div className="space-y-3">
                    <div>
                        <label className={labelClass}>Nhà cung cấp</label>
                        <Select value={draft.supplierId} onValueChange={(v) => setDraft({ ...draft, supplierId: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {suppliers.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className={labelClass}>Kho nhận</label>
                        <Select value={draft.warehouseId} onValueChange={(v) => setDraft({ ...draft, warehouseId: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {REGIONAL_WAREHOUSES.map((w) => (<SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Số lượng</label>
                            <input type="number" min={1} className={inputClass} value={draft.units} onChange={(e) => setDraft({ ...draft, units: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className={labelClass}>Đơn giá (vnđ)</label>
                            <input type="number" min={0} className={inputClass} value={draft.unitCost} onChange={(e) => setDraft({ ...draft, unitCost: Number(e.target.value) })} />
                        </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-sm">
                        <span className="text-slate-500">Tổng giá trị: </span>
                        <span className="font-bold text-custom">{formatVnd(draft.units * draft.unitCost)}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Tạo đơn</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
