"use client";

import { Eye } from "lucide-react";
import type { DemoAccess } from "./useDemoAccess";

interface AccessBannerProps {
    access: Pick<DemoAccess, "label" | "isReadOnly" | "isMonitor" | "isProposeOnly">;
}

export default function AccessBanner({ access }: AccessBannerProps) {
    if (!access.label) return null;

    return (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <Eye size={16} className="shrink-0" />
            <span>
                Quyền truy cập: <strong>{access.label}</strong>
                {access.isMonitor && " — không thể thao tác bán hàng"}
                {access.isProposeOnly && " — thao tác sẽ được gửi dưới dạng đề nghị"}
            </span>
        </div>
    );
}
