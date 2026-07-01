import { AUTH_CONFIG } from "@/lib/authConfig";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/** Demo Elise: refresh is a no-op — opaque demo tokens do not expire. */
export async function POST() {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get(AUTH_CONFIG.COOKIES.TOKEN)?.value;

    if (!currentToken?.startsWith("demo.")) {
        return NextResponse.json(
            { success: false, error: "Only demo sessions are supported" },
            { status: 401 }
        );
    }

    const oneYear = 365 * 24 * 60 * 60;
    return NextResponse.json({
        success: true,
        tokenExpiresAt: Date.now() + oneYear * 1000,
    });
}
