"use client";

import StatCard from "@/components/demo/StatCard";
import { formatNumber, formatVnd, formatVndShort } from "@/lib/demo/format";
import { BadgeCheck, Briefcase, Users, Wallet } from "lucide-react";

interface StaffStatsProps {
    total: number;
    active: number;
    probation: number;
    payroll: number;
}

export default function StaffStats({ total, active, probation, payroll }: StaffStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                label="Tổng nhân sự"
                value={formatNumber(total)}
                icon={Users}
                accent="primary"
            />
            <StatCard
                label="Đang làm việc"
                value={formatNumber(active)}
                icon={BadgeCheck}
                accent="green"
            />
            <StatCard
                label="Thử việc"
                value={formatNumber(probation)}
                icon={Briefcase}
                accent="amber"
            />
            <StatCard
                label="Quỹ lương tháng"
                value={formatVndShort(payroll)}
                sub={formatVnd(payroll)}
                icon={Wallet}
                accent="blue"
            />
        </div>
    );
}
