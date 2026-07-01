"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { AUTH_CONFIG } from "@/lib/authConfig";
import {
    DEMO_ROLES,
    ROLE_DESCRIPTIONS,
    ROLE_LABELS,
    type DemoRole,
} from "@/lib/demo/roles";
import { getDefaultHomePath } from "@/lib/demo/nav";
import { fetchWithLocale } from "@/lib/fetchWithLocale";
import { useRouter } from "@/i18n/routing";
import {
    Briefcase,
    Calculator,
    Crown,
    Loader2,
    LogIn,
    ShoppingBag,
    Store,
} from "lucide-react";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";

const DEMO_ROLE_ICONS: Record<DemoRole, typeof Briefcase> = {
    director: Briefcase,
    accountant: Calculator,
    procurement: ShoppingBag,
    store_manager: Store,
    franchise_monitor: Crown,
};

export default function DemoRolePicker() {
    const { setUser } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);

    const loginAsRole = async (role: DemoRole) => {
        if (loadingRole) return;
        setLoadingRole(role);
        try {
            const res = await fetchWithLocale("/api/auth/demo-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });

            if (!res.ok) {
                toast({
                    title: "Không thể đăng nhập",
                    description: "Vui lòng thử lại.",
                    variant: "destructive",
                });
                return;
            }

            const data = await res.json();

            if (data.tokenExpiresAt) {
                localStorage.setItem(
                    AUTH_CONFIG.STORAGE_KEYS.TOKEN_EXPIRES_AT,
                    String(data.tokenExpiresAt)
                );
            }

            if (data.user) {
                setUser(data.user);
                localStorage.setItem(
                    AUTH_CONFIG.STORAGE_KEYS.USER,
                    JSON.stringify(data.user)
                );
                localStorage.setItem(
                    AUTH_CONFIG.STORAGE_KEYS.CACHED_AT,
                    String(Date.now())
                );
            }

            toast({
                title: `Đăng nhập: ${ROLE_LABELS[role]}`,
                description: "Đang vào bản demo Elise...",
                variant: "success",
            });
            const landingPath = getDefaultHomePath(role);
            router.replace(landingPath as "/dashboard");
        } catch {
            toast({
                title: "Lỗi kết nối",
                variant: "destructive",
            });
        } finally {
            setLoadingRole(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center space-y-3 text-center">
                <BrandLogo size="lg" priority />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Demo Elise theo vai trò</h2>
                <p className="text-sm text-slate-500">
                    Chọn vai trò và bấm Đăng nhập để vào bản demo quản lý chuỗi thời trang Elise.
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {DEMO_ROLES.map((role) => {
                    const Icon = DEMO_ROLE_ICONS[role];
                    const isLoading = loadingRole === role;
                    const isDisabled = !!loadingRole;

                    return (
                        <div
                            key={role}
                            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-custom">
                                    <Icon size={20} />
                                </span>
                                <div className="min-w-0">
                                    <span className="block text-sm font-bold text-slate-800">
                                        {ROLE_LABELS[role]}
                                    </span>
                                    <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                                        {ROLE_DESCRIPTIONS[role]}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={() => loginAsRole(role)}
                                disabled={isDisabled}
                                className="w-full cursor-pointer bg-gradient-to-r from-custom to-custom-hover text-white shadow-md shadow-custom/20 hover:from-custom-hover hover:to-custom"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={16} />
                                        Đăng nhập
                                    </>
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
