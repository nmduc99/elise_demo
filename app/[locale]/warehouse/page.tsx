"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import RoleGuard from "@/components/demo/RoleGuard";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import StatCard from "@/components/demo/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
    LOW_STOCK_THRESHOLD,
    PRODUCTS,
    REGIONAL_WAREHOUSES,
    STOCK,
    STORES,
    getProduct,
    getStore,
    getWarehouse,
    regionalWarehouseForRegion,
    stockForWarehouse,
} from "@/lib/demo/eliseData";
import { getRoleFromUser } from "@/lib/demo/roles";
import { formatNumber, formatVndShort } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination, type PaginationState } from "@/lib/demo/usePagination";
import { useLocalCollection } from "@/lib/demo/useLocalCollection";
import { ArrowRightLeft, PackageSearch, Warehouse as WarehouseIcon } from "lucide-react";
import { useMemo, useState } from "react";

interface Transfer {
    id: string;
    createdAt: string;
    sourceWarehouseId: string;
    destWarehouseId: string;
    productId: string;
    size: string;
    color: string;
    qty: number;
}

function stockKey(wh: string, p: string, size: string, color: string): string {
    return `${wh}|${p}|${size}|${color}`;
}

export default function WarehousePage() {
    const { user } = useAuth();
    const role = getRoleFromUser(user);
    const lockedStoreId = role === "store_manager" ? user?.storeId ?? null : null;
    const regionalAccess = useDemoAccess("warehouse_regional");
    const storeAccess = useDemoAccess("warehouse_store");
    const transferAccess = useDemoAccess("stock_transfer");
    const { toast } = useToast();

    const [transfers, addTransfer] = useLocalCollection<Transfer>("elise-demo-transfers");

    // Net adjustment per exact stock key from transfers.
    const adjustments = useMemo(() => {
        const map = new Map<string, number>();
        for (const t of transfers) {
            const src = stockKey(t.sourceWarehouseId, t.productId, t.size, t.color);
            const dst = stockKey(t.destWarehouseId, t.productId, t.size, t.color);
            map.set(src, (map.get(src) ?? 0) - t.qty);
            map.set(dst, (map.get(dst) ?? 0) + t.qty);
        }
        return map;
    }, [transfers]);

    const effectiveQty = (wh: string, p: string, size: string, color: string): number => {
        const base = STOCK.find((s) => s.warehouseId === wh && s.productId === p && s.size === size && s.color === color)?.qty ?? 0;
        return Math.max(0, base + (adjustments.get(stockKey(wh, p, size, color)) ?? 0));
    };

    // Aggregate a warehouse's stock by product (sum across sizes/colors).
    const productRows = (warehouseId: string) => {
        return PRODUCTS.map((product) => {
            const rows = stockForWarehouse(warehouseId, product.id);
            let units = 0;
            for (const r of rows) units += effectiveQty(warehouseId, product.id, r.size, r.color);
            return { product, units, value: units * product.costPrice };
        });
    };

    /* ---- Regional tab ---- */
    const [regionWhId, setRegionWhId] = useState<string>(REGIONAL_WAREHOUSES[0].id);
    const regionalRows = useMemo(() => productRows(regionWhId), [regionWhId, adjustments]);
    const regionalUnits = regionalRows.reduce((s, r) => s + r.units, 0);
    const regionalValue = regionalRows.reduce((s, r) => s + r.value, 0);

    /* ---- Store tab ---- */
    const storeOptions = lockedStoreId ? STORES.filter((s) => s.id === lockedStoreId) : STORES;
    const [storeId, setStoreId] = useState<string>(lockedStoreId ?? STORES[0].id);
    const storeWhId = `wh-${storeId}`;
    const storeRows = useMemo(() => productRows(storeWhId), [storeWhId, adjustments]);
    const storeUnits = storeRows.reduce((s, r) => s + r.units, 0);
    const storeLow = storeRows.filter((r) => r.units > 0 && r.units <= LOW_STOCK_THRESHOLD * 3).length;

    const regionalPager = usePagination(regionalRows, 10);
    const storePager = usePagination(storeRows, 10);

    /* ---- Transfer dialog ---- */
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        regionId: REGIONAL_WAREHOUSES[0].regionId,
        destStoreId: lockedStoreId ?? STORES[0].id,
        productId: PRODUCTS[0].id,
        size: PRODUCTS[0].sizes[0],
        color: PRODUCTS[0].colors[0],
        qty: 10,
    });

    const formProduct = getProduct(form.productId)!;
    const sourceWhId = regionalWarehouseForRegion(form.regionId)?.id ?? REGIONAL_WAREHOUSES[0].id;
    const available = effectiveQty(sourceWhId, form.productId, form.size, form.color);

    const submitTransfer = () => {
        if (form.qty <= 0) {
            toast({ title: "Số lượng không hợp lệ", variant: "destructive" });
            return;
        }
        if (form.qty > available) {
            toast({ title: "Vượt quá tồn kho khu vực", description: `Chỉ còn ${available} sản phẩm`, variant: "destructive" });
            return;
        }
        if (transferAccess.isProposeOnly) {
            toast({
                title: "Đã gửi đề nghị điều chuyển",
                description: `${form.qty} x ${formProduct.name} → ${getStore(form.destStoreId)?.name}. Chờ phòng thu mua duyệt.`,
                variant: "success",
            });
            setOpen(false);
            return;
        }
        addTransfer({
            id: `tr-${Date.now()}`,
            createdAt: new Date().toISOString(),
            sourceWarehouseId: sourceWhId,
            destWarehouseId: `wh-${form.destStoreId}`,
            productId: form.productId,
            size: form.size,
            color: form.color,
            qty: form.qty,
        });
        toast({
            title: "Điều chuyển thành công",
            description: `${form.qty} x ${formProduct.name} → ${getStore(form.destStoreId)?.name}`,
            variant: "success",
        });
        setOpen(false);
    };

    const transferLabel = transferAccess.isProposeOnly ? "Đề nghị điều chuyển" : "Điều chuyển kho";
    const canTransfer = transferAccess.canWrite || transferAccess.isProposeOnly;

    const transferDialog = canTransfer ? (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-custom text-white hover:bg-custom-hover">
                    <ArrowRightLeft size={16} className="mr-1.5" /> {transferLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Điều chuyển: Kho khu vực → Kho cửa hàng</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-500">Kho khu vực (nguồn)</label>
                        <Select value={form.regionId} onValueChange={(v) => setForm((f) => ({ ...f, regionId: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {REGIONAL_WAREHOUSES.map((w) => (
                                    <SelectItem key={w.id} value={w.regionId}>{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-500">Cửa hàng nhận</label>
                        <Select
                            value={form.destStoreId}
                            onValueChange={(v) => setForm((f) => ({ ...f, destStoreId: v }))}
                            disabled={!!lockedStoreId}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {storeOptions.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-500">Sản phẩm</label>
                        <Select
                            value={form.productId}
                            onValueChange={(v) => {
                                const p = getProduct(v)!;
                                setForm((f) => ({ ...f, productId: v, size: p.sizes[0], color: p.colors[0] }));
                            }}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PRODUCTS.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">Size</label>
                        <Select value={form.size} onValueChange={(v) => setForm((f) => ({ ...f, size: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {formProduct.sizes.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">Màu</label>
                        <Select value={form.color} onValueChange={(v) => setForm((f) => ({ ...f, color: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {formProduct.colors.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            Số lượng (tồn nguồn: {available})
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={form.qty}
                            onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                            className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button className="bg-custom text-white hover:bg-custom-hover" onClick={submitTransfer}>
                        {transferAccess.isProposeOnly ? "Gửi đề nghị" : "Xác nhận điều chuyển"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ) : null;

    const renderTable = (
        pager: PaginationState<{ product: typeof PRODUCTS[number]; units: number; value: number }>,
        lowThreshold: number
    ) => (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-4 py-3 font-medium">Sản phẩm</th>
                        <th className="px-4 py-3 font-medium">SKU</th>
                        <th className="px-4 py-3 text-right font-medium">Tồn kho</th>
                        <th className="px-4 py-3 text-right font-medium">Giá trị (vốn)</th>
                        <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {pager.pageItems.map(({ product, units, value }) => {
                        const out = units === 0;
                        const low = !out && units <= lowThreshold;
                        return (
                            <tr key={product.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{product.name}</td>
                                <td className="px-4 py-3 text-slate-400">{product.sku}</td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatNumber(units)}</td>
                                <td className="px-4 py-3 text-right text-slate-600">{formatVndShort(value)}</td>
                                <td className="px-4 py-3 text-center">
                                    {out ? (
                                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Hết hàng</Badge>
                                    ) : low ? (
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Sắp hết</Badge>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Còn hàng</Badge>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Pagination
                page={pager.page}
                totalPages={pager.totalPages}
                total={pager.total}
                start={pager.start}
                end={pager.end}
                onPageChange={pager.setPage}
                unit="mã hàng"
            />
        </div>
    );

    const defaultTab = regionalAccess.canAccess && !lockedStoreId ? "regional" : "store";

    return (
        <RoleGuard permission={["warehouse_regional", "warehouse_store"]}>
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Quản lý kho 2 cấp</h1>
                        <p className="text-sm text-slate-500">
                            Kho khu vực (kho tổng vùng) và kho từng cửa hàng theo tỉnh thành
                        </p>
                    </div>
                    {!lockedStoreId && transferAccess.canWrite && transferDialog}
                </div>

                <AccessBanner access={storeAccess.isReadOnly ? storeAccess : regionalAccess} />

                <Tabs defaultValue={defaultTab}>
                    <TabsList>
                        {regionalAccess.canAccess && !lockedStoreId && (
                            <TabsTrigger value="regional">Kho khu vực</TabsTrigger>
                        )}
                        {storeAccess.canAccess && (
                            <TabsTrigger value="store">Kho cửa hàng</TabsTrigger>
                        )}
                    </TabsList>

                    {regionalAccess.canAccess && !lockedStoreId && (
                        <TabsContent value="regional" className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Select value={regionWhId} onValueChange={setRegionWhId}>
                                    <SelectTrigger className="h-9 w-[260px] bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {REGIONAL_WAREHOUSES.map((w) => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <StatCard label="Tổng tồn kho" value={`${formatNumber(regionalUnits)} sp`} icon={WarehouseIcon} accent="primary" />
                                <StatCard label="Giá trị tồn (vốn)" value={formatVndShort(regionalValue)} icon={PackageSearch} accent="green" />
                                <StatCard label="Số mã hàng" value={formatNumber(regionalRows.length)} accent="blue" />
                            </div>
                            {renderTable(regionalPager, LOW_STOCK_THRESHOLD * 5)}
                        </TabsContent>
                    )}

                    {storeAccess.canAccess && (
                    <TabsContent value="store" className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={storeId} onValueChange={setStoreId} disabled={!!lockedStoreId}>
                                <SelectTrigger className="h-9 w-[260px] bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {storeOptions.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {lockedStoreId && transferDialog}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <StatCard label="Tồn kho cửa hàng" value={`${formatNumber(storeUnits)} sp`} icon={WarehouseIcon} accent="primary" />
                            <StatCard label="Mã sắp hết hàng" value={formatNumber(storeLow)} accent="amber" />
                            <StatCard label="Kho" value={getWarehouse(storeWhId)?.name?.replace("Kho ", "") ?? "-"} accent="blue" />
                        </div>
                        {renderTable(storePager, LOW_STOCK_THRESHOLD * 3)}
                    </TabsContent>
                    )}
                </Tabs>

                {transfers.length > 0 && (
                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b px-5 py-3 text-sm font-semibold text-slate-700">
                            Lịch sử điều chuyển trong phiên ({transfers.length})
                        </div>
                        <div className="divide-y text-sm">
                            {transfers.slice(0, 8).map((t) => (
                                <div key={t.id} className="flex items-center justify-between px-5 py-2.5">
                                    <span className="text-slate-700">
                                        {getProduct(t.productId)?.name} ({t.size}/{t.color}) × {t.qty}
                                    </span>
                                    <span className="text-slate-400">
                                        {getWarehouse(t.sourceWarehouseId)?.name} → {getStore(t.destWarehouseId.replace("wh-", ""))?.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}
