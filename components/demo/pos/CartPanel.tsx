"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CUSTOMERS, getProduct } from "@/lib/demo/eliseData";
import { formatVnd } from "@/lib/demo/format";
import type { CartLine } from "@/lib/demo/pos/invoice";
import { Minus, Plus, Printer, ShoppingBag, Trash2 } from "lucide-react";

interface CartPanelProps {
    storeName: string;
    customerId: string;
    setCustomerId: (id: string) => void;
    cart: CartLine[];
    updateLine: (index: number, patch: Partial<CartLine>) => void;
    removeLine: (index: number) => void;
    clearCart: () => void;
    subtotal: number;
    discount: number;
    setDiscount: (value: number) => void;
    total: number;
    itemCount: number;
    onCheckout: () => void;
    readOnly?: boolean;
}

export default function CartPanel({
    storeName,
    customerId,
    setCustomerId,
    cart,
    updateLine,
    removeLine,
    clearCart,
    subtotal,
    discount,
    setDiscount,
    total,
    itemCount,
    onCheckout,
    readOnly = false,
}: CartPanelProps) {
    return (
        <div className="flex flex-col overflow-hidden bg-white">
            <div className="border-b p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Hóa đơn bán hàng</h2>
                    {cart.length > 0 && !readOnly && (
                        <button onClick={clearCart} className="flex items-center gap-1 text-xs text-rose-500 hover:underline">
                            <Trash2 size={13} /> Hủy đơn
                        </button>
                    )}
                </div>
                <p className="text-xs text-slate-400">{storeName}</p>
                <div className="mt-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">Khách hàng</label>
                    <Select value={customerId} onValueChange={setCustomerId} disabled={readOnly}>
                        <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {CUSTOMERS.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                    {c.phone ? ` · ${c.phone}` : ""}
                                    {c.tier !== "Thường" ? ` (${c.tier})` : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {cart.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-slate-300">
                        <ShoppingBag size={40} />
                        <p className="mt-2 text-sm">Chọn sản phẩm để thêm vào hóa đơn</p>
                    </div>
                )}
                {cart.map((line, i) => {
                    const product = getProduct(line.productId)!;
                    return (
                        <div key={`${line.productId}-${i}`} className="rounded-lg border p-2.5">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-slate-800">{product.name}</p>
                                <button onClick={() => !readOnly && removeLine(i)} className="text-slate-400 hover:text-rose-500" disabled={readOnly}>
                                    <Trash2 size={15} />
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <Select value={line.size} onValueChange={(v) => updateLine(i, { size: v })} disabled={readOnly}>
                                    <SelectTrigger className="h-7 w-[80px] text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {product.sizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <Select value={line.color} onValueChange={(v) => updateLine(i, { color: v })} disabled={readOnly}>
                                    <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {product.colors.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <div className="ml-auto flex items-center gap-1">
                                    <button
                                        onClick={() => updateLine(i, { qty: Math.max(1, line.qty - 1) })}
                                        disabled={readOnly}
                                        className="flex h-6 w-6 items-center justify-center rounded border text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-semibold">{line.qty}</span>
                                    <button
                                        onClick={() => updateLine(i, { qty: line.qty + 1 })}
                                        disabled={readOnly}
                                        className="flex h-6 w-6 items-center justify-center rounded border text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            </div>
                            <p className="mt-1.5 text-right text-sm font-semibold text-slate-700">
                                {formatVnd(product.salePrice * line.qty)}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="space-y-2 border-t p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tạm tính</span>
                    <span className="font-medium text-slate-800">{formatVnd(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Giảm giá</span>
                    <input
                        type="number"
                        min={0}
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                        disabled={readOnly}
                        className="h-8 w-32 rounded-md border border-input bg-white px-2 text-right text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                    />
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-base">
                    <span className="font-semibold text-slate-700">Tổng cộng</span>
                    <span className="text-xl font-bold text-custom">{formatVnd(total)}</span>
                </div>
                {!readOnly && (
                    <Button onClick={onCheckout} className="h-11 w-full bg-custom text-base font-semibold text-white hover:bg-custom-hover">
                        <Printer size={18} className="mr-2" /> Thanh toán & In {itemCount > 0 ? `(${itemCount})` : ""}
                    </Button>
                )}
            </div>
        </div>
    );
}
