"use client";

import { Link } from "@/i18n/routing";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRoleFromUser } from "@/lib/demo/roles";
import { getDefaultHomePath } from "@/lib/demo/nav";
import BrandLogo from "@/components/BrandLogo";
import LanguageSelector from "./LanguageSelector";
import UserMenu from "./UserMenu";

export default function HeaderTopBar() {
    const { user } = useAuth();
    const homePath = getDefaultHomePath(getRoleFromUser(user));

    return (
        <div className="bg-[#fff] h-[48px] flex justify-between items-center px-4">
            <Link href={homePath as "/dashboard"} className="flex items-center gap-2">
                <BrandLogo size="md" />
            </Link>
            <div className="flex items-center gap-2">
                <LanguageSelector />
                <UserMenu />
            </div>
        </div>
    );
}
