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
import { inputClass, labelClass } from "@/lib/demo/formClasses";
import type { Department, Position } from "./shared";

interface DepartmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Department;
    setDraft: (d: Department) => void;
    onSave: () => void;
}

export function DepartmentDialog({ open, onOpenChange, draft, setDraft, onSave }: DepartmentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa phòng ban" : "Thêm phòng ban"}</DialogTitle></DialogHeader>
                <div><label className={labelClass}>Tên phòng ban</label><input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface PositionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Position;
    setDraft: (p: Position) => void;
    onSave: () => void;
    departments: Department[];
}

export function PositionDialog({ open, onOpenChange, draft, setDraft, onSave, departments }: PositionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa vị trí" : "Thêm vị trí"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                    <div><label className={labelClass}>Tên vị trí</label><input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                    <div>
                        <label className={labelClass}>Phòng ban</label>
                        <Select value={draft.department} onValueChange={(v) => setDraft({ ...draft, department: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{departments.map((d) => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}</SelectContent>
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
