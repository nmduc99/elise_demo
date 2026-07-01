"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { getTitle } from "@/lib/titleMap";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SWRConfig } from "swr";
import { fetchWithLocale } from "@/lib/fetchWithLocale";

function isPublicPath(pathname: string): boolean {
    return (
        pathname === "/vi" ||
        pathname === "/en" ||
        pathname === "/" ||
        pathname.includes("/login") ||
        pathname.includes("/dang-nhap") ||
        pathname.includes("/auth") ||
        pathname.includes("/terms-and-privacy") ||
        pathname.includes("/dieu-khoan-bao-mat")
    );
}

export default function LayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const locale = pathname.startsWith("/en") ? "en" : "vi";
    const cleanPath =
        locale === "en"
            ? pathname.replace(/^\/en/, "") || "/"
            : pathname.replace(/^\/vi/, "") || "/";

    useEffect(() => {
        const title = getTitle(cleanPath, locale as "en" | "vi");
        document.title = title ?? "Elise Demo";
    }, [pathname, locale, cleanPath]);

    const hideHeader = isPublicPath(pathname);

    return (
        <SWRConfig
            value={{
                fetcher: async (url: string) => {
                    const response = await fetchWithLocale(url);
                    if (!response.ok) {
                        const error: Error & { status?: number } = new Error(
                            `HTTP error! status: ${response.status}`
                        );
                        error.status = response.status;
                        throw error;
                    }
                    return response.json();
                },
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                shouldRetryOnError: () => false,
            }}
        >
            <AuthProvider>
                {!hideHeader && <Header />}
                <main>{children}</main>
                <Toaster />
            </AuthProvider>
        </SWRConfig>
    );
}
