"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import WriteGuard from "@/components/demo/WriteGuard";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import RoleGuard from "@/components/demo/RoleGuard";
import StatCard from "@/components/demo/StatCard";
import SupplierDialog from "@/components/demo/procurement/SupplierDialog";
import PurchaseOrderDialog from "@/components/demo/procurement/PurchaseOrderDialog";
import {
    calcPoTotals,
    emptyPoDraft,
    formatPoProductSummary,
    poToDraft,
    type PoDialogMode,
} from "@/components/demo/procurement/purchaseOrderUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    PURCHASE_ORDERS,
    REGIONS,
    SUPPLIERS,
    type PurchaseOrder,
    type Supplier,
    getRegion,
    getWarehouse,
} from "@/lib/demo/eliseData";
import { formatDate, formatNumber, formatVnd, formatVndShort } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination } from "@/lib/demo/usePagination";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import {
    ClipboardList,
    Eye,
    PackageCheck,
    Pencil,
    Phone,
    Plus,
    Trash2,
    Truck,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const PO_STATUS: Record<PurchaseOrder["status"], { label: string; cls: string }> = {
    draft: { label: "Nháp", cls: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
    ordered: { label: "Đã đặt", cls: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    received: { label: "Đã nhập kho", cls: "bg-green-100 text-green-700 hover:bg-green-100" },
};

function newId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}`;
}

function emptySupplier(): Supplier {
    return { id: "", name: "", category: "", phone: "", regionId: REGIONS[0].id, contacts: [] };
}

export default function ProcurementPage() {
    const supplierAccess = useDemoAccess("suppliers");
    const { toast } = useToast();

    const suppliers = useCrudCollection<Supplier>("elise-demo-suppliers", SUPPLIERS);
    const orders = useCrudCollection<PurchaseOrder>("elise-demo-purchase-orders", PURCHASE_ORDERS);

    const supplierName = (id: string) => suppliers.items.find((s) => s.id === id)?.name ?? "—";

    const [supOpen, setSupOpen] = useState(false);
    const [supDraft, setSupDraft] = useState<Supplier>(emptySupplier());

    const saveSupplier = () => {
        if (!supDraft.name.trim()) {
            toast({ title: "Thiếu tên nhà cung cấp", variant: "destructive" });
            return;
        }
        if (supDraft.id) {
            suppliers.update(supDraft.id, supDraft);
            toast({ title: "Đã cập nhật NCC", variant: "success" });
        } else {
            suppliers.add({ ...supDraft, id: newId("sup") });
            toast({ title: "Đã thêm NCC", variant: "success" });
        }
        setSupOpen(false);
    };

    const [poOpen, setPoOpen] = useState(false);
    const [poMode, setPoMode] = useState<PoDialogMode>("create");
    const [poDraft, setPoDraft] = useState(emptyPoDraft);
    const [poMeta, setPoMeta] = useState<Pick<PurchaseOrder, "code" | "status" | "createdAt"> | undefined>();

    const openPoCreate = () => {
        setPoMode("create");
        setPoMeta(undefined);
        setPoDraft({
            ...emptyPoDraft(),
            supplierId: suppliers.items[0]?.id ?? "",
        });
        setPoOpen(true);
    };

    const openPoView = (order: PurchaseOrder) => {
        setPoMode("view");
        setPoMeta({ code: order.code, status: order.status, createdAt: order.createdAt });
        setPoDraft(poToDraft(order));
        setPoOpen(true);
    };

    const openPoEdit = (order: PurchaseOrder) => {
        setPoMode("edit");
        setPoMeta({ code: order.code, status: order.status, createdAt: order.createdAt });
        setPoDraft(poToDraft(order));
        setPoOpen(true);
    };

    const savePo = () => {
        if (!poDraft.supplierId) {
            toast({ title: "Vui lòng chọn nhà cung cấp", variant: "destructive" });
            return;
        }
        if (poDraft.lines.length === 0) {
            toast({ title: "Vui lòng thêm ít nhất một sản phẩm", variant: "destructive" });
            return;
        }
        const { units, totalAmount } = calcPoTotals(poDraft.lines);
        const lines = poDraft.lines.map((line) => ({ ...line }));

        if (poMode === "edit" && poDraft.id) {
            orders.update(poDraft.id, {
                supplierId: poDraft.supplierId,
                warehouseId: poDraft.warehouseId,
                totalAmount,
                units,
                lines,
            });
            toast({ title: "Đã cập nhật đơn nhập hàng", description: formatVnd(totalAmount), variant: "success" });
        } else {
            orders.add({
                id: newId("po"),
                code: `PO${Date.now().toString().slice(-4)}`,
                supplierId: poDraft.supplierId,
                warehouseId: poDraft.warehouseId,
                createdAt: new Date().toISOString(),
                status: "ordered",
                totalAmount,
                units,
                lines,
            });
            toast({ title: "Đã tạo đơn nhập hàng", description: formatVnd(totalAmount), variant: "success" });
        }
        setPoOpen(false);
    };

    const receivePo = (po: PurchaseOrder) => {
        orders.update(po.id, { status: "received" });
        toast({ title: "Đã nhập kho", description: `${po.code} · ${formatNumber(po.units)} sp`, variant: "success" });
    };

    const stats = useMemo(() => {
        const received = orders.items.filter((o) => o.status === "received");
        const pending = orders.items.filter((o) => o.status !== "received");
        return {
            suppliers: suppliers.items.length,
            poValue: orders.items.reduce((s, o) => s + o.totalAmount, 0),
            receivedUnits: received.reduce((s, o) => s + o.units, 0),
            pending: pending.length,
        };
    }, [orders.items, suppliers.items]);

    const supplierPage = usePagination(suppliers.items, 10);
    const orderPage = usePagination(orders.items, 10);

    return (
        <RoleGuard permission="suppliers">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Thu mua & Nhà cung cấp</h1>
                    <p className="text-sm text-slate-500">
                        Quản lý nhà cung cấp (kèm người liên hệ) và đơn nhập hàng về kho khu vực
                    </p>
                </div>

                <AccessBanner access={supplierAccess} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Nhà cung cấp" value={formatNumber(stats.suppliers)} icon={Truck} accent="primary" />
                    <StatCard label="Giá trị đơn nhập" value={formatVndShort(stats.poValue)} sub={formatVnd(stats.poValue)} icon={ClipboardList} accent="blue" />
                    <StatCard label="SP đã nhập kho" value={`${formatNumber(stats.receivedUnits)} sp`} icon={PackageCheck} accent="green" />
                    <StatCard label="Đơn chờ xử lý" value={formatNumber(stats.pending)} icon={ClipboardList} accent="amber" />
                </div>

                <Tabs defaultValue="suppliers">
                    <TabsList>
                        <TabsTrigger value="suppliers">Nhà cung cấp</TabsTrigger>
                        <TabsTrigger value="orders">Đơn nhập hàng</TabsTrigger>
                    </TabsList>

                    <TabsContent value="suppliers" className="space-y-3">
                        <WriteGuard permission="suppliers">
                            <div className="flex justify-end">
                                <Button
                                    className="bg-custom text-white hover:bg-custom-hover"
                                    onClick={() => {
                                        setSupDraft(emptySupplier());
                                        setSupOpen(true);
                                    }}
                                >
                                    <Plus size={16} className="mr-1.5" /> Thêm nhà cung cấp
                                </Button>
                            </div>
                        </WriteGuard>
                        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Nhà cung cấp</th>
                                        <th className="px-4 py-3 font-medium">Nhóm hàng</th>
                                        <th className="px-4 py-3 font-medium">Điện thoại</th>
                                        <th className="px-4 py-3 font-medium">Người liên hệ</th>
                                        <th className="px-4 py-3 font-medium">Khu vực</th>
                                        <th className="px-4 py-3 text-center font-medium">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {supplierPage.pageItems.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{s.category}</td>
                                            <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {s.contacts?.length ? (
                                                    <div className="space-y-0.5">
                                                        {s.contacts.slice(0, 2).map((c, i) => (
                                                            <div key={i} className="flex items-center gap-1 text-xs">
                                                                <Users size={12} className="text-slate-400" />
                                                                <span>{c.name}</span>
                                                                {c.phone && (
                                                                    <span className="text-slate-400">
                                                                        <Phone size={10} className="inline mr-0.5" />
                                                                        {c.phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {s.contacts.length > 2 && (
                                                            <span className="text-xs text-slate-400">+{s.contacts.length - 2} liên hệ</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{getRegion(s.regionId)?.name}</td>
                                            <td className="px-4 py-3">
                                                <WriteGuard permission="suppliers">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={() => { setSupDraft({ ...s, contacts: s.contacts ?? [] }); setSupOpen(true); }} className="rounded p-1.5 text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
                                                        <button onClick={() => suppliers.remove(s.id)} className="rounded p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></button>
                                                    </div>
                                                </WriteGuard>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination
                                page={supplierPage.page}
                                totalPages={supplierPage.totalPages}
                                total={supplierPage.total}
                                start={supplierPage.start}
                                end={supplierPage.end}
                                onPageChange={supplierPage.setPage}
                                unit="nhà cung cấp"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-3">
                        <WriteGuard permission="suppliers">
                            <div className="flex justify-end">
                                <Button
                                    className="bg-custom text-white hover:bg-custom-hover"
                                    onClick={openPoCreate}
                                    disabled={suppliers.items.length === 0}
                                >
                                    <Plus size={16} className="mr-1.5" /> Tạo đơn nhập
                                </Button>
                            </div>
                        </WriteGuard>
                        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Mã đơn</th>
                                        <th className="px-4 py-3 font-medium">Nhà cung cấp</th>
                                        <th className="px-4 py-3 font-medium">Kho nhận</th>
                                        <th className="px-4 py-3 font-medium">Sản phẩm</th>
                                        <th className="px-4 py-3 font-medium">Ngày</th>
                                        <th className="px-4 py-3 text-right font-medium">SL</th>
                                        <th className="px-4 py-3 text-right font-medium">Giá trị</th>
                                        <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                                        <th className="w-44 px-4 py-3 text-center font-medium">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orderPage.pageItems.map((o) => (
                                        <tr key={o.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{o.code}</td>
                                            <td className="px-4 py-3 text-slate-600">{supplierName(o.supplierId)}</td>
                                            <td className="px-4 py-3 text-slate-600">{getWarehouse(o.warehouseId)?.name}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <p className="line-clamp-2 text-sm">{formatPoProductSummary(o.lines)}</p>
                                                {o.lines?.length ? (
                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {formatNumber(o.lines.length)} mặt hàng
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                                            <td className="px-4 py-3 text-right text-slate-700">{formatNumber(o.units)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatVndShort(o.totalAmount)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge className={PO_STATUS[o.status].cls}>{PO_STATUS[o.status].label}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="mx-auto grid w-44 grid-cols-[28px_28px_1fr] items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPoView(o)}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                                                        title="Xem đơn"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <div className="flex h-7 w-7 items-center justify-center">
                                                        {o.status === "ordered" ? (
                                                            <WriteGuard permission="suppliers">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openPoEdit(o)}
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded text-blue-600 hover:bg-blue-50"
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>
                                                            </WriteGuard>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex h-7 items-center justify-start">
                                                        {o.status !== "received" ? (
                                                            <WriteGuard permission="stock_in">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 whitespace-nowrap px-2 text-xs"
                                                                    onClick={() => receivePo(o)}
                                                                >
                                                                    <PackageCheck size={14} className="mr-1" /> Nhận hàng
                                                                </Button>
                                                            </WriteGuard>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination
                                page={orderPage.page}
                                totalPages={orderPage.totalPages}
                                total={orderPage.total}
                                start={orderPage.start}
                                end={orderPage.end}
                                onPageChange={orderPage.setPage}
                                unit="đơn"
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <SupplierDialog
                open={supOpen}
                onOpenChange={setSupOpen}
                draft={supDraft}
                setDraft={setSupDraft}
                onSave={saveSupplier}
            />

            <PurchaseOrderDialog
                open={poOpen}
                onOpenChange={setPoOpen}
                mode={poMode}
                draft={poDraft}
                setDraft={setPoDraft}
                onSave={savePo}
                suppliers={suppliers.items}
                orderMeta={poMeta}
            />
        </RoleGuard>
    );
}
