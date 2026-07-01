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
import { type Brand, type Category } from "@/lib/demo/eliseData";
import { inputClass, labelClass } from "@/lib/demo/formClasses";

export interface ProductDraft {
    id: string;
    sku: string;
    name: string;
    categoryId: string;
    brandId: string;
    costPrice: number;
    salePrice: number;
    sizes: string;
    colors: string;
}

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: ProductDraft | null;
    setDraft: (d: ProductDraft) => void;
    onSave: () => void;
    brands: Brand[];
    categories: Category[];
}

export default function ProductFormDialog({
    open,
    onOpenChange,
    draft,
    setDraft,
    onSave,
    brands,
    categories,
}: ProductFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{draft?.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle>
                </DialogHeader>
                {draft && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className={labelClass}>Tên sản phẩm</label>
                            <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>SKU</label>
                            <input className={inputClass} value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Thương hiệu</label>
                            <Select value={draft.brandId} onValueChange={(v) => setDraft({ ...draft, brandId: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {brands.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Danh mục</label>
                            <Select value={draft.categoryId} onValueChange={(v) => setDraft({ ...draft, categoryId: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className={labelClass}>Giá vốn (đ)</label>
                            <input type="number" min={0} className={inputClass} value={draft.costPrice} onChange={(e) => setDraft({ ...draft, costPrice: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className={labelClass}>Giá bán (đ)</label>
                            <input type="number" min={0} className={inputClass} value={draft.salePrice} onChange={(e) => setDraft({ ...draft, salePrice: Number(e.target.value) })} />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Sizes (cách nhau bằng dấu phẩy)</label>
                            <input className={inputClass} value={draft.sizes} onChange={(e) => setDraft({ ...draft, sizes: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Màu sắc (cách nhau bằng dấu phẩy)</label>
                            <input className={inputClass} value={draft.colors} onChange={(e) => setDraft({ ...draft, colors: e.target.value })} />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
