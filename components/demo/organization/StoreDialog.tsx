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
import { type Province, type Store, type StoreStatus } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";

interface StoreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Store;
    setDraft: (s: Store) => void;
    onSave: () => void;
    provinces: Province[];
}

export default function StoreDialog({ open, onOpenChange, draft, setDraft, onSave, provinces }: StoreDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa cửa hàng" : "Thêm cửa hàng"}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>Mã cửa hàng</label><input className={inputClass} value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></div>
                    <div><label className={labelClass}>Tên cửa hàng</label><input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                    <div>
                        <label className={labelClass}>Tỉnh/thành</label>
                        <Select value={draft.provinceId} onValueChange={(v) => setDraft({ ...draft, provinceId: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{provinces.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className={labelClass}>Loại hình</label>
                        <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as Store["type"] })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="owned">Sở hữu</SelectItem>
                                <SelectItem value="franchise">Nhượng quyền</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2"><label className={labelClass}>Địa chỉ</label><input className={inputClass} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></div>
                    <div><label className={labelClass}>Quản lý</label><input className={inputClass} value={draft.managerName} onChange={(e) => setDraft({ ...draft, managerName: e.target.value })} /></div>
                    <div><label className={labelClass}>Điện thoại</label><input className={inputClass} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
                    <div><label className={labelClass}>Mục tiêu/tháng (vnđ)</label><input type="number" className={inputClass} value={draft.monthlyTarget} onChange={(e) => setDraft({ ...draft, monthlyTarget: Number(e.target.value) })} /></div>
                    <div><label className={labelClass}>Royalty (%)</label><input type="number" className={inputClass} value={draft.royaltyRate} onChange={(e) => setDraft({ ...draft, royaltyRate: Number(e.target.value) })} /></div>
                    <div>
                        <label className={labelClass}>Trạng thái</label>
                        <Select value={draft.status ?? "active"} onValueChange={(v) => setDraft({ ...draft, status: v as StoreStatus })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Đang hoạt động</SelectItem>
                                <SelectItem value="paused">Tạm đóng</SelectItem>
                                <SelectItem value="closed">Ngừng kinh doanh</SelectItem>
                            </SelectContent>
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
