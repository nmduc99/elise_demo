"use client";

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
} from "@/lib/demo/eliseData";
import {
    DEFAULT_PROVINCE_ID,
    DEFAULT_REGION_ID,
    emptyStore,
    newId,
} from "@/lib/demo/organization/organizationUtils";
import { usePagination } from "@/lib/demo/usePagination";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import { useState } from "react";

export function useOrganizationPage() {
    const { toast } = useToast();

    const company = useCrudCollection<Company>("elise-demo-company", [COMPANY]);
    const regions = useCrudCollection<Region>("elise-demo-regions", REGIONS);
    const provinces = useCrudCollection<Province>("elise-demo-provinces", PROVINCES);
    const stores = useCrudCollection<Store>("elise-demo-stores", STORES);

    const co = company.items[0];
    const regionName = (id: string) =>
        regions.items.find((r) => r.id === id)?.name ?? "-";
    const provinceName = (id: string) =>
        provinces.items.find((p) => p.id === id)?.name ?? "-";

    const [coDraft, setCoDraft] = useState<Company | null>(null);
    const saveCompany = () => {
        if (!coDraft) return;
        company.update(coDraft.id, coDraft);
        toast({ title: "Đã lưu thông tin công ty", variant: "success" });
        setCoDraft(null);
    };

    const [regionOpen, setRegionOpen] = useState(false);
    const [regionDraft, setRegionDraft] = useState<Region>({
        id: "",
        name: "",
        code: "",
    });
    const saveRegion = () => {
        if (!regionDraft.name.trim()) {
            toast({ title: "Thiếu tên khu vực", variant: "destructive" });
            return;
        }
        if (regionDraft.id) regions.update(regionDraft.id, regionDraft);
        else regions.add({ ...regionDraft, id: newId("region") });
        setRegionOpen(false);
    };

    const [provOpen, setProvOpen] = useState(false);
    const [provDraft, setProvDraft] = useState<Province>({
        id: "",
        name: "",
        regionId: DEFAULT_REGION_ID,
    });
    const saveProvince = () => {
        if (!provDraft.name.trim()) {
            toast({ title: "Thiếu tên tỉnh/thành", variant: "destructive" });
            return;
        }
        if (provDraft.id) provinces.update(provDraft.id, provDraft);
        else provinces.add({ ...provDraft, id: newId("prov") });
        setProvOpen(false);
    };

    const [storeOpen, setStoreOpen] = useState(false);
    const [storeDraft, setStoreDraft] = useState<Store>(
        emptyStore(DEFAULT_PROVINCE_ID, DEFAULT_REGION_ID),
    );
    const openStore = (store?: Store) => {
        setStoreDraft(
            store
                ? { ...store, status: store.status ?? "active" }
                : emptyStore(
                      provinces.items[0]?.id ?? "",
                      regions.items[0]?.id ?? "",
                  ),
        );
        setStoreOpen(true);
    };
    const saveStore = () => {
        if (!storeDraft.name.trim() || !storeDraft.code.trim()) {
            toast({
                title: "Thiếu tên hoặc mã cửa hàng",
                variant: "destructive",
            });
            return;
        }
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

    const activeStoreCount = stores.items.filter(
        (s) => (s.status ?? "active") === "active",
    ).length;

    return {
        co,
        coDraft,
        setCoDraft,
        saveCompany,
        regions,
        regionOpen,
        setRegionOpen,
        regionDraft,
        setRegionDraft,
        saveRegion,
        provinces,
        provOpen,
        setProvOpen,
        provDraft,
        setProvDraft,
        saveProvince,
        stores,
        storeOpen,
        setStoreOpen,
        storeDraft,
        setStoreDraft,
        openStore,
        saveStore,
        provincePage,
        storePage,
        regionName,
        provinceName,
        activeStoreCount,
    };
}

export type OrganizationPageState = ReturnType<typeof useOrganizationPage>;
