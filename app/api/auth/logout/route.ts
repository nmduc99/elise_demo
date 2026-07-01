// app/api/auth/logout/route.ts
import { AUTH_CONFIG } from "@/lib/authConfig";
import { NextResponse } from "next/server";

const COOKIE_CLEAR_OPTIONS = {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax" as const,
};

export async function POST() {
    const res = NextResponse.json({ success: true });

    res.cookies.set(AUTH_CONFIG.COOKIES.TOKEN, "", COOKIE_CLEAR_OPTIONS);
    res.cookies.set(AUTH_CONFIG.COOKIES.REFRESH_TOKEN, "", COOKIE_CLEAR_OPTIONS);
    res.cookies.set(AUTH_CONFIG.COOKIES.DEVICE_ID, "", COOKIE_CLEAR_OPTIONS);

    return res;
}
