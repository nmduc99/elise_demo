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
import { type Province, type Region } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";

interface RegionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Region;
    setDraft: (r: Region) => void;
    onSave: () => void;
}

export function RegionDialog({ open, onOpenChange, draft, setDraft, onSave }: RegionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa khu vực" : "Thêm khu vực"}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className={labelClass}>Tên khu vực</label><input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                    <div><label className={labelClass}>Mã</label><input className={inputClass} value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ProvinceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Province;
    setDraft: (p: Province) => void;
    onSave: () => void;
    regions: Region[];
}

export function ProvinceDialog({ open, onOpenChange, draft, setDraft, onSave, regions }: ProvinceDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa tỉnh/thành" : "Thêm tỉnh/thành"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                    <div><label className={labelClass}>Tên tỉnh/thành</label><input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                    <div>
                        <label className={labelClass}>Khu vực</label>
                        <Select value={draft.regionId} onValueChange={(v) => setDraft({ ...draft, regionId: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{regions.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}</SelectContent>
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
