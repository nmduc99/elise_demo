import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
    // Lấy locale từ request
    const locale = await requestLocale;

    // Validate locale
    if (!locale || !routing.locales.includes(locale as any)) notFound();

    return {
        locale: locale as string,
        messages: (await import(`../languages/${locale}.json`)).default,
    };
});

// Trigger reload
