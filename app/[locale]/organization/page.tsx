"use client";

import RoleGuard from "@/components/demo/RoleGuard";
import StatCard from "@/components/demo/StatCard";
import CompanyDialog from "@/components/demo/organization/CompanyDialog";
import {
  RegionDialog,
  ProvinceDialog,
} from "@/components/demo/organization/RegionProvinceDialogs";
import StoreDialog from "@/components/demo/organization/StoreDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  COMPANY,
  PROVINCES,
  REGIONS,
  STORES,
  type Company,
  type Province,
  type Region,
  type Store,
  type StoreStatus,
} from "@/lib/demo/eliseData";
import { formatNumber, formatVndShort } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination } from "@/lib/demo/usePagination";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import {
  Building2,
  Map,
  MapPin,
  Pencil,
  Plus,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const STORE_STATUS: Record<StoreStatus, { label: string; cls: string }> = {
  active: {
    label: "Đang hoạt động",
    cls: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  paused: {
    label: "Tạm đóng",
    cls: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  closed: {
    label: "Ngừng kinh doanh",
    cls: "bg-rose-100 text-rose-700 hover:bg-rose-100",
  },
};

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

function emptyStore(provinceId: string, regionId: string): Store {
  return {
    id: "",
    code: "",
    name: "",
    provinceId,
    regionId,
    type: "owned",
    address: "",
    managerName: "",
    phone: "",
    openedAt: new Date().toISOString().slice(0, 10),
    areaM2: 0,
    monthlyTarget: 500_000_000,
    royaltyRate: 0,
    status: "active",
  };
}

export default function OrganizationPage() {
  const { toast } = useToast();

  const company = useCrudCollection<Company>("elise-demo-company", [COMPANY]);
  const regions = useCrudCollection<Region>("elise-demo-regions", REGIONS);
  const provinces = useCrudCollection<Province>(
    "elise-demo-provinces",
    PROVINCES,
  );
  const stores = useCrudCollection<Store>("elise-demo-stores", STORES);

  const co = company.items[0];
  const regionName = (id: string) =>
    regions.items.find((r) => r.id === id)?.name ?? "-";
  const provinceName = (id: string) =>
    provinces.items.find((p) => p.id === id)?.name ?? "-";

  /* -------- Company -------- */
  const [coDraft, setCoDraft] = useState<Company | null>(null);
  const saveCompany = () => {
    if (!coDraft) return;
    company.update(coDraft.id, coDraft);
    toast({ title: "Đã lưu thông tin công ty", variant: "success" });
    setCoDraft(null);
  };

  /* -------- Region -------- */
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionDraft, setRegionDraft] = useState<Region>({
    id: "",
    name: "",
    code: "",
  });
  const saveRegion = () => {
    if (!regionDraft.name.trim())
      return toast({ title: "Thiếu tên khu vực", variant: "destructive" });
    if (regionDraft.id) regions.update(regionDraft.id, regionDraft);
    else regions.add({ ...regionDraft, id: newId("region") });
    setRegionOpen(false);
  };

  /* -------- Province -------- */
  const [provOpen, setProvOpen] = useState(false);
  const [provDraft, setProvDraft] = useState<Province>({
    id: "",
    name: "",
    regionId: REGIONS[0].id,
  });
  const saveProvince = () => {
    if (!provDraft.name.trim())
      return toast({ title: "Thiếu tên tỉnh/thành", variant: "destructive" });
    if (provDraft.id) provinces.update(provDraft.id, provDraft);
    else provinces.add({ ...provDraft, id: newId("prov") });
    setProvOpen(false);
  };

  /* -------- Store -------- */
  const [storeOpen, setStoreOpen] = useState(false);
  const [storeDraft, setStoreDraft] = useState<Store>(
    emptyStore(PROVINCES[0].id, REGIONS[0].id),
  );
  const openStore = (s?: Store) => {
    setStoreDraft(
      s
        ? { ...s, status: s.status ?? "active" }
        : emptyStore(provinces.items[0]?.id ?? "", regions.items[0]?.id ?? ""),
    );
    setStoreOpen(true);
  };
  const saveStore = () => {
    if (!storeDraft.name.trim() || !storeDraft.code.trim())
      return toast({
        title: "Thiếu tên hoặc mã cửa hàng",
        variant: "destructive",
      });
    const province = provinces.items.find(
      (p) => p.id === storeDraft.provinceId,
    );
    const payload: Store = {
      ...storeDraft,
      regionId: province?.regionId ?? storeDraft.regionId,
    };
    if (storeDraft.id) {
      stores.update(storeDraft.id, payload);
      toast({
        title: "Đã cập nhật cửa hàng",
        description: payload.name,
        variant: "success",
      });
    } else {
      stores.add({ ...payload, id: newId("st") });
      toast({
        title: "Đã thêm cửa hàng",
        description: payload.name,
        variant: "success",
      });
    }
    setStoreOpen(false);
  };

  const provincePage = usePagination(provinces.items, 10);
  const storePage = usePagination(stores.items, 10);

  return (
    <RoleGuard permission="organization">
      <div className="w-full space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tổ chức</h1>
          <p className="text-sm text-slate-500">
            Công ty, khu vực, tỉnh/thành và hệ thống cửa hàng
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Khu vực"
            value={formatNumber(regions.items.length)}
            icon={Map}
            accent="primary"
          />
          <StatCard
            label="Tỉnh/thành"
            value={formatNumber(provinces.items.length)}
            icon={MapPin}
            accent="blue"
          />
          <StatCard
            label="Cửa hàng"
            value={formatNumber(stores.items.length)}
            icon={StoreIcon}
            accent="amber"
          />
          <StatCard
            label="Đang hoạt động"
            value={formatNumber(
              stores.items.filter((s) => (s.status ?? "active") === "active")
                .length,
            )}
            icon={Building2}
            accent="green"
          />
        </div>

        <Tabs defaultValue="company">
          <TabsList>
            <TabsTrigger value="company">Công ty</TabsTrigger>
            <TabsTrigger value="regions">Khu vực</TabsTrigger>
            <TabsTrigger value="provinces">Tỉnh/thành</TabsTrigger>
            <TabsTrigger value="stores">Cửa hàng</TabsTrigger>
          </TabsList>

          {/* Company */}
          <TabsContent value="company">
            {co && (
              <div className="max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    {co.name}
                  </h2>
                  <Button variant="outline" onClick={() => setCoDraft(co)}>
                    <Pencil size={14} className="mr-1.5" /> Sửa
                  </Button>
                </div>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-400">Mã số thuế</dt>
                    <dd className="font-medium text-slate-700">{co.taxCode}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Năm thành lập</dt>
                    <dd className="font-medium text-slate-700">
                      {co.foundedYear}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-400">Địa chỉ</dt>
                    <dd className="font-medium text-slate-700">{co.address}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Điện thoại</dt>
                    <dd className="font-medium text-slate-700">{co.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Email</dt>
                    <dd className="font-medium text-slate-700">{co.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Website</dt>
                    <dd className="font-medium text-slate-700">{co.website}</dd>
                  </div>
                </dl>
              </div>
            )}
          </TabsContent>

          {/* Regions */}
          <TabsContent value="regions" className="space-y-3">
            <div className="flex justify-end">
              <Button
                className="bg-custom text-white hover:bg-custom-hover"
                onClick={() => {
                  setRegionDraft({ id: "", name: "", code: "" });
                  setRegionOpen(true);
                }}
              >
                <Plus size={16} className="mr-1.5" /> Thêm khu vực
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {regions.items.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400">
                      Mã: {r.code} ·{" "}
                      {
                        provinces.items.filter((p) => p.regionId === r.id)
                          .length
                      }{" "}
                      tỉnh ·{" "}
                      {stores.items.filter((s) => s.regionId === r.id).length}{" "}
                      cửa hàng
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRegionDraft(r);
                        setRegionOpen(true);
                      }}
                      className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => regions.remove(r.id)}
                      className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Provinces */}
          <TabsContent value="provinces" className="space-y-3">
            <div className="flex justify-end">
              <Button
                className="bg-custom text-white hover:bg-custom-hover"
                onClick={() => {
                  setProvDraft({
                    id: "",
                    name: "",
                    regionId: regions.items[0]?.id ?? "",
                  });
                  setProvOpen(true);
                }}
              >
                <Plus size={16} className="mr-1.5" /> Thêm tỉnh/thành
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tỉnh/thành</th>
                    <th className="px-4 py-3 font-medium">Khu vực</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Cửa hàng
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {provincePage.pageItems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {regionName(p.regionId)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {
                          stores.items.filter((s) => s.provinceId === p.id)
                            .length
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setProvDraft(p);
                              setProvOpen(true);
                            }}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => provinces.remove(p.id)}
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
                page={provincePage.page}
                totalPages={provincePage.totalPages}
                total={provincePage.total}
                start={provincePage.start}
                end={provincePage.end}
                onPageChange={provincePage.setPage}
                unit="tỉnh/thành"
              />
            </div>
          </TabsContent>

          {/* Stores */}
          <TabsContent value="stores" className="space-y-3">
            <div className="flex justify-end">
              <Button
                className="bg-custom text-white hover:bg-custom-hover"
                onClick={() => openStore()}
              >
                <Plus size={16} className="mr-1.5" /> Thêm cửa hàng
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cửa hàng</th>
                    <th className="px-4 py-3 font-medium">Tỉnh/thành</th>
                    <th className="px-4 py-3 font-medium">Loại hình</th>
                    <th className="px-4 py-3 font-medium">Quản lý</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Mục tiêu/tháng
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {storePage.pageItems.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.code}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {provinceName(s.provinceId)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            s.type === "franchise"
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          }
                        >
                          {s.type === "franchise" ? "Nhượng quyền" : "Sở hữu"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {s.managerName}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatVndShort(s.monthlyTarget)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={STORE_STATUS[s.status ?? "active"].cls}
                        >
                          {STORE_STATUS[s.status ?? "active"].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openStore(s)}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => stores.remove(s.id)}
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
                page={storePage.page}
                totalPages={storePage.totalPages}
                total={storePage.total}
                start={storePage.start}
                end={storePage.end}
                onPageChange={storePage.setPage}
                unit="cửa hàng"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CompanyDialog
        draft={coDraft}
        setDraft={setCoDraft}
        onSave={saveCompany}
      />

      <RegionDialog
        open={regionOpen}
        onOpenChange={setRegionOpen}
        draft={regionDraft}
        setDraft={setRegionDraft}
        onSave={saveRegion}
      />

      <ProvinceDialog
        open={provOpen}
        onOpenChange={setProvOpen}
        draft={provDraft}
        setDraft={setProvDraft}
        onSave={saveProvince}
        regions={regions.items}
      />

      <StoreDialog
        open={storeOpen}
        onOpenChange={setStoreOpen}
        draft={storeDraft}
        setDraft={setStoreDraft}
        onSave={saveStore}
        provinces={provinces.items}
      />
    </RoleGuard>
  );
}
