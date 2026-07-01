import { AUTH_CONFIG } from "@/lib/authConfig";
import { DEMO_USERS, isDemoRole } from "@/lib/demo/roles";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/me — demo sessions only (opaque `demo.<role>` cookie).
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_CONFIG.COOKIES.TOKEN)?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        if (token.startsWith("demo.")) {
            const role = token.slice("demo.".length);
            if (isDemoRole(role)) {
                return NextResponse.json({ user: DEMO_USERS[role] }, { status: 200 });
            }
        }

        return NextResponse.json({ user: null }, { status: 200 });
    } catch {
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
