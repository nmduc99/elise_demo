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
import { type Brand, type Category } from "@/lib/demo/eliseData";
import { formatVnd } from "@/lib/demo/format";
import { inputClass, labelClass } from "@/lib/demo/formClasses";
import PositiveNumberInput from "./PositiveNumberInput";

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
    unit: string;
    barcode: string;
    description: string;
    vatPercent: number;
    status: "active" | "inactive";
    weightGram: number;
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
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{draft?.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle>
                </DialogHeader>
                {draft && (
                    <Tabs defaultValue="basic">
                        <TabsList className="mb-3">
                            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                            <TabsTrigger value="pricing">Giá & thuế</TabsTrigger>
                            <TabsTrigger value="variants">Biến thể</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className={labelClass}>Tên sản phẩm *</label>
                                <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Mã SKU</label>
                                <input className={inputClass} value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Mã vạch</label>
                                <input className={inputClass} value={draft.barcode} onChange={(e) => setDraft({ ...draft, barcode: e.target.value })} />
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
                            <div>
                                <label className={labelClass}>Danh mục</label>
                                <Select value={draft.categoryId} onValueChange={(v) => setDraft({ ...draft, categoryId: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className={labelClass}>Đơn vị tính</label>
                                <Select value={draft.unit} onValueChange={(v) => setDraft({ ...draft, unit: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cái">Cái</SelectItem>
                                        <SelectItem value="Bộ">Bộ</SelectItem>
                                        <SelectItem value="Chiếc">Chiếc</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className={labelClass}>Trạng thái</label>
                                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as ProductDraft["status"] })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Đang kinh doanh</SelectItem>
                                        <SelectItem value="inactive">Ngừng kinh doanh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass}>Mô tả</label>
                                <textarea
                                    className={`${inputClass} min-h-[72px] resize-y`}
                                    value={draft.description}
                                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="pricing" className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Giá vốn (vnđ)</label>
                                <PositiveNumberInput
                                    value={draft.costPrice}
                                    onChange={(costPrice) => setDraft({ ...draft, costPrice })}
                                    format="vi-vn"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Giá bán (vnđ)</label>
                                <PositiveNumberInput
                                    value={draft.salePrice}
                                    onChange={(salePrice) => setDraft({ ...draft, salePrice })}
                                    format="vi-vn"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>VAT (%)</label>
                                <PositiveNumberInput
                                    value={draft.vatPercent}
                                    onChange={(vatPercent) => setDraft({ ...draft, vatPercent })}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Khối lượng (gram)</label>
                                <PositiveNumberInput
                                    value={draft.weightGram}
                                    onChange={(weightGram) => setDraft({ ...draft, weightGram })}
                                />
                            </div>
                            <div className="col-span-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                                Giá sau VAT: <span className="font-semibold text-custom">{formatVnd(Math.round(draft.salePrice * (1 + draft.vatPercent / 100)))}</span>
                            </div>
                        </TabsContent>

                        <TabsContent value="variants" className="space-y-3">
                            <div>
                                <label className={labelClass}>Sizes (cách nhau bằng dấu phẩy)</label>
                                <input className={inputClass} value={draft.sizes} onChange={(e) => setDraft({ ...draft, sizes: e.target.value })} placeholder="S, M, L, XL" />
                            </div>
                            <div>
                                <label className={labelClass}>Màu sắc (cách nhau bằng dấu phẩy)</label>
                                <input className={inputClass} value={draft.colors} onChange={(e) => setDraft({ ...draft, colors: e.target.value })} placeholder="Đen, Trắng, Be" />
                            </div>
                            <p className="text-xs text-slate-400">
                                Hệ thống tự sinh mã vạch theo SKU + size + màu khi in tem.
                            </p>
                        </TabsContent>
                    </Tabs>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={onSave}>Lưu sản phẩm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
