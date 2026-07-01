"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import {
    accessLabel,
    canWriteLevel,
    getAccessLevel,
    isProposeOnly as checkPropose,
    isReadOnlyLevel,
    isStoreScopedLevel,
    type AccessLevel,
    type PermissionKey,
} from "@/lib/demo/permissions";
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
    const level = getAccessLevel(role, key);

    return {
        role,
        level,
        canAccess: level !== "none",
        canWrite: canWriteLevel(level),
        isReadOnly: isReadOnlyLevel(level),
        isMonitor: level === "monitor",
        isProposeOnly: checkPropose(role, key),
        isStoreScoped: isStoreScopedLevel(level),
        label: accessLabel(level),
    };
}
