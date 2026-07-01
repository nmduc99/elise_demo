type Locale = "en" | "vi";

export const APP_NAME = "Elise";

/**
 * Page titles keyed by next-intl logical pathname (e.g. /dashboard, /auth).
 */
const PAGE_TITLES: Record<string, Record<Locale, string>> = {
    "/": {
        en: "Home",
        vi: "Trang chủ",
    },
    "/auth": {
        en: "Login",
        vi: "Đăng nhập",
    },
    "/dashboard": {
        en: "Dashboard",
        vi: "Trang tổng quan",
    },
    "/organization": {
        en: "Organization",
        vi: "Quản lý tổ chức",
    },
    "/catalog": {
        en: "Product catalog",
        vi: "Quản lý sản phẩm",
    },
    "/procurement": {
        en: "Procurement",
        vi: "Thu mua",
    },
    "/warehouse": {
        en: "Warehouse",
        vi: "Quản lý kho",
    },
    "/staff": {
        en: "Staff",
        vi: "Nhân sự",
    },
    "/staff/[id]": {
        en: "Employee detail",
        vi: "Chi tiết nhân viên",
    },
    "/franchise": {
        en: "Franchise",
        vi: "Nhượng quyền",
    },
    "/report-center": {
        en: "Reports",
        vi: "Báo cáo kinh doanh",
    },
    "/pos": {
        en: "POS",
        vi: "Bán hàng POS",
    },
    "/transactions": {
        en: "Transactions",
        vi: "Giao dịch",
    },
    "/ledger": {
        en: "Cash book",
        vi: "Sổ quỹ",
    },
    "/permissions": {
        en: "Permissions",
        vi: "Phân quyền",
    },
    "/terms-and-privacy": {
        en: "Terms and Privacy",
        vi: "Điều khoản & bảo mật",
    },
};

/** @deprecated Use getPageTitle with logical pathname from @/i18n/routing */
export const titleMap: Record<Locale, Record<string, string>> = {
    en: Object.fromEntries(
        Object.entries(PAGE_TITLES).map(([path, titles]) => [path, titles.en]),
    ),
    vi: Object.fromEntries(
        Object.entries(PAGE_TITLES).map(([path, titles]) => [path, titles.vi]),
    ),
};

export function getPageTitle(logicalPath: string, locale: Locale): string {
    const pageTitle = PAGE_TITLES[logicalPath]?.[locale];
    if (!pageTitle) {
        return APP_NAME;
    }
    return `${pageTitle} | ${APP_NAME}`;
}

/** @deprecated Use getPageTitle */
export function getTitle(path: string, locale: Locale): string | undefined {
    return PAGE_TITLES[path]?.[locale];
}
