import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/authConfig";
import { getLocalizedHomePathFromToken } from "@/lib/demo/homePath";

type Locale = "vi" | "en";

const LOGIN_PATHS: Record<Locale, string> = {
    vi: "/vi/dang-nhap",
    en: "/en/login",
};

interface RootPageProps {
    params: Promise<{ locale: string }>;
}

export default async function RootPage({ params }: RootPageProps) {
    const { locale: localeParam } = await params;
    const locale: Locale = localeParam === "en" ? "en" : "vi";

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.COOKIES.TOKEN)?.value;

    if (token) {
        const home = getLocalizedHomePathFromToken(token, locale);
        redirect(`/${locale}${home}`);
    }

    redirect(LOGIN_PATHS[locale]);
}
