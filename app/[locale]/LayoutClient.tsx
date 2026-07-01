"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { getPageTitle } from "@/lib/titleMap";
import { usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { SWRConfig } from "swr";
import { fetchWithLocale } from "@/lib/fetchWithLocale";

function isPublicPath(pathname: string): boolean {
    return pathname === "/" || pathname === "/auth" || pathname === "/terms-and-privacy";
}

export default function LayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const locale = useLocale() as "en" | "vi";

    useEffect(() => {
        document.title = getPageTitle(pathname, locale);
    }, [pathname, locale]);

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
