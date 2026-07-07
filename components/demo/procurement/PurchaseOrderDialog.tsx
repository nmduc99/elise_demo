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
import { labelClass } from "@/lib/demo/formClasses";
import PoLineItemsEditor from "./PoLineItemsEditor";
import { calcPoTotals, type PoDraft } from "./purchaseOrderUtils";

export type { PoDraft, PoLineDraft } from "./purchaseOrderUtils";

interface PurchaseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: PoDraft;
    setDraft: (d: PoDraft) => void;
    onSave: () => void;
    suppliers: Supplier[];
}

export default function PurchaseOrderDialog({
    open,
    onOpenChange,
    draft,
    setDraft,
    onSave,
    suppliers,
}: PurchaseOrderDialogProps) {
    const { units, totalAmount } = calcPoTotals(draft.lines);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Tạo đơn nhập hàng</DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Nhà cung cấp</label>
                            <Select
                                value={draft.supplierId}
                                onValueChange={(v) => setDraft({ ...draft, supplierId: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className={labelClass}>Kho nhận</label>
                            <Select
                                value={draft.warehouseId}
                                onValueChange={(v) => setDraft({ ...draft, warehouseId: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {REGIONAL_WAREHOUSES.map((w) => (
                                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <PoLineItemsEditor
                        lines={draft.lines}
                        onChange={(lines) => setDraft({ ...draft, lines })}
                    />

                    <div className="rounded-lg bg-slate-50 p-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Tổng số lượng</span>
                            <span className="font-medium text-slate-700">{units} sp</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                            <span className="text-slate-500">Tổng giá trị</span>
                            <span className="font-bold text-custom">{formatVnd(totalAmount)}</span>
                        </div>
                    </div>
                </div>
                <DialogFooter className="shrink-0 border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button
                        className="bg-custom text-white hover:bg-custom-hover"
                        onClick={onSave}
                        disabled={draft.lines.length === 0}
                    >
                        Tạo đơn
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
