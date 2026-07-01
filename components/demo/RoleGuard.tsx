"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { getAccessLevel, type PermissionKey } from "@/lib/demo/permissions";
import { getRoleFromUser } from "@/lib/demo/roles";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
    /** Single key or any-of keys for page access. */
    permission: PermissionKey | PermissionKey[];
    children: React.ReactNode;
}

function isAllowed(role: ReturnType<typeof getRoleFromUser>, permission: PermissionKey | PermissionKey[]): boolean {
    const keys = Array.isArray(permission) ? permission : [permission];
    return keys.some((key) => getAccessLevel(role, key) !== "none");
}

/**
 * Gates a page by demo role. Shows an access-denied panel when the current
 * role lacks the permission.
 */
export default function RoleGuard({ permission, children }: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const role = getRoleFromUser(user);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-slate-400">
                Đang tải...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-64 items-center justify-center text-slate-400">
                Đang tải...
            </div>
        );
    }

    if (!isAllowed(role, permission)) {
        return (
            <div className="mx-auto mt-16 max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <ShieldAlert size={28} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Không có quyền truy cập</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Vai trò hiện tại của bạn không được phép xem trang này. Vui lòng đăng nhập
                    bằng tài khoản có quyền phù hợp.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
