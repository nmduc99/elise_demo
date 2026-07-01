// app/[locale]/layout.tsx
import TenantProvider from "@/components/TenantProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { parseTenantFromHost } from "@/lib/tenant";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { headers } from "next/headers";
import LayoutClient from "./LayoutClient";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const locale = await getLocale();
    const messages = await getMessages();

    const host = (await headers()).get("host") || "";
    const tenant = parseTenantFromHost(host); // 'abc' | 'www' | 'local' ...

    return (
        <NextIntlClientProvider messages={messages}>
            <TenantProvider tenant={tenant}>
                <TooltipProvider>
                    <LayoutClient>{children}</LayoutClient>
                </TooltipProvider>
            </TenantProvider>
        </NextIntlClientProvider>
    );
}
