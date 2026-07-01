"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { type Brand } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";

interface CategoryDraft {
    id: string;
    name: string;
}

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: CategoryDraft;
    setDraft: (d: CategoryDraft) => void;
    onSave: () => void;
}

export function CategoryDialog({ open, onOpenChange, draft, setDraft, onSave }: CategoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{draft.id ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
                </DialogHeader>
                <div>
                    <label className={labelClass}>Tên danh mục</label>
                    <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface BrandDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Brand;
    setDraft: (b: Brand) => void;
    onSave: () => void;
}

export function BrandDialog({ open, onOpenChange, draft, setDraft, onSave }: BrandDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{draft.id ? "Sửa thương hiệu" : "Thêm thương hiệu"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div>
                        <label className={labelClass}>Tên thương hiệu</label>
                        <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Ghi chú</label>
                        <input className={inputClass} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
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
