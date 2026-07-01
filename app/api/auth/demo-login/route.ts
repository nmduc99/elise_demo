import { AUTH_CONFIG } from "@/lib/authConfig";
import { DEMO_USERS, isDemoRole } from "@/lib/demo/roles";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Demo-only login. Bypasses the external API entirely: it sets the standard
 * auth cookie to an opaque `demo.<role>` token so the existing middleware and
 * `/api/auth/me` recognise the session, and returns the matching demo user.
 */
export async function POST(req: Request) {
    try {
        const { role } = await req.json();

        if (!isDemoRole(role)) {
            return NextResponse.json({ error: "Invalid demo role" }, { status: 400 });
        }

        const user = DEMO_USERS[role];
        const token = `demo.${role}`;

        // Far-future expiry so the client never tries to refresh against the
        // external API during the demo.
        const oneYear = 365 * 24 * 60 * 60;
        const tokenExpiresAt = Date.now() + oneYear * 1000;

        const response = NextResponse.json({ user, tokenExpiresAt });

        await cookies();
        response.cookies.set(AUTH_CONFIG.COOKIES.TOKEN, token, {
            httpOnly: true,
            maxAge: oneYear,
            path: "/",
            sameSite: "lax",
        });

        // Drop real JWT refresh cookies — demo token does not use external refresh.
        response.cookies.set(AUTH_CONFIG.COOKIES.REFRESH_TOKEN, "", {
            httpOnly: true,
            maxAge: 0,
            path: "/",
            sameSite: "lax",
        });
        response.cookies.set(AUTH_CONFIG.COOKIES.DEVICE_ID, "", {
            httpOnly: true,
            maxAge: 0,
            path: "/",
            sameSite: "lax",
        });

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Demo login failed" },
            { status: 500 }
        );
    }
}
