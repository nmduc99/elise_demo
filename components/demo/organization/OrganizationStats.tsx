"use client";

import StatCard from "@/components/demo/StatCard";
import { formatNumber } from "@/lib/demo/format";
import { Building2, Map, MapPin, Store as StoreIcon } from "lucide-react";
import type { OrganizationPageState } from "./useOrganizationPage";

interface OrganizationStatsProps {
    regionsCount: number;
    provincesCount: number;
    storesCount: number;
    activeStoreCount: number;
}

export default function OrganizationStats({
    regionsCount,
    provincesCount,
    storesCount,
    activeStoreCount,
}: OrganizationStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                label="Khu vực"
                value={formatNumber(regionsCount)}
                icon={Map}
                accent="primary"
            />
            <StatCard
                label="Tỉnh/thành"
                value={formatNumber(provincesCount)}
                icon={MapPin}
                accent="blue"
            />
            <StatCard
                label="Cửa hàng"
                value={formatNumber(storesCount)}
                icon={StoreIcon}
                accent="amber"
            />
            <StatCard
                label="Đang hoạt động"
                value={formatNumber(activeStoreCount)}
                icon={Building2}
                accent="green"
            />
        </div>
    );
}

export function organizationStatsProps(state: OrganizationPageState): OrganizationStatsProps {
    return {
        regionsCount: state.regions.items.length,
        provincesCount: state.provinces.items.length,
        storesCount: state.stores.items.length,
        activeStoreCount: state.activeStoreCount,
    };
}
