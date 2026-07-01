"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import RoleGuard from "@/components/demo/RoleGuard";
import StatCard from "@/components/demo/StatCard";
import { ScopeFilter, useDemoScope } from "@/components/demo/ScopeFilter";
import WriteGuard from "@/components/demo/WriteGuard";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
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
import { useToast } from "@/hooks/use-toast";
import {
    LEDGER_CATEGORIES,
    LEDGER_ENTRIES,
    STORES,
    getLedgerCategory,
    getStore,
    type LedgerEntry,
} from "@/lib/demo/eliseData";
import { formatDate, formatVnd, formatVndShort } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination } from "@/lib/demo/usePagination";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import { inputClass, labelClass } from "@/lib/demo/formClasses";
import { ArrowDownLeft, ArrowUpRight, Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

function newId(): string {
    return `ledger-${Date.now().toString(36)}`;
}

export default function LedgerPage() {
    const scope = useDemoScope();
    const ledgerAccess = useDemoAccess("ledger");
    const { toast } = useToast();

    const entries = useCrudCollection<LedgerEntry>("elise-demo-ledger", LEDGER_ENTRIES);

    const scopedEntries = useMemo(() => {
        return entries.items.filter((e) => {
            if (scope.storeId && e.storeId !== scope.storeId) return false;
            if (scope.regionId) {
                const store = getStore(e.storeId);
                if (store?.regionId !== scope.regionId) return false;
            }
            return true;
        });
    }, [entries.items, scope.storeId, scope.regionId]);

    const stats = useMemo(() => {
        const income = scopedEntries.filter((e) => e.type === "in" && e.status === "paid").reduce((s, e) => s + e.amount, 0);
        const expense = scopedEntries.filter((e) => e.type === "out" && e.status === "paid").reduce((s, e) => s + e.amount, 0);
        return { income, expense, balance: income - expense };
    }, [scopedEntries]);

    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState({
        type: "in" as "in" | "out",
        storeId: STORES[0].id,
        categoryId: "income_sales",
        payerOrPayee: "",
        amount: 0,
        method: "cash" as LedgerEntry["method"],
        notes: "",
    });

    const saveEntry = () => {
        if (!draft.payerOrPayee.trim() || draft.amount <= 0) {
            toast({ title: "Vui lòng nhập đầy đủ thông tin", variant: "destructive" });
            return;
        }
        const code = draft.type === "in" ? `PT${Date.now().toString().slice(-4)}` : `PC${Date.now().toString().slice(-4)}`;
        entries.add({
            id: newId(),
            code,
            time: new Date().toISOString(),
            storeId: draft.storeId,
            type: draft.type,
            categoryId: draft.categoryId,
            payerOrPayee: draft.payerOrPayee,
            amount: draft.amount,
            method: draft.method,
            notes: draft.notes,
            status: "paid",
        });
        toast({ title: "Đã ghi sổ quỹ", variant: "success" });
        setOpen(false);
    };

    const pager = usePagination(scopedEntries, 12);
    const categoriesForType = LEDGER_CATEGORIES.filter((c) => c.type === draft.type);

    return (
        <RoleGuard permission="ledger">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Sổ quỹ</h1>
                        <p className="text-sm text-slate-500">Quản lý thu chi tiền mặt, chuyển khoản theo cửa hàng</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <ScopeFilter scope={scope} />
                        <WriteGuard permission="ledger">
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-custom text-white hover:bg-custom-hover">
                                        <Plus size={16} className="mr-1.5" /> Ghi thu/chi
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader><DialogTitle>Ghi sổ quỹ</DialogTitle></DialogHeader>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelClass}>Loại</label>
                                                <Select value={draft.type} onValueChange={(v) => setDraft((d) => ({ ...d, type: v as "in" | "out", categoryId: v === "in" ? "income_sales" : "expense_other" }))}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="in">Phiếu thu</SelectItem>
                                                        <SelectItem value="out">Phiếu chi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Cửa hàng</label>
                                                <Select value={draft.storeId} onValueChange={(v) => setDraft((d) => ({ ...d, storeId: v }))}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {STORES.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Hạng mục</label>
                                            <Select value={draft.categoryId} onValueChange={(v) => setDraft((d) => ({ ...d, categoryId: v }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {categoriesForType.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>{draft.type === "in" ? "Người nộp" : "Người nhận"}</label>
                                            <input className={inputClass} value={draft.payerOrPayee} onChange={(e) => setDraft((d) => ({ ...d, payerOrPayee: e.target.value }))} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelClass}>Số tiền (đ)</label>
                                                <input type="number" min={0} className={inputClass} value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: Number(e.target.value) }))} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Hình thức</label>
                                                <Select value={draft.method} onValueChange={(v) => setDraft((d) => ({ ...d, method: v as LedgerEntry["method"] }))}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cash">Tiền mặt</SelectItem>
                                                        <SelectItem value="card">Thẻ</SelectItem>
                                                        <SelectItem value="transfer">Chuyển khoản</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Ghi chú</label>
                                            <input className={inputClass} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                                        <Button className="bg-custom text-white hover:bg-custom-hover" onClick={saveEntry}>Lưu</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </WriteGuard>
                    </div>
                </div>

                <AccessBanner access={ledgerAccess} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard label="Tổng thu" value={formatVndShort(stats.income)} sub={formatVnd(stats.income)} icon={ArrowDownLeft} accent="green" />
                    <StatCard label="Tổng chi" value={formatVndShort(stats.expense)} sub={formatVnd(stats.expense)} icon={ArrowUpRight} accent="rose" />
                    <StatCard label="Tồn quỹ" value={formatVndShort(stats.balance)} icon={Wallet} accent="primary" />
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Mã phiếu</th>
                                <th className="px-4 py-3 font-medium">Ngày</th>
                                <th className="px-4 py-3 font-medium">Cửa hàng</th>
                                <th className="px-4 py-3 font-medium">Loại</th>
                                <th className="px-4 py-3 font-medium">Hạng mục</th>
                                <th className="px-4 py-3 font-medium">Đối tượng</th>
                                <th className="px-4 py-3 text-right font-medium">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pager.pageItems.map((e) => (
                                <tr key={e.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{e.code}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatDate(e.time)}</td>
                                    <td className="px-4 py-3 text-slate-600">{getStore(e.storeId)?.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={e.type === "in" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-rose-100 text-rose-700 hover:bg-rose-100"}>
                                            {e.type === "in" ? "Thu" : "Chi"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{getLedgerCategory(e.categoryId)?.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{e.payerOrPayee}</td>
                                    <td className={`px-4 py-3 text-right font-semibold ${e.type === "in" ? "text-green-700" : "text-rose-700"}`}>
                                        {e.type === "in" ? "+" : "-"}{formatVndShort(e.amount)}
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
                        unit="phiếu"
                    />
                </div>
            </div>
        </RoleGuard>
    );
}
