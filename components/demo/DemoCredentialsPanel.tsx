"use client";

import { useToast } from "@/hooks/use-toast";
import {
    DEMO_ROLES,
    DEMO_USERS,
    ROLE_LABELS,
    type DemoRole,
} from "@/lib/demo/roles";
import {
    Briefcase,
    Calculator,
    Check,
    Copy,
    ShoppingBag,
    Store,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const DEMO_ROLE_ICONS: Record<DemoRole, typeof Briefcase> = {
    director: Briefcase,
    accountant: Calculator,
    procurement: ShoppingBag,
    store_manager: Store,
};

interface CopyFieldProps {
    label: string;
    value: string;
}

function CopyField({ label, value }: CopyFieldProps) {
    const { toast } = useToast();
    const t = useTranslations("demoAuth");
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast({
                title: t("copied"),
                description: `${label}: ${value}`,
                variant: "success",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                title: t("copyFailed"),
                variant: "destructive",
            });
        }
    }, [label, toast, t, value]);

    return (
        <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                    {value}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-orange-50 hover:text-custom focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-custom/30 active:bg-orange-100"
                    aria-label={`${t("copy")} ${label}`}
                >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
}

export default function DemoCredentialsPanel() {
    const t = useTranslations("demoAuth");

    return (
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 shrink-0 space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{t("credentialsTitle")}</h3>
                <p className="text-sm text-slate-500">{t("credentialsSubtitle")}</p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-fr">
                    {DEMO_ROLES.map((role) => {
                        const Icon = DEMO_ROLE_ICONS[role];
                        const user = DEMO_USERS[role];

                        return (
                            <div
                                key={role}
                                className="flex h-full flex-col space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-custom">
                                        <Icon size={18} />
                                    </span>
                                    <span className="text-sm font-bold text-slate-800">
                                        {ROLE_LABELS[role]}
                                    </span>
                                </div>

                                <div className="mt-auto space-y-2">
                                    <CopyField label={t("account")} value={user.account} />
                                    <CopyField label={t("password")} value={user.password} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
