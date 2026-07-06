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
import { type Supplier } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";

export interface ContactDraft {
    id?: string;
    supplierId: string;
    name: string;
    title: string;
    phone: string;
    email: string;
}

interface ContactDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: ContactDraft;
    setDraft: (c: ContactDraft) => void;
    onSave: () => void;
    suppliers: Supplier[];
}

export default function ContactDialog({ open, onOpenChange, draft, setDraft, onSave, suppliers }: ContactDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa liên hệ" : "Thêm liên hệ"}</DialogTitle></DialogHeader>
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
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Họ tên</label>
                            <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Chức danh</label>
                            <input className={inputClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Điện thoại</label>
                            <input className={inputClass} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Email</label>
                            <input className={inputClass} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
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
