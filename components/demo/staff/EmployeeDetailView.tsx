"use client";

import WriteGuard from "@/components/demo/WriteGuard";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import StatCard from "@/components/demo/StatCard";
import EmployeeFormDialog from "@/components/demo/staff/EmployeeFormDialog";
import { EmployeeRoleBadges } from "@/components/demo/staff/EmployeeRolePicker";
import TransferDialog from "@/components/demo/staff/TransferDialog";
import { STATUS_CLASS, STATUS_LABEL, type Department, type Position } from "@/components/demo/staff/shared";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/routing";
import {
    DEPARTMENTS,
    EMPLOYEES,
    MONTHS,
    PERFORMANCE,
    POSITION_LIST,
    STORES,
    type Employee,
    getRegion,
    getStore,
    sumPerformance,
} from "@/lib/demo/eliseData";
import { formatDate, formatNumber, formatVnd, formatVndShort } from "@/lib/demo/format";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import {
    ArrowLeft,
    ArrowLeftRight,
    Briefcase,
    Building2,
    Calendar,
    MapPin,
    Pencil,
    Phone,
    Store as StoreIcon,
    Trash2,
    Users,
    Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEPT_SEED: Department[] = DEPARTMENTS.map((name, i) => ({
    id: `dept-${i}`,
    name,
}));
const POS_SEED: Position[] = POSITION_LIST.map((p, i) => ({
    id: `pos-${i}`,
    name: p.position,
    department: p.department,
}));

const currentMonth = MONTHS[MONTHS.length - 1];

function weight(key: string): number {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 1000) / 1000;
}

function tenureLabel(joinedAt: string): string {
    const join = new Date(joinedAt);
    const now = new Date();
    const months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    if (months < 12) return `${months} tháng`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years} năm ${rem} tháng` : `${years} năm`;
}

interface EmployeeDetailViewProps {
    employeeId: string;
}

export default function EmployeeDetailView({ employeeId }: EmployeeDetailViewProps) {
    const router = useRouter();
    const { toast } = useToast();
    const hrAccess = useDemoAccess("hr");
    const canAssignRoles = hrAccess.role === "director" && hrAccess.canWrite;

    const employees = useCrudCollection<Employee>("elise-demo-employees", EMPLOYEES);
    const departments = useCrudCollection<Department>("elise-demo-departments", DEPT_SEED);
    const positions = useCrudCollection<Position>("elise-demo-positions", POS_SEED);

    const employee = employees.items.find((e) => e.id === employeeId);
    const store = employee ? getStore(employee.storeId) : undefined;
    const region = employee ? getRegion(employee.regionId) : undefined;

    const colleagues = useMemo(() => {
        if (!employee) return [];
        return employees.items.filter((e) => e.storeId === employee.storeId && e.id !== employee.id);
    }, [employees.items, employee]);

    const salesStats = useMemo(() => {
        if (!employee || employee.department !== "Bán hàng") return null;
        const storeMonth = sumPerformance(
            PERFORMANCE.filter((p) => p.month === currentMonth && p.storeId === employee.storeId)
        );
        const salesStaff = employees.items.filter(
            (e) => e.storeId === employee.storeId && e.department === "Bán hàng"
        );
        const w = 0.6 + weight(employee.id) * 0.8;
        const totalW = salesStaff.reduce((s, p) => s + (0.6 + weight(p.id) * 0.8), 0) || 1;
        const revenue = (storeMonth.revenue * w) / totalW;
        const orders = Math.max(1, Math.round((storeMonth.orders * w) / totalW));
        return { revenue, orders };
    }, [employee, employees.items]);

    const [empOpen, setEmpOpen] = useState(false);
    const [empDraft, setEmpDraft] = useState<Employee | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferTo, setTransferTo] = useState(STORES[0].id);

    const openEdit = () => {
        if (!employee) return;
        setEmpDraft({ ...employee });
        setEmpOpen(true);
    };

    const saveEmp = () => {
        if (!empDraft) return;
        if (!empDraft.name.trim()) {
            toast({ title: "Thiếu họ tên", variant: "destructive" });
            return;
        }
        const payload: Employee = {
            ...empDraft,
            regionId: getStore(empDraft.storeId)?.regionId ?? empDraft.regionId,
        };
        employees.update(empDraft.id, payload);
        toast({ title: "Đã cập nhật nhân viên", description: payload.name, variant: "success" });
        setEmpOpen(false);
    };

    const confirmDelete = () => {
        if (!employee) return;
        employees.remove(employee.id);
        toast({ title: "Đã xóa nhân viên", description: employee.name, variant: "success" });
        router.push("/staff");
    };

    const doTransfer = () => {
        if (!employee) return;
        const toStore = getStore(transferTo);
        employees.update(employee.id, {
            storeId: transferTo,
            regionId: toStore?.regionId ?? employee.regionId,
        });
        toast({
            title: "Đã điều chuyển nhân viên",
            description: `${employee.name} → ${toStore?.name}`,
            variant: "success",
        });
        setTransferOpen(false);
    };

    if (!employee) {
        return (
            <div className="mx-auto max-w-lg p-8 text-center">
                <p className="text-lg font-semibold text-slate-800">Không tìm thấy nhân viên</p>
                <p className="mt-2 text-sm text-slate-500">Mã nhân viên không tồn tại hoặc đã bị xóa.</p>
                <Button asChild className="mt-6 bg-custom text-white hover:bg-custom-hover">
                    <Link href="/staff">
                        <ArrowLeft size={16} className="mr-1.5" /> Quay lại danh sách
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="outline" size="icon" className="shrink-0" asChild>
                        <Link href="/staff">
                            <ArrowLeft size={18} />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-custom">
                            {employee.name.charAt(0)}
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
                            <p className="text-sm text-slate-500">
                                {employee.code} · {employee.position}
                            </p>
                            <Badge className={`mt-2 ${STATUS_CLASS[employee.status]}`}>
                                {STATUS_LABEL[employee.status]}
                            </Badge>
                        </div>
                    </div>
                </div>

                <WriteGuard permission="hr">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => { setTransferTo(employee.storeId); setTransferOpen(true); }}>
                            <ArrowLeftRight size={16} className="mr-1.5" /> Điều chuyển
                        </Button>
                        <Button variant="outline" onClick={openEdit}>
                            <Pencil size={16} className="mr-1.5" /> Sửa
                        </Button>
                        <Button variant="outline" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setDeleteOpen(true)}>
                            <Trash2 size={16} className="mr-1.5" /> Xóa
                        </Button>
                    </div>
                </WriteGuard>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Lương cơ bản" value={formatVndShort(employee.salary)} sub={formatVnd(employee.salary)} icon={Wallet} accent="primary" />
                <StatCard label="Thâm niên" value={tenureLabel(employee.joinedAt)} sub={`Từ ${formatDate(employee.joinedAt)}`} icon={Calendar} accent="blue" />
                <StatCard label="Phòng ban" value={employee.department} icon={Briefcase} accent="green" />
                <StatCard label="Đồng nghiệp" value={formatNumber(colleagues.length)} sub="cùng cửa hàng" icon={Users} accent="amber" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Briefcase size={16} className="text-custom" /> Thông tin công việc
                    </h2>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                        <div>
                            <dt className="text-slate-400">Mã nhân viên</dt>
                            <dd className="font-medium text-slate-800">{employee.code}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-400">Họ tên</dt>
                            <dd className="font-medium text-slate-800">{employee.name}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-400">Phòng ban</dt>
                            <dd className="font-medium text-slate-800">{employee.department}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-400">Vị trí</dt>
                            <dd className="font-medium text-slate-800">{employee.position}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-400">Trạng thái</dt>
                            <dd><Badge className={STATUS_CLASS[employee.status]}>{STATUS_LABEL[employee.status]}</Badge></dd>
                        </div>
                        <div>
                            <dt className="text-slate-400">Ngày vào làm</dt>
                            <dd className="font-medium text-slate-800">{formatDate(employee.joinedAt)}</dd>
                        </div>
                        <div className="col-span-2">
                            <dt className="mb-1.5 text-slate-400">Vai trò hệ thống</dt>
                            <dd><EmployeeRoleBadges roles={employee.systemRoles} /></dd>
                        </div>
                        <div className="col-span-2">
                            <dt className="text-slate-400">Lương tháng</dt>
                            <dd className="text-lg font-bold text-custom">{formatVnd(employee.salary)}</dd>
                        </div>
                    </dl>
                </section>

                <section className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <StoreIcon size={16} className="text-custom" /> Cửa hàng & khu vực
                    </h2>
                    <dl className="space-y-4 text-sm">
                        <div>
                            <dt className="text-slate-400">Cửa hàng</dt>
                            <dd className="font-medium text-slate-800">{store?.name ?? "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-400">Khu vực</dt>
                            <dd className="font-medium text-slate-800">{region?.name ?? "—"}</dd>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                            <dd className="text-slate-600">{store?.address ?? "—"}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            <dd className="text-slate-600">{store?.phone ?? "—"}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-slate-400" />
                            <dd className="text-slate-600">
                                {store?.type === "franchise" ? "Nhượng quyền" : "Sở hữu"}
                                {store?.managerName ? ` · QL: ${store.managerName}` : ""}
                            </dd>
                        </div>
                    </dl>
                </section>
            </div>

            {salesStats && (
                <section className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">
                        Hiệu suất bán hàng (tháng {currentMonth.split("-")[1]}/{currentMonth.split("-")[0]})
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs text-slate-400">Doanh số ước tính</p>
                            <p className="mt-1 text-xl font-bold text-slate-800">{formatVndShort(salesStats.revenue)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs text-slate-400">Số đơn hàng</p>
                            <p className="mt-1 text-xl font-bold text-slate-800">{formatNumber(salesStats.orders)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs text-slate-400">TB/đơn</p>
                            <p className="mt-1 text-xl font-bold text-slate-800">
                                {formatVndShort(salesStats.revenue / salesStats.orders)}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="border-b px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-700">Đồng nghiệp tại {store?.name}</h2>
                </div>
                {colleagues.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Mã NV</th>
                                <th className="px-4 py-3 font-medium">Họ tên</th>
                                <th className="px-4 py-3 font-medium">Phòng ban</th>
                                <th className="px-4 py-3 font-medium">Vị trí</th>
                                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {colleagues.map((c) => (
                                <tr
                                    key={c.id}
                                    className="cursor-pointer hover:bg-slate-50"
                                    onClick={() => router.push({ pathname: "/staff/[id]", params: { id: c.id } })}
                                >
                                    <td className="px-4 py-3 text-slate-400">{c.code}</td>
                                    <td className="px-4 py-3 font-medium text-custom">{c.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.department}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.position}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={STATUS_CLASS[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="px-5 py-8 text-center text-sm text-slate-400">Không có đồng nghiệp khác tại cửa hàng này</p>
                )}
            </section>

            {empDraft && (
                <EmployeeFormDialog
                    open={empOpen}
                    onOpenChange={setEmpOpen}
                    draft={empDraft}
                    setDraft={setEmpDraft}
                    onSave={saveEmp}
                    departments={departments.items}
                    positions={positions.items}
                    storeOptions={STORES}
                    lockStore={hrAccess.isStoreScoped}
                    canAssignRoles={canAssignRoles}
                />
            )}

            <TransferDialog
                employee={transferOpen ? employee : null}
                transferTo={transferTo}
                setTransferTo={setTransferTo}
                onClose={() => setTransferOpen(false)}
                onConfirm={doTransfer}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa nhân viên?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa <strong>{employee.name}</strong> ({employee.code})? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={confirmDelete}>
                            Xóa nhân viên
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
