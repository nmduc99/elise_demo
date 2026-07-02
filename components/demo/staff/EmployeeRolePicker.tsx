"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { labelClass } from "@/lib/demo/formClasses";
import {
    DEMO_ROLES,
    ROLE_DESCRIPTIONS,
    ROLE_LABELS,
    type DemoRole,
} from "@/lib/demo/roles";

interface EmployeeRolePickerProps {
    value: DemoRole[];
    onChange: (roles: DemoRole[]) => void;
    disabled?: boolean;
}

export default function EmployeeRolePicker({
    value,
    onChange,
    disabled,
}: EmployeeRolePickerProps) {
    const toggle = (role: DemoRole) => {
        if (disabled) return;
        if (value.includes(role)) {
            onChange(value.filter((r) => r !== role));
        } else {
            onChange([...value, role]);
        }
    };

    return (
        <div className="col-span-2 space-y-2">
            <label className={labelClass}>Vai trò hệ thống (phân quyền)</label>
            <p className="text-xs text-slate-500">
                Gán quyền truy cập theo vai trò RBAC. Nhân viên có thể được gán nhiều vai trò.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {DEMO_ROLES.map((role) => {
                    const checked = value.includes(role);
                    return (
                        <label
                            key={role}
                            className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors ${
                                checked ? "border-custom bg-orange-50/50" : "hover:bg-slate-50"
                            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                            <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggle(role)}
                                disabled={disabled}
                                className="mt-0.5"
                            />
                            <div className="min-w-0">
                                <span className="block text-sm font-medium text-slate-800">
                                    {ROLE_LABELS[role]}
                                </span>
                                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                                    {ROLE_DESCRIPTIONS[role]}
                                </span>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

interface EmployeeRoleBadgesProps {
    roles?: DemoRole[];
}

export function EmployeeRoleBadges({ roles }: EmployeeRoleBadgesProps) {
    if (!roles?.length) {
        return <span className="text-xs text-slate-400">Chưa gán</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
                <Badge
                    key={role}
                    variant="outline"
                    className="border-custom/30 bg-orange-50 text-xs text-custom"
                >
                    {ROLE_LABELS[role]}
                </Badge>
            ))}
        </div>
    );
}
