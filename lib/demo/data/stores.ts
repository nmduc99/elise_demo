/**
 * Store chain & warehouse master data for the Elise demo.
 */

export type StoreType = "owned" | "franchise";

export type StoreStatus = "active" | "paused" | "closed";

export interface Store {
    id: string;
    code: string;
    name: string;
    provinceId: string;
    regionId: string;
    type: StoreType;
    address: string;
    managerName: string;
    phone: string;
    openedAt: string;
    areaM2: number;
    monthlyTarget: number;
    /** Royalty percentage charged to franchise stores (0 for owned). */
    royaltyRate: number;
    /** Operating status. Undefined is treated as "active". */
    status?: StoreStatus;
}

export interface Warehouse {
    id: string;
    name: string;
    type: "regional" | "store";
    regionId: string;
    storeId?: string;
}

export const STORES: Store[] = [
    {
        id: "st-hn-01",
        code: "EL-HN01",
        name: "Elise Vincom Bà Triệu",
        provinceId: "hanoi",
        regionId: "north",
        type: "owned",
        address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
        managerName: "Phạm Thị Mai",
        phone: "024 3974 1010",
        openedAt: "2019-03-12",
        areaM2: 180,
        monthlyTarget: 1_500_000_000,
        royaltyRate: 0,
    },
    {
        id: "st-hn-02",
        code: "EL-HN02",
        name: "Elise Aeon Long Biên",
        provinceId: "hanoi",
        regionId: "north",
        type: "owned",
        address: "27 Cổ Linh, Long Biên, Hà Nội",
        managerName: "Đỗ Quang Huy",
        phone: "024 3201 2345",
        openedAt: "2020-09-01",
        areaM2: 150,
        monthlyTarget: 1_100_000_000,
        royaltyRate: 0,
    },
    {
        id: "st-hp-01",
        code: "EL-HP01",
        name: "Elise Vincom Imperia Hải Phòng",
        provinceId: "haiphong",
        regionId: "north",
        type: "franchise",
        address: "Vĩnh Niệm, Lê Chân, Hải Phòng",
        managerName: "Nguyễn Văn Bình",
        phone: "0225 3686 868",
        openedAt: "2021-06-18",
        areaM2: 120,
        monthlyTarget: 800_000_000,
        royaltyRate: 6,
    },
    {
        id: "st-qn-01",
        code: "EL-QN01",
        name: "Elise Hạ Long",
        provinceId: "quangninh",
        regionId: "north",
        type: "franchise",
        address: "Bãi Cháy, Hạ Long, Quảng Ninh",
        managerName: "Vũ Thị Hồng",
        phone: "0203 3812 345",
        openedAt: "2022-04-22",
        areaM2: 95,
        monthlyTarget: 600_000_000,
        royaltyRate: 6,
    },
    {
        id: "st-dn-01",
        code: "EL-DN01",
        name: "Elise Vincom Đà Nẵng",
        provinceId: "danang",
        regionId: "central",
        type: "owned",
        address: "910A Ngô Quyền, Sơn Trà, Đà Nẵng",
        managerName: "Trần Anh Khoa",
        phone: "0236 3655 999",
        openedAt: "2020-01-15",
        areaM2: 160,
        monthlyTarget: 1_000_000_000,
        royaltyRate: 0,
    },
    {
        id: "st-hue-01",
        code: "EL-HUE01",
        name: "Elise Huế",
        provinceId: "hue",
        regionId: "central",
        type: "franchise",
        address: "24 Hùng Vương, TP. Huế",
        managerName: "Lê Thị Diệu",
        phone: "0234 3888 111",
        openedAt: "2022-08-09",
        areaM2: 85,
        monthlyTarget: 480_000_000,
        royaltyRate: 7,
    },
    {
        id: "st-kh-01",
        code: "EL-KH01",
        name: "Elise Nha Trang",
        provinceId: "khanhhoa",
        regionId: "central",
        type: "franchise",
        address: "26 Trần Phú, Nha Trang, Khánh Hòa",
        managerName: "Hồ Minh Quân",
        phone: "0258 3527 222",
        openedAt: "2021-11-02",
        areaM2: 110,
        monthlyTarget: 700_000_000,
        royaltyRate: 6,
    },
    {
        id: "st-hcm-01",
        code: "EL-HCM01",
        name: "Elise Nguyễn Trãi",
        provinceId: "hcm",
        regionId: "south",
        type: "owned",
        address: "26 Nguyễn Trãi, Quận 1, TP. HCM",
        managerName: "Bùi Thanh Tâm",
        phone: "028 3925 6789",
        openedAt: "2018-05-20",
        areaM2: 200,
        monthlyTarget: 1_800_000_000,
        royaltyRate: 0,
    },
    {
        id: "st-hcm-02",
        code: "EL-HCM02",
        name: "Elise Vincom Đồng Khởi",
        provinceId: "hcm",
        regionId: "south",
        type: "owned",
        address: "72 Lê Thánh Tôn, Quận 1, TP. HCM",
        managerName: "Đặng Thị Ngọc",
        phone: "028 3822 1188",
        openedAt: "2019-12-01",
        areaM2: 175,
        monthlyTarget: 1_600_000_000,
        royaltyRate: 0,
    },
    {
        id: "st-hcm-03",
        code: "EL-HCM03",
        name: "Elise Aeon Tân Phú",
        provinceId: "hcm",
        regionId: "south",
        type: "owned",
        address: "30 Bờ Bao Tân Thắng, Tân Phú, TP. HCM",
        managerName: "Phan Văn Lộc",
        phone: "028 6264 8888",
        openedAt: "2021-03-30",
        areaM2: 145,
        monthlyTarget: 1_050_000_000,
        royaltyRate: 0,
    },
    {
        id: "st-ct-01",
        code: "EL-CT01",
        name: "Elise Cần Thơ",
        provinceId: "cantho",
        regionId: "south",
        type: "franchise",
        address: "209 30 Tháng 4, Ninh Kiều, Cần Thơ",
        managerName: "Trương Mỹ Linh",
        phone: "0292 3733 456",
        openedAt: "2022-02-14",
        areaM2: 100,
        monthlyTarget: 620_000_000,
        royaltyRate: 7,
    },
    {
        id: "st-bd-01",
        code: "EL-BD01",
        name: "Elise Aeon Bình Dương",
        provinceId: "binhduong",
        regionId: "south",
        type: "franchise",
        address: "1 Đại lộ Bình Dương, Thuận An, Bình Dương",
        managerName: "Ngô Gia Bảo",
        phone: "0274 3636 777",
        openedAt: "2021-09-10",
        areaM2: 130,
        monthlyTarget: 760_000_000,
        royaltyRate: 6,
    },
];

export const REGIONAL_WAREHOUSES: Warehouse[] = [
    { id: "wh-north", name: "Kho Tổng Miền Bắc (Hà Nội)", type: "regional", regionId: "north" },
    { id: "wh-central", name: "Kho Tổng Miền Trung (Đà Nẵng)", type: "regional", regionId: "central" },
    { id: "wh-south", name: "Kho Tổng Miền Nam (TP. HCM)", type: "regional", regionId: "south" },
];

export const STORE_WAREHOUSES: Warehouse[] = STORES.map((store) => ({
    id: `wh-${store.id}`,
    name: `Kho ${store.name}`,
    type: "store" as const,
    regionId: store.regionId,
    storeId: store.id,
}));

export const WAREHOUSES: Warehouse[] = [...REGIONAL_WAREHOUSES, ...STORE_WAREHOUSES];

export function getStore(id: string): Store | undefined {
    return STORES.find((s) => s.id === id);
}

export function getWarehouse(id: string): Warehouse | undefined {
    return WAREHOUSES.find((w) => w.id === id);
}

export function regionalWarehouseForRegion(regionId: string): Warehouse | undefined {
    return REGIONAL_WAREHOUSES.find((w) => w.regionId === regionId);
}

export function storeWarehouseForStore(storeId: string): Warehouse | undefined {
    return STORE_WAREHOUSES.find((w) => w.storeId === storeId);
}
