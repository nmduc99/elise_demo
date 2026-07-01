"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { REGIONS, STORES, getStore } from "@/lib/demo/eliseData";
import { getRoleFromUser } from "@/lib/demo/roles";
import { useEffect, useMemo, useState } from "react";

const ALL = "all";

export interface DemoScope {
    role: ReturnType<typeof getRoleFromUser>;
    /** Fixed store for a store manager, otherwise null. */
    scopedStoreId: string | null;
    regionId: string | null;
    storeId: string | null;
    setRegionId: (id: string | null) => void;
    setStoreId: (id: string | null) => void;
    isLockedToStore: boolean;
}

export function useDemoScope(): DemoScope {
    const { user } = useAuth();
    const role = getRoleFromUser(user);
    const scopedStoreId = role === "store_manager" ? user?.storeId ?? null : null;

    const [regionId, setRegionId] = useState<string | null>(null);
    const [storeId, setStoreId] = useState<string | null>(scopedStoreId);

    // Keep a store manager locked to their own store once the user loads.
    useEffect(() => {
        if (scopedStoreId) {
            setStoreId(scopedStoreId);
            const store = getStore(scopedStoreId);
            if (store) setRegionId(store.regionId);
        }
    }, [scopedStoreId]);

    return {
        role,
        scopedStoreId,
        regionId,
        storeId,
        setRegionId,
        setStoreId,
        isLockedToStore: Boolean(scopedStoreId),
    };
}

export function ScopeFilter({ scope }: { scope: DemoScope }) {
    const { regionId, storeId, setRegionId, setStoreId, isLockedToStore } = scope;

    const stores = useMemo(
        () => STORES.filter((s) => !regionId || s.regionId === regionId),
        [regionId]
    );

    if (isLockedToStore) {
        const store = storeId ? getStore(storeId) : null;
        return (
            <div className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm">
                <span className="text-slate-400">Cửa hàng:</span>
                <span className="font-semibold text-slate-800">{store?.name ?? "-"}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Select
                value={regionId ?? ALL}
                onValueChange={(v) => {
                    setRegionId(v === ALL ? null : v);
                    setStoreId(null);
                }}
            >
                <SelectTrigger className="h-9 w-[170px] bg-white">
                    <SelectValue placeholder="Khu vực" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>Tất cả khu vực</SelectItem>
                    {REGIONS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                            {r.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={storeId ?? ALL} onValueChange={(v) => setStoreId(v === ALL ? null : v)}>
                <SelectTrigger className="h-9 w-[220px] bg-white">
                    <SelectValue placeholder="Cửa hàng" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>Tất cả cửa hàng</SelectItem>
                    {stores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                            {s.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
