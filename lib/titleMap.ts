type Locale = "en" | "vi";

export const titleMap: Record<Locale, Record<string, string>> = {
    en: {
        "/": "Home",
        "/login": "Login",
        "/auth": "Login",
        "/dashboard": "Dashboard",
        "/organization": "Organization",
        "/catalog": "Product catalog",
        "/procurement": "Procurement",
        "/warehouse": "Warehouse",
        "/staff": "Staff",
        "/franchise": "Franchise",
        "/report-center": "Reports",
        "/pos": "POS",
        "/terms-and-privacy": "Terms and Privacy",
    },
    vi: {
        "/": "Trang chủ",
        "/dang-nhap": "Đăng nhập",
        "/auth": "Đăng nhập",
        "/tong-quan": "Trang tổng quan",
        "/quan-ly-to-chuc": "Quản lý tổ chức",
        "/quan-ly-san-pham": "Quản lý sản phẩm",
        "/thu-mua": "Thu mua",
        "/quan-ly-kho": "Quản lý kho",
        "/nhan-vien": "Nhân sự",
        "/nhuong-quyen": "Nhượng quyền",
        "/bao-cao-kinh-doanh": "Báo cáo kinh doanh",
        "/ban-hang-pos": "Bán hàng POS",
        "/dieu-khoan-bao-mat": "Điều khoản & bảo mật",
    },
};

export function getTitle(path: string, locale: Locale): string | undefined {
    return titleMap[locale]?.[path];
}
