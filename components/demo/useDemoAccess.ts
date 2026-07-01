"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import {
    accessLabel,
    canWriteLevel,
    isReadOnlyLevel,
    isStoreScopedLevel,
    type AccessLevel,
    type PermissionKey,
} from "@/lib/demo/permissions";
import { getEffectiveAccessLevel } from "@/lib/demo/permissionOverrides";
import { getRoleFromUser, type DemoRole } from "@/lib/demo/roles";

export interface DemoAccess {
    role: DemoRole | null;
    level: AccessLevel;
    canAccess: boolean;
    canWrite: boolean;
    isReadOnly: boolean;
    isMonitor: boolean;
    isProposeOnly: boolean;
    isStoreScoped: boolean;
    label: string | null;
}

export function useDemoAccess(key: PermissionKey): DemoAccess {
    const { user } = useAuth();
    const role = getRoleFromUser(user);
    const level = getEffectiveAccessLevel(role, key);

    return {
        role,
        level,
        canAccess: level !== "none",
        canWrite: canWriteLevel(level),
        isReadOnly: isReadOnlyLevel(level),
        isMonitor: level === "monitor",
        isProposeOnly: level === "propose",
        isStoreScoped: isStoreScopedLevel(level),
        label: accessLabel(level),
    };
}
