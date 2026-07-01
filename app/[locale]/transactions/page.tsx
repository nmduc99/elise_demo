"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import RoleGuard from "@/components/demo/RoleGuard";
import StatCard from "@/components/demo/StatCard";
import { ScopeFilter, useDemoScope } from "@/components/demo/ScopeFilter";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ORDER_TRANSACTIONS,
    RETURN_TRANSACTIONS,
    SALES_TRANSACTIONS,
    getStore,
    type OrderTransaction,
    type ReturnTransaction,
    type SalesTransaction,
} from "@/lib/demo/eliseData";
import { formatDate, formatNumber, formatVndShort } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination } from "@/lib/demo/usePagination";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import { useLocalCollection } from "@/lib/demo/useLocalCollection";
import { Receipt, RotateCcw, ShoppingBag, ShoppingCart } from "lucide-react";
import { useMemo } from "react";

interface PosSale {
    id: string;
    storeId: string;
    total: number;
    itemCount: number;
    createdAt: string;
}

const SALE_STATUS: Record<SalesTransaction["status"], string> = {
    completed: "bg-green-100 text-green-700 hover:bg-green-100",
    cancelled: "bg-slate-100 text-slate-600 hover:bg-slate-100",
};

const ORDER_STATUS: Record<OrderTransaction["status"], string> = {
    pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    confirmed: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    delivered: "bg-green-100 text-green-700 hover:bg-green-100",
    cancelled: "bg-slate-100 text-slate-600 hover:bg-slate-100",
};

const RETURN_STATUS: Record<ReturnTransaction["status"], string> = {
    pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    approved: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    refunded: "bg-green-100 text-green-700 hover:bg-green-100",
};

export default function TransactionsPage() {
    const scope = useDemoScope();
    const txAccess = useDemoAccess("transactions");

    const sales = useCrudCollection<SalesTransaction>("elise-demo-sales-tx", SALES_TRANSACTIONS);
    const orders = useCrudCollection<OrderTransaction>("elise-demo-order-tx", ORDER_TRANSACTIONS);
    const returns = useCrudCollection<ReturnTransaction>("elise-demo-return-tx", RETURN_TRANSACTIONS);
    const [posSales] = useLocalCollection<PosSale>("elise-demo-sales");

    const filterStore = <T extends { storeId: string }>(rows: T[]) =>
        rows.filter((r) => {
            if (scope.storeId && r.storeId !== scope.storeId) return false;
            if (scope.regionId) {
                const store = getStore(r.storeId);
                if (store?.regionId !== scope.regionId) return false;
            }
            return true;
        });

    const scopedSales = useMemo(() => filterStore(sales.items), [sales.items, scope.storeId, scope.regionId]);
    const scopedOrders = useMemo(() => filterStore(orders.items), [orders.items, scope.storeId, scope.regionId]);
    const scopedReturns = useMemo(() => filterStore(returns.items), [returns.items, scope.storeId, scope.regionId]);
    const scopedPos = useMemo(() => filterStore(posSales), [posSales, scope.storeId, scope.regionId]);

    const stats = useMemo(() => ({
        sales: scopedSales.filter((s) => s.status === "completed").length + scopedPos.length,
        orders: scopedOrders.filter((o) => o.status !== "cancelled").length,
        returns: scopedReturns.length,
        revenue: scopedSales.filter((s) => s.status === "completed").reduce((a, s) => a + s.totalAmount, 0)
            + scopedPos.reduce((a, s) => a + s.total, 0),
    }), [scopedSales, scopedOrders, scopedReturns, scopedPos]);

    const salesPager = usePagination(
        [...scopedPos.map((p) => ({
            id: p.id,
            code: `POS-${p.id.slice(-6)}`,
            storeId: p.storeId,
            customerName: "Khách lẻ POS",
            createdAt: p.createdAt,
            totalAmount: p.total,
            itemCount: p.itemCount,
            paymentMethod: "cash" as const,
            status: "completed" as const,
        })), ...scopedSales],
        10
    );
    const orderPager = usePagination(scopedOrders, 10);
    const returnPager = usePagination(scopedReturns, 10);

    return (
        <RoleGuard permission="transactions">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Giao dịch</h1>
                        <p className="text-sm text-slate-500">Bán hàng · Đặt hàng · Trả hàng</p>
                    </div>
                    <ScopeFilter scope={scope} />
                </div>

                <AccessBanner access={txAccess} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Giao dịch bán" value={formatNumber(stats.sales)} icon={ShoppingCart} accent="primary" />
                    <StatCard label="Đơn đặt hàng" value={formatNumber(stats.orders)} icon={ShoppingBag} accent="blue" />
                    <StatCard label="Phiếu trả hàng" value={formatNumber(stats.returns)} icon={RotateCcw} accent="amber" />
                    <StatCard label="Doanh thu" value={formatVndShort(stats.revenue)} icon={Receipt} accent="green" />
                </div>

                <Tabs defaultValue="sales">
                    <TabsList>
                        <TabsTrigger value="sales">Bán hàng</TabsTrigger>
                        <TabsTrigger value="orders">Đặt hàng</TabsTrigger>
                        <TabsTrigger value="returns">Trả hàng</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sales">
                        <TxTable
                            pager={salesPager}
                            head={["Mã", "Cửa hàng", "Khách hàng", "Ngày", "SL", "Giá trị", "TT"]}
                            rows={salesPager.pageItems.map((s) => [
                                s.code,
                                getStore(s.storeId)?.name ?? "—",
                                s.customerName,
                                formatDate(s.createdAt),
                                String(s.itemCount),
                                formatVndShort(s.totalAmount),
                                s.status === "completed" ? "Hoàn tất" : "Hủy",
                            ])}
                            badges={salesPager.pageItems.map((s) => SALE_STATUS[s.status])}
                        />
                    </TabsContent>

                    <TabsContent value="orders">
                        <TxTable
                            pager={orderPager}
                            head={["Mã", "Cửa hàng", "Khách hàng", "Ngày giao", "Tạm ứng", "Tổng", "TT"]}
                            rows={orderPager.pageItems.map((o) => [
                                o.code,
                                getStore(o.storeId)?.name ?? "—",
                                o.customerName,
                                o.deliveryDate,
                                formatVndShort(o.deposit),
                                formatVndShort(o.totalAmount),
                                o.status,
                            ])}
                            badges={orderPager.pageItems.map((o) => ORDER_STATUS[o.status])}
                        />
                    </TabsContent>

                    <TabsContent value="returns">
                        <TxTable
                            pager={returnPager}
                            head={["Mã", "Cửa hàng", "Khách hàng", "Ngày", "Lý do", "Giá trị", "TT"]}
                            rows={returnPager.pageItems.map((r) => [
                                r.code,
                                getStore(r.storeId)?.name ?? "—",
                                r.customerName,
                                formatDate(r.createdAt),
                                r.reason,
                                formatVndShort(r.totalAmount),
                                r.status,
                            ])}
                            badges={returnPager.pageItems.map((r) => RETURN_STATUS[r.status])}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </RoleGuard>
    );
}

function TxTable({
    pager,
    head,
    rows,
    badges,
}: {
    pager: ReturnType<typeof usePagination>;
    head: string[];
    rows: string[][];
    badges?: string[];
}) {
    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                        {head.map((h) => (<th key={h} className="px-4 py-3 font-medium">{h}</th>))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            {r.slice(0, -1).map((cell, ci) => (
                                <td key={ci} className={`px-4 py-3 ${ci === 0 ? "font-medium text-slate-800" : "text-slate-600"}`}>{cell}</td>
                            ))}
                            <td className="px-4 py-3">
                                {badges?.[i] ? (
                                    <Badge className={badges[i]}>{r[r.length - 1]}</Badge>
                                ) : (
                                    <span className="text-slate-600">{r[r.length - 1]}</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                page={pager.page}
                totalPages={pager.totalPages}
                total={pager.total}
                start={pager.start}
                end={pager.end}
                onPageChange={pager.setPage}
                unit="giao dịch"
            />
        </div>
    );
}
