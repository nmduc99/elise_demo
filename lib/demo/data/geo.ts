/**
 * Geography & company master data for the Elise demo.
 */

export interface Region {
    id: string;
    name: string;
    code: string;
}

export interface Province {
    id: string;
    name: string;
    regionId: string;
}

export interface Company {
    id: string;
    name: string;
    taxCode: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    foundedYear: number;
}

export const REGIONS: Region[] = [
    { id: "north", name: "Miền Bắc", code: "MB" },
    { id: "central", name: "Miền Trung", code: "MT" },
    { id: "south", name: "Miền Nam", code: "MN" },
];

export const PROVINCES: Province[] = [
    { id: "hanoi", name: "Hà Nội", regionId: "north" },
    { id: "haiphong", name: "Hải Phòng", regionId: "north" },
    { id: "quangninh", name: "Quảng Ninh", regionId: "north" },
    { id: "danang", name: "Đà Nẵng", regionId: "central" },
    { id: "hue", name: "Thừa Thiên Huế", regionId: "central" },
    { id: "khanhhoa", name: "Khánh Hòa", regionId: "central" },
    { id: "hcm", name: "TP. Hồ Chí Minh", regionId: "south" },
    { id: "cantho", name: "Cần Thơ", regionId: "south" },
    { id: "binhduong", name: "Bình Dương", regionId: "south" },
];

export const COMPANY: Company = {
    id: "co-elise",
    name: "Công ty CP Thời trang Elise Việt Nam",
    taxCode: "0101234567",
    address: "Tầng 12, Tòa nhà Elise, 18 Phạm Hùng, Nam Từ Liêm, Hà Nội",
    phone: "1900 6750",
    email: "info@elise.vn",
    website: "https://elise.vn",
    foundedYear: 2011,
};

export function getRegion(id: string): Region | undefined {
    return REGIONS.find((r) => r.id === id);
}

export function getProvince(id: string): Province | undefined {
    return PROVINCES.find((p) => p.id === id);
}
