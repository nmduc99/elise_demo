"use client";

import { Badge } from "@/components/ui/badge";
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
import {
    REGIONAL_WAREHOUSES,
    type PurchaseOrder,
    type Supplier,
    getWarehouse,
} from "@/lib/demo/eliseData";
import { formatDate, formatVnd } from "@/lib/demo/format";
import { labelClass } from "@/lib/demo/formClasses";
import PoLineItemsEditor from "./PoLineItemsEditor";
import { calcPoTotals, type PoDialogMode, type PoDraft } from "./purchaseOrderUtils";

export type { PoDraft, PoLineDraft, PoDialogMode } from "./purchaseOrderUtils";

const PO_STATUS: Record<PurchaseOrder["status"], { label: string; cls: string }> = {
    ordered: { label: "Đã đặt", cls: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    received: { label: "Đã nhập kho", cls: "bg-green-100 text-green-700 hover:bg-green-100" },
};

interface PurchaseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: PoDialogMode;
    draft: PoDraft;
    setDraft: (d: PoDraft) => void;
    onSave: () => void;
    suppliers: Supplier[];
    orderMeta?: Pick<PurchaseOrder, "code" | "status" | "createdAt">;
}

const DIALOG_TITLES: Record<PoDialogMode, string> = {
    create: "Tạo đơn nhập hàng",
    edit: "Chỉnh sửa đơn nhập hàng",
    view: "Chi tiết đơn nhập hàng",
};

export default function PurchaseOrderDialog({
    open,
    onOpenChange,
    mode,
    draft,
    setDraft,
    onSave,
    suppliers,
    orderMeta,
}: PurchaseOrderDialogProps) {
    const readOnly = mode === "view";
    const { units, totalAmount } = calcPoTotals(draft.lines);
    const supplierName = suppliers.find((s) => s.id === draft.supplierId)?.name ?? "—";
    const warehouseName = getWarehouse(draft.warehouseId)?.name ?? "—";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>
                        {DIALOG_TITLES[mode]}
                        {orderMeta?.code ? ` · ${orderMeta.code}` : ""}
                    </DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                    {orderMeta && (
                        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                            <span className="text-slate-500">Ngày tạo: <span className="font-medium text-slate-700">{formatDate(orderMeta.createdAt)}</span></span>
                            <Badge className={PO_STATUS[orderMeta.status].cls}>{PO_STATUS[orderMeta.status].label}</Badge>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Nhà cung cấp</label>
                            {readOnly ? (
                                <p className="rounded-md border bg-white px-3 py-2 text-sm text-slate-800">{supplierName}</p>
                            ) : (
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
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Kho nhận</label>
                            {readOnly ? (
                                <p className="rounded-md border bg-white px-3 py-2 text-sm text-slate-800">{warehouseName}</p>
                            ) : (
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
                            )}
                        </div>
                    </div>

                    <PoLineItemsEditor
                        lines={draft.lines}
                        onChange={(lines) => setDraft({ ...draft, lines })}
                        readOnly={readOnly}
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {readOnly ? "Đóng" : "Hủy"}
                    </Button>
                    {!readOnly && (
                        <Button
                            className="bg-custom text-white hover:bg-custom-hover"
                            onClick={onSave}
                            disabled={draft.lines.length === 0}
                        >
                            {mode === "edit" ? "Lưu thay đổi" : "Tạo đơn"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
