import { NextResponse } from "next/server";
import { DEMO_SHOP } from "@/lib/demo/mockApiResponses";

/**
 * GET /api/shops/me — mock shop info for Elise demo.
 */
export async function GET() {
    return NextResponse.json({
        success: true,
        data: DEMO_SHOP,
    });
}
