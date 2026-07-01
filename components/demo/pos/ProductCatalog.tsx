"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, STORES, type Product } from "@/lib/demo/eliseData";
import { formatVnd } from "@/lib/demo/format";
import type { Sale } from "@/lib/demo/pos/invoice";
import { Printer, ShoppingBag, X } from "lucide-react";

interface ProductCatalogProps {
    storeId: string;
    setStoreId: (id: string) => void;
    lockedStoreId: string | null;
    category: string;
    setCategory: (id: string) => void;
    products: Product[];
    onAdd: (productId: string) => void;
    recentSales: Sale[];
    recentRevenue: number;
    onPrint: (sale: Sale) => void;
    onCancel: (sale: Sale) => void;
    readOnly?: boolean;
}

export default function ProductCatalog({
    storeId,
    setStoreId,
    lockedStoreId,
    category,
    setCategory,
    products,
    onAdd,
    recentSales,
    recentRevenue,
    onPrint,
    onCancel,
    readOnly = false,
}: ProductCatalogProps) {
    return (
        <div className="flex flex-col overflow-hidden border-r">
            <div className="flex flex-wrap items-center gap-2 border-b bg-white p-3">
                <Select value={storeId} onValueChange={setStoreId} disabled={!!lockedStoreId}>
                    <SelectTrigger className="h-9 w-[230px] bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {(lockedStoreId ? STORES.filter((s) => s.id === lockedStoreId) : STORES).map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 w-[190px] bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        {CATEGORIES.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                </Select>
                <div className="ml-auto text-xs text-slate-500">
                    Hôm nay: <span className="font-semibold text-slate-700">{recentSales.length} đơn</span> ·{" "}
                    <span className="font-semibold text-custom">{formatVnd(recentRevenue)}</span>
                </div>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => !readOnly && onAdd(p.id)}
                        disabled={readOnly}
                        className={`flex flex-col rounded-xl border bg-white p-3 text-left shadow-sm transition-all ${
                            readOnly ? "cursor-default opacity-90" : "hover:border-custom hover:shadow"
                        }`}
                    >
                        <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-gradient-to-br from-orange-50 to-slate-50 text-custom">
                            <ShoppingBag size={26} />
                        </div>
                        <p className="line-clamp-2 text-sm font-medium text-slate-800">{p.name}</p>
                        <p className="mt-auto pt-1 text-sm font-bold text-custom">{formatVnd(p.salePrice)}</p>
                    </button>
                ))}
            </div>

            {recentSales.length > 0 && (
                <div className="max-h-44 overflow-y-auto border-t bg-white p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Hóa đơn gần đây</p>
                    <div className="space-y-1.5">
                        {recentSales.slice(0, 6).map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm">
                                <span className="text-slate-700">
                                    <span className="font-medium">{s.code}</span> · {s.customerName} · {s.itemCount} sp
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-custom">{formatVnd(s.total)}</span>
                                    <button onClick={() => onPrint(s)} className="rounded p-1 text-slate-500 hover:bg-slate-100" title="In lại">
                                        <Printer size={14} />
                                    </button>
                                    {!readOnly && (
                                        <button onClick={() => onCancel(s)} className="rounded p-1 text-rose-500 hover:bg-rose-50" title="Hủy hóa đơn">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
