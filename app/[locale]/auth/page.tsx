"use client";

import DemoCredentialsPanel from "@/components/demo/DemoCredentialsPanel";
import DemoLoginForm from "@/components/demo/DemoLoginForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRoleFromUser, isDemoUser } from "@/lib/demo/roles";
import { getDefaultHomePath } from "@/lib/demo/nav";
import { useRouter } from "@/i18n/routing";
import { useEffect } from "react";

export default function AuthPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && isDemoUser(user)) {
            const role = getRoleFromUser(user);
            router.replace(getDefaultHomePath(role) as "/dashboard");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
                Đang tải...
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.35),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(0,0,0,0.25),_transparent_45%)]" />
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
                <div className="w-full max-w-6xl rounded-[32px] border border-white/10 bg-white/95 p-5 shadow-2xl sm:p-8">
                    <div className="grid grid-cols-1 gap-4 lg:h-[min(720px,calc(100vh-5rem))] lg:grid-cols-2 lg:gap-5">
                        <DemoCredentialsPanel />
                        <DemoLoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
