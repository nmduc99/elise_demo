"use client";

import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string;
    icon?: LucideIcon;
    sub?: string;
    change?: number;
    accent?: "primary" | "blue" | "green" | "amber" | "rose";
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
    primary: "bg-orange-100 text-custom",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
};

export default function StatCard({
    label,
    value,
    icon: Icon,
    sub,
    change,
    accent = "primary",
}: StatCardProps) {
    const hasChange = typeof change === "number" && Number.isFinite(change);
    const positive = (change ?? 0) >= 0;

    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                    {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
                </div>
                {Icon && (
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", ACCENTS[accent])}>
                        <Icon size={20} />
                    </span>
                )}
            </div>
            {hasChange && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                    <span
                        className={cn(
                            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                            positive ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                        )}
                    >
                        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(change as number).toFixed(1)}%
                    </span>
                    <span className="text-slate-400">so với kỳ trước</span>
                </div>
            )}
        </div>
    );
}
