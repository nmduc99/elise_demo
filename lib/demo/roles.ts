/**
 * Role definitions for the Elise chain demo RBAC.
 * Shared between server (demo auth) and client (nav / guards).
 */

export type DemoRole =
    | "director"
    | "accountant"
    | "procurement"
    | "store_manager";

export const DEMO_ROLES: DemoRole[] = [
    "director",
    "accountant",
    "procurement",
    "store_manager",
];

export interface DemoUser {
    id: string;
    account: string;
    /**
     * Mật khẩu đăng nhập của tài khoản demo. Dùng để hiển thị cho người dùng
     * tự copy và đăng nhập theo từng role. Cập nhật lại cho khớp tài khoản thật.
     */
    password: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    roles: DemoRole[];
    /** Only set for store_manager: the single store they manage. */
    storeId?: string;
    isActive: boolean;
    createdAt: string;
}

export const ROLE_LABELS: Record<DemoRole, string> = {
    director: "Giám đốc",
    accountant: "Kế toán",
    procurement: "Phòng thu mua",
    store_manager: "Quản lý cửa hàng",
};

export const ROLE_DESCRIPTIONS: Record<DemoRole, string> = {
    director: "Toàn quyền theo dõi chuỗi: doanh thu, lợi nhuận, kho, nhân sự, nhượng quyền.",
    accountant: "Theo dõi doanh thu, lợi nhuận, kho và bảng lương toàn chuỗi.",
    procurement: "Quản lý nhà cung cấp, sản phẩm, đặt hàng và kho khu vực.",
    store_manager: "Quản lý một cửa hàng: bán hàng, kho cửa hàng và nhân sự tại chỗ.",
};

/**
 * Pre-built demo accounts. The store_manager is scoped to a Hà Nội store.
 */
export const DEMO_USERS: Record<DemoRole, DemoUser> = {
    director: {
        id: "demo-director",
        account: "giamdoc",
        password: "Elise@2024",
        fullName: "Nguyễn Thị Lan Anh",
        email: "lananh@elise.vn",
        phoneNumber: "0901 000 001",
        roles: ["director"],
        isActive: true,
        createdAt: "2018-01-02",
    },
    accountant: {
        id: "demo-accountant",
        account: "ketoan",
        password: "Elise@2024",
        fullName: "Trần Thu Hà",
        email: "thuha@elise.vn",
        phoneNumber: "0901 000 002",
        roles: ["accountant"],
        isActive: true,
        createdAt: "2018-03-15",
    },
    procurement: {
        id: "demo-procurement",
        account: "thumua",
        password: "Elise@2024",
        fullName: "Lê Minh Tuấn",
        email: "minhtuan@elise.vn",
        phoneNumber: "0901 000 003",
        roles: ["procurement"],
        isActive: true,
        createdAt: "2019-06-01",
    },
    store_manager: {
        id: "demo-store-manager",
        account: "cuahang",
        password: "Elise@2024",
        fullName: "Phạm Thị Mai",
        email: "mai.batrieu@elise.vn",
        phoneNumber: "0901 000 004",
        roles: ["store_manager"],
        storeId: "st-hn-01",
        isActive: true,
        createdAt: "2019-03-12",
    },
};

export function isDemoRole(value: unknown): value is DemoRole {
    return typeof value === "string" && (DEMO_ROLES as string[]).includes(value);
}

/**
 * Extract the demo role from an auth user object (roles[0]).
 */
export function getRoleFromUser(user: { roles?: string[] } | null | undefined): DemoRole | null {
    const first = user?.roles?.[0];
    return isDemoRole(first) ? first : null;
}

export function getDemoUserByRole(role: DemoRole): DemoUser {
    return DEMO_USERS[role];
}

export function isDemoUser(user: { id?: string } | null | undefined): boolean {
    return typeof user?.id === "string" && user.id.startsWith("demo-");
}
