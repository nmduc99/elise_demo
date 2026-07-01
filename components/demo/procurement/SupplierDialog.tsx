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
import { REGIONS, type Supplier } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";

interface SupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Supplier;
    setDraft: (s: Supplier) => void;
    onSave: () => void;
}

export default function SupplierDialog({ open, onOpenChange, draft, setDraft, onSave }: SupplierDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                    <div>
                        <label className={labelClass}>Tên nhà cung cấp</label>
                        <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Nhóm hàng</label>
                        <input className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Điện thoại</label>
                            <input className={inputClass} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Khu vực</label>
                            <Select value={draft.regionId} onValueChange={(v) => setDraft({ ...draft, regionId: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
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
