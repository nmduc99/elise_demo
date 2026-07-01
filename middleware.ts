import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { AUTH_CONFIG } from "@/lib/authConfig";
import { getRoleFromDemoToken } from "@/lib/demo/paths";
import { getLocalizedHomePathFromToken } from "@/lib/demo/homePath";
import { hasNavAccess } from "@/lib/demo/permissions";

const intlMiddleware = createMiddleware(routing);

// Public routes: auth + terms-and-privacy (root path removed)
const PUBLIC_PATHS: Record<"vi" | "en", string[]> = {
  vi: ["/dang-nhap", "/dieu-khoan-bao-mat"],
  en: ["/login", "/terms-and-privacy"],
};

// Login paths for redirect
const LOGIN_PATHS: Record<"vi" | "en", string> = {
  vi: "/dang-nhap",
  en: "/login",
};

// Default post-auth redirect (overridden per demo role)
const DASHBOARD_PATHS: Record<"vi" | "en", string> = {
  vi: "/tong-quan",
  en: "/dashboard",
};

function postAuthPath(locale: "vi" | "en", token?: string): string {
  if (token?.startsWith("demo.")) {
    return getLocalizedHomePathFromToken(token, locale);
  }
  return DASHBOARD_PATHS[locale];
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bỏ qua asset và api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|mp3|wav)$/)
  ) {
    return NextResponse.next();
  }

  // Handle root path - always redirect to Vietnamese
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/vi";
    return NextResponse.redirect(url);
  }

  const res = intlMiddleware(req);

  // Lấy locale từ segment đầu
  const segments = pathname.split("/").filter(Boolean);
  const locale: "vi" | "en" =
    segments[0] === "vi" || segments[0] === "en" ? (segments[0] as "vi" | "en") : "vi";

  // Xác định path không prefix locale
  const pathWithoutLocale =
    segments[0] === "vi" || segments[0] === "en"
      ? "/" + segments.slice(1).join("/")
      : pathname;

  // Locale root paths (/vi, /en) - redirect to login for unauthenticated
  const isLocaleRoot = pathWithoutLocale === "/" && (pathname === "/vi" || pathname === "/en");
  const isPublic = PUBLIC_PATHS[locale].includes(pathWithoutLocale);
  const isLoginPage = pathWithoutLocale === LOGIN_PATHS[locale];

  const token = req.cookies.get(AUTH_CONFIG.COOKIES.TOKEN)?.value;

  // Authenticated user handling
  if (token) {
    // Redirect authenticated user from login page
    if (isLoginPage) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}${postAuthPath(locale, token)}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
    // Redirect authenticated user from locale root
    if (isLocaleRoot) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}${postAuthPath(locale, token)}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
    // Demo user without dashboard access visiting overview → role home
    if (token?.startsWith("demo.")) {
      const role = getRoleFromDemoToken(token);
      const isDashboardPath =
        pathWithoutLocale === "/tong-quan" || pathWithoutLocale === "/dashboard";

      if (isDashboardPath && role && !hasNavAccess(role, "dashboard")) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}${postAuthPath(locale, token)}`;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    return res;
  }

  // Unauthenticated user handling
  // Redirect unauthenticated user from locale root to login
  if (isLocaleRoot) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${LOGIN_PATHS[locale]}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated user from protected routes to login
  if (!isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${LOGIN_PATHS[locale]}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    // Chỉ match các route có locale prefix - không match root "/"
    "/(en|vi)/:path*",
    "/((?!api|_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav)$).*)",
  ],
};
