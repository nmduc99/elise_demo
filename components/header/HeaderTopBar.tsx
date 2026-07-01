"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRoleFromUser } from "@/lib/demo/roles";
import { getDefaultHomePath } from "@/lib/demo/nav";
import LanguageSelector from "./LanguageSelector";
import UserMenu from "./UserMenu";

export default function HeaderTopBar() {
    const t = useTranslations("elise");
    const { user } = useAuth();
    const homePath = getDefaultHomePath(getRoleFromUser(user));

    return (
        <div className="bg-[#fff] h-[48px] flex justify-between items-center px-4">
            <Link href={homePath as "/dashboard"} className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-custom to-custom-hover text-sm font-bold text-white">
                    E
                </span>
                <div className="leading-tight">
                    <p className="font-bold text-black text-sm md:text-base tracking-wide">
                        {t("brand")}
                    </p>
                    <p className="hidden sm:block text-[10px] text-slate-400">
                        {t("brandTagline")}
                    </p>
                </div>
            </Link>
            <div className="flex items-center gap-2">
                <LanguageSelector />
                <UserMenu />
            </div>
        </div>
    );
}
