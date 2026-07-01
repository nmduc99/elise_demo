import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    localePrefix: "as-needed",
    locales: ["en", "vi"],
    defaultLocale: "vi",
    localeDetection: false,
    pathnames: {
        "/": {
            en: "/",
            vi: "/",
        },
        "/auth": {
            en: "/login",
            vi: "/dang-nhap",
        },
        "/dashboard": {
            en: "/dashboard",
            vi: "/tong-quan",
        },
        "/organization": {
            en: "/organization",
            vi: "/quan-ly-to-chuc",
        },
        "/catalog": {
            en: "/catalog",
            vi: "/quan-ly-san-pham",
        },
        "/procurement": {
            en: "/procurement",
            vi: "/thu-mua",
        },
        "/warehouse": {
            en: "/warehouse",
            vi: "/quan-ly-kho",
        },
        "/staff": {
            en: "/staff",
            vi: "/nhan-vien",
        },
        "/staff/[id]": {
            en: "/staff/[id]",
            vi: "/nhan-vien/[id]",
        },
        "/franchise": {
            en: "/franchise",
            vi: "/nhuong-quyen",
        },
        "/report-center": {
            en: "/report-center",
            vi: "/bao-cao-kinh-doanh",
        },
        "/pos": {
            en: "/pos",
            vi: "/ban-hang-pos",
        },
        "/transactions": {
            en: "/transactions",
            vi: "/giao-dich",
        },
        "/ledger": {
            en: "/ledger",
            vi: "/so-quy",
        },
        "/permissions": {
            en: "/permissions",
            vi: "/phan-quyen",
        },
        "/terms-and-privacy": {
            en: "/terms-and-privacy",
            vi: "/dieu-khoan-bao-mat",
        },
    },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, getPathname, redirect, usePathname, useRouter } =
    createNavigation(routing);
