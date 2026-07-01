"use client";

import { LogOut, User } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { clearAuthStorage } from "@/lib/tokenService";
import { useAuth } from "../auth/AuthProvider";
import { getRoleFromUser, ROLE_LABELS } from "@/lib/demo/roles";
import { navigationColors } from "@/lib/colors/navigationColors";
import clsx from "clsx";

export default function UserMenu() {
    const t = useTranslations("common");
    const locale = useLocale();
    const { user } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [userMenuTimeoutId, setUserMenuTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const role = getRoleFromUser(user);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        setUserMenuOpen(false);

        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            /* proceed with local cleanup even if API fails */
        }

        clearAuthStorage();

        const loginPath = locale === "vi" ? `/${locale}/dang-nhap` : `/${locale}/login`;
        // Redirect immediately — avoid setUser(null) here, which would re-render
        // RoleGuard on the current page and flash "Không có quyền truy cập".
        window.location.replace(loginPath);
    };

    const handleUserMenuMouseEnter = () => {
        if (userMenuTimeoutId) clearTimeout(userMenuTimeoutId);
        setUserMenuOpen(true);
    };

    const handleUserMenuMouseLeave = () => {
        const id = setTimeout(() => {
            setUserMenuOpen(false);
        }, 200);
        setUserMenuTimeoutId(id);
    };

    if (!user) return null;

    return (
        <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <div
                onMouseEnter={handleUserMenuMouseEnter}
                onMouseLeave={handleUserMenuMouseLeave}
                className="inline-block border-none"
                suppressHydrationWarning
            >
                <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 p-2 rounded-[8px] hover:bg-gray-200 cursor-pointer">
                        <User size={16} />
                        <span className="hidden sm:inline text-xs font-medium text-slate-700 max-w-[120px] truncate">
                            {user.fullName || user.account}
                        </span>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    onMouseEnter={handleUserMenuMouseEnter}
                    onMouseLeave={handleUserMenuMouseLeave}
                    align="end"
                    className="w-56 p-2"
                >
                    <div className="flex flex-col gap-1">
                        <div className="px-3 py-2">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {user.fullName || user.account}
                            </p>
                            {role && (
                                <p className="text-xs text-slate-500 mt-0.5">{ROLE_LABELS[role]}</p>
                            )}
                        </div>
                        <div className="border-t border-gray-200 my-1" />
                        <button
                            type="button"
                            disabled={loggingOut}
                            onPointerDown={(e) => {
                                e.preventDefault();
                                void handleLogout();
                            }}
                            className={clsx(
                                "flex w-full items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm text-red-600 disabled:opacity-60",
                                navigationColors.submenuItem.hoverBg
                            )}
                        >
                            <LogOut size={16} />
                            {loggingOut ? "Đang đăng xuất..." : t("logout")}
                        </button>
                    </div>
                </PopoverContent>
            </div>
        </Popover>
    );
}
