/**
 * HR master data (departments, positions) and the generated employee roster.
 */

import { randInt, rngFor } from "./rng";
import { STORES } from "./stores";

export type EmployeeStatus = "active" | "probation" | "leave";

export interface Employee {
    id: string;
    code: string;
    name: string;
    storeId: string;
    regionId: string;
    department: string;
    position: string;
    salary: number;
    joinedAt: string;
    status: EmployeeStatus;
}

export const DEPARTMENTS = ["Bán hàng", "Kho & Vận hành", "Thu ngân", "Marketing"];

export const POSITIONS: Record<string, string[]> = {
    "Bán hàng": ["Tư vấn bán hàng", "Nhân viên bán hàng", "Trưởng nhóm bán hàng", "Cửa hàng trưởng"],
    "Kho & Vận hành": ["Nhân viên kho", "Phụ trách kho"],
    "Thu ngân": ["Thu ngân"],
    Marketing: ["Nhân viên Marketing"],
};

/** Flat list of (department, position) pairs for the HR position catalog. */
export const POSITION_LIST: { department: string; position: string }[] = Object.entries(
    POSITIONS
).flatMap(([department, list]) => list.map((position) => ({ department, position })));

const FIRST_NAMES = ["Mai", "Hương", "Lan", "Trang", "Ngọc", "Hà", "Linh", "Thảo", "Phương", "Quỳnh", "Tuấn", "Nam", "Khoa", "Dũng", "Hiếu"];
const LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ"];

function buildEmployees(): Employee[] {
    const employees: Employee[] = [];
    let counter = 1;
    for (const store of STORES) {
        const rng = rngFor(`emp|${store.id}`);
        const headcount = randInt(rng, 4, 7);
        for (let i = 0; i < headcount; i++) {
            const department = i === 0 ? "Bán hàng" : DEPARTMENTS[randInt(rng, 0, DEPARTMENTS.length - 1)];
            const positions = POSITIONS[department];
            const position = i === 0 ? "Cửa hàng trưởng" : positions[randInt(rng, 0, positions.length - 1)];
            const first = FIRST_NAMES[randInt(rng, 0, FIRST_NAMES.length - 1)];
            const last = LAST_NAMES[randInt(rng, 0, LAST_NAMES.length - 1)];
            const name = i === 0 ? store.managerName : `${last} ${FIRST_NAMES[randInt(rng, 0, FIRST_NAMES.length - 1)]} ${first}`;
            const baseSalary = position === "Cửa hàng trưởng" ? 18_000_000 : department === "Bán hàng" ? 8_500_000 : 9_500_000;
            const salary = baseSalary + randInt(rng, 0, 6) * 500_000;
            const statusRoll = rng();
            const status: EmployeeStatus = statusRoll > 0.9 ? "leave" : statusRoll > 0.78 ? "probation" : "active";
            const joinYear = 2019 + randInt(rng, 0, 6);
            const joinMonth = randInt(rng, 1, 12);
            employees.push({
                id: `e-${String(counter).padStart(3, "0")}`,
                code: `NV${String(counter).padStart(4, "0")}`,
                name,
                storeId: store.id,
                regionId: store.regionId,
                department,
                position,
                salary,
                joinedAt: `${joinYear}-${String(joinMonth).padStart(2, "0")}-01`,
                status,
            });
            counter++;
        }
    }
    return employees;
}

export const EMPLOYEES: Employee[] = buildEmployees();
