"use client";

import RoleGuard from "@/components/demo/RoleGuard";
import StatCard from "@/components/demo/StatCard";
import { Badge } from "@/components/ui/badge";
import { BarChart, ELISE_COLORS } from "@/components/demo/DemoCharts";
import {
    MONTHS,
    PERFORMANCE,
    STORES,
    getRegion,
    sumPerformance,
    totalUnitsInWarehouse,
} from "@/lib/demo/eliseData";
import { formatNumber, formatPercent, formatVnd, formatVndShort, VND_MILLION_AXIS_LABEL } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination } from "@/lib/demo/usePagination";
import { Crown, HandCoins, Percent, Store as StoreIcon } from "lucide-react";
import { useMemo } from "react";

const currentMonth = MONTHS[MONTHS.length - 1];

export default function FranchisePage() {
    const rows = useMemo(() => {
        return STORES.filter((s) => s.type === "franchise")
            .map((store) => {
                const totals = sumPerformance(
                    PERFORMANCE.filter((p) => p.month === currentMonth && p.storeId === store.id)
                );
                const royalty = (totals.revenue * store.royaltyRate) / 100;
                return {
                    store,
                    revenue: totals.revenue,
                    units: totals.units,
                    royalty,
                    onHand: totalUnitsInWarehouse(`wh-${store.id}`),
                    targetPct: store.monthlyTarget ? (totals.revenue / store.monthlyTarget) * 100 : 0,
                };
            })
            .sort((a, b) => b.revenue - a.revenue);
    }, []);

    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const totalRoyalty = rows.reduce((s, r) => s + r.royalty, 0);
    const avgRate = rows.length ? rows.reduce((s, r) => s + r.store.royaltyRate, 0) / rows.length : 0;

    const rowPage = usePagination(rows, 10);

    return (
        <RoleGuard permission="franchise">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Theo dõi cửa hàng nhượng quyền</h1>
                    <p className="text-sm text-slate-500">
                        Doanh thu, phí nhượng quyền và hàng hóa nhập từ kho khu vực
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Cửa hàng nhượng quyền" value={formatNumber(rows.length)} icon={StoreIcon} accent="amber" />
                    <StatCard label="Doanh thu tháng" value={formatVndShort(totalRevenue)} sub={formatVnd(totalRevenue)} icon={Crown} accent="primary" />
                    <StatCard label="Phí nhượng quyền thu" value={formatVndShort(totalRoyalty)} sub={formatVnd(totalRoyalty)} icon={HandCoins} accent="green" />
                    <StatCard label="Royalty trung bình" value={formatPercent(avgRate)} icon={Percent} accent="blue" />
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">Phí nhượng quyền theo cửa hàng {VND_MILLION_AXIS_LABEL}</h2>
                    <BarChart
                        data={{
                            labels: rows.map((r) => r.store.name),
                            datasets: [
                                {
                                    label: "Phí nhượng quyền",
                                    data: rows.map((r) => Math.round(r.royalty / 1_000_000)),
                                    backgroundColor: ELISE_COLORS.amber,
                                    borderRadius: 6,
                                },
                            ],
                        }}
                        options={{ indexAxis: "y" as const, plugins: { legend: { display: false } } }}
                        height={320}
                    />
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Cửa hàng</th>
                                <th className="px-4 py-3 font-medium">Khu vực</th>
                                <th className="px-4 py-3 text-right font-medium">Doanh thu</th>
                                <th className="px-4 py-3 text-center font-medium">Royalty</th>
                                <th className="px-4 py-3 text-right font-medium">Phí phải nộp</th>
                                <th className="px-4 py-3 text-right font-medium">Tồn kho</th>
                                <th className="px-4 py-3 text-center font-medium">Đạt mục tiêu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {rowPage.pageItems.map((r) => (
                                <tr key={r.store.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-800">{r.store.name}</p>
                                        <p className="text-xs text-slate-400">{r.store.managerName}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{getRegion(r.store.regionId)?.name}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatVndShort(r.revenue)}</td>
                                    <td className="px-4 py-3 text-center text-slate-600">{r.store.royaltyRate}%</td>
                                    <td className="px-4 py-3 text-right font-semibold text-amber-700">{formatVndShort(r.royalty)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{formatNumber(r.onHand)} sp</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge
                                            className={
                                                r.targetPct >= 100
                                                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                    : r.targetPct >= 80
                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                                    : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                            }
                                        >
                                            {formatPercent(r.targetPct, 0)}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination
                        page={rowPage.page}
                        totalPages={rowPage.totalPages}
                        total={rowPage.total}
                        start={rowPage.start}
                        end={rowPage.end}
                        onPageChange={rowPage.setPage}
                        unit="cửa hàng"
                    />
                </div>
            </div>
        </RoleGuard>
    );
}
