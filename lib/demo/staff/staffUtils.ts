import {
    DEPARTMENTS,
    POSITION_LIST,
    STORES,
    getStore,
    type Employee,
} from "@/lib/demo/eliseData";
import type { Department, Position } from "@/components/demo/staff/shared";

export const DEPT_SEED: Department[] = DEPARTMENTS.map((name, index) => ({
    id: `dept-${index}`,
    name,
}));

export const POS_SEED: Position[] = POSITION_LIST.map((position, index) => ({
    id: `pos-${index}`,
    name: position.position,
    department: position.department,
}));

export function newId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}`;
}

export function emptyEmployee(storeId: string): Employee {
    return {
        id: "",
        code: "",
        name: "",
        storeId,
        regionId: getStore(storeId)?.regionId ?? "",
        department: DEPARTMENTS[0],
        position: POSITION_LIST[0]?.position ?? "",
        salary: 8_500_000,
        joinedAt: new Date().toISOString().slice(0, 10),
        status: "active",
    };
}

export const DEFAULT_STORE_ID = STORES[0].id;
