/**
 * Product catalog, supplier & customer master data for the Elise demo.
 */

import { hashSeed } from "./rng";

export interface Category {
    id: string;
    name: string;
}

export interface Brand {
    id: string;
    name: string;
    /** Short note shown in the catalog. */
    note: string;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    categoryId: string;
    brandId: string;
    costPrice: number;
    salePrice: number;
    sizes: string[];
    colors: string[];
}

export interface Supplier {
    id: string;
    name: string;
    category: string;
    phone: string;
    regionId: string;
}

export interface SupplierContact {
    id: string;
    supplierId: string;
    name: string;
    title: string;
    phone: string;
    email: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    tier: "Thường" | "Thành viên" | "VIP";
}

export const CATEGORIES: Category[] = [
    { id: "cat-dress", name: "Đầm & Váy liền" },
    { id: "cat-top", name: "Áo kiểu & Sơ mi" },
    { id: "cat-skirt", name: "Chân váy" },
    { id: "cat-pants", name: "Quần" },
    { id: "cat-outerwear", name: "Áo khoác" },
    { id: "cat-accessory", name: "Phụ kiện" },
];

export const BRANDS: Brand[] = [
    { id: "br-elise", name: "Elise", note: "Dòng thời trang công sở & dạo phố chủ lực" },
    { id: "br-elyn", name: "Elyn by Elise", note: "Dòng cao cấp, dự tiệc và áo khoác" },
    { id: "br-elise-sport", name: "Elise Sport", note: "Dòng năng động, trẻ trung" },
    { id: "br-elise-acc", name: "Elise Accessories", note: "Túi, khăn và phụ kiện" },
];

const APPAREL_SIZES = ["S", "M", "L", "XL"];
const FREE_SIZE = ["Freesize"];

export const PRODUCTS: Product[] = [
    { id: "p-01", sku: "EL-DAM-001", name: "Đầm dự tiệc lụa Elise", categoryId: "cat-dress", brandId: "br-elyn", costPrice: 720_000, salePrice: 1_690_000, sizes: APPAREL_SIZES, colors: ["Đỏ đô", "Đen", "Xanh navy"] },
    { id: "p-02", sku: "EL-DAM-002", name: "Đầm công sở suông", categoryId: "cat-dress", brandId: "br-elise", costPrice: 480_000, salePrice: 1_090_000, sizes: APPAREL_SIZES, colors: ["Be", "Đen", "Hồng"] },
    { id: "p-03", sku: "EL-AO-001", name: "Áo sơ mi lụa tay dài", categoryId: "cat-top", brandId: "br-elise", costPrice: 260_000, salePrice: 650_000, sizes: APPAREL_SIZES, colors: ["Trắng", "Be", "Xanh mint"] },
    { id: "p-04", sku: "EL-AO-002", name: "Áo kiểu voan nơ cổ", categoryId: "cat-top", brandId: "br-elise", costPrice: 210_000, salePrice: 590_000, sizes: APPAREL_SIZES, colors: ["Trắng", "Hồng", "Đen"] },
    { id: "p-05", sku: "EL-CV-001", name: "Chân váy bút chì", categoryId: "cat-skirt", brandId: "br-elise", costPrice: 230_000, salePrice: 620_000, sizes: APPAREL_SIZES, colors: ["Đen", "Be", "Xám"] },
    { id: "p-06", sku: "EL-CV-002", name: "Chân váy xòe xếp ly", categoryId: "cat-skirt", brandId: "br-elise", costPrice: 250_000, salePrice: 690_000, sizes: APPAREL_SIZES, colors: ["Đỏ", "Đen", "Xanh navy"] },
    { id: "p-07", sku: "EL-QU-001", name: "Quần âu ống suông", categoryId: "cat-pants", brandId: "br-elise", costPrice: 280_000, salePrice: 720_000, sizes: APPAREL_SIZES, colors: ["Đen", "Be", "Xám"] },
    { id: "p-08", sku: "EL-QU-002", name: "Quần culottes lưng cao", categoryId: "cat-pants", brandId: "br-elise-sport", costPrice: 240_000, salePrice: 660_000, sizes: APPAREL_SIZES, colors: ["Đen", "Trắng", "Nâu"] },
    { id: "p-09", sku: "EL-AK-001", name: "Áo khoác blazer", categoryId: "cat-outerwear", brandId: "br-elyn", costPrice: 520_000, salePrice: 1_290_000, sizes: APPAREL_SIZES, colors: ["Be", "Đen", "Hồng"] },
    { id: "p-10", sku: "EL-AK-002", name: "Áo khoác dạ dáng dài", categoryId: "cat-outerwear", brandId: "br-elyn", costPrice: 680_000, salePrice: 1_590_000, sizes: APPAREL_SIZES, colors: ["Camel", "Đen", "Xám"] },
    { id: "p-11", sku: "EL-PK-001", name: "Túi xách tay Elise", categoryId: "cat-accessory", brandId: "br-elise-acc", costPrice: 320_000, salePrice: 890_000, sizes: FREE_SIZE, colors: ["Đen", "Nâu", "Đỏ"] },
    { id: "p-12", sku: "EL-PK-002", name: "Khăn lụa Elise", categoryId: "cat-accessory", brandId: "br-elise-acc", costPrice: 90_000, salePrice: 290_000, sizes: FREE_SIZE, colors: ["Hồng", "Xanh", "Vàng"] },
];

export const SUPPLIERS: Supplier[] = [
    { id: "sup-01", name: "Dệt May Thành Công", category: "Vải & nguyên liệu", phone: "028 3815 1111", regionId: "south" },
    { id: "sup-02", name: "Xưởng May Đức Giang", category: "Gia công may mặc", phone: "024 3827 2222", regionId: "north" },
    { id: "sup-03", name: "Phụ kiện Thời trang An Phú", category: "Phụ kiện", phone: "028 3933 3333", regionId: "south" },
    { id: "sup-04", name: "Da & Túi Sài Gòn Leather", category: "Túi & da", phone: "028 3920 4444", regionId: "south" },
    { id: "sup-05", name: "Lụa Hà Đông Premium", category: "Vải lụa cao cấp", phone: "024 3355 5555", regionId: "north" },
];

export const SUPPLIER_CONTACTS: SupplierContact[] = [
    { id: "sc-01", supplierId: "sup-01", name: "Nguyễn Văn Thành", title: "Giám đốc kinh doanh", phone: "0903 111 222", email: "thanh@thanhcong.vn" },
    { id: "sc-02", supplierId: "sup-01", name: "Trần Thị Cúc", title: "Phụ trách đơn hàng", phone: "0903 111 333", email: "cuc@thanhcong.vn" },
    { id: "sc-03", supplierId: "sup-02", name: "Lê Đức Giang", title: "Quản lý xưởng", phone: "0912 222 444", email: "giang@ducgiang.vn" },
    { id: "sc-04", supplierId: "sup-03", name: "Phạm An Phú", title: "Đại diện bán hàng", phone: "0938 333 555", email: "anphu@anphu.vn" },
    { id: "sc-05", supplierId: "sup-04", name: "Võ Sài Gòn", title: "Trưởng phòng kinh doanh", phone: "0907 444 666", email: "vsg@sgleather.vn" },
    { id: "sc-06", supplierId: "sup-05", name: "Đỗ Hà Đông", title: "Chủ cơ sở", phone: "0988 555 777", email: "hadong@luapremium.vn" },
];

export const CUSTOMERS: Customer[] = [
    { id: "cus-walkin", name: "Khách lẻ", phone: "", tier: "Thường" },
    { id: "cus-01", name: "Nguyễn Thị Hồng", phone: "0987 111 222", tier: "VIP" },
    { id: "cus-02", name: "Trần Mỹ Linh", phone: "0912 333 444", tier: "Thành viên" },
    { id: "cus-03", name: "Lê Thu Trang", phone: "0938 555 666", tier: "Thành viên" },
    { id: "cus-04", name: "Phạm Quỳnh Anh", phone: "0905 777 888", tier: "VIP" },
];

export function getProduct(id: string): Product | undefined {
    return PRODUCTS.find((p) => p.id === id);
}

export function getCategory(id: string): Category | undefined {
    return CATEGORIES.find((c) => c.id === id);
}

export function getBrand(id: string): Brand | undefined {
    return BRANDS.find((b) => b.id === id);
}

/**
 * Deterministic 13-digit EAN-style barcode for a product variant.
 * Purely cosmetic for the demo — not a real check-digit calculation.
 */
export function productBarcode(sku: string, size = "", color = ""): string {
    const seed = hashSeed(`${sku}|${size}|${color}`);
    const digits = String(seed).padStart(12, "0").slice(0, 12);
    const check = digits.split("").reduce((sum, d) => (sum + Number(d)) % 10, 0);
    return `893${digits}${check}`.slice(0, 13);
}
