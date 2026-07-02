"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CUSTOMERS, getProduct } from "@/lib/demo/eliseData";
import { formatVnd } from "@/lib/demo/format";
import type { CartLine } from "@/lib/demo/pos/invoice";
import { cn } from "@/lib/utils";
import {
    Minus,
    Pencil,
    Plus,
    Search,
    ShoppingBag,
    Trash2,
    UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type DiscountType = "vnd" | "percent";
export type PaymentMethod = "cash" | "transfer";

interface CartPanelProps {
    staffName: string;
    customerId: string;
    setCustomerId: (id: string) => void;
    cart: CartLine[];
    updateLine: (index: number, patch: Partial<CartLine>) => void;
    removeLine: (index: number) => void;
    clearCart: () => void;
    subtotal: number;
    discountValue: number;
    setDiscountValue: (value: number) => void;
    discountType: DiscountType;
    setDiscountType: (type: DiscountType) => void;
    discountAmount: number;
    total: number;
    itemCount: number;
    paymentAmount: number;
    setPaymentAmount: (value: number) => void;
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
    onCheckout: () => void;
    readOnly?: boolean;
}

function formatPosDateTime(date: Date): string {
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export default function CartPanel({
    staffName,
    customerId,
    setCustomerId,
    cart,
    updateLine,
    removeLine,
    clearCart,
    subtotal,
    discountValue,
    setDiscountValue,
    discountType,
    setDiscountType,
    discountAmount,
    total,
    itemCount,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    onCheckout,
    readOnly = false,
}: CartPanelProps) {
    const [now, setNow] = useState(() => new Date());
    const [customerQuery, setCustomerQuery] = useState("");
    const [showCustomerList, setShowCustomerList] = useState(false);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 30_000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const customer = CUSTOMERS.find((c) => c.id === customerId);
        setCustomerQuery(customer?.name ?? "");
    }, [customerId]);

    const filteredCustomers = useMemo(() => {
        const q = customerQuery.trim().toLowerCase();
        if (!q) return CUSTOMERS;
        return CUSTOMERS.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.phone?.toLowerCase().includes(q) ?? false),
        );
    }, [customerQuery]);

    const canCheckout = cart.length > 0 && total > 0 && !readOnly;

    return (
        <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-white">
            <div className="shrink-0 border-b px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{staffName}</span>
                    <span className="text-slate-500">{formatPosDateTime(now)}</span>
                </div>

                <div className="relative mt-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                                value={customerQuery}
                                onChange={(e) => {
                                    setCustomerQuery(e.target.value);
                                    setShowCustomerList(true);
                                }}
                                onFocus={() => setShowCustomerList(true)}
                                onBlur={() => window.setTimeout(() => setShowCustomerList(false), 150)}
                                placeholder="Tìm khách hàng (F4)"
                                disabled={readOnly}
                                className="h-9 bg-white pl-9"
                            />
                        </div>
                        <button
                            type="button"
                            disabled={readOnly}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                            aria-label="Thêm khách hàng"
                        >
                            <UserPlus size={18} />
                        </button>
                    </div>
                    {showCustomerList && filteredCustomers.length > 0 && !readOnly && (
                        <div className="absolute left-0 right-10 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border bg-white shadow-md">
                            {filteredCustomers.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={cn(
                                        "flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50",
                                        c.id === customerId && "bg-orange-50",
                                    )}
                                    onMouseDown={() => {
                                        setCustomerId(c.id);
                                        setCustomerQuery(c.name);
                                        setShowCustomerList(false);
                                    }}
                                >
                                    <span className="font-medium text-slate-800">{c.name}</span>
                                    {c.phone && (
                                        <span className="text-xs text-slate-500">{c.phone}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && !readOnly && (
                    <button
                        onClick={clearCart}
                        className="mt-2 flex items-center gap-1 text-xs text-rose-500 hover:underline"
                    >
                        <Trash2 size={13} /> Hủy đơn
                    </button>
                )}
            </div>

            <div className="space-y-2 p-3">
                {cart.length === 0 && (
                    <div className="flex min-h-[120px] flex-col items-center justify-center text-slate-300">
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
                                <button
                                    onClick={() => !readOnly && removeLine(i)}
                                    className="text-slate-400 hover:text-rose-500"
                                    disabled={readOnly}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <Select
                                    value={line.size}
                                    onValueChange={(v) => updateLine(i, { size: v })}
                                    disabled={readOnly}
                                >
                                    <SelectTrigger className="h-7 w-[80px] text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {product.sizes.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={line.color}
                                    onValueChange={(v) => updateLine(i, { color: v })}
                                    disabled={readOnly}
                                >
                                    <SelectTrigger className="h-7 w-[110px] text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {product.colors.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
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

            <div className="shrink-0 space-y-3 border-t p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Tổng tiền hàng</span>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-500">{itemCount}</span>
                        <span className="min-w-[80px] text-right font-medium text-slate-800">
                            {formatVnd(subtotal)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-slate-600">
                            Giảm giá
                            <Pencil size={13} className="text-slate-400" />
                        </span>
                        <span className="text-slate-700">-{formatVnd(discountAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min={0}
                            value={discountValue}
                            onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                            disabled={readOnly}
                            className="h-9 flex-1 bg-white text-right"
                        />
                        <div className="flex overflow-hidden rounded-md border">
                            <button
                                type="button"
                                disabled={readOnly}
                                onClick={() => setDiscountType("vnd")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium transition-colors",
                                    discountType === "vnd"
                                        ? "bg-custom text-white"
                                        : "bg-white text-slate-600 hover:bg-slate-50",
                                )}
                            >
                                VND
                            </button>
                            <button
                                type="button"
                                disabled={readOnly}
                                onClick={() => setDiscountType("percent")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium transition-colors",
                                    discountType === "percent"
                                        ? "bg-custom text-white"
                                        : "bg-white text-slate-600 hover:bg-slate-50",
                                )}
                            >
                                %
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-base font-bold text-custom">Khách cần trả</span>
                    <span className="text-lg font-bold text-custom">{formatVnd(total)}</span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600">Thanh toán</span>
                    <Input
                        type="number"
                        min={0}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Math.max(0, Number(e.target.value)))}
                        disabled={readOnly}
                        className="h-9 w-36 bg-white text-right"
                    />
                </div>

                <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    className="flex gap-6"
                    disabled={readOnly}
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="cash" id="pay-cash" />
                        <Label htmlFor="pay-cash" className="cursor-pointer text-sm font-normal">
                            Tiền mặt
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="transfer" id="pay-transfer" />
                        <Label htmlFor="pay-transfer" className="cursor-pointer text-sm font-normal">
                            Chuyển khoản
                        </Label>
                    </div>
                </RadioGroup>

                {paymentMethod === "transfer" && (
                    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                        <p className="text-slate-600">Bạn chưa có tài khoản ngân hàng</p>
                        <button
                            type="button"
                            className="mt-1 text-sm font-medium text-custom hover:underline"
                        >
                            Thêm tài khoản ngân hàng
                        </button>
                    </div>
                )}

                {!readOnly && (
                    <Button
                        onClick={onCheckout}
                        disabled={!canCheckout}
                        className={cn(
                            "h-12 w-full text-base font-bold tracking-wide",
                            canCheckout
                                ? "bg-custom text-white hover:bg-custom-hover"
                                : "bg-slate-200 text-slate-500 hover:bg-slate-200",
                        )}
                    >
                        THANH TOÁN
                    </Button>
                )}
            </div>
        </div>
    );
}
