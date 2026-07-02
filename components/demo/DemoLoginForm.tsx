"use client";

import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { AUTH_CONFIG } from "@/lib/authConfig";
import { getDefaultHomePath } from "@/lib/demo/nav";
import { ROLE_LABELS, getRoleFromUser } from "@/lib/demo/roles";
import { fetchWithLocale } from "@/lib/fetchWithLocale";
import { useRouter } from "@/i18n/routing";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

export default function DemoLoginForm() {
    const t = useTranslations("demoAuth");
    const { setUser } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!account.trim() || !password) {
            toast({
                title: t("loginFailed"),
                description: t("credentialsRequired"),
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetchWithLocale("/api/auth/demo-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account: account.trim(),
                    password,
                }),
            });

            if (!res.ok) {
                toast({
                    title: t("loginFailed"),
                    description: t("invalidCredentials"),
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

            const role = getRoleFromUser(data.user);
            const roleLabel = role ? ROLE_LABELS[role] : "";

            toast({
                title: t("loginSuccess"),
                description: roleLabel ? `${roleLabel} — ${t("redirecting")}` : t("redirecting"),
                variant: "success",
            });

            const landingPath = role ? getDefaultHomePath(role) : "/dashboard";
            router.replace(landingPath as "/dashboard");
        } catch {
            toast({
                title: t("connectionError"),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex shrink-0 flex-col items-center space-y-2 text-center">
                <BrandLogo size="lg" priority />
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">{t("loginTitle")}</h3>
                    <p className="text-sm text-slate-500">{t("loginSubtitle")}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="demo-account" className="text-slate-700">
                        {t("account")}
                    </Label>
                    <Input
                        id="demo-account"
                        type="text"
                        autoComplete="username"
                        placeholder={t("accountPlaceholder")}
                        value={account}
                        onChange={(event) => setAccount(event.target.value)}
                        disabled={isLoading}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="demo-password" className="text-slate-700">
                        {t("password")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="demo-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder={t("passwordPlaceholder")}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={isLoading}
                            className="h-11 pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-slate-500"
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full cursor-pointer bg-gradient-to-r from-custom to-custom-hover text-white shadow-md shadow-custom/20 hover:from-custom-hover hover:to-custom"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {t("loggingIn")}
                        </>
                    ) : (
                        <>
                            <LogIn size={16} />
                            {t("login")}
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
