"use client";

import RoleGuard from "@/components/demo/RoleGuard";
import StatCard from "@/components/demo/StatCard";
import { ScopeFilter, useDemoScope } from "@/components/demo/ScopeFilter";
import { BarChart, ELISE_COLORS, LineChart } from "@/components/demo/DemoCharts";
import { useAuth } from "@/components/auth/AuthProvider";
import {
    EMPLOYEES,
    LOW_STOCK_THRESHOLD,
    MONTHS,
    PERFORMANCE,
    PRODUCTS,
    REGIONS,
    STOCK,
    STORES,
    filterPerformance,
    getProduct,
    getRegion,
    getStore,
    sumPerformance,
    totalUnitsInWarehouse,
} from "@/lib/demo/eliseData";
import { getRoleFromUser } from "@/lib/demo/roles";
import { hasAccess } from "@/lib/demo/permissions";
import { getDefaultHomePath } from "@/lib/demo/nav";
import { formatNumber, formatPercent, formatVnd, formatVndShort } from "@/lib/demo/format";
import { useLocalCollection } from "@/lib/demo/useLocalCollection";
import { useRouter } from "@/i18n/routing";
import {
    Banknote,
    Boxes,
    Receipt,
    ShoppingBag,
    Store as StoreIcon,
    TrendingUp,
    Users,
} from "lucide-react";
import { useEffect, useMemo } from "react";

function monthLabel(month: string): string {
    const [y, m] = month.split("-");
    return `${m}/${y.slice(2)}`;
}

function pctChange(current: number, previous: number): number {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
}

/** Deterministic 0..1 weight from a string (for synthesized product mix). */
function weight(key: string): number {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 1000) / 1000;
}

const currentMonth = MONTHS[MONTHS.length - 1];
const prevMonth = MONTHS[MONTHS.length - 2];

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const role = getRoleFromUser(user);
    const router = useRouter();

    useEffect(() => {
        if (isLoading || !role) return;

        const canChain = hasAccess(role, "dashboard_chain");
        const canStore = hasAccess(role, "dashboard_store");

        if (!canChain && !canStore) {
            router.replace(getDefaultHomePath(role) as "/dashboard");
        }
    }, [isLoading, role, router]);

    if (role === "store_manager") {
        return (
            <RoleGuard permission="dashboard_store">
                <StoreManagerDashboard storeId={user?.storeId ?? STORES[0].id} />
            </RoleGuard>
        );
    }

    return (
        <RoleGuard permission="dashboard_chain">
            <ChainDashboard />
        </RoleGuard>
    );
}

/* -------------------------------------------------------------------------- */
/* Director / chain dashboard                                                 */
/* -------------------------------------------------------------------------- */

function ChainDashboard() {
    const scope = useDemoScope();

    const scopedRows = useMemo(
        () => filterPerformance({ regionId: scope.regionId, storeId: scope.storeId }),
        [scope.regionId, scope.storeId]
    );

    const currentTotals = useMemo(
        () => sumPerformance(scopedRows.filter((r) => r.month === currentMonth)),
        [scopedRows]
    );
    const prevTotals = useMemo(
        () => sumPerformance(scopedRows.filter((r) => r.month === prevMonth)),
        [scopedRows]
    );

    const profitMargin = currentTotals.revenue ? (currentTotals.profit / currentTotals.revenue) * 100 : 0;

    const scopedStores = useMemo(
        () =>
            STORES.filter(
                (s) =>
                    (!scope.regionId || s.regionId === scope.regionId) &&
                    (!scope.storeId || s.id === scope.storeId)
            ),
        [scope.regionId, scope.storeId]
    );

    const headcount = useMemo(() => {
        const ids = new Set(scopedStores.map((s) => s.id));
        return EMPLOYEES.filter((e) => ids.has(e.storeId)).length;
    }, [scopedStores]);

    const stockUnits = useMemo(() => {
        return scopedStores.reduce((sum, s) => sum + totalUnitsInWarehouse(`wh-${s.id}`), 0);
    }, [scopedStores]);

    const lowStockCount = useMemo(() => {
        const storeWhIds = new Set(scopedStores.map((s) => `wh-${s.id}`));
        return STOCK.filter((s) => storeWhIds.has(s.warehouseId) && s.qty > 0 && s.qty <= LOW_STOCK_THRESHOLD).length;
    }, [scopedStores]);

    const trend = useMemo(() => {
        const labels = MONTHS.map(monthLabel);
        const revenue: number[] = [];
        const profit: number[] = [];
        for (const month of MONTHS) {
            const totals = sumPerformance(scopedRows.filter((r) => r.month === month));
            revenue.push(Math.round(totals.revenue / 1_000_000));
            profit.push(Math.round(totals.profit / 1_000_000));
        }
        return { labels, revenue, profit };
    }, [scopedRows]);

    const topStores = useMemo(() => {
        return scopedStores
            .map((s) => {
                const totals = sumPerformance(PERFORMANCE.filter((p) => p.month === currentMonth && p.storeId === s.id));
                return { store: s, revenue: totals.revenue, target: s.monthlyTarget };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);
    }, [scopedStores]);

    // Synthesized "top products" by share of scoped current-month revenue.
    const topProducts = useMemo(() => {
        const totalW = PRODUCTS.reduce((s, p) => s + (0.4 + weight(p.id)), 0) || 1;
        return PRODUCTS.map((p) => ({
            product: p,
            revenue: (currentTotals.revenue * (0.4 + weight(p.id))) / totalW,
        }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);
    }, [currentTotals.revenue]);

    return (
        <div className="w-full space-y-6 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tổng quan chuỗi Elise</h1>
                    <p className="text-sm text-slate-500">
                        Kết quả kinh doanh tháng {currentMonth.split("-")[1]}/{currentMonth.split("-")[0]}
                    </p>
                </div>
                <ScopeFilter scope={scope} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Tổng doanh thu tháng" value={formatVndShort(currentTotals.revenue)} sub={formatVnd(currentTotals.revenue)} icon={Banknote} accent="primary" change={pctChange(currentTotals.revenue, prevTotals.revenue)} />
                <StatCard label="Tổng lợi nhuận tháng" value={formatVndShort(currentTotals.profit)} sub={`Biên LN ${formatPercent(profitMargin)}`} icon={TrendingUp} accent="green" change={pctChange(currentTotals.profit, prevTotals.profit)} />
                <StatCard label="Số đơn hàng" value={formatNumber(currentTotals.orders)} sub={`${formatNumber(currentTotals.units)} sản phẩm bán ra`} icon={Receipt} accent="blue" change={pctChange(currentTotals.orders, prevTotals.orders)} />
                <StatCard label="Tổng cửa hàng" value={formatNumber(scopedStores.length)} sub={`${scopedStores.filter((s) => s.type === "franchise").length} nhượng quyền`} icon={StoreIcon} accent="amber" />
                <StatCard label="Tổng nhân viên" value={formatNumber(headcount)} icon={Users} accent="blue" />
                <StatCard label="Tổng tồn kho" value={`${formatNumber(stockUnits)} sp`} sub={`${lowStockCount} mã sắp hết hàng`} icon={Boxes} accent="rose" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">Doanh thu theo tháng (triệu đ)</h2>
                    <LineChart
                        data={{
                            labels: trend.labels,
                            datasets: [
                                { label: "Doanh thu", data: trend.revenue, borderColor: ELISE_COLORS.primary, backgroundColor: ELISE_COLORS.primarySoft, fill: true, tension: 0.35 },
                                { label: "Lợi nhuận", data: trend.profit, borderColor: ELISE_COLORS.green, backgroundColor: "transparent", tension: 0.35 },
                            ],
                        }}
                    />
                </div>
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">Top sản phẩm bán chạy (triệu đ)</h2>
                    <BarChart
                        data={{
                            labels: topProducts.map((t) => t.product.name),
                            datasets: [{ label: "Doanh thu", data: topProducts.map((t) => Math.round(t.revenue / 1_000_000)), backgroundColor: ELISE_COLORS.primary, borderRadius: 6 }],
                        }}
                        options={{ indexAxis: "y" as const, plugins: { legend: { display: false } } }}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-700">Top cửa hàng & tiến độ mục tiêu (tháng này)</h2>
                </div>
                <div className="divide-y">
                    {topStores.map(({ store, revenue, target }) => {
                        const progress = target ? Math.min(150, (revenue / target) * 100) : 0;
                        const reached = revenue >= target;
                        return (
                            <div key={store.id} className="flex items-center gap-4 px-5 py-3">
                                <div className="w-48 shrink-0">
                                    <p className="truncate text-sm font-medium text-slate-800">{store.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {getRegion(store.regionId)?.name} · {store.type === "franchise" ? "Nhượng quyền" : "Sở hữu"}
                                    </p>
                                </div>
                                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                    <div className={reached ? "h-full rounded-full bg-green-500" : "h-full rounded-full bg-custom"} style={{ width: `${Math.min(100, progress)}%` }} />
                                </div>
                                <div className="w-40 shrink-0 text-right">
                                    <p className="text-sm font-semibold text-slate-800">{formatVndShort(revenue)}</p>
                                    <p className="text-xs text-slate-400">{formatPercent(progress, 0)} mục tiêu</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Store-manager dashboard                                                    */
/* -------------------------------------------------------------------------- */

interface SmSale {
    id: string;
    storeId: string;
    total: number;
    itemCount: number;
    createdAt: string;
}

function StoreManagerDashboard({ storeId }: { storeId: string }) {
    const store = getStore(storeId);
    const [sales] = useLocalCollection<SmSale>("elise-demo-sales");

    const today = new Date().toDateString();
    const todaySales = sales.filter((s) => s.storeId === storeId && new Date(s.createdAt).toDateString() === today);
    const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);
    const todayUnits = todaySales.reduce((s, x) => s + x.itemCount, 0);

    const monthTotals = useMemo(
        () => sumPerformance(PERFORMANCE.filter((p) => p.month === currentMonth && p.storeId === storeId)),
        [storeId]
    );
    const stockUnits = totalUnitsInWarehouse(`wh-${storeId}`);
    const salesStaff = EMPLOYEES.filter((e) => e.storeId === storeId && e.department === "Bán hàng");
    const allStaff = EMPLOYEES.filter((e) => e.storeId === storeId);
    const targetPct = store?.monthlyTarget ? (monthTotals.revenue / store.monthlyTarget) * 100 : 0;

    // Per-staff synthesized share of this month revenue.
    const staffRanking = useMemo(() => {
        const totalW = salesStaff.reduce((s, e) => s + (0.6 + weight(e.id)), 0) || 1;
        return salesStaff
            .map((e) => ({ emp: e, revenue: (monthTotals.revenue * (0.6 + weight(e.id))) / totalW }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [salesStaff, monthTotals.revenue]);

    const lowStock = STOCK.filter((s) => s.warehouseId === `wh-${storeId}` && s.qty > 0 && s.qty <= LOW_STOCK_THRESHOLD).length;

    return (
        <div className="w-full space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Tổng quan cửa hàng</h1>
                <p className="text-sm text-slate-500">{store?.name} · {store?.address}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Doanh thu hôm nay" value={formatVndShort(todayRevenue)} sub={`${todaySales.length} đơn POS`} icon={Banknote} accent="primary" />
                <StatCard label="Đơn hàng hôm nay" value={formatNumber(todaySales.length)} sub={`${formatNumber(todayUnits)} sản phẩm`} icon={ShoppingBag} accent="blue" />
                <StatCard label="Tồn kho cửa hàng" value={`${formatNumber(stockUnits)} sp`} sub={`${lowStock} mã sắp hết`} icon={Boxes} accent="amber" />
                <StatCard label="Nhân viên bán hàng" value={formatNumber(salesStaff.length)} sub={`${allStaff.length} tổng nhân sự`} icon={Users} accent="green" />
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">Tiến độ doanh thu tháng này</h2>
                    <span className="text-sm font-semibold text-slate-700">
                        {formatVndShort(monthTotals.revenue)} / {formatVndShort(store?.monthlyTarget ?? 0)}
                    </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={targetPct >= 100 ? "h-full rounded-full bg-green-500" : "h-full rounded-full bg-custom"} style={{ width: `${Math.min(100, targetPct)}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">{formatPercent(targetPct, 0)} mục tiêu tháng</p>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="border-b px-5 py-3 text-sm font-semibold text-slate-700">Doanh số nhân viên bán hàng (tháng này)</div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Nhân viên</th>
                            <th className="px-4 py-3 font-medium">Vị trí</th>
                            <th className="px-4 py-3 text-right font-medium">Doanh số ước tính</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {staffRanking.map(({ emp, revenue }) => (
                            <tr key={emp.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{emp.name}</td>
                                <td className="px-4 py-3 text-slate-500">{emp.position}</td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatVndShort(revenue)}</td>
                            </tr>
                        ))}
                        {staffRanking.length === 0 && (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Chưa có nhân viên bán hàng</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
