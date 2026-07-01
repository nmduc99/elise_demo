"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { type Company } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";

interface CompanyDialogProps {
    draft: Company | null;
    setDraft: (c: Company | null) => void;
    onSave: () => void;
}

export default function CompanyDialog({ draft, setDraft, onSave }: CompanyDialogProps) {
    return (
        <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
            <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Sửa thông tin công ty</DialogTitle></DialogHeader>
                {draft && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2"><label className={labelClass}>Tên công ty</label><input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                        <div><label className={labelClass}>Mã số thuế</label><input className={inputClass} value={draft.taxCode} onChange={(e) => setDraft({ ...draft, taxCode: e.target.value })} /></div>
                        <div><label className={labelClass}>Năm thành lập</label><input type="number" className={inputClass} value={draft.foundedYear} onChange={(e) => setDraft({ ...draft, foundedYear: Number(e.target.value) })} /></div>
                        <div className="col-span-2"><label className={labelClass}>Địa chỉ</label><input className={inputClass} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></div>
                        <div><label className={labelClass}>Điện thoại</label><input className={inputClass} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
                        <div><label className={labelClass}>Email</label><input className={inputClass} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
                        <div className="col-span-2"><label className={labelClass}>Website</label><input className={inputClass} value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} /></div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDraft(null)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
