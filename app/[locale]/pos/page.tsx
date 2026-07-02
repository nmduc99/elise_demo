"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import RoleGuard from "@/components/demo/RoleGuard";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import { useAuth } from "@/components/auth/AuthProvider";
import CartPanel, {
    type DiscountType,
    type PaymentMethod,
} from "@/components/demo/pos/CartPanel";
import ProductCatalog from "@/components/demo/pos/ProductCatalog";
import { useToast } from "@/hooks/use-toast";
import {
    CUSTOMERS,
    PRODUCTS,
    STORES,
    getProduct,
    getStore,
} from "@/lib/demo/eliseData";
import { getRoleFromUser } from "@/lib/demo/roles";
import { formatVnd } from "@/lib/demo/format";
import { printInvoice, type CartLine, type Sale } from "@/lib/demo/pos/invoice";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import { useEffect, useMemo, useState } from "react";

export default function PosPage() {
    const { user } = useAuth();
    const role = getRoleFromUser(user);
    const posAccess = useDemoAccess("pos");
    const readOnly = !posAccess.canWrite;
    const lockedStoreId = role === "store_manager" ? (user?.storeId ?? null) : null;
    const { toast } = useToast();

    const [storeId, setStoreId] = useState<string>(lockedStoreId ?? STORES[0].id);
    const [category, setCategory] = useState<string>("all");
    const [customerId, setCustomerId] = useState<string>(CUSTOMERS[0].id);
    const [cart, setCart] = useState<CartLine[]>([]);
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<DiscountType>("vnd");
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transfer");
    const sales = useCrudCollection<Sale>("elise-demo-sales", []);

    const visibleProducts = useMemo(
        () => PRODUCTS.filter((p) => category === "all" || p.categoryId === category),
        [category],
    );

    const addToCart = (productId: string) => {
        const product = getProduct(productId)!;
        const size = product.sizes[0];
        const color = product.colors[0];
        setCart((prev) => {
            const idx = prev.findIndex(
                (l) => l.productId === productId && l.size === size && l.color === color,
            );
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
                return next;
            }
            return [{ productId, size, color, qty: 1 }, ...prev];
        });
    };

    const updateLine = (index: number, patch: Partial<CartLine>) => {
        setCart((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    };
    const removeLine = (index: number) => setCart((prev) => prev.filter((_, i) => i !== index));

    const subtotal = cart.reduce((s, l) => s + (getProduct(l.productId)?.salePrice ?? 0) * l.qty, 0);
    const discountAmount = useMemo(() => {
        if (discountType === "vnd") {
            return Math.min(discountValue, subtotal);
        }
        return Math.min(Math.round((subtotal * discountValue) / 100), subtotal);
    }, [discountType, discountValue, subtotal]);
    const total = Math.max(0, subtotal - discountAmount);
    const itemCount = cart.reduce((s, l) => s + l.qty, 0);

    useEffect(() => {
        setPaymentAmount(total);
    }, [total]);

    const clearCart = () => {
        setCart([]);
        setDiscountValue(0);
        setPaymentAmount(0);
    };

    const checkout = () => {
        if (cart.length === 0) {
            toast({ title: "Giỏ hàng trống", variant: "destructive" });
            return;
        }
        const sale: Sale = {
            id: `sale-${Date.now()}`,
            code: `HD${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            storeId,
            customerName: CUSTOMERS.find((c) => c.id === customerId)?.name ?? "Khách lẻ",
            subtotal,
            discount: discountAmount,
            total,
            paymentMethod,
            paidAmount: paymentAmount,
            itemCount,
            lines: cart.map((l) => {
                const p = getProduct(l.productId)!;
                return { name: p.name, size: l.size, color: l.color, qty: l.qty, price: p.salePrice };
            }),
        };
        sales.add(sale);
        toast({
            title: "Thanh toán thành công",
            description: `${itemCount} sản phẩm · ${formatVnd(total)} · ${getStore(storeId)?.name}`,
            variant: "success",
        });
        printInvoice(sale);
        clearCart();
    };

    const cancelSale = (sale: Sale) => {
        sales.remove(sale.id);
        toast({ title: "Đã hủy hóa đơn", description: sale.code });
    };

    const todaySales = sales.items.filter((s) => s.storeId === storeId);
    const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);

    return (
        <RoleGuard permission="pos">
            <div className="flex h-[calc(100vh-96px)] flex-col">
                {readOnly && (
                    <div className="shrink-0 border-b bg-white px-4 py-2">
                        <AccessBanner access={posAccess} />
                    </div>
                )}
                <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_400px]">
                <ProductCatalog
                    storeId={storeId}
                    setStoreId={setStoreId}
                    lockedStoreId={lockedStoreId}
                    category={category}
                    setCategory={setCategory}
                    products={visibleProducts}
                    onAdd={readOnly ? () => {} : addToCart}
                    recentSales={todaySales}
                    recentRevenue={todayRevenue}
                    onPrint={printInvoice}
                    onCancel={readOnly ? () => {} : cancelSale}
                    readOnly={readOnly}
                />

                <div className="flex min-h-0 h-full flex-col overflow-hidden">
                <CartPanel
                    staffName={user?.fullName ?? user?.account ?? "Nhân viên"}
                    customerId={customerId}
                    setCustomerId={setCustomerId}
                    cart={cart}
                    updateLine={readOnly ? () => {} : updateLine}
                    removeLine={readOnly ? () => {} : removeLine}
                    clearCart={readOnly ? () => {} : clearCart}
                    subtotal={subtotal}
                    discountValue={discountValue}
                    setDiscountValue={readOnly ? () => {} : setDiscountValue}
                    discountType={discountType}
                    setDiscountType={readOnly ? () => {} : setDiscountType}
                    discountAmount={discountAmount}
                    total={total}
                    itemCount={itemCount}
                    paymentAmount={paymentAmount}
                    setPaymentAmount={readOnly ? () => {} : setPaymentAmount}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={readOnly ? () => {} : setPaymentMethod}
                    onCheckout={readOnly ? () => {} : checkout}
                    readOnly={readOnly}
                />
                </div>
                </div>
            </div>
        </RoleGuard>
    );
}
