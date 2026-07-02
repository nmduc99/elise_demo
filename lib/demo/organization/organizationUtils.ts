import { PROVINCES, REGIONS, type Store, type StoreStatus } from "@/lib/demo/eliseData";

export const STORE_STATUS: Record<StoreStatus, { label: string; cls: string }> = {
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

export function newId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}`;
}

export function emptyStore(provinceId: string, regionId: string): Store {
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

export const DEFAULT_PROVINCE_ID = PROVINCES[0].id;
export const DEFAULT_REGION_ID = REGIONS[0].id;
