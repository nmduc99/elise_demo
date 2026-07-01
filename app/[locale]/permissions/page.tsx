"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import RoleGuard from "@/components/demo/RoleGuard";
import WriteGuard from "@/components/demo/WriteGuard";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    clearPermissionOverrides,
    loadPermissionOverrides,
    savePermissionOverrides,
    type OverrideMap,
} from "@/lib/demo/permissionOverrides";
import {
    ACCESS_LEVEL_OPTIONS,
    PERMISSION_LABELS,
    accessLabel,
    getMatrix,
    type AccessLevel,
    type PermissionKey,
} from "@/lib/demo/permissions";
import { DEMO_ROLES, ROLE_LABELS, type DemoRole } from "@/lib/demo/roles";
import { RotateCcw, Save, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const PERMISSION_KEYS = Object.keys(PERMISSION_LABELS) as PermissionKey[];

export default function PermissionsPage() {
    const rbacAccess = useDemoAccess("users_rbac");
    const { toast } = useToast();
    const matrix = getMatrix();

    const [overrides, setOverrides] = useState<OverrideMap>({});
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setOverrides(loadPermissionOverrides());
    }, []);

    const getLevel = useCallback(
        (role: DemoRole, key: PermissionKey): AccessLevel => {
            return overrides[role]?.[key] ?? matrix[role]?.[key] ?? "none";
        },
        [overrides, matrix]
    );

    const setLevel = (role: DemoRole, key: PermissionKey, level: AccessLevel) => {
        setOverrides((prev) => ({
            ...prev,
            [role]: { ...prev[role], [key]: level },
        }));
        setDirty(true);
    };

    const handleSave = () => {
        savePermissionOverrides(overrides);
        setDirty(false);
        toast({ title: "Đã lưu phân quyền", description: "Tải lại trang để áp dụng đầy đủ.", variant: "success" });
    };

    const handleReset = () => {
        clearPermissionOverrides();
        setOverrides({});
        setDirty(false);
        toast({ title: "Đã khôi phục mặc định", variant: "success" });
    };

    return (
        <RoleGuard permission="users_rbac">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Phân quyền hệ thống</h1>
                        <p className="text-sm text-slate-500">
                            Giám đốc cấu hình quyền truy cập theo vai trò (lưu localStorage demo)
                        </p>
                    </div>
                    <WriteGuard permission="users_rbac">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleReset}>
                                <RotateCcw size={16} className="mr-1.5" /> Khôi phục
                            </Button>
                            <Button className="bg-custom text-white hover:bg-custom-hover" onClick={handleSave} disabled={!dirty}>
                                <Save size={16} className="mr-1.5" /> Lưu thay đổi
                            </Button>
                        </div>
                    </WriteGuard>
                </div>

                <AccessBanner access={rbacAccess} />

                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="min-w-[900px] w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                            <tr>
                                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 font-medium">Chức năng</th>
                                {DEMO_ROLES.map((role) => (
                                    <th key={role} className="px-3 py-3 font-medium text-center min-w-[120px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <Shield size={14} className="text-custom" />
                                            {ROLE_LABELS[role]}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {PERMISSION_KEYS.map((key) => (
                                <tr key={key} className="hover:bg-slate-50">
                                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-slate-800">
                                        {PERMISSION_LABELS[key]}
                                    </td>
                                    {DEMO_ROLES.map((role) => {
                                        const level = getLevel(role, key);
                                        const isOverride = !!overrides[role]?.[key];
                                        return (
                                            <td key={role} className="px-3 py-2 text-center">
                                                <WriteGuard permission="users_rbac">
                                                    <Select
                                                        value={level}
                                                        onValueChange={(v) => setLevel(role, key, v as AccessLevel)}
                                                    >
                                                        <SelectTrigger className={`h-8 text-xs ${isOverride ? "border-custom" : ""}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ACCESS_LEVEL_OPTIONS.map((opt) => (
                                                                <SelectItem key={opt} value={opt}>
                                                                    {opt === "none" ? "Không" : accessLabel(opt) ?? opt}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </WriteGuard>
                                                {!rbacAccess.canWrite && (
                                                    <span className="text-xs text-slate-500">
                                                        {level === "none" ? "Không" : accessLabel(level) ?? level}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="text-xs text-slate-400">
                    Role &quot;Theo dõi cửa hàng nhượng quyền&quot; đã được gỡ — giám đốc và kế toán theo dõi nhượng quyền qua mục Nhượng quyền và Báo cáo.
                </p>
            </div>
        </RoleGuard>
    );
}
