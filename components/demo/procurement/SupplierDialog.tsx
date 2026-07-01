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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REGIONS, type Supplier, type SupplierContact } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";
import { Plus, Trash2 } from "lucide-react";

interface SupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: Supplier;
    setDraft: (s: Supplier) => void;
    onSave: () => void;
}

const emptyContact = (): SupplierContact => ({
    name: "",
    title: "",
    phone: "",
    email: "",
});

export default function SupplierDialog({ open, onOpenChange, draft, setDraft, onSave }: SupplierDialogProps) {
    const updateContact = (index: number, patch: Partial<SupplierContact>) => {
        const contacts = [...draft.contacts];
        contacts[index] = { ...contacts[index], ...patch };
        setDraft({ ...draft, contacts });
    };

    const addContact = () => {
        setDraft({ ...draft, contacts: [...draft.contacts, emptyContact()] });
    };

    const removeContact = (index: number) => {
        setDraft({ ...draft, contacts: draft.contacts.filter((_, i) => i !== index) });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader><DialogTitle>{draft.id ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}</DialogTitle></DialogHeader>
                <Tabs defaultValue="info">
                    <TabsList className="mb-3">
                        <TabsTrigger value="info">Thông tin NCC</TabsTrigger>
                        <TabsTrigger value="contacts">Người liên hệ ({draft.contacts.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-3">
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
                    </TabsContent>
                    <TabsContent value="contacts" className="space-y-3">
                        {draft.contacts.map((c, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500">Liên hệ #{i + 1}</span>
                                    <button type="button" onClick={() => removeContact(i)} className="rounded p-1 text-rose-500 hover:bg-rose-50">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="col-span-2">
                                        <label className={labelClass}>Họ tên</label>
                                        <input className={inputClass} value={c.name} onChange={(e) => updateContact(i, { name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Chức vụ</label>
                                        <input className={inputClass} value={c.title} onChange={(e) => updateContact(i, { title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Điện thoại</label>
                                        <input className={inputClass} value={c.phone} onChange={(e) => updateContact(i, { phone: e.target.value })} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelClass}>Email</label>
                                        <input className={inputClass} value={c.email} onChange={(e) => updateContact(i, { email: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addContact}>
                            <Plus size={14} className="mr-1" /> Thêm người liên hệ
                        </Button>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
