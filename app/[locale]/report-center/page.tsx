"use client";

import RoleGuard from "@/components/demo/RoleGuard";
import AccessBanner from "@/components/demo/AccessBanner";
import StatCard from "@/components/demo/StatCard";
import { ScopeFilter, useDemoScope } from "@/components/demo/ScopeFilter";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import { BarChart, ELISE_COLORS, LineChart } from "@/components/demo/DemoCharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    EMPLOYEES,
    MONTHS,
    PERFORMANCE,
    PRODUCTS,
    PURCHASE_ORDERS,
    STORES,
    STORE_WAREHOUSES,
    SUPPLIERS,
    filterPerformance,
    getRegion,
    getStore,
    getWarehouse,
    stockForWarehouse,
    sumPerformance,
    totalUnitsInWarehouse,
} from "@/lib/demo/eliseData";
import { formatNumber, formatPercent, formatVnd, formatVndShort, VND_MILLION_AXIS_LABEL } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination } from "@/lib/demo/usePagination";
import { Coins, Download, PiggyBank, Receipt, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";

function monthLabel(month: string): string {
    const [y, m] = month.split("-");
    return `${m}/${y.slice(2)}`;
}

function exportCsv(filename: string, rows: (string | number)[][]): void {
    const csv = rows
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/** Deterministic 0..1 weight from a string (for employee-sales synthesis). */
function weight(key: string): number {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 1000) / 1000;
}

const currentMonth = MONTHS[MONTHS.length - 1];

export default function ReportCenterPage() {
    const scope = useDemoScope();
    const revenueAccess = useDemoAccess("report_revenue");
    const profitAccess = useDemoAccess("report_profit");
    const inventoryAccess = useDemoAccess("report_inventory");

    const storeUniverse = useMemo(
        () =>
            STORES.filter(
                (s) =>
                    (!scope.regionId || s.regionId === scope.regionId) &&
                    (!scope.storeId || s.id === scope.storeId)
            ),
        [scope.regionId, scope.storeId]
    );
    const storeIds = useMemo(() => new Set(storeUniverse.map((s) => s.id)), [storeUniverse]);

    const scopedRows = useMemo(
        () => filterPerformance({ regionId: scope.regionId, storeId: scope.storeId }).filter((r) => storeIds.has(r.storeId)),
        [scope.regionId, scope.storeId, storeIds]
    );

    const totals = useMemo(() => sumPerformance(scopedRows), [scopedRows]);
    const margin = totals.revenue ? (totals.profit / totals.revenue) * 100 : 0;

    /* ---- Monthly trend ---- */
    const monthly = useMemo(
        () =>
            MONTHS.map((month) => {
                const t = sumPerformance(scopedRows.filter((r) => r.month === month));
                return { label: monthLabel(month), revenue: t.revenue, profit: t.profit };
            }),
        [scopedRows]
    );

    /* ---- Per-store rows ---- */
    const perStore = useMemo(
        () =>
            storeUniverse
                .map((store) => {
                    const t = sumPerformance(scopedRows.filter((r) => r.storeId === store.id));
                    return {
                        store,
                        revenue: t.revenue,
                        cogs: t.cogs,
                        gross: t.revenue - t.cogs,
                        opex: t.opex,
                        profit: t.profit,
                        orders: t.orders,
                        units: t.units,
                        margin: t.revenue ? (t.profit / t.revenue) * 100 : 0,
                    };
                })
                .sort((a, b) => b.revenue - a.revenue),
        [storeUniverse, scopedRows]
    );

    /* ---- Inventory report (current stock) ---- */
    const inventoryRows = useMemo(
        () =>
            STORE_WAREHOUSES.filter((w) => w.storeId && storeIds.has(w.storeId)).map((w) => {
                const rows = stockForWarehouse(w.id);
                const units = rows.reduce((s, r) => s + r.qty, 0);
                const value = rows.reduce((s, r) => {
                    const product = PRODUCTS.find((p) => p.id === r.productId);
                    return s + r.qty * (product?.costPrice ?? 0);
                }, 0);
                return { warehouse: w, store: getStore(w.storeId!)!, units, value };
            }),
        [storeIds]
    );

    /* ---- Employee sales report (current month, synthesized) ---- */
    const employeeSales = useMemo(() => {
        const salesStaff = EMPLOYEES.filter((e) => e.department === "Bán hàng" && storeIds.has(e.storeId));
        return salesStaff
            .map((emp) => {
                const storeMonth = sumPerformance(
                    PERFORMANCE.filter((p) => p.month === currentMonth && p.storeId === emp.storeId)
                );
                const peers = salesStaff.filter((e) => e.storeId === emp.storeId);
                const w = 0.6 + weight(emp.id) * 0.8;
                const totalW = peers.reduce((s, p) => s + (0.6 + weight(p.id) * 0.8), 0) || 1;
                const revenue = (storeMonth.revenue * w) / totalW;
                const orders = Math.max(1, Math.round((storeMonth.orders * w) / totalW));
                return { emp, revenue, orders };
            })
            .sort((a, b) => b.revenue - a.revenue);
    }, [storeIds]);

    const endOfDayRows = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        return storeUniverse.map((store) => {
            const dayPerf = PERFORMANCE.filter((p) => p.storeId === store.id && p.month === currentMonth);
            const totals = sumPerformance(dayPerf);
            const dailyRevenue = Math.round(totals.revenue / 30);
            const dailyOrders = Math.round(totals.orders / 30);
            return { store, dailyRevenue, dailyOrders, cash: Math.round(dailyRevenue * 0.55), card: Math.round(dailyRevenue * 0.45) };
        });
    }, [storeUniverse]);

    const cashflowRows = useMemo(() => {
        return MONTHS.slice(-6).map((month) => {
            const t = sumPerformance(scopedRows.filter((r) => r.month === month));
            return {
                label: monthLabel(month),
                inflow: t.revenue,
                outflow: t.cogs + t.opex,
                net: t.profit,
            };
        });
    }, [scopedRows]);

    const purchaseRows = useMemo(() => {
        return PURCHASE_ORDERS.map((po) => ({
            po,
            supplier: SUPPLIERS.find((s) => s.id === po.supplierId)?.name ?? "—",
            warehouse: getWarehouse(po.warehouseId)?.name ?? "—",
        }));
    }, []);

    return (
        <RoleGuard permission={["report_revenue", "report_profit", "report_inventory", "invoices"]}>
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Báo cáo kinh doanh</h1>
                        <p className="text-sm text-slate-500">
                            Doanh thu · Lợi nhuận · Tồn kho · Cuối ngày · Dòng tiền · Nhập hàng
                        </p>
                    </div>
                    <ScopeFilter scope={scope} />
                </div>

                {(revenueAccess.isReadOnly || profitAccess.isReadOnly || inventoryAccess.isStoreScoped) && (
                    <AccessBanner access={revenueAccess.canAccess ? revenueAccess : inventoryAccess} />
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {revenueAccess.canAccess && (
                        <StatCard label="Doanh thu (12T)" value={formatVndShort(totals.revenue)} icon={Receipt} accent="primary" />
                    )}
                    {profitAccess.canAccess && (
                        <StatCard label="Lợi nhuận (12T)" value={formatVndShort(totals.profit)} sub={`Biên ${formatPercent(margin)}`} icon={PiggyBank} accent="green" />
                    )}
                    {revenueAccess.canAccess && (
                        <>
                            <StatCard label="Đơn hàng" value={formatNumber(totals.orders)} icon={TrendingUp} accent="blue" />
                            <StatCard label="Sản phẩm bán" value={formatNumber(totals.units)} icon={Coins} accent="amber" />
                        </>
                    )}
                </div>

                <Tabs defaultValue={revenueAccess.canAccess ? "revenue" : profitAccess.canAccess ? "profit" : "inventory"}>
                    <TabsList>
                        {revenueAccess.canAccess && <TabsTrigger value="revenue">Doanh thu</TabsTrigger>}
                        {profitAccess.canAccess && <TabsTrigger value="profit">Lợi nhuận</TabsTrigger>}
                        {inventoryAccess.canAccess && <TabsTrigger value="inventory">Tồn kho</TabsTrigger>}
                        {revenueAccess.canAccess && <TabsTrigger value="sales">Bán hàng</TabsTrigger>}
                        {revenueAccess.canAccess && <TabsTrigger value="employee">NV bán hàng</TabsTrigger>}
                        {revenueAccess.canAccess && <TabsTrigger value="eod">Cuối ngày</TabsTrigger>}
                        {profitAccess.canAccess && <TabsTrigger value="cashflow">Dòng tiền</TabsTrigger>}
                        {inventoryAccess.canAccess && <TabsTrigger value="purchase">Nhập hàng</TabsTrigger>}
                    </TabsList>

                    {/* Revenue */}
                    <TabsContent value="revenue" className="space-y-4">
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-sm font-semibold text-slate-700">Doanh thu 12 tháng {VND_MILLION_AXIS_LABEL}</h2>
                            <LineChart
                                data={{
                                    labels: monthly.map((m) => m.label),
                                    datasets: [{ label: "Doanh thu", data: monthly.map((m) => Math.round(m.revenue / 1_000_000)), borderColor: ELISE_COLORS.primary, backgroundColor: ELISE_COLORS.primarySoft, fill: true, tension: 0.35 }],
                                }}
                            />
                        </div>
                        <ReportTable
                            title="Báo cáo doanh thu theo cửa hàng"
                            onExport={() =>
                                exportCsv("bao-cao-doanh-thu.csv", [
                                    ["Cửa hàng", "Khu vực", "Doanh thu", "Đơn hàng", "SP bán"],
                                    ...perStore.map((p) => [p.store.name, getRegion(p.store.regionId)?.name ?? "", p.revenue, p.orders, p.units]),
                                ])
                            }
                            head={["Cửa hàng", "Khu vực", "Doanh thu", "Đơn", "SP bán"]}
                            rows={perStore.map((p) => [
                                p.store.name,
                                getRegion(p.store.regionId)?.name ?? "",
                                formatVnd(p.revenue),
                                formatNumber(p.orders),
                                formatNumber(p.units),
                            ])}
                            alignRight={[2, 3, 4]}
                        />
                    </TabsContent>

                    {/* Profit */}
                    <TabsContent value="profit" className="space-y-4">
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-sm font-semibold text-slate-700">Doanh thu vs Lợi nhuận {VND_MILLION_AXIS_LABEL}</h2>
                            <BarChart
                                data={{
                                    labels: monthly.map((m) => m.label),
                                    datasets: [
                                        { label: "Doanh thu", data: monthly.map((m) => Math.round(m.revenue / 1_000_000)), backgroundColor: ELISE_COLORS.primary, borderRadius: 4 },
                                        { label: "Lợi nhuận", data: monthly.map((m) => Math.round(m.profit / 1_000_000)), backgroundColor: ELISE_COLORS.green, borderRadius: 4 },
                                    ],
                                }}
                                height={300}
                            />
                        </div>
                        <ReportTable
                            title="Báo cáo lợi nhuận theo cửa hàng"
                            onExport={() =>
                                exportCsv("bao-cao-loi-nhuan.csv", [
                                    ["Cửa hàng", "Doanh thu", "Giá vốn", "LN gộp", "Chi phí VH", "LN ròng", "Biên LN %"],
                                    ...perStore.map((p) => [p.store.name, p.revenue, p.cogs, p.gross, p.opex, p.profit, p.margin.toFixed(1)]),
                                ])
                            }
                            head={["Cửa hàng", "Doanh thu", "Giá vốn", "LN gộp", "Chi phí VH", "LN ròng", "Biên LN"]}
                            rows={perStore.map((p) => [
                                p.store.name,
                                formatVndShort(p.revenue),
                                formatVndShort(p.cogs),
                                formatVndShort(p.gross),
                                formatVndShort(p.opex),
                                formatVndShort(p.profit),
                                formatPercent(p.margin),
                            ])}
                            alignRight={[1, 2, 3, 4, 5, 6]}
                        />
                    </TabsContent>

                    {/* Inventory */}
                    <TabsContent value="inventory" className="space-y-4">
                        <ReportTable
                            title="Báo cáo tồn kho theo cửa hàng"
                            onExport={() =>
                                exportCsv("bao-cao-ton-kho.csv", [
                                    ["Cửa hàng", "Khu vực", "Tồn kho (SP)", "Giá trị vốn"],
                                    ...inventoryRows.map((r) => [r.store.name, getRegion(r.store.regionId)?.name ?? "", r.units, r.value]),
                                ])
                            }
                            head={["Cửa hàng", "Khu vực", "Tồn kho", "Giá trị vốn"]}
                            rows={inventoryRows.map((r) => [
                                r.store.name,
                                getRegion(r.store.regionId)?.name ?? "",
                                `${formatNumber(r.units)} sp`,
                                formatVnd(r.value),
                            ])}
                            alignRight={[2, 3]}
                        />
                    </TabsContent>

                    {/* Sales */}
                    <TabsContent value="sales" className="space-y-4">
                        <ReportTable
                            title="Báo cáo bán hàng (12 tháng)"
                            onExport={() =>
                                exportCsv("bao-cao-ban-hang.csv", [
                                    ["Cửa hàng", "Đơn hàng", "SP bán", "Doanh thu", "Giá trị TB/đơn"],
                                    ...perStore.map((p) => [p.store.name, p.orders, p.units, p.revenue, Math.round(p.revenue / Math.max(1, p.orders))]),
                                ])
                            }
                            head={["Cửa hàng", "Đơn hàng", "SP bán", "Doanh thu", "TB/đơn"]}
                            rows={perStore.map((p) => [
                                p.store.name,
                                formatNumber(p.orders),
                                formatNumber(p.units),
                                formatVndShort(p.revenue),
                                formatVnd(Math.round(p.revenue / Math.max(1, p.orders))),
                            ])}
                            alignRight={[1, 2, 3, 4]}
                        />
                    </TabsContent>

                    {/* Employee sales */}
                    <TabsContent value="employee" className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Users size={16} /> Doanh số nhân viên bán hàng tháng {currentMonth.split("-")[1]}/{currentMonth.split("-")[0]}
                        </div>
                        <ReportTable
                            title="Báo cáo doanh số nhân viên bán hàng"
                            onExport={() =>
                                exportCsv("bao-cao-nv-ban-hang.csv", [
                                    ["Nhân viên", "Cửa hàng", "Đơn hàng", "Doanh số"],
                                    ...employeeSales.map((r) => [r.emp.name, getStore(r.emp.storeId)?.name ?? "", r.orders, Math.round(r.revenue)]),
                                ])
                            }
                            head={["Nhân viên", "Cửa hàng", "Đơn hàng", "Doanh số"]}
                            rows={employeeSales.map((r) => [
                                r.emp.name,
                                getStore(r.emp.storeId)?.name ?? "",
                                formatNumber(r.orders),
                                formatVndShort(r.revenue),
                            ])}
                            alignRight={[2, 3]}
                        />
                    </TabsContent>

                    {/* End of day */}
                    <TabsContent value="eod" className="space-y-4">
                        <ReportTable
                            title="Báo cáo cuối ngày (ước tính theo tháng)"
                            onExport={() =>
                                exportCsv("bao-cao-cuoi-ngay.csv", [
                                    ["Cửa hàng", "Doanh thu ngày", "Đơn hàng", "Tiền mặt", "Thẻ/CK"],
                                    ...endOfDayRows.map((r) => [r.store.name, r.dailyRevenue, r.dailyOrders, r.cash, r.card]),
                                ])
                            }
                            head={["Cửa hàng", "DT ngày", "Đơn", "Tiền mặt", "Thẻ/CK"]}
                            rows={endOfDayRows.map((r) => [
                                r.store.name,
                                formatVndShort(r.dailyRevenue),
                                formatNumber(r.dailyOrders),
                                formatVndShort(r.cash),
                                formatVndShort(r.card),
                            ])}
                            alignRight={[1, 2, 3, 4]}
                        />
                    </TabsContent>

                    {/* Cashflow */}
                    <TabsContent value="cashflow" className="space-y-4">
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-sm font-semibold text-slate-700">Dòng tiền 6 tháng {VND_MILLION_AXIS_LABEL}</h2>
                            <BarChart
                                data={{
                                    labels: cashflowRows.map((r) => r.label),
                                    datasets: [
                                        { label: "Thu vào", data: cashflowRows.map((r) => Math.round(r.inflow / 1_000_000)), backgroundColor: ELISE_COLORS.green, borderRadius: 4 },
                                        { label: "Chi ra", data: cashflowRows.map((r) => Math.round(r.outflow / 1_000_000)), backgroundColor: ELISE_COLORS.rose, borderRadius: 4 },
                                    ],
                                }}
                                height={300}
                            />
                        </div>
                        <ReportTable
                            title="Báo cáo dòng tiền"
                            onExport={() =>
                                exportCsv("bao-cao-dong-tien.csv", [
                                    ["Tháng", "Thu vào", "Chi ra", "Ròng"],
                                    ...cashflowRows.map((r) => [r.label, r.inflow, r.outflow, r.net]),
                                ])
                            }
                            head={["Tháng", "Thu vào", "Chi ra", "Dòng ròng"]}
                            rows={cashflowRows.map((r) => [
                                r.label,
                                formatVndShort(r.inflow),
                                formatVndShort(r.outflow),
                                formatVndShort(r.net),
                            ])}
                            alignRight={[1, 2, 3]}
                        />
                    </TabsContent>

                    {/* Purchase report */}
                    <TabsContent value="purchase" className="space-y-4">
                        <ReportTable
                            title="Báo cáo nhập hàng theo NCC"
                            onExport={() =>
                                exportCsv("bao-cao-nhap-hang.csv", [
                                    ["Mã đơn", "NCC", "Kho nhận", "SL", "Giá trị", "Trạng thái"],
                                    ...purchaseRows.map((r) => [r.po.code, r.supplier, r.warehouse, r.po.units, r.po.totalAmount, r.po.status]),
                                ])
                            }
                            head={["Mã đơn", "Nhà cung cấp", "Kho nhận", "SL", "Giá trị", "TT"]}
                            rows={purchaseRows.map((r) => [
                                r.po.code,
                                r.supplier,
                                r.warehouse,
                                formatNumber(r.po.units),
                                formatVndShort(r.po.totalAmount),
                                r.po.status,
                            ])}
                            alignRight={[3, 4]}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </RoleGuard>
    );
}

interface ReportTableProps {
    title: string;
    head: string[];
    rows: (string | number)[][];
    alignRight?: number[];
    onExport: () => void;
}

function ReportTable({ title, head, rows, alignRight = [], onExport }: ReportTableProps) {
    const right = new Set(alignRight);
    const pager = usePagination(rows, 10);
    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-3">
                <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onExport}>
                    <Download size={14} className="mr-1.5" /> Xuất CSV
                </Button>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                        {head.map((h, i) => (
                            <th key={i} className={`px-4 py-3 font-medium ${right.has(i) ? "text-right" : ""}`}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {pager.pageItems.map((r, ri) => (
                        <tr key={ri} className="hover:bg-slate-50">
                            {r.map((cell, ci) => (
                                <td key={ci} className={`px-4 py-3 ${right.has(ci) ? "text-right font-medium text-slate-800" : "text-slate-600"} ${ci === 0 ? "font-medium text-slate-800" : ""}`}>
                                    {cell}
                                </td>
                            ))}
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
                unit="dòng"
            />
        </div>
    );
}
