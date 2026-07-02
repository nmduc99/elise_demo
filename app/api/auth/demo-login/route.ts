import { AUTH_CONFIG } from "@/lib/authConfig";
import {
    DEMO_ROLES,
    DEMO_USERS,
    isDemoRole,
    type DemoRole,
} from "@/lib/demo/roles";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function resolveDemoRole(body: {
    role?: unknown;
    account?: unknown;
    password?: unknown;
}): DemoRole | null {
    if (typeof body.account === "string" && typeof body.password === "string") {
        const account = body.account.trim();
        const password = body.password;

        const matchedRole = DEMO_ROLES.find(
            (role) =>
                DEMO_USERS[role].account === account &&
                DEMO_USERS[role].password === password
        );

        return matchedRole ?? null;
    }

    if (isDemoRole(body.role)) {
        return body.role;
    }

    return null;
}

/**
 * Demo-only login. Bypasses the external API entirely: it sets the standard
 * auth cookie to an opaque `demo.<role>` token so the existing middleware and
 * `/api/auth/me` recognise the session, and returns the matching demo user.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const role = resolveDemoRole(body);

        if (!role) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
