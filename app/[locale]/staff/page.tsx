"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import RoleGuard from "@/components/demo/RoleGuard";
import StatCard from "@/components/demo/StatCard";
import { ScopeFilter, useDemoScope } from "@/components/demo/ScopeFilter";
import { DoughnutChart, ELISE_COLORS } from "@/components/demo/DemoCharts";
import EmployeeFormDialog from "@/components/demo/staff/EmployeeFormDialog";
import {
  DepartmentDialog,
  PositionDialog,
} from "@/components/demo/staff/OrgUnitDialogs";
import {
  STATUS_CLASS,
  STATUS_LABEL,
  type Department,
  type Position,
} from "@/components/demo/staff/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/routing";
import {
  DEPARTMENTS,
  EMPLOYEES,
  POSITION_LIST,
  STORES,
  type Employee,
  getRegion,
  getStore,
} from "@/lib/demo/eliseData";
import { formatNumber, formatVnd, formatVndShort } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination } from "@/lib/demo/usePagination";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import {
  BadgeCheck,
  Briefcase,
  Building,
  Pencil,
  Plus,
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

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

function emptyEmployee(storeId: string): Employee {
  return {
    id: "",
    code: "",
    name: "",
    storeId,
    regionId: getStore(storeId)?.regionId ?? "",
    department: DEPARTMENTS[0],
    position: POSITION_LIST[0]?.position ?? "",
    salary: 8_500_000,
    joinedAt: new Date().toISOString().slice(0, 10),
    status: "active",
  };
}

export default function StaffPage() {
  const scope = useDemoScope();
  const hrAccess = useDemoAccess("hr");
  const router = useRouter();
  const { toast } = useToast();

  const employees = useCrudCollection<Employee>(
    "elise-demo-employees",
    EMPLOYEES,
  );
  const departments = useCrudCollection<Department>(
    "elise-demo-departments",
    DEPT_SEED,
  );
  const positions = useCrudCollection<Position>(
    "elise-demo-positions",
    POS_SEED,
  );

  const [department, setDepartment] = useState("all");

  const filtered = useMemo(() => {
    return employees.items.filter((e) => {
      if (scope.storeId && e.storeId !== scope.storeId) return false;
      if (scope.regionId && e.regionId !== scope.regionId) return false;
      if (department !== "all" && e.department !== department) return false;
      return true;
    });
  }, [employees.items, scope.storeId, scope.regionId, department]);

  const active = filtered.filter((e) => e.status === "active").length;
  const probation = filtered.filter((e) => e.status === "probation").length;
  const payroll = filtered.reduce((s, e) => s + e.salary, 0);

  const byDept = useMemo(() => {
    const labels = departments.items.map((d) => d.name);
    const values = labels.map(
      (d) => filtered.filter((e) => e.department === d).length,
    );
    return { labels, values };
  }, [departments.items, filtered]);

  const storeOptions = scope.scopedStoreId
    ? STORES.filter((s) => s.id === scope.scopedStoreId)
    : STORES;

  /* -------- Employee dialog -------- */
  const [empOpen, setEmpOpen] = useState(false);
  const [empDraft, setEmpDraft] = useState<Employee>(
    emptyEmployee(scope.scopedStoreId ?? STORES[0].id),
  );
  const openEmp = (e?: Employee) => {
    setEmpDraft(
      e ? { ...e } : emptyEmployee(scope.scopedStoreId ?? STORES[0].id),
    );
    setEmpOpen(true);
  };
  const saveEmp = () => {
    if (!empDraft.name.trim())
      return toast({ title: "Thiếu họ tên", variant: "destructive" });
    const payload: Employee = {
      ...empDraft,
      regionId: getStore(empDraft.storeId)?.regionId ?? empDraft.regionId,
    };
    if (empDraft.id) {
      employees.update(empDraft.id, payload);
      toast({
        title: "Đã cập nhật nhân viên",
        description: payload.name,
        variant: "success",
      });
    } else {
      employees.add({
        ...payload,
        id: newId("e"),
        code: payload.code || `NV${Date.now().toString().slice(-4)}`,
      });
      toast({
        title: "Đã thêm nhân viên",
        description: payload.name,
        variant: "success",
      });
    }
    setEmpOpen(false);
  };

  /* -------- Department / Position dialogs -------- */
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptDraft, setDeptDraft] = useState<Department>({ id: "", name: "" });
  const saveDept = () => {
    if (!deptDraft.name.trim())
      return toast({ title: "Thiếu tên phòng ban", variant: "destructive" });
    if (deptDraft.id) departments.update(deptDraft.id, deptDraft);
    else departments.add({ ...deptDraft, id: newId("dept") });
    setDeptOpen(false);
  };

  const [posOpen, setPosOpen] = useState(false);
  const [posDraft, setPosDraft] = useState<Position>({
    id: "",
    name: "",
    department: DEPARTMENTS[0],
  });
  const savePos = () => {
    if (!posDraft.name.trim())
      return toast({ title: "Thiếu tên vị trí", variant: "destructive" });
    if (posDraft.id) positions.update(posDraft.id, posDraft);
    else positions.add({ ...posDraft, id: newId("pos") });
    setPosOpen(false);
  };

  const employeePage = usePagination(filtered, 10);
  const positionPage = usePagination(positions.items, 10);

  return (
    <RoleGuard permission="hr">
      <div className="w-full space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý nhân sự
            </h1>
            <p className="text-sm text-slate-500">
              Nhân viên, phòng ban, vị trí, điều chuyển & hồ sơ
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ScopeFilter scope={scope} />
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="h-9 w-[180px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.items.map((d) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AccessBanner access={hrAccess} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng nhân sự"
            value={formatNumber(filtered.length)}
            icon={Users}
            accent="primary"
          />
          <StatCard
            label="Đang làm việc"
            value={formatNumber(active)}
            icon={BadgeCheck}
            accent="green"
          />
          <StatCard
            label="Thử việc"
            value={formatNumber(probation)}
            icon={Briefcase}
            accent="amber"
          />
          <StatCard
            label="Quỹ lương tháng"
            value={formatVndShort(payroll)}
            sub={formatVnd(payroll)}
            icon={Wallet}
            accent="blue"
          />
        </div>

        <Tabs defaultValue="employees">
          <TabsList>
            <TabsTrigger value="employees">Nhân viên</TabsTrigger>
            <TabsTrigger value="departments">Phòng ban</TabsTrigger>
            <TabsTrigger value="positions">Vị trí</TabsTrigger>
          </TabsList>

          {/* Employees */}
          <TabsContent value="employees" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-xl border bg-white p-4 shadow-sm sm:w-[320px]">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">
                  Cơ cấu theo phòng ban
                </h2>
                <DoughnutChart
                  data={{
                    labels: byDept.labels,
                    datasets: [
                      {
                        data: byDept.values,
                        backgroundColor: ELISE_COLORS.palette,
                      },
                    ],
                  }}
                  height={180}
                />
              </div>
              {hrAccess.canWrite && (
                <Button
                  className="bg-custom text-white hover:bg-custom-hover"
                  onClick={() => openEmp()}
                >
                  <Plus size={16} className="mr-1.5" /> Thêm nhân viên
                </Button>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mã NV</th>
                    <th className="px-4 py-3 font-medium">Họ tên</th>
                    <th className="px-4 py-3 font-medium">Cửa hàng</th>
                    <th className="px-4 py-3 font-medium">Phòng ban</th>
                    <th className="px-4 py-3 font-medium">Vị trí</th>
                    <th className="px-4 py-3 text-right font-medium">Lương</th>
                    <th className="px-4 py-3 text-center font-medium">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employeePage.pageItems.map((e) => (
                    <tr
                      key={e.id}
                      className="cursor-pointer hover:bg-orange-50/50"
                      onClick={() => router.push({ pathname: "/staff/[id]", params: { id: e.id } })}
                    >
                      <td className="px-4 py-3 text-slate-400">{e.code}</td>
                      <td className="px-4 py-3 font-medium text-custom">{e.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {getStore(e.storeId)?.name}
                        <span className="block text-xs text-slate-400">
                          {getRegion(e.regionId)?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {e.department}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{e.position}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {formatVnd(e.salary)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={STATUS_CLASS[e.status]}>
                          {STATUS_LABEL[e.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={employeePage.page}
                totalPages={employeePage.totalPages}
                total={employeePage.total}
                start={employeePage.start}
                end={employeePage.end}
                onPageChange={employeePage.setPage}
                unit="nhân viên"
              />
            </div>
          </TabsContent>

          {/* Departments */}
          <TabsContent value="departments" className="space-y-3">
            <div className="flex justify-end">
              <Button
                className="bg-custom text-white hover:bg-custom-hover"
                onClick={() => {
                  setDeptDraft({ id: "", name: "" });
                  setDeptOpen(true);
                }}
              >
                <Plus size={16} className="mr-1.5" /> Thêm phòng ban
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {departments.items.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Building size={16} />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-400">
                        {
                          employees.items.filter((e) => e.department === d.name)
                            .length
                        }{" "}
                        NV
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setDeptDraft(d);
                        setDeptOpen(true);
                      }}
                      className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => departments.remove(d.id)}
                      className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Positions */}
          <TabsContent value="positions" className="space-y-3">
            <div className="flex justify-end">
              <Button
                className="bg-custom text-white hover:bg-custom-hover"
                onClick={() => {
                  setPosDraft({
                    id: "",
                    name: "",
                    department: departments.items[0]?.name ?? DEPARTMENTS[0],
                  });
                  setPosOpen(true);
                }}
              >
                <Plus size={16} className="mr-1.5" /> Thêm vị trí
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Vị trí</th>
                    <th className="px-4 py-3 font-medium">Phòng ban</th>
                    <th className="px-4 py-3 text-right font-medium">Số NV</th>
                    <th className="px-4 py-3 text-center font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {positionPage.pageItems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.department}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {
                          employees.items.filter((e) => e.position === p.name)
                            .length
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setPosDraft(p);
                              setPosOpen(true);
                            }}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => positions.remove(p.id)}
                            className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={positionPage.page}
                totalPages={positionPage.totalPages}
                total={positionPage.total}
                start={positionPage.start}
                end={positionPage.end}
                onPageChange={positionPage.setPage}
                unit="vị trí"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <EmployeeFormDialog
        open={empOpen}
        onOpenChange={setEmpOpen}
        draft={empDraft}
        setDraft={setEmpDraft}
        onSave={saveEmp}
        departments={departments.items}
        positions={positions.items}
        storeOptions={storeOptions}
        lockStore={!!scope.scopedStoreId}
      />

      <DepartmentDialog
        open={deptOpen}
        onOpenChange={setDeptOpen}
        draft={deptDraft}
        setDraft={setDeptDraft}
        onSave={saveDept}
      />

      <PositionDialog
        open={posOpen}
        onOpenChange={setPosOpen}
        draft={posDraft}
        setDraft={setPosDraft}
        onSave={savePos}
        departments={departments.items}
      />
    </RoleGuard>
  );
}
