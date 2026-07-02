"use client";

import { Button } from "@/components/ui/button";
import type { Region } from "@/lib/demo/eliseData";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { OrganizationPageState } from "./useOrganizationPage";

interface RegionsTabProps {
    state: OrganizationPageState;
}

export default function RegionsTab({ state }: RegionsTabProps) {
    const { regions, provinces, stores } = state;

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button
                    className="bg-custom text-white hover:bg-custom-hover"
                    onClick={() => {
                        state.setRegionDraft({ id: "", name: "", code: "" });
                        state.setRegionOpen(true);
                    }}
                >
                    <Plus size={16} className="mr-1.5" /> Thêm khu vực
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {regions.items.map((region: Region) => (
                    <div
                        key={region.id}
                        className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm"
                    >
                        <div>
                            <p className="font-semibold text-slate-800">{region.name}</p>
                            <p className="text-xs text-slate-400">
                                Mã: {region.code} ·{" "}
                                {provinces.items.filter((p) => p.regionId === region.id).length}{" "}
                                tỉnh ·{" "}
                                {stores.items.filter((s) => s.regionId === region.id).length}{" "}
                                cửa hàng
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    state.setRegionDraft(region);
                                    state.setRegionOpen(true);
                                }}
                                className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => regions.remove(region.id)}
                                className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
