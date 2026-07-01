/**
 * Resolve role-based home path to a locale-specific URL segment (for middleware).
 */

import { routing } from "@/i18n/routing";
import { getDefaultHomePath } from "./nav";
import { getRoleFromDemoToken } from "./paths";
import type { DemoRole } from "./roles";

type Locale = "vi" | "en";

function toLocalizedPath(logicalPath: string, locale: Locale): string {
    const pathnames = routing.pathnames as Record<
        string,
        Partial<Record<Locale, string>> | string
    >;
    const mapping = pathnames[logicalPath];

    if (mapping && typeof mapping === "object" && mapping[locale]) {
        return mapping[locale]!;
    }

    if (logicalPath === "/dashboard") {
        return locale === "vi" ? "/tong-quan" : "/dashboard";
    }

    return logicalPath;
}

export function getLocalizedHomePath(role: DemoRole | null | undefined, locale: Locale): string {
    return toLocalizedPath(getDefaultHomePath(role), locale);
}

export function getLocalizedHomePathFromToken(
    token: string | undefined | null,
    locale: Locale
): string {
    return getLocalizedHomePath(getRoleFromDemoToken(token), locale);
}
