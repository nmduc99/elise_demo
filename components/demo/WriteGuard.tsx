"use client";

import type { PermissionKey } from "@/lib/demo/permissions";
import { useDemoAccess } from "./useDemoAccess";

interface WriteGuardProps {
    permission: PermissionKey;
    children: React.ReactNode;
}

/** Renders children only when the role has write access for the permission. */
export default function WriteGuard({ permission, children }: WriteGuardProps) {
    const { canWrite } = useDemoAccess(permission);
    if (!canWrite) return null;
    return <>{children}</>;
}
